'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Sparkles,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Plus,
  X,
  RefreshCw,
  Download,
  Copy,
  DollarSign,
  Clock,
  Users,
  Flame,
  Leaf,
  Star,
  CheckCircle,
  ImageIcon,
  Utensils,
  Lightbulb,
} from 'lucide-react'

interface AIMenuCreatorProps {
  storeId: string
}

interface GeneratedDish {
  id: string
  name: string
  description: string
  ingredients: string[]
  composition: string
  imageUrl: string | null
  suggestedPrice: number
  costEstimate: number
  profitMargin: number
  cookingTime: string
  difficulty: 'mudah' | 'sedang' | 'sulit'
  servings: number
  tags: string[]
  tips: string
}

type Step = 'input' | 'generating' | 'results'

const cuisineOptions = [
  { id: 'indonesian', label: 'Indonesia', image: '/indonesia.png' },
  { id: 'western', label: 'Western', image: '/western.png' },
  { id: 'japanese', label: 'Jepang', image: '/jepang.png' },
  { id: 'chinese', label: 'China', image: '/china.png' },
  { id: 'korean', label: 'Korea', image: '/korea.png' },
  { id: 'italian', label: 'Italia', image: '/italia.png' },
  { id: 'dessert', label: 'Dessert', image: '/dessert.png' },
  { id: 'beverage', label: 'Minuman', image: '/minuman.png' },
]

const priceRanges = [
  { id: 'budget', label: 'Budget', range: 'Rp 15-35rb', value: '15000-35000' },
  { id: 'medium', label: 'Menengah', range: 'Rp 35-75rb', value: '35000-75000' },
  { id: 'premium', label: 'Premium', range: 'Rp 75-150rb', value: '75000-150000' },
  { id: 'luxury', label: 'Luxury', range: '>Rp 150rb', value: '150000-500000' },
]

const difficultyOptions = [
  { id: 'mudah', label: 'Mudah', desc: 'Bisa dibuat cepat' },
  { id: 'sedang', label: 'Sedang', desc: 'Butuh keahlian dasar' },
  { id: 'sulit', label: 'Sulit', desc: 'Chef berpengalaman' },
]

const portionOptions = [
  { id: '1', label: '1 porsi', desc: 'Individual' },
  { id: '2-3', label: '2-3 porsi', desc: 'Sharing kecil' },
  { id: '4-6', label: '4-6 porsi', desc: 'Keluarga' },
]

const outputOptions = [
  { id: 'single', label: '1 Ide', desc: 'Fokus detail' },
  { id: 'multiple', label: '3 Ide', desc: 'Variasi pilihan' },
  { id: 'set', label: 'Set Menu', desc: 'Paket lengkap' },
]

export function AIMenuCreator({ storeId }: AIMenuCreatorProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')

  // Form state
  const [cuisineType, setCuisineType] = useState('indonesian')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [priceRange, setPriceRange] = useState('medium')
  const [difficulty, setDifficulty] = useState('sedang')
  const [portion, setPortion] = useState('1')
  const [outputFormat, setOutputFormat] = useState('multiple')

  // Results state
  const [generatedDishes, setGeneratedDishes] = useState<GeneratedDish[]>([])
  const [selectedDish, setSelectedDish] = useState<GeneratedDish | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set())
  const [addingToMenu, setAddingToMenu] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [addedDishName, setAddedDishName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const addIngredient = () => {
    const trimmed = ingredientInput.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setIngredientInput('')
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    setStep('generating')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/menu-creator-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisineType,
          ingredients,
          priceRange,
          difficulty,
          portion,
          outputFormat,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate menu ideas')
      }

      setGeneratedDishes(data.dishes)
      setStep('results')
    } catch (error: any) {
      console.error('Generate error:', error)
      setStep('input')
      alert('Gagal generate menu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async (dish: GeneratedDish) => {
    setGeneratingImages(prev => new Set(prev).add(dish.id))

    try {
      const response = await fetch('/api/ai/generate-dish-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dish.name,
          description: dish.description,
          ingredients: dish.ingredients,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // Update the dish with generated image
      setGeneratedDishes(prev =>
        prev.map(d => d.id === dish.id ? { ...d, imageUrl: data.imageUrl } : d)
      )
    } catch (error: any) {
      console.error('Image generation error:', error)
      alert('Gagal generate gambar: ' + error.message)
    } finally {
      setGeneratingImages(prev => {
        const next = new Set(prev)
        next.delete(dish.id)
        return next
      })
    }
  }

  const handleAddToMenu = async (dish: GeneratedDish) => {
    setAddingToMenu(dish.id)

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dish.name,
          description: dish.description,
          price: dish.suggestedPrice,
          image_url: dish.imageUrl,
          is_available: true,
          is_featured: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to menu')
      }

      setAddedDishName(dish.name)
      setShowSuccessModal(true)
    } catch (error: any) {
      console.error('Add to menu error:', error)
      alert('Gagal menambahkan ke menu: ' + error.message)
    } finally {
      setAddingToMenu(null)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownloadImage = async (imageUrl: string, dishName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${dishName.toLowerCase().replace(/\s+/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const resetCreator = () => {
    setStep('input')
    setGeneratedDishes([])
    setSelectedDish(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Menu Creator</h1>
                <p className="text-sm text-gray-500">Temukan ide menu baru untuk bisnis Anda</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {['Input', 'Generate', 'Hasil'].map((label, index) => {
                const stepIndex = step === 'input' ? 0 : step === 'generating' ? 1 : 2
                const isActive = index <= stepIndex
                const isCurrent = index === stepIndex

                return (
                  <div key={label} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white'
                        : isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isActive && index < stepIndex ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="w-5 h-5 flex items-center justify-center">{index + 1}</span>
                      )}
                      <span className="hidden md:inline">{label}</span>
                    </div>
                    {index < 2 && (
                      <ArrowRight className={`w-4 h-4 mx-1 ${isActive ? 'text-orange-400' : 'text-gray-300'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cuisine Type */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                Jenis Kuliner
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {cuisineOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCuisineType(option.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      cuisineType === option.id
                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/20'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                      <Image
                        src={option.image}
                        alt={option.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className={`text-xs font-medium ${cuisineType === option.id ? 'text-orange-700' : 'text-gray-600'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                Bahan yang Tersedia
                <span className="text-xs font-normal text-gray-400">(opsional)</span>
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  placeholder="Ketik bahan lalu tekan Enter..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <button
                  onClick={addIngredient}
                  disabled={!ingredientInput.trim()}
                  className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {ing}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="hover:text-orange-900 transition-colors"
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

            {/* Price Range */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Target Harga Jual
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {priceRanges.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPriceRange(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      priceRange === option.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <p className={`font-semibold ${priceRange === option.id ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {option.label}
                    </p>
                    <p className={`text-sm ${priceRange === option.id ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {option.range}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Portion */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Tingkat Kesulitan
                </h2>
                <div className="space-y-2">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setDifficulty(option.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                        difficulty === option.id
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${difficulty === option.id ? 'text-red-700' : 'text-gray-900'}`}>
                          {option.label}
                        </p>
                        <p className={`text-xs ${difficulty === option.id ? 'text-red-600' : 'text-gray-500'}`}>
                          {option.desc}
                        </p>
                      </div>
                      {difficulty === option.id && <Check className="w-5 h-5 text-red-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Ukuran Porsi
                </h2>
                <div className="space-y-2">
                  {portionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPortion(option.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                        portion === option.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${portion === option.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {option.label}
                        </p>
                        <p className={`text-xs ${portion === option.id ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.desc}
                        </p>
                      </div>
                      {portion === option.id && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Format */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Format Output
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {outputOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setOutputFormat(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      outputFormat === option.id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <p className={`font-semibold ${outputFormat === option.id ? 'text-amber-700' : 'text-gray-900'}`}>
                      {option.label}
                    </p>
                    <p className={`text-xs ${outputFormat === option.id ? 'text-amber-600' : 'text-gray-500'}`}>
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
            >
              <Sparkles className="w-6 h-6" />
              Generate Ide Menu
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping" />
            </div>
            <h3 className="mt-8 text-xl font-semibold text-gray-900">AI sedang membuat ide menu...</h3>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              Menganalisis preferensi dan menciptakan menu unik dengan komposisi bahan, estimasi harga, dan tips penyajian
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-orange-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Biasanya membutuhkan 10-20 detik
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ide Menu untuk Anda ({generatedDishes.length})
                </h2>
                <p className="text-gray-500 text-sm">
                  Pilih menu yang menarik dan tambahkan ke daftar menu Anda
                </p>
              </div>
              <button
                onClick={resetCreator}
                className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Ulang
              </button>
            </div>

            {/* Dish Cards */}
            <div className="grid gap-6">
              {generatedDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-72 h-48 md:h-auto relative bg-gradient-to-br from-orange-100 to-amber-100 flex-shrink-0">
                      {dish.imageUrl ? (
                        <>
                          <Image
                            src={dish.imageUrl}
                            alt={dish.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <button
                              onClick={() => handleDownloadImage(dish.imageUrl!, dish.name)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-orange-300 mb-2" />
                          <button
                            onClick={() => handleGenerateImage(dish)}
                            disabled={generatingImages.has(dish.id)}
                            className="px-4 py-2 bg-white text-orange-600 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {generatingImages.has(dish.id) ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Generate Foto AI
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{dish.name}</h3>
                          <p className="mt-1 text-gray-600 text-sm line-clamp-2">{dish.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(dish.suggestedPrice)}
                          </p>
                          <p className="text-xs text-gray-500">Harga jual</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          dish.difficulty === 'mudah' ? 'bg-green-100 text-green-700' :
                          dish.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {dish.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dish.cookingTime}
                        </span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Margin {dish.profitMargin}%
                        </span>
                        {dish.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Ingredients */}
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Bahan Utama:</p>
                        <div className="flex flex-wrap gap-1">
                          {dish.ingredients.slice(0, 6).map((ing) => (
                            <span key={ing} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                              {ing}
                            </span>
                          ))}
                          {dish.ingredients.length > 6 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                              +{dish.ingredients.length - 6} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Composition */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-500">Komposisi & Cara Buat:</p>
                          <button
                            onClick={() => handleCopy(dish.composition, `comp-${dish.id}`)}
                            className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                          >
                            {copied === `comp-${dish.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied === `comp-${dish.id}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{dish.composition}</p>
                      </div>

                      {/* Tips */}
                      {dish.tips && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                            <Lightbulb className="w-3 h-3" />
                            Tips
                          </p>
                          <p className="text-xs text-amber-800">{dish.tips}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleAddToMenu(dish)}
                          disabled={addingToMenu === dish.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
                        >
                          {addingToMenu === dish.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Menambahkan...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Tambah ke Menu
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(`${dish.name}\n\n${dish.description}\n\nBahan: ${dish.ingredients.join(', ')}\n\nHarga: ${formatCurrency(dish.suggestedPrice)}`, `full-${dish.id}`)}
                          className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setStep('input')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke pengaturan
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h3>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-orange-600">{addedDishName}</span> telah ditambahkan ke daftar Menu Anda.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Lanjut Explore
              </button>
              <button
                onClick={() => router.push('/admin/menu')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Lihat Menu
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
