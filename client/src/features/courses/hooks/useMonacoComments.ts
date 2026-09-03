import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import type { InlineComment } from '../api/commentApi';

// hook that manages monaco editor decorations, text selections, and inline comments
export function useMonacoComments(comments: InlineComment[], onSelectionChange?: (startLine: number, endLine: number | null) => void) {
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
  const decorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const [activeSelection, setActiveSelection] = useState<{ startLine: number, endLine: number } | null>(null);

  // called once monaco editor mounts to the DOM
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco?: any) => {
    setEditorInstance(editor);
    decorationsCollectionRef.current = editor.createDecorationsCollection([]);

    // listen for user dragging cursor to select code lines
    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      // check if user highlighted a range of code (not just a single click)
      if (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) {
        setActiveSelection({
          startLine: selection.startLineNumber,
          endLine: selection.endLineNumber
        });
        if (onSelectionChange) onSelectionChange(selection.startLineNumber, selection.endLineNumber);
      } else {
        // single cursor click without active selection
        setActiveSelection(null);
        if (onSelectionChange) onSelectionChange(selection.startLineNumber, null);
      }
    });
  };

  // re-apply editor decorations whenever comments list or status changes
  useEffect(() => {
    if (!editorInstance || !decorationsCollectionRef.current) return;

    // map comment threads to monaco line decorations
    const decorations = comments.map(comment => {
      const isResolved = comment.isResolved;
      return {
        range: {
          startLineNumber: comment.startLine,
          startColumn: 1,
          endLineNumber: comment.endLine,
          endColumn: 1, // Full line coverage usually requires column 1 to 1 but with isWholeLine
        },
        options: {
          isWholeLine: true,
          // resolved threads get dimmed grey, active threads show bright yellow border
          className: isResolved ? 'bg-gray-500/20' : 'bg-yellow-500/20 border-l-4 border-yellow-500',
          hoverMessage: { value: `**${comment.author.fullName}**: ${comment.content}` }
        }
      };
    });

    decorationsCollectionRef.current.set(decorations);
  }, [comments, editorInstance]);

  // jump and focus editor directly on a commented line
  const scrollToLine = (lineNumber: number) => {
    if (editorInstance) {
      editorInstance.revealLineInCenter(lineNumber);
      editorInstance.setPosition({ lineNumber, column: 1 });
      editorInstance.focus();
    }
  };

  return {
    handleEditorDidMount,
    activeSelection,
    scrollToLine,
    editorInstance
  };
}
