import { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import type { InlineComment } from '../api/commentApi';

export function useMonacoComments(comments: InlineComment[], onSelectionChange?: (startLine: number, endLine: number | null) => void) {
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
  const decorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const [activeSelection, setActiveSelection] = useState<{ startLine: number, endLine: number } | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco?: any) => {
    setEditorInstance(editor);
    decorationsCollectionRef.current = editor.createDecorationsCollection([]);

    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      // If user selects text (not just clicking)
      if (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) {
        setActiveSelection({
          startLine: selection.startLineNumber,
          endLine: selection.endLineNumber
        });
        if (onSelectionChange) onSelectionChange(selection.startLineNumber, selection.endLineNumber);
      } else {
        setActiveSelection(null);
        if (onSelectionChange) onSelectionChange(selection.startLineNumber, null);
      }
    });
  };

  // Update decorations when comments change
  useEffect(() => {
    if (!editorInstance || !decorationsCollectionRef.current) return;

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
          className: isResolved ? 'bg-gray-500/20' : 'bg-yellow-500/20 border-l-4 border-yellow-500',
          hoverMessage: { value: `**${comment.author.fullName}**: ${comment.content}` }
        }
      };
    });

    decorationsCollectionRef.current.set(decorations);
  }, [comments, editorInstance]);

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
