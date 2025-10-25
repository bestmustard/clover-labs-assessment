'use client';

import Image from 'next/image';
import { ImageBlock as ImageBlockType } from '@/types/block';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon } from 'lucide-react';

interface ImageBlockProps {
  block: ImageBlockType;
  onSave: (updatedBlock: ImageBlockType) => void;
}

export default function ImageBlock({ block, onSave }: ImageBlockProps) {
  // Use block props directly instead of local state
  // This ensures undo/redo updates the inputs immediately
  const url = block.content;
  const width = block.width?.toString() || '';
  const height = block.height?.toString() || '';

  // Check if URL is valid (starts with http:// or https://)
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));

  const handleUrlChange = (newUrl: string) => {
    onSave({
      ...block,
      content: newUrl,
    });
  };

  const handleWidthChange = (newWidth: string) => {
    const widthNum = parseInt(newWidth) || undefined;
    onSave({
      ...block,
      width: widthNum,
    });
  };

  const handleHeightChange = (newHeight: string) => {
    const heightNum = parseInt(newHeight) || undefined;
    onSave({
      ...block,
      height: heightNum,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Input Fields */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`url-${block.id}`} className="text-sm font-medium">
            Image URL
          </Label>
          <Input
            id={`url-${block.id}`}
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`width-${block.id}`} className="text-sm font-medium">
              Width (px)
            </Label>
            <Input
              id={`width-${block.id}`}
              type="number"
              placeholder="400"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`height-${block.id}`} className="text-sm font-medium">
              Height (px)
            </Label>
            <Input
              id={`height-${block.id}`}
              type="number"
              placeholder="300"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="border border-border rounded-lg p-4 bg-muted/50 min-h-[200px] flex items-center justify-center overflow-hidden">
        {isValidUrl ? (
          <div
            style={{
              width: width ? `${width}px` : '400px',
              height: height ? `${height}px` : '300px',
              maxWidth: '100%',
              position: 'relative',
            }}
          >
            <Image
              src={url}
              alt="Block preview"
              fill
              style={{
                objectFit: 'fill',
              }}
              className="rounded-lg"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-12 h-12" />
            <p className="text-sm">
              {url ? 'Enter a valid URL (must start with http:// or https://)' : 'Enter an image URL to see preview'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
