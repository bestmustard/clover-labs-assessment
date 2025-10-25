import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Block, TextBlock, ImageBlock } from '@/types/block';
import { randomUUID } from 'crypto';

// GET: Return a list of blocks
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM blocks ORDER BY "order" ASC');
    const rows = stmt.all() as Array<{
      id: string;
      type: string;
      content: string;
      order: number;
      style?: string;
      width?: number;
      height?: number;
    }>;

    const blocks: Block[] = rows.map(row => {
      if (row.type === 'text') {
        return {
          id: row.id,
          type: 'text',
          content: row.content,
          order: row.order,
          style: row.style as TextBlock['style'] || 'paragraph',
        } as TextBlock;
      } else {
        return {
          id: row.id,
          type: 'image',
          content: row.content,
          order: row.order,
          width: row.width,
          height: row.height,
        } as ImageBlock;
      }
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}

// POST: Add new blocks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, style, width, height } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    if (type !== 'text' && type !== 'image') {
      return NextResponse.json(
        { error: 'Type must be either "text" or "image"' },
        { status: 400 }
      );
    }

    const id = randomUUID();

    // Get the current max order
    const maxOrderStmt = db.prepare('SELECT MAX("order") as maxOrder FROM blocks');
    const result = maxOrderStmt.get() as { maxOrder: number | null };
    const order = (result.maxOrder ?? -1) + 1;

    const stmt = db.prepare(`
      INSERT INTO blocks (id, type, content, "order", style, width, height)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      type,
      content,
      order,
      type === 'text' ? (style || 'paragraph') : null,
      type === 'image' ? width : null,
      type === 'image' ? height : null
    );

    const newBlock: Block = type === 'text'
      ? {
          id,
          type: 'text',
          content,
          order,
          style: style || 'paragraph',
        }
      : {
          id,
          type: 'image',
          content,
          order,
          width,
          height,
        };

    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}

// PATCH: Update existing blocks
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, style, width, height } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Block ID is required' },
        { status: 400 }
      );
    }

    // Check if block exists
    const checkStmt = db.prepare('SELECT * FROM blocks WHERE id = ?');
    const existingBlock = checkStmt.get(id) as { type: string } | undefined;

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }

    if (existingBlock.type === 'text' && style !== undefined) {
      updates.push('style = ?');
      values.push(style);
    }

    if (existingBlock.type === 'image') {
      if (width !== undefined) {
        updates.push('width = ?');
        values.push(width);
      }
      if (height !== undefined) {
        updates.push('height = ?');
        values.push(height);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(id);
    const updateStmt = db.prepare(`
      UPDATE blocks
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    updateStmt.run(...values);

    // Fetch and return the updated block
    const updatedBlock = checkStmt.get(id) as {
      id: string;
      type: string;
      content: string;
      order: number;
      style?: string;
      width?: number;
      height?: number;
    };

    const block: Block = updatedBlock.type === 'text'
      ? {
          id: updatedBlock.id,
          type: 'text',
          content: updatedBlock.content,
          order: updatedBlock.order,
          style: updatedBlock.style as TextBlock['style'] || 'paragraph',
        }
      : {
          id: updatedBlock.id,
          type: 'image',
          content: updatedBlock.content,
          order: updatedBlock.order,
          width: updatedBlock.width,
          height: updatedBlock.height,
        };

    return NextResponse.json(block);
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}
