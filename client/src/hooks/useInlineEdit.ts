import { useState } from 'react'

/**
 * Editing one table row at a time: which row is being edited and its draft values.
 */
export const useInlineEdit = <V extends Record<string, unknown>>() => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [values, setValues] = useState<V | null>(null)

  const startEdit = (id: string, initial: V) => {
    setEditingId(id)
    setValues(initial)
  }

  const setField = <K extends keyof V>(name: K, value: V[K]) => {
    setValues((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const cancel = () => {
    setEditingId(null)
    setValues(null)
  }

  return { editingId, values, startEdit, setField, cancel, isEditing: (id: string) => editingId === id }
}
