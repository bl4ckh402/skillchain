"use client"

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

// Toolbar button component
const MenuButton = ({ onClick, active, disabled, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${
      active 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={disabled}
  >
    {children}
  </button>
)

export function TipTapEditor({ value, onChange, placeholder = "Write something..." }) {
  // Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync with external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  if (!editor) {
    return <div className="h-64 w-full border rounded-md bg-slate-50 animate-pulse" />
  }

  return (
    <div className="wysiwyg-editor border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50 dark:bg-slate-900">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <span className="font-bold">B</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <span className="italic">I</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
        >
          <span className="line-through">S</span>
        </MenuButton>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </MenuButton>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • List
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1. List
        </MenuButton>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          Quote
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
        >
          Code
        </MenuButton>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        <MenuButton 
          onClick={() => {
            const url = window.prompt('URL', 'https://')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }} 
          active={editor.isActive('link')}
        >
          Link
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          Unlink
        </MenuButton>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[12rem] focus:outline-none dark:prose-invert" 
      />
    </div>
  )
}