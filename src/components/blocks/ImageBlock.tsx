'use client';

import { useState } from 'react';
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
  const [url, setUrl] = useState(block.content);
  const [width, setWidth] = useState(block.width?.toString() || '');
  const [height, setHeight] = useState(block.height?.toString() || '');

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    onSave({
      ...block,
      content: newUrl,
    });
  };

  const handleWidthChange = (newWidth: string) => {
    setWidth(newWidth);
    const widthNum = parseInt(newWidth) || undefined;
    onSave({
      ...block,
      width: widthNum,
    });
  };

  const handleHeightChange = (newHeight: string) => {
    setHeight(newHeight);
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
      <div className="border border-border rounded-lg p-4 bg-muted/50 min-h-[200px] flex items-center justify-center">
        {url ? (
          <img
            src={url}
            alt="Block preview"
            width={width ? parseInt(width) : undefined}
            height={height ? parseInt(height) : undefined}
            className="rounded-lg object-contain max-w-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="flex flex-col items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <p class="text-sm">Failed to load image</p>
                </div>
              `;
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-12 h-12" />
            <p className="text-sm">Enter an image URL to see preview</p>
          </div>
        )}
      </div>
    </Card>
  );
}
