'use client';

import { useEffect, useState } from 'react';
import { Block, TextBlock, ImageBlock } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Image as ImageIcon } from 'lucide-react';

export default function Editor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blocks on mount
  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blocks');
      if (!response.ok) throw new Error('Failed to fetch blocks');
      const data = await response.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBlock = async (type: 'text' | 'image') => {
    try {
      const newBlock = {
        type,
        content: type === 'text' ? 'New text block' : 'https://via.placeholder.com/400',
        ...(type === 'text' ? { style: 'paragraph' as const } : { width: 400, height: 300 }),
      };

      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlock),
      });

      if (!response.ok) throw new Error('Failed to create block');

      // Re-fetch blocks to update the list
      await fetchBlocks();
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  const renderBlock = (block: Block) => {
    if (block.type === 'text') {
      const textBlock = block as TextBlock;
      const styles = {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-semibold',
        h3: 'text-2xl font-semibold',
        paragraph: 'text-base',
      };

      return (
        <div className={`${styles[textBlock.style]} text-foreground`}>
          {textBlock.content}
        </div>
      );
    } else {
      const imageBlock = block as ImageBlock;
      return (
        <img
          src={imageBlock.content}
          alt="Block image"
          width={imageBlock.width}
          height={imageBlock.height}
          className="rounded-lg object-cover"
        />
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-foreground">Mini Notion</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => addBlock('text')} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Text Block
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('image')} className="gap-2 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Image Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Blocks Container */}
        <div className="space-y-4">
          {blocks.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No blocks yet. Click the + button to add your first block!</p>
            </Card>
          ) : (
            blocks.map((block) => (
              <Card key={block.id} className="p-6 hover:shadow-lg transition-shadow">
                {renderBlock(block)}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
