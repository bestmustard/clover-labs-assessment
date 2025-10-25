export type BlockType = 'text' | 'image';

export type TextStyle = 'h1' | 'h2' | 'h3' | 'paragraph';

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  style: TextStyle;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: string; // URL
  width?: number;
  height?: number;
}

export type Block = TextBlock | ImageBlock;
