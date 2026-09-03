import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Role } from '@prisma/client';
import { assertCanAccessSubmission } from '../../utils/authGuards.js';
import { env } from '../../config/env.js';
import { AppError, ForbiddenError } from '../../errors/AppError.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

// helper to filter out non-code assets and sensitve environment files
const isFileAllowed = (filePath: string): boolean => {
  const lowerPath = filePath.toLowerCase();
  // ignore images, zip archives, and lockfiles to conserve prompt tokens
  const blacklistedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.zip', '.pdf', '.lock'];
  const blacklistedDirs = ['node_modules/', 'dist/', 'build/', '.git/'];

  if (blacklistedExtensions.some(ext => lowerPath.endsWith(ext))) return false;
  if (blacklistedDirs.some(dir => lowerPath.includes(dir))) return false;
  // definitely never leak secrets to external ai api
  if (lowerPath.endsWith('.env') || lowerPath.endsWith('.pem')) return false;

  return true;
};

// recursively gather all file paths if user selected a directory node
const getAllFilesInDir = (dirPath: string, arrayOfFiles: string[] = []) => {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFilesInDir(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

export const aiController = {
  // send selected source files to gemini for automated pedagogical feedback
  async analyzeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { submissionId, paths } = req.body;
      const user = req.user!;
      
      // basic validation on incoming paramaters
      if (!submissionId || !paths || !Array.isArray(paths) || paths.length === 0) {
        throw new AppError('submissionId and an array of paths are required.', 400, 'BAD_REQUEST');
      }

      // Check if user is a teacher or admin
      if (user.role !== Role.TEACHER && user.role !== Role.ADMIN) {
        throw new ForbiddenError('Only instructors can perform AI analysis.');
      }

      // Assert user has access to this submission (assigned teacher or admin)
      const submission = await assertCanAccessSubmission(user, submissionId);

      const baseSubmissionsDir = path.join(process.cwd(), 'uploads/submissions', submission.assignmentId, submission.studentId, `v${submission.version}`);
      const extractedDir = path.join(baseSubmissionsDir, 'extracted');

      let contextText = '';
      let totalBytes = 0;
      const MAX_BYTES = 1000 * 1024; // 1MB limit for safety to prevent huge requests

      for (const targetPath of paths) {
        const absoluteTargetPath = path.join(extractedDir, targetPath);

        // Security check
        if (!absoluteTargetPath.startsWith(extractedDir)) continue;
        if (!fs.existsSync(absoluteTargetPath)) continue;

        let filesToProcess: string[] = [];
        
        if (fs.statSync(absoluteTargetPath).isDirectory()) {
          filesToProcess = getAllFilesInDir(absoluteTargetPath);
        } else {
          filesToProcess.push(absoluteTargetPath);
        }

        for (const filePath of filesToProcess) {
          // Calculate relative path for display
          const relativeFilePath = path.relative(extractedDir, filePath);
          
          if (!isFileAllowed(relativeFilePath)) continue;

          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileBlock = `\n==================================================\nFile: ${relativeFilePath}\n==================================================\n${content}\n`;
            
            // check file size limits before appending to prompt payload
            totalBytes += Buffer.byteLength(fileBlock, 'utf8');
            if (totalBytes > MAX_BYTES) {
              throw new AppError(
                'Total selected files exceed maximum allowed size (1MB). Please select fewer files.',
                400,
                'BAD_REQUEST'
              );
            }

            contextText += fileBlock;
          } catch (err) {
            if (err instanceof AppError) throw err;
            console.error(`Failed to read file ${filePath}`, err);
            // continue processing other files even if one fails
          }
        }
      }

      if (!contextText) {
        throw new AppError('No valid code files found to analyze in selected paths.', 400, 'BAD_REQUEST');
      }

      // verify api key is present in env config
      if (!env.GEMINI_API_KEY) {
        throw new AppError('API key is missing in server configuration.', 500, 'INTERNAL_SERVER_ERROR');
      }

      // initialize gemini flash model for fast latency and cost efficiency
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
      
      // prompt instructing the model to act as a university teaching assistant
      const systemPrompt = `You are an expert Senior Software Engineer and Computer Science Professor. You are given source code files from a student assignment submission. Your goal is to provide a concise, constructive, and comprehensive review.

Respond strictly in the following structure using Markdown (level 3 headings, bullet lists, and code snippets when appropriate):

### Executive Summary
Provide a concise 2-3 sentence overview of what the code accomplishes and its design structure.

### Strengths & Best Practices
- Highlight 1-2 points where the code demonstrates clean design, good readability, or best practices.
- Use concise bullet points.

### Areas for Improvement & Bugs
- **[Bug]**: Explain the bug and how it should be fixed.
- **[Code Smell / Anti-pattern]**: Note areas where architecture or efficiency can improve.
- Use concise bullet points.

Do not write entire code solutions, only provide short snippets if necessary. Your output assists the instructor in evaluation and feedback.`;

      const prompt = `${systemPrompt}\n\nHere is the source code to review:\n${contextText}`;

      // request ai review response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.json({ analysis: text });
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      
      // handle rate limiting gracefully so user knows to retry in a minute
      if (error?.status === 429) {
        return next(new AppError('AI service is temporarily busy (Rate Limit). Please try again shortly.', 429, 'RATE_LIMIT_EXCEEDED'));
      }

      next(error);
    }
  }
};
