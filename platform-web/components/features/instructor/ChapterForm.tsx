'use client'

import { useState } from 'react'
import { Pencil, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateChapter, deleteChapter } from '@/lib/api/instructor'
import type { Chapter } from '@/types/api'

interface ChapterFormProps {
  chapter: Chapter
  onUpdated: (chapter: Chapter) => void
  onDeleted: () => void
}

export function ChapterForm({ chapter, onUpdated, onDeleted }: ChapterFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(chapter.title)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateChapter(chapter.id, { title })
      onUpdated(updated)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`チャプター「${title}」とその全レッスンを削除しますか？`)) return
    setDeleting(true)
    try {
      await deleteChapter(chapter.id)
      onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{title}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-7 text-sm"
        autoFocus
      />
      <Button size="icon-sm" onClick={handleSave} disabled={saving}>
        <Check className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => { setTitle(chapter.title); setIsEditing(false) }}>
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
