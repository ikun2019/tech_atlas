'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, Plus, Trash2, Database, BookMarked, Check, AlertCircle } from 'lucide-react'
import {
  syncDatabase,
  syncAllDatabases,
  createReferenceDatabase,
  deleteReferenceDatabase,
  upsertReferenceTechnology,
} from '@/app/actions/references'
import { cn } from '@/lib/utils'
import type { ReferenceDatabase, ReferenceTechnology } from '@/types/reference'

interface SyncStatus {
  id: string
  synced?: number
  error?: string
  done: boolean
}

interface AdminReferencesClientProps {
  databases: ReferenceDatabase[]
  technologies: ReferenceTechnology[]
}

export function AdminReferencesClient({
  databases: initialDatabases,
  technologies: initialTechnologies,
}: AdminReferencesClientProps) {
  const [isPending, startTransition] = useTransition()
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([])
  const [syncAllResult, setSyncAllResult] = useState<string | null>(null)

  // DB form state
  const [dbForm, setDbForm] = useState({ notionDatabaseId: '', slug: '', name: '', description: '' })
  const [dbFormError, setDbFormError] = useState<string | null>(null)
  const [dbFormSuccess, setDbFormSuccess] = useState(false)

  // Tech form state
  const [techForm, setTechForm] = useState({
    id: '',
    slug: '',
    name: '',
    description: '',
    iconUrl: '',
    sortOrder: '0',
  })
  const [techFormError, setTechFormError] = useState<string | null>(null)
  const [techFormSuccess, setTechFormSuccess] = useState(false)

  function handleSync(dbId: string) {
    startTransition(async () => {
      setSyncStatuses((prev) => [...prev.filter((s) => s.id !== dbId), { id: dbId, done: false }])
      const result = await syncDatabase(dbId)
      setSyncStatuses((prev) =>
        prev.map((s) =>
          s.id === dbId ? { ...s, done: true, synced: result.synced, error: result.error } : s
        )
      )
    })
  }

  function handleSyncAll() {
    startTransition(async () => {
      setSyncAllResult('同期中...')
      const result = await syncAllDatabases()
      const summary = result.results
        .map((r) => `${r.name}: ${r.error ?? `${r.synced}件同期`}`)
        .join(' / ')
      setSyncAllResult(summary || '完了')
    })
  }

  async function handleCreateDb(e: React.FormEvent) {
    e.preventDefault()
    setDbFormError(null)
    setDbFormSuccess(false)
    const result = await createReferenceDatabase(dbForm)
    if (result.success) {
      setDbFormSuccess(true)
      setDbForm({ notionDatabaseId: '', slug: '', name: '', description: '' })
    } else {
      setDbFormError(result.error ?? 'エラーが発生しました')
    }
  }

  async function handleDeleteDb(id: string) {
    if (!confirm('このデータベース設定を削除しますか？')) return
    await deleteReferenceDatabase(id)
  }

  async function handleUpsertTech(e: React.FormEvent) {
    e.preventDefault()
    setTechFormError(null)
    setTechFormSuccess(false)
    const result = await upsertReferenceTechnology({
      id: techForm.id || undefined,
      slug: techForm.slug,
      name: techForm.name,
      description: techForm.description || undefined,
      iconUrl: techForm.iconUrl || undefined,
      sortOrder: Number(techForm.sortOrder),
    })
    if (result.success) {
      setTechFormSuccess(true)
      setTechForm({ id: '', slug: '', name: '', description: '', iconUrl: '', sortOrder: '0' })
    } else {
      setTechFormError(result.error ?? 'エラーが発生しました')
    }
  }

  function getSyncStatus(id: string): SyncStatus | undefined {
    return syncStatuses.find((s) => s.id === id)
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#e5eefc' }}>
          Reference 管理
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9fb0cc' }}>
          Notionデータベースの設定・同期、技術カードの管理を行います。
        </p>
      </div>

      {/* ── Database section ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: '#e5eefc' }}>
            <Database className="size-5" style={{ color: '#7c3aed' }} />
            データベース設定
          </h2>
          <button
            onClick={handleSyncAll}
            disabled={isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50',
            )}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            <RefreshCw className={cn('size-4', isPending && 'animate-spin')} />
            全DB同期
          </button>
        </div>

        {syncAllResult && (
          <p className="mb-3 text-sm" style={{ color: '#9cecff' }}>
            {syncAllResult}
          </p>
        )}

        {/* DB list */}
        <div className="mb-6 space-y-3">
          {initialDatabases.length === 0 && (
            <p className="text-sm" style={{ color: '#6b7f9a' }}>
              データベースが登録されていません。
            </p>
          )}
          {initialDatabases.map((db) => {
            const status = getSyncStatus(db.id)
            return (
              <div
                key={db.id}
                className="flex items-center justify-between gap-4 rounded-xl border p-4"
                style={{
                  background: 'rgba(15,23,42,.55)',
                  borderColor: 'rgba(148,163,184,.18)',
                }}
              >
                <div className="min-w-0">
                  <p className="font-medium" style={{ color: '#e5eefc' }}>
                    {db.name}
                  </p>
                  <p className="mt-0.5 text-xs font-mono truncate" style={{ color: '#6b7f9a' }}>
                    slug: {db.slug} / notionId: {db.notionDatabaseId}
                  </p>
                  {status?.done && (
                    <p
                      className="mt-1 flex items-center gap-1 text-xs"
                      style={{ color: status.error ? '#fca5a5' : '#86efac' }}
                    >
                      {status.error ? (
                        <>
                          <AlertCircle className="size-3" />
                          {status.error}
                        </>
                      ) : (
                        <>
                          <Check className="size-3" />
                          {status.synced} 件同期しました
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleSync(db.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
                    style={{
                      borderColor: 'rgba(148,163,184,.18)',
                      color: '#9fb0cc',
                    }}
                  >
                    <RefreshCw
                      className={cn(
                        'size-3',
                        isPending && status && !status.done && 'animate-spin'
                      )}
                    />
                    同期
                  </button>
                  <button
                    onClick={() => handleDeleteDb(db.id)}
                    className="grid size-8 place-items-center rounded-lg text-red-400/70 transition-colors hover:text-red-400"
                    style={{ background: 'rgba(220,38,38,.08)' }}
                    aria-label="削除"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add DB form */}
        <form
          onSubmit={handleCreateDb}
          className="rounded-xl border p-5 space-y-3"
          style={{
            background: 'rgba(15,23,42,.45)',
            borderColor: 'rgba(148,163,184,.18)',
          }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#dce8ff' }}>
            <Plus className="size-4" />
            データベースを追加
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Notion Database ID"
              value={dbForm.notionDatabaseId}
              onChange={(e) => setDbForm((p) => ({ ...p, notionDatabaseId: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              required
              placeholder="slug (例: docker)"
              value={dbForm.slug}
              onChange={(e) => setDbForm((p) => ({ ...p, slug: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              required
              placeholder="表示名"
              value={dbForm.name}
              onChange={(e) => setDbForm((p) => ({ ...p, name: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              placeholder="説明（任意）"
              value={dbForm.description}
              onChange={(e) => setDbForm((p) => ({ ...p, description: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
          </div>
          {dbFormError && <p className="text-xs" style={{ color: '#fca5a5' }}>{dbFormError}</p>}
          {dbFormSuccess && (
            <p className="flex items-center gap-1 text-xs" style={{ color: '#86efac' }}>
              <Check className="size-3" />
              追加しました
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            追加する
          </button>
        </form>
      </section>

      {/* ── Technology section ── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ color: '#e5eefc' }}>
          <BookMarked className="size-5" style={{ color: '#06b6d4' }} />
          技術カード管理
        </h2>

        {/* Tech list */}
        <div className="mb-6 space-y-3">
          {initialTechnologies.length === 0 && (
            <p className="text-sm" style={{ color: '#6b7f9a' }}>
              技術カードが登録されていません。
            </p>
          )}
          {initialTechnologies.map((tech) => (
            <div
              key={tech.id}
              className="flex items-center justify-between gap-4 rounded-xl border p-4"
              style={{
                background: 'rgba(15,23,42,.55)',
                borderColor: 'rgba(148,163,184,.18)',
              }}
            >
              <div>
                <p className="font-medium" style={{ color: '#e5eefc' }}>
                  {tech.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: '#6b7f9a' }}>
                  slug: {tech.slug} / order: {tech.sortOrder}
                </p>
                {tech.description && (
                  <p className="mt-1 text-xs line-clamp-1" style={{ color: '#9fb0cc' }}>
                    {tech.description}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  setTechForm({
                    id: tech.id,
                    slug: tech.slug,
                    name: tech.name,
                    description: tech.description ?? '',
                    iconUrl: tech.iconUrl ?? '',
                    sortOrder: String(tech.sortOrder),
                  })
                }
                className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(148,163,184,.18)', color: '#9fb0cc' }}
              >
                編集
              </button>
            </div>
          ))}
        </div>

        {/* Upsert tech form */}
        <form
          onSubmit={handleUpsertTech}
          className="rounded-xl border p-5 space-y-3"
          style={{
            background: 'rgba(15,23,42,.45)',
            borderColor: 'rgba(148,163,184,.18)',
          }}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#dce8ff' }}>
            <Plus className="size-4" />
            {techForm.id ? '技術カードを編集' : '技術カードを追加'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="slug (例: docker)"
              value={techForm.slug}
              onChange={(e) => setTechForm((p) => ({ ...p, slug: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              required
              placeholder="表示名"
              value={techForm.name}
              onChange={(e) => setTechForm((p) => ({ ...p, name: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              placeholder="説明（任意）"
              value={techForm.description}
              onChange={(e) => setTechForm((p) => ({ ...p, description: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20 sm:col-span-2"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              placeholder="アイコンURL（任意）"
              value={techForm.iconUrl}
              onChange={(e) => setTechForm((p) => ({ ...p, iconUrl: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
            <input
              type="number"
              placeholder="表示順"
              value={techForm.sortOrder}
              onChange={(e) => setTechForm((p) => ({ ...p, sortOrder: e.target.value }))}
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20"
              style={{ borderColor: 'rgba(148,163,184,.18)', color: '#e5eefc' }}
            />
          </div>
          {techFormError && (
            <p className="text-xs" style={{ color: '#fca5a5' }}>
              {techFormError}
            </p>
          )}
          {techFormSuccess && (
            <p className="flex items-center gap-1 text-xs" style={{ color: '#86efac' }}>
              <Check className="size-3" />
              保存しました
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {techForm.id ? '更新する' : '追加する'}
            </button>
            {techForm.id && (
              <button
                type="button"
                onClick={() =>
                  setTechForm({
                    id: '',
                    slug: '',
                    name: '',
                    description: '',
                    iconUrl: '',
                    sortOrder: '0',
                  })
                }
                className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(148,163,184,.18)', color: '#9fb0cc' }}
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
