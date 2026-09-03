import React, { useState } from 'react';
import { X, Loader2, Sparkles, Folder, FileCode2, CheckSquare, Square, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { analyzeCodeWithAI } from '../api/submissionApi';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  fileTree: any[];
  token: string;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, submissionId, fileTree, token }) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  // Helper to get all file paths recursively
  const getAllChildPaths = (node: any, paths: string[] = []) => {
    paths.push(node.path);
    if (node.isDirectory && node.children) {
      node.children.forEach((child: any) => getAllChildPaths(child, paths));
    }
    return paths;
  };

  const toggleSelection = (node: any) => {
    const newSelected = new Set(selectedPaths);
    const childPaths = getAllChildPaths(node);
    
    // If the node itself is selected, we unselect it and all its children
    if (newSelected.has(node.path)) {
      childPaths.forEach(p => newSelected.delete(p));
    } else {
      // Otherwise we select it and all its children
      childPaths.forEach(p => newSelected.add(p));
    }
    
    setSelectedPaths(newSelected);
  };

  const handleAnalyze = async () => {
    const pathsArray = Array.from(selectedPaths);
    if (pathsArray.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await analyzeCodeWithAI(token, submissionId, pathsArray);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-analysis-${submissionId}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const TreeNode = ({ node, level }: { node: any, level: number }) => {
    const isSelected = selectedPaths.has(node.path);
    const hasChildren = node.isDirectory && node.children && node.children.length > 0;
    
    return (
      <div className="flex flex-col">
        <div 
          className={cn(
            "flex items-center py-1.5 px-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors",
            isSelected ? "bg-primary/5" : ""
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => toggleSelection(node)}
        >
          <div className="mr-2 text-primary">
            {isSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          {node.isDirectory ? (
             <Folder className="w-4 h-4 mr-2 text-foreground/80" />
          ) : (
             <FileCode2 className="w-4 h-4 mr-2 text-muted-foreground" />
          )}
          
          <span className="text-sm font-medium text-foreground">{node.name}</span>
        </div>
        
        {hasChildren && (
          <div className="flex flex-col">
            {node.children.map((child: any) => (
              <TreeNode key={child.path} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-semibold">AI Code Analysis (Gemini)</h2>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="h-8 text-xs px-2 gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download Markdown
              </Button>
            )}
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors ml-2 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar: File Picker */}
          <div className="w-1/3 border-r border-border flex flex-col bg-muted/10">
            <div className="p-3 border-b border-border text-sm font-medium text-muted-foreground">
              Select files for analysis:
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {fileTree.map(node => (
                <TreeNode key={node.path} node={node} level={0} />
              ))}
            </div>
            <div className="p-4 border-t border-border bg-card">
              <Button 
                onClick={handleAnalyze} 
                disabled={selectedPaths.size === 0 || isLoading}
                className="w-full flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isLoading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Selected files: {selectedPaths.size}
              </p>
            </div>
          </div>

          {/* Main Area: Results */}
          <div className="flex-1 bg-card flex flex-col relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">AI is analyzing the submitted codebase...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-destructive">
                <p className="font-semibold mb-2">Analysis Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : result ? (
              <div className="p-6 overflow-y-auto h-full max-w-none">
                <ReactMarkdown
                  components={{
                    h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-primary border-b border-border pb-1" {...props} />,
                    p: ({ ...props }) => <p className="text-sm text-foreground mb-4 leading-relaxed" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                    li: ({ ...props }) => <li className="text-sm text-foreground" {...props} />,
                    strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                    code: ({ inline, ...props }: any) => 
                      inline 
                        ? <code className="bg-muted px-1.5 py-0.5 rounded-md text-xs font-mono text-primary" {...props} />
                        : <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-4 text-xs font-mono"><code {...props} /></pre>,
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50 p-8 text-center">
                <Sparkles className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Code Analysis</h3>
                <p className="text-sm max-w-md">
                  Select the files or directories you want Gemini to analyze.
                  The analysis will provide an executive summary, highlight good programming practices, and identify potential bugs or areas for improvement.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
