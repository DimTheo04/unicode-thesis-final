import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Code2, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="w-full border-t border-border bg-background mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            
            {/* Left Info / Attribution */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-foreground/70 shrink-0" />
                <span className="font-bold text-foreground tracking-wider">UNICODE</span>
              </div>
              <span className="hidden sm:inline text-border">•</span>
              <span>Academic Code Review & Evaluation Platform</span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="text-muted-foreground/80">© {currentYear}</span>
            </div>

            {/* Right Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              <Link 
                to="/dashboard" 
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Guide</span>
              </button>
            </div>

          </div>
        </div>
      </footer>

      {/* Quick Help & System Guide Modal */}
      {isHelpOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card text-card-foreground w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Platform Information & Guide</h3>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-sm">About UNICODE</h4>
                <p>
                  UNICODE is a comprehensive academic code review and evaluation platform. It allows instructors to create courses, assign projects, and perform line-by-line in-line code reviews, while providing students with interactive feedback and AI-assisted guidance.
                </p>
              </div>

              <div className="border-t border-border/60 pt-3">
                <h4 className="font-semibold text-foreground mb-1.5 text-sm">Key Features</h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Overview and management of enrolled courses</li>
                  <li>Source code submission and automated checks</li>
                  <li>Interactive in-line code review with threaded discussions</li>
                  <li>Real-time notifications for assignments and feedback</li>
                  <li>Customizable workspace with Light and Dark themes</li>
                </ul>
              </div>

              <div className="border-t border-border/60 pt-3">
                <h4 className="font-semibold text-foreground mb-1 text-sm">Technical Support</h4>
                <p>
                  For bug reports or inquiries regarding the system, please contact your department administrator.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
