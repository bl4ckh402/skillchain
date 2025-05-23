"use client"

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify';

export function WysiwygDisplayer({ content, className = "" }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      // You could add syntax highlighting, link handling, etc. here
      
      // Example: Make all links open in new tab
      const links = contentRef.current.querySelectorAll('a')
      links.forEach(link => {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      })
    }
  }, [content])

  return (
    <div 
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '') }}
    />
  )
}