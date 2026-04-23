import { useState, useCallback } from 'react'
import { SUBJECTS } from '../data'

export function useSubjectScores() {
  const [entries, setEntries] = useState([
    { id: 1, subject: '', score: '' },
    { id: 2, subject: '', score: '' },
  ])

  const usedSubjects = entries.map((e) => e.subject).filter(Boolean)

  const availableSubjects = (currentSubject) =>
    SUBJECTS.filter((s) => !usedSubjects.includes(s) || s === currentSubject)

  const addEntry = useCallback(() => {
    if (entries.length >= SUBJECTS.length) return
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), subject: '', score: '' },
    ])
  }, [entries.length])

  const removeEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateEntry = useCallback((id, field, value) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }, [])

  const total = entries.reduce((sum, e) => {
    if (!e.subject || e.score === '') return sum
    const val = parseInt(e.score, 10)
    if (isNaN(val) || val < 0 || val > 100) return sum
    return sum + val
  }, 0)

  const validCount = entries.filter((e) => {
    if (!e.subject || e.score === '') return false
    const val = parseInt(e.score, 10)
    return !isNaN(val) && val >= 0 && val <= 100
  }).length

  const canSearch = validCount >= 2

  return {
    entries,
    total,
    validCount,
    canSearch,
    availableSubjects,
    addEntry,
    removeEntry,
    updateEntry,
  }
}
