// TiptapToolbar.jsx
import React from "react";

export default function TiptapToolbar({ editor }) {
  if (!editor) return null;

  const btn = "px-2 py-1 text-xs border rounded mr-1";

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      <button
        className={btn}
        onClick={() => editor.chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().redo().run()}
      >
        Redo
      </button>

      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>

      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </button>

      <button
        className={btn}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </button>

      <button
        className={btn}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </button>

      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Bullet List
      </button>

      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Numbered List
      </button>
    </div>
  );
}
