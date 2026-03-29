import { create } from 'zustand'

interface ProgressState {
  completedLessonIds: Set<string>
  markComplete: (lessonId: string) => void
  markIncomplete: (lessonId: string) => void
  isCompleted: (lessonId: string) => boolean
  setCompleted: (lessonIds: string[]) => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedLessonIds: new Set(),
  markComplete: (lessonId) =>
    set((state) => ({
      completedLessonIds: new Set([...state.completedLessonIds, lessonId]),
    })),
  markIncomplete: (lessonId) =>
    set((state) => {
      const next = new Set(state.completedLessonIds)
      next.delete(lessonId)
      return { completedLessonIds: next }
    }),
  isCompleted: (lessonId) => get().completedLessonIds.has(lessonId),
  setCompleted: (lessonIds) => set({ completedLessonIds: new Set(lessonIds) }),
}))
