'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  FileText,
  Image,
  Lightbulb,
  Send,
  Loader2,
  Copy,
  Check,
  ChefHat,
  ArrowRight,
} from 'lucide-react'

const quickActions = [
  {
    id: 'describe',
    icon: FileText,
    label: 'Buat Deskripsi Menu',
    prompt: 'Buatkan deskripsi menarik untuk menu',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'suggest',
    icon: Lightbulb,
    label: 'Saran Menu Baru',
    prompt: 'Rekomendasikan menu baru berdasarkan bahan',
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'image',
    icon: Image,
    label: 'Prompt Foto Menu',
    prompt: 'Buatkan prompt untuk foto menu',
    color: 'from-pink-500 to-rose-500',
  },
]

export function AIAssistant() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<
    { role: 'user' | 'assistant'; content: string; type?: string }[]
  >([])
  const [copied, setCopied] = useState<string | null>(null)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setConversation((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, type: data.type },
      ])
    } catch (error: any) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Maaf, terjadi kesalahan: ${error.message}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (action: (typeof quickActions)[0]) => {
    setConversation((prev) => [
      ...prev,
      { role: 'user', content: action.prompt },
    ])
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: action.prompt,
          action: action.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, type: action.id },
      ])
    } catch (error: any) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Maaf, terjadi kesalahan: ${error.message}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* AI Menu Creator Promo Card */}
      <Link href="/admin/menu-creator">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Menu Creator</h3>
                <p className="text-white/80 text-sm">
                  Generate ide menu baru dengan AI - lengkap dengan foto, harga, dan komposisi bahan
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white/80" />
          </div>
        </div>
      </Link>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Chat AI Assistant</h2>
              <p className="text-xs text-gray-500">Tanya apa saja tentang bisnis F&B Anda</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4" data-tour="ai-chat-messages">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Halo! Saya AI Assistant Anda
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Saya siap membantu Anda membuat deskripsi menu, memberikan saran menu baru, dan banyak lagi.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto" data-tour="ai-quick-actions">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-violet-300 transition-all text-left group"
                  >
                    <div
                      className={`p-2 bg-gradient-to-br ${action.color} rounded-lg`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.content, `chat-${index}`)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {copied === `chat-${index}` ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-gray-50" data-tour="ai-chat-input">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan atau pilih aksi cepat..."
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
