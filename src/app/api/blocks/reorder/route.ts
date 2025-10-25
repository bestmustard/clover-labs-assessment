import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// PATCH: Reorder blocks
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockIds } = body;

    if (!Array.isArray(blockIds)) {
      return NextResponse.json(
        { error: 'blockIds must be an array' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure all updates succeed or fail together
    const updateOrder = db.transaction((ids: string[]) => {
      const stmt = db.prepare('UPDATE blocks SET "order" = ? WHERE id = ?');

      ids.forEach((id, index) => {
        stmt.run(index, id);
      });
    });

    updateOrder(blockIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blocks' },
      { status: 500 }
    );
  }
}
