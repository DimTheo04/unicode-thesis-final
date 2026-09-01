import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all assignments...');
  const result = await prisma.assignment.deleteMany({});
  console.log(`Deleted \${result.count} assignments and their cascaded submissions/comments.`);
  
  console.log('Cleaning up upload directories...');
  const assignmentsDir = path.join(process.cwd(), 'uploads/assignments');
  const submissionsDir = path.join(process.cwd(), 'uploads/submissions');
  
  if (fs.existsSync(assignmentsDir)) {
    const files = fs.readdirSync(assignmentsDir);
    let count = 0;
    for (const file of files) {
      if (file !== '.gitkeep') {
        fs.unlinkSync(path.join(assignmentsDir, file));
        count++;
      }
    }
    console.log(`Deleted \${count} files from \${assignmentsDir}`);
  }
  
  if (fs.existsSync(submissionsDir)) {
    const files = fs.readdirSync(submissionsDir);
    let count = 0;
    for (const file of files) {
      if (file !== '.gitkeep') {
        const fullPath = path.join(submissionsDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        count++;
      }
    }
    console.log(`Deleted \${count} items from \${submissionsDir}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
