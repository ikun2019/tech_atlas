'use client'

import { useState } from 'react'
import { updateUserRole } from '@/lib/api/admin'
import type { User, Role } from '@/types/api'

interface UserTableProps {
  initialUsers: User[]
  currentUserId: string
}

const ROLES: Role[] = ['USER', 'INSTRUCTOR', 'ADMIN']

export function UserTable({ initialUsers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [confirmChange, setConfirmChange] = useState<{ userId: string; role: Role } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleRoleChange(userId: string, role: Role) {
    setLoading(userId)
    try {
      await updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
    } finally {
      setLoading(null)
      setConfirmChange(null)
    }
  }

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-border border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">名前</th>
            <th className="px-4 py-3 text-left font-medium">メール</th>
            <th className="px-4 py-3 text-left font-medium">ロール</th>
            <th className="px-4 py-3 text-left font-medium">登録日</th>
            <th className="px-4 py-3 text-left font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="text-muted-foreground px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="text-muted-foreground px-4 py-3 text-xs">
                {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td className="px-4 py-3">
                {user.id === currentUserId ? (
                  <span className="text-muted-foreground text-xs">（自分）</span>
                ) : confirmChange?.userId === user.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      → {confirmChange.role} に変更?
                    </span>
                    <button
                      className="text-brand-600 text-xs font-medium"
                      onClick={() => handleRoleChange(confirmChange.userId, confirmChange.role)}
                      disabled={loading === user.id}
                    >
                      確定
                    </button>
                    <button
                      className="text-muted-foreground text-xs"
                      onClick={() => setConfirmChange(null)}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <select
                    className="border-input bg-background h-7 rounded border px-1.5 text-xs"
                    value={user.role}
                    onChange={(e) => setConfirmChange({ userId: user.id, role: e.target.value as Role })}
                    disabled={loading === user.id}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
