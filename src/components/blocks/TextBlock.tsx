'use client';

import { useRef, useEffect } from 'react';
import { TextBlock as TextBlockType, TextStyle } from '@/types/block';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, Heading1, Heading2, Heading3 } from 'lucide-react';

interface TextBlockProps {
  block: TextBlockType;
  onSave: (updatedBlock: TextBlockType) => void;
}

export default function TextBlock({ block, onSave }: TextBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isUserTyping = useRef(false);

  // Use block.style directly instead of local state
  // This ensures undo/redo updates the style immediately

  useEffect(() => {
    // Only update content if user is not currently typing
    if (contentRef.current && !isUserTyping.current && contentRef.current.textContent !== block.content) {
      const selection = window.getSelection();
      let cursorPosition: number | undefined;

      // Save cursor position if there's an active selection
      try {
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          cursorPosition = range.startOffset;
        }
      } catch {
        // No valid selection, ignore
      }

      contentRef.current.textContent = block.content;

      // Restore cursor position
      if (selection && cursorPosition !== undefined) {
        try {
          const newRange = document.createRange();
          const textNode = contentRef.current.firstChild;
          if (textNode) {
            const offset = Math.min(cursorPosition, textNode.textContent?.length || 0);
            newRange.setStart(textNode, offset);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } catch {
          // Ignore errors with cursor restoration
        }
      }
    }
  }, [block.content]);

  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.textContent || '';
      isUserTyping.current = true;
      onSave({
        ...block,
        content: newContent,
      });
      // Reset typing flag after a short delay
      setTimeout(() => {
        isUserTyping.current = false;
      }, 100);
    }
  };

  const handleStyleChange = (newStyle: TextStyle) => {
    onSave({
      ...block,
      style: newStyle,
    });
  };

  const getStyleClasses = (style: TextStyle) => {
    const baseClasses = 'outline-none focus:outline-none min-h-[2em] px-1';
    const styleMap = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-semibold',
      h3: 'text-2xl font-semibold',
      paragraph: 'text-base',
    };
    return `${baseClasses} ${styleMap[style]}`;
  };

  const styleButtons = [
    { style: 'paragraph' as TextStyle, icon: Type, label: 'Paragraph' },
    { style: 'h1' as TextStyle, icon: Heading1, label: 'Heading 1' },
    { style: 'h2' as TextStyle, icon: Heading2, label: 'Heading 2' },
    { style: 'h3' as TextStyle, icon: Heading3, label: 'Heading 3' },
  ];

  return (
    <Card className="p-4 space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {styleButtons.map(({ style, icon: Icon, label }) => (
          <Button
            key={style}
            variant={block.style === style ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStyleChange(style)}
            className="gap-2"
            title={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Editable Content */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleContentChange}
        onInput={handleContentChange}
        className={getStyleClasses(block.style)}
        role="textbox"
        aria-label="Text block content"
      />
    </Card>
  );
}
