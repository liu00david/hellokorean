'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'liu00david@gmail.com'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form states
  const [deleteEmail, setDeleteEmail] = useState('')
  const [clearEmail, setClearEmail] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    if (user.email !== ADMIN_EMAIL) {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Access denied. Admin only.</p>
      </div>
    )
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSyncContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/sync-content', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        showMessage('success', `Synced ${data.lessonsCount} lessons and ${data.wordsCount} words`)
      } else {
        showMessage('error', data.error || 'Failed to sync content')
      }
    } catch (error) {
      showMessage('error', 'Error syncing content')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteEmail.trim()) {
      showMessage('error', 'Please enter an email')
      return
    }

    if (!confirm(`Are you sure you want to permanently delete user ${deleteEmail}? This cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail }),
      })
      const data = await response.json()

      if (response.ok) {
        showMessage('success', `User ${deleteEmail} deleted successfully`)
        setDeleteEmail('')
      } else {
        showMessage('error', data.error || 'Failed to delete user')
      }
    } catch (error) {
      showMessage('error', 'Error deleting user')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clearEmail.trim()) {
      showMessage('error', 'Please enter an email')
      return
    }

    if (!confirm(`Are you sure you want to clear all progress for ${clearEmail}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/clear-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clearEmail }),
      })
      const data = await response.json()

      if (response.ok) {
        const msg = `Cleared progress for ${clearEmail}: ${data.deleted_lessons} lessons, ${data.deleted_words} words, ${data.deleted_quizzes} quizzes`
        showMessage('success', msg)
        setClearEmail('')
      } else {
        showMessage('error', data.error || 'Failed to clear progress')
      }
    } catch (error) {
      showMessage('error', 'Error clearing progress')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Console</h1>
        <p className="text-gray-600 mb-8">Manage content and users</p>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Sync Content */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sync Content</h2>
            <p className="text-gray-600 mb-4">
              Sync all lessons and dictionary words from JSON files to the database.
            </p>
            <button
              onClick={handleSyncContent}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Syncing...' : 'Sync Content'}
            </button>
          </div>

          {/* Delete User */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Delete User</h2>
            <p className="text-gray-600 mb-4">
              Permanently delete a user and all their data including auth account.
            </p>
            <form onSubmit={handleDeleteUser} className="flex gap-3">
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </form>
          </div>

          {/* Clear Progress */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Clear Progress</h2>
            <p className="text-gray-600 mb-4">
              Clear all progress for a user (lessons, words, quizzes) but keep their account.
            </p>
            <form onSubmit={handleClearProgress} className="flex gap-3">
              <input
                type="email"
                value={clearEmail}
                onChange={(e) => setClearEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Clearing...' : 'Clear Progress'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
