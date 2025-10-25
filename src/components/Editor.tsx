'use client';

import { useEffect, useState, useCallback } from 'react';
import { Block, TextBlock as TextBlockType, ImageBlock as ImageBlockType } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Image as ImageIcon, Undo, Redo } from 'lucide-react';
import TextBlock from '@/components/blocks/TextBlock';
import ImageBlock from '@/components/blocks/ImageBlock';
import SortableBlock from '@/components/SortableBlock';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useHistory } from '@/hooks/useHistory';
import { useDebouncedPersistence } from '@/hooks/useDebouncedPersistence';

export default function Editor() {
  const [isLoading, setIsLoading] = useState(true);
  const [blocks, historyActions] = useHistory<Block[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounced persistence - saves to API after 500ms of no changes
  const persistBlocks = useCallback(async (blocksToSave: Block[]) => {
    if (blocksToSave.length === 0) return;

    try {
      // Persist each block's changes
      await Promise.all(
        blocksToSave.map((block) =>
          fetch('/api/blocks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block),
          })
        )
      );
    } catch (error) {
      console.error('Failed to persist blocks:', error);
    }
  }, []);

  useDebouncedPersistence({
    value: blocks,
    onPersist: persistBlocks,
    delay: 500,
  });

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
      historyActions.set(data, true); // overwrite = true, don't add to history
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
        content: type === 'text' ? 'New text block' : 'https://picsum.photos/400/300',
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

      const createdBlock = await response.json();

      // Add to history (this will trigger debounced persistence)
      historyActions.set([...blocks, createdBlock]);
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  const handleSaveBlock = useCallback((updatedBlock: Block) => {
    // Update block in history (this will trigger debounced persistence)
    const updatedBlocks = blocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    historyActions.set(updatedBlocks);
  }, [blocks, historyActions]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);

    // Update history (this will trigger debounced persistence)
    historyActions.set(newBlocks);

    // Send reorder request to API immediately (not debounced)
    try {
      const blockIds = newBlocks.map((block) => block.id);
      const response = await fetch('/api/blocks/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder blocks');
      }
    } catch (error) {
      console.error('Error reordering blocks:', error);
    }
  }, [blocks, historyActions]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        historyActions.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        historyActions.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyActions]);

  const renderBlock = (block: Block) => {
    if (block.type === 'text') {
      return (
        <TextBlock
          block={block as TextBlockType}
          onSave={handleSaveBlock}
        />
      );
    } else {
      return (
        <ImageBlock
          block={block as ImageBlockType}
          onSave={handleSaveBlock}
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Mini Notion</h1>

            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={historyActions.undo}
                disabled={!historyActions.canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={historyActions.redo}
                disabled={!historyActions.canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {blocks.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No blocks yet. Click the + button to add your first block!</p>
                </Card>
              ) : (
                blocks.map((block) => (
                  <SortableBlock key={block.id} id={block.id}>
                    {renderBlock(block)}
                  </SortableBlock>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
