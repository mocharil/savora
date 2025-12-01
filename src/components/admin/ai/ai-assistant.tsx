'use client'

import { useState } from 'react'
import {
  Sparkles,
  FileText,
  Image,
  Lightbulb,
  BarChart3,
  Send,
  Loader2,
  ArrowRight,
  ChefHat,
  TrendingUp,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  DollarSign,
} from 'lucide-react'

type AssistantMode = 'chat' | 'menu-creator' | 'analytics'

interface GeneratedMenuItem {
  name: string
  description: string
  imagePrompt: string
  estimatedPrice: string
  cookingTime: string
  difficulty: string
  profitMargin: string
  servingTips: string
}

const quickActions = [
  {
    id: 'describe',
    icon: FileText,
    label: 'Buat Deskripsi Menu',
    prompt: 'Buatkan deskripsi menarik untuk menu',
    color: 'from-orange-500 to-cyan-500',
  },
  {
    id: 'suggest',
    icon: Lightbulb,
    label: 'Saran Menu Baru',
    prompt: 'Rekomendasikan menu baru berdasarkan bahan',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'analyze',
    icon: BarChart3,
    label: 'Analisis Penjualan',
    prompt: 'Analisis produk mana yang paling laku',
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

const cuisineTypes = [
  { id: 'indonesian', label: 'Indonesia' },
  { id: 'italian', label: 'Italia' },
  { id: 'japanese', label: 'Jepang' },
  { id: 'chinese', label: 'China' },
  { id: 'western', label: 'Western' },
  { id: 'korean', label: 'Korea' },
  { id: 'fusion', label: 'Fusion' },
]

const businessTypes = [
  { id: 'cafe', label: 'Kafe' },
  { id: 'restaurant', label: 'Restoran' },
  { id: 'warung', label: 'Warung Makan' },
  { id: 'foodtruck', label: 'Food Truck' },
  { id: 'catering', label: 'Catering' },
]

const priceRanges = [
  { id: 'budget', label: 'Budget (Rp 15-35rb)' },
  { id: 'medium', label: 'Menengah (Rp 35-75rb)' },
  { id: 'premium', label: 'Premium (Rp 75-150rb)' },
  { id: 'luxury', label: 'Luxury (>Rp 150rb)' },
]

export function AIAssistant() {
  const [mode, setMode] = useState<AssistantMode>('chat')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<
    { role: 'user' | 'assistant'; content: string; type?: string }[]
  >([])
  const [copied, setCopied] = useState<string | null>(null)

  // Menu Creator State
  const [menuCreatorStep, setMenuCreatorStep] = useState(0)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [menuCreatorConfig, setMenuCreatorConfig] = useState({
    cuisineType: 'indonesian',
    businessType: 'restaurant',
    priceRange: 'medium',
  })
  const [generatedMenus, setGeneratedMenus] = useState<GeneratedMenuItem[]>([])
  const [selectedMenuIndex, setSelectedMenuIndex] = useState<number | null>(null)

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()])
      setIngredientInput('')
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

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

  const handleMenuCreator = async () => {
    if (ingredients.length === 0) return

    setLoading(true)
    setMenuCreatorStep(1)

    try {
      const response = await fetch('/api/ai/menu-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          cuisineType: menuCreatorConfig.cuisineType,
          businessType: menuCreatorConfig.businessType,
          priceRange: menuCreatorConfig.priceRange,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setGeneratedMenus(data.menus)
      setMenuCreatorStep(2)
    } catch (error: any) {
      console.error('Menu creator error:', error)
      setMenuCreatorStep(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const resetMenuCreator = () => {
    setMenuCreatorStep(0)
    setIngredients([])
    setGeneratedMenus([])
    setSelectedMenuIndex(null)
  }

  const renderChat = () => (
    <div className="flex flex-col h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Halo! Saya AI Assistant Anda
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Saya siap membantu Anda membuat deskripsi menu, memberikan saran
              menu baru, menganalisis penjualan, dan banyak lagi.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group"
                >
                  <div
                    className={`p-2 bg-gradient-to-br ${action.color} rounded-lg`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {action.label}
                    </p>
                  </div>
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
                    ? 'bg-violet-600 text-white'
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
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan atau pilih aksi cepat..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderMenuCreator = () => (
    <div className="p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Bahan & Preferensi', 'AI Memproses', 'Pilih Menu'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= menuCreatorStep
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:block ${index <= menuCreatorStep ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {step}
            </span>
            {index < 2 && (
              <ArrowRight className="w-4 h-4 mx-2 sm:mx-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Input Ingredients */}
      {menuCreatorStep === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Ingredients Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bahan-bahan yang Anda Miliki <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="Ketik bahan lalu tekan Enter..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                onClick={addIngredient}
                disabled={!ingredientInput.trim()}
                className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Ingredient Tags */}
            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm"
                  >
                    {ing}
                    <button
                      onClick={() => removeIngredient(index)}
                      className="hover:text-violet-900 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Contoh: ayam, bawang putih, kecap manis, telur, nasi
              </p>
            )}
          </div>

          {/* Configuration */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema Kuliner
              </label>
              <select
                value={menuCreatorConfig.cuisineType}
                onChange={(e) =>
                  setMenuCreatorConfig({ ...menuCreatorConfig, cuisineType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {cuisineTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Bisnis
              </label>
              <select
                value={menuCreatorConfig.businessType}
                onChange={(e) =>
                  setMenuCreatorConfig({ ...menuCreatorConfig, businessType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {businessTypes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Range Harga
              </label>
              <select
                value={menuCreatorConfig.priceRange}
                onChange={(e) =>
                  setMenuCreatorConfig({ ...menuCreatorConfig, priceRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {priceRanges.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleMenuCreator}
            disabled={ingredients.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Generate Rekomendasi Menu
          </button>

          <p className="text-center text-xs text-gray-400">
            AI akan merekomendasikan 3-5 menu lengkap dengan nama, deskripsi, dan prompt foto
          </p>
        </div>
      )}

      {/* Step 1: Loading */}
      {menuCreatorStep === 1 && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">AI sedang membuat rekomendasi menu...</p>
          <p className="text-sm text-gray-400 mt-2">
            Menganalisis bahan dan membuat nama, deskripsi, serta prompt foto
          </p>
        </div>
      )}

      {/* Step 2: Results */}
      {menuCreatorStep === 2 && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rekomendasi Menu ({generatedMenus.length})
              </h3>
              <p className="text-sm text-gray-500">
                Berdasarkan: {ingredients.join(', ')}
              </p>
            </div>
            <button
              onClick={resetMenuCreator}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Buat Baru
            </button>
          </div>

          {/* Menu Cards */}
          <div className="grid gap-4">
            {generatedMenus.map((menu, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  selectedMenuIndex === index
                    ? 'border-violet-500 ring-2 ring-violet-200'
                    : 'border-gray-200 hover:border-violet-300'
                }`}
              >
                {/* Menu Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedMenuIndex(selectedMenuIndex === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{menu.name}</h4>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {menu.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-violet-600 font-semibold">{menu.estimatedPrice}</span>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {menu.cookingTime}
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      menu.difficulty === 'mudah' ? 'bg-green-100 text-green-700' :
                      menu.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {menu.difficulty}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${
                      menu.profitMargin === 'tinggi' ? 'text-green-600' :
                      menu.profitMargin === 'sedang' ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      <DollarSign className="w-3 h-3" />
                      Margin {menu.profitMargin}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {selectedMenuIndex === index && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                    {/* Description */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          Deskripsi Menu
                        </h5>
                        <button
                          onClick={() => handleCopy(menu.description, `desc-${index}`)}
                          className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                        >
                          {copied === `desc-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === `desc-${index}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm">{menu.description}</p>
                    </div>

                    {/* Image Prompt */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 flex items-center gap-2">
                          <Image className="w-4 h-4 text-pink-500" />
                          Prompt Foto Menu
                        </h5>
                        <button
                          onClick={() => handleCopy(menu.imagePrompt, `img-${index}`)}
                          className="text-xs text-pink-600 hover:text-pink-800 flex items-center gap-1"
                        >
                          {copied === `img-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === `img-${index}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm font-mono bg-gray-50 p-3 rounded">
                        {menu.imagePrompt}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Gunakan di Midjourney, DALL-E, atau AI image generator lainnya
                      </p>
                    </div>

                    {/* Tips */}
                    {menu.servingTips && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <h5 className="font-medium text-amber-900 flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4" />
                          Tips Penyajian
                        </h5>
                        <p className="text-amber-800 text-sm">{menu.servingTips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderAnalytics = () => (
    <div className="p-6">
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analisis Produk
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Lihat produk terlaris dan dapatkan insight dari AI
        </p>
        <button
          onClick={async () => {
            setLoading(true)
            try {
              const response = await fetch('/api/ai/product-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dateRange: '30' }),
              })
              const data = await response.json()

              if (data.success) {
                const insights = data.data.aiInsights
                setConversation([
                  {
                    role: 'assistant',
                    content: `📊 **Analisis 30 Hari Terakhir**\n\n${insights?.summary || 'Data belum tersedia'}\n\n**Rekomendasi:**\n${insights?.actionItems?.map((item: any) => `• [${item.priority}] ${item.action}`).join('\n') || 'Tidak ada rekomendasi'}`,
                    type: 'analytics',
                  },
                ])
                setMode('chat')
              }
            } catch (error) {
              console.error('Analytics error:', error)
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Mulai Analisis'
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMode('chat')}
          data-tour="ai-menu-creator"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
            mode === 'chat'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Chat AI
        </button>
        <button
          onClick={() => setMode('menu-creator')}
          data-tour="ai-pricing"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
            mode === 'menu-creator'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Menu Creator
        </button>
        <button
          onClick={() => setMode('analytics')}
          data-tour="ai-analytics"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
            mode === 'analytics'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Analisis
        </button>
      </div>

      {/* Content */}
      {mode === 'chat' && renderChat()}
      {mode === 'menu-creator' && renderMenuCreator()}
      {mode === 'analytics' && renderAnalytics()}
    </div>
  )
}
