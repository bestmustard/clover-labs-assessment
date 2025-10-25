# Mini Notion

A lightweight, Notion-inspired block-based editor built with Next.js, featuring real-time editing, drag-and-drop reordering, and comprehensive undo/redo functionality.

## Features

- 📝 **Block-Based Editing** - Text blocks with multiple heading styles (H1, H2, H3, Paragraph)
- 🖼️ **Image Blocks** - Add images with customizable dimensions and URL input
- 🔄 **Undo/Redo** - Full history management with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- 🎯 **Drag & Drop** - Reorder blocks with smooth animations using dnd-kit
- 💾 **Auto-Save** - Debounced persistence (500ms) for seamless editing experience
- 🎨 **Dark Mode** - Built-in dark mode support with shadcn/ui
- ⚡ **Real-time Updates** - Instant UI updates with optimistic rendering

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clover-labs-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
mini-notion/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Backend API Routes
│   │   │   └── blocks/
│   │   │       ├── route.ts      # GET, POST, PATCH endpoints for blocks
│   │   │       └── reorder/
│   │   │           └── route.ts  # PATCH endpoint for reordering blocks
│   │   ├── globals.css          # Global styles and Tailwind imports
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── page.tsx             # Main page rendering the Editor
│   │
│   ├── components/              # React Components
│   │   ├── blocks/              # Block-specific components
│   │   │   ├── TextBlock.tsx    # Editable text block with style toolbar
│   │   │   └── ImageBlock.tsx   # Image block with URL/size inputs
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx       # Button component
│   │   │   ├── card.tsx         # Card component
│   │   │   ├── dropdown-menu.tsx # Dropdown menu component
│   │   │   ├── input.tsx        # Input component
│   │   │   ├── label.tsx        # Label component
│   │   │   └── select.tsx       # Select component
│   │   ├── Editor.tsx           # Main editor component with history
│   │   └── SortableBlock.tsx    # Drag-and-drop wrapper for blocks
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useHistory.ts        # History management (undo/redo)
│   │   └── useDebouncedPersistence.ts # Debounced API persistence
│   │
│   ├── lib/                     # Utility Libraries
│   │   ├── db.ts               # SQLite database initialization
│   │   └── utils.ts            # General utility functions (cn)
│   │
│   └── types/                   # TypeScript Type Definitions
│       └── block.ts            # Block type interfaces (TextBlock, ImageBlock)
│
├── public/                      # Static Assets
│   ├── next.svg                # Next.js logo
│   └── vercel.svg              # Vercel logo
│
├── mini-notion.db              # SQLite database file (auto-generated)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
└── package.json                # Project dependencies
```

## Detailed Component Guide

### `/src/app/api/blocks/`
**Backend API Routes**

- **`route.ts`** - Main CRUD operations:
  - `GET /api/blocks` - Fetches all blocks ordered by position
  - `POST /api/blocks` - Creates a new block (text or image)
  - `PATCH /api/blocks` - Updates an existing block's content, style, or dimensions

- **`reorder/route.ts`** - Block reordering:
  - `PATCH /api/blocks/reorder` - Updates block order via array of IDs

### `/src/components/`
**Frontend Components**

#### **Editor.tsx** (Main Component)
The central editor component that orchestrates all functionality:
- Manages block state with history (`useHistory` hook)
- Handles undo/redo with keyboard shortcuts
- Implements debounced persistence (saves after 500ms of inactivity)
- Provides drag-and-drop context for reordering
- Renders toolbar with add block dropdown and undo/redo buttons

Key Features:
- Single source of truth for block state
- Optimistic UI updates
- Automatic error recovery

#### **blocks/TextBlock.tsx**
Editable text block component:
- ContentEditable div for inline text editing
- Style toolbar with 4 options (Paragraph, H1, H2, H3)
- Cursor position preservation during updates
- Prevents cursor jumping during fast typing
- Real-time content synchronization

#### **blocks/ImageBlock.tsx**
Image block with live preview:
- URL input with validation (must start with http:// or https://)
- Width/height inputs with validation:
  - Integer-only (no decimals)
  - Range: 1-1000px
  - Inline error messages
- Live image preview using Next.js Image component
- Stretch mode (objectFit: fill)

#### **SortableBlock.tsx**
Drag-and-drop wrapper:
- Uses @dnd-kit/sortable
- Shows grip handle on hover
- Smooth animations during drag
- Opacity changes for visual feedback

### `/src/hooks/`
**Custom React Hooks**

#### **useHistory.ts**
History management with bounded stacks:
- Maintains past, present, and future states
- Max 50 history entries
- Methods: `set()`, `undo()`, `redo()`, `clear()`
- Provides `canUndo` and `canRedo` flags

#### **useDebouncedPersistence.ts**
Automatic debounced saving:
- Delays API calls until user stops typing
- Default 500ms delay
- Skips first render
- Exposes `persistNow()` for immediate saves

### `/src/lib/`
**Utility Libraries**

#### **db.ts**
SQLite database setup:
- Uses better-sqlite3
- Creates `blocks` table with schema:
  ```sql
  - id: TEXT PRIMARY KEY
  - type: TEXT (text | image)
  - content: TEXT
  - order: INTEGER
  - style: TEXT (for text blocks)
  - width: INTEGER (for image blocks)
  - height: INTEGER (for image blocks)
  ```

#### **utils.ts**
Utility functions:
- `cn()` - Class name merger using clsx and tailwind-merge

### `/src/types/`
**TypeScript Definitions**

#### **block.ts**
Type definitions:
```typescript
type BlockType = 'text' | 'image'
type TextStyle = 'h1' | 'h2' | 'h3' | 'paragraph'

interface TextBlock {
  id: string
  type: 'text'
  content: string
  order: number
  style: TextStyle
}

interface ImageBlock {
  id: string
  type: 'image'
  content: string // URL
  order: number
  width?: number
  height?: number
}

type Block = TextBlock | ImageBlock
```

## Key Functionalities

### 1. Block Management
- **Add Blocks**: Click "+ Add Block" button → Select Text or Image
- **Edit Text**: Click into text block → Type directly → Change style via toolbar
- **Edit Images**: Enter URL → Set width/height → See live preview
- **Delete Blocks**: Currently not implemented (future feature)

### 2. History & Undo/Redo
- **Undo**: `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (Mac)
- **Redo**: `Ctrl+Y` or `Ctrl+Shift+Z` (Windows/Linux) or `Cmd+Shift+Z` (Mac)
- **Visual Indicators**: Undo/Redo buttons disabled when no history available
- **Scope**: Tracks all block edits and reordering
- **Instant**: No API calls during undo/redo for immediate response

### 3. Drag & Drop Reordering
- **Activate**: Hover over block → Grip handle appears on left
- **Drag**: Click and hold grip → Drag to new position
- **Drop**: Release to place block
- **Auto-save**: New order persists immediately to database

### 4. Auto-Save & Persistence
- **Debounced Saving**: Changes save 500ms after last edit
- **What's Saved**: Block content, styles, dimensions, order
- **Visual Feedback**: None (saves silently in background)
- **Error Handling**: Reverts to last known good state on failure

### 5. Validation & Error Handling
- **Image URLs**: Must start with `http://` or `https://`
- **Dimensions**:
  - Integers only (no decimals)
  - Range: 1-1000px
  - Inline error messages below inputs
  - Red border on invalid input

## Technology Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Database**: better-sqlite3 (SQLite)
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image component

## Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- 'text' or 'image'
  content TEXT NOT NULL,        -- text content or image URL
  "order" INTEGER NOT NULL,     -- display order (0, 1, 2, ...)
  style TEXT,                   -- text style (h1, h2, h3, paragraph)
  width INTEGER,                -- image width in pixels
  height INTEGER                -- image height in pixels
)
```

## Development Notes

### Known Limitations
- No block deletion functionality
- No collaborative editing
- No export/import features
- No markdown support
- Image blocks require full URLs (no file upload)

### Future Enhancements
- Block deletion with trash/restore
- More block types (code, lists, embeds)
- Markdown import/export
- File upload for images
- Collaborative editing with WebSockets
- Block templates
- Search functionality

## Troubleshooting

### Database Issues
If you encounter database errors:
1. Delete `mini-notion.db`
2. Restart the dev server
3. Database will be recreated automatically

### Build Errors for better-sqlite3
If native bindings fail:
```bash
npm rebuild better-sqlite3
```

### TypeScript Errors
Ensure you're using TypeScript 5.x:
```bash
npm install -D typescript@^5
```

## License

This is a demonstration project created for the CloverLabs take home assessment.
