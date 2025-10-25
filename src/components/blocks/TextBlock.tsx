'use client';

import { useRef, useEffect, useState } from 'react';
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
  const [currentStyle, setCurrentStyle] = useState<TextStyle>(block.style);

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== block.content) {
      contentRef.current.textContent = block.content;
    }
  }, [block.content]);

  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.textContent || '';
      onSave({
        ...block,
        content: newContent,
      });
    }
  };

  const handleStyleChange = (newStyle: TextStyle) => {
    setCurrentStyle(newStyle);
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
            variant={currentStyle === style ? 'default' : 'outline'}
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
        className={getStyleClasses(currentStyle)}
        role="textbox"
        aria-label="Text block content"
      />
    </Card>
  );
}
