'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableBlockProps {
  id: string;
  children: ReactNode;
}

export default function SortableBlock({ id, children }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
        aria-label="Drag handle"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Block Content */}
      {children}
    </div>
  );
}
