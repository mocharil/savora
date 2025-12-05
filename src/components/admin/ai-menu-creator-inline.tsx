'use client'

import { useState, useEffect } from 'react'
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
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  Package,
  Layers,
  HelpCircle,
  PlayCircle,
} from 'lucide-react'

interface AIMenuCreatorInlineProps {
  storeId: string
}

interface Category {
  id: string
  name: string
}

interface IngredientDetail {
  name: string
  amount: string
  unit: string
  price: number
}

interface Recipe {
  prepTime: string
  cookTime: string
  totalTime: string
  steps: string[]
}

interface GeneratedDish {
  id: string
  name: string
  description: string
  ingredients: string[]
  ingredientDetails: IngredientDetail[]
  recipe: Recipe
  composition: string
  plating: string
  imageUrl: string | null
  suggestedPrice: number
  costEstimate: number
  profitMargin: number
  cookingTime: string
  difficulty: 'mudah' | 'sedang' | 'sulit'
  servings: number
  tags: string[]
  tips: string
  variations: string
  storage: string
  allergens: string[]
}

type Step = 'input' | 'generating' | 'results'

const cuisineOptions = [
  { id: 'indonesian', label: 'Indonesia', icon: '🇮🇩' },
  { id: 'western', label: 'Western', icon: '🍔' },
  { id: 'japanese', label: 'Jepang', icon: '🍱' },
  { id: 'chinese', label: 'China', icon: '🥡' },
  { id: 'korean', label: 'Korea', icon: '🍜' },
  { id: 'italian', label: 'Italia', icon: '🍝' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'beverage', label: 'Minuman', icon: '🥤' },
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

export function AIMenuCreatorInline({ storeId }: AIMenuCreatorInlineProps) {
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
  const [loading, setLoading] = useState(false)
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set())
  const [addingToMenu, setAddingToMenu] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [addedDishName, setAddedDishName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false)

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Category selection modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedDishForCategory, setSelectedDishForCategory] = useState<GeneratedDish | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()
        if (response.ok && data.categories) {
          setCategories(data.categories)
          // Auto-select first category if available
          if (data.categories.length > 0) {
            setSelectedCategoryId(data.categories[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const toggleCardExpanded = (dishId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(dishId)) {
        next.delete(dishId)
      } else {
        next.add(dishId)
      }
      return next
    })
  }

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

      // Auto-generate images for all dishes
      autoGenerateImages(data.dishes)
    } catch (error: any) {
      console.error('Generate error:', error)
      setStep('input')
      alert('Gagal generate menu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate images for dishes without images
  const autoGenerateImages = async (dishes: GeneratedDish[]) => {
    for (const dish of dishes) {
      if (!dish.imageUrl) {
        // Add to generating set
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

          if (response.ok && data.imageUrl) {
            setGeneratedDishes(prev =>
              prev.map(d => d.id === dish.id ? { ...d, imageUrl: data.imageUrl } : d)
            )
          }
        } catch (error) {
          console.error('Auto image generation error for', dish.name, error)
        } finally {
          setGeneratingImages(prev => {
            const next = new Set(prev)
            next.delete(dish.id)
            return next
          })
        }
      }
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

  // Open category selection modal
  const handleAddToMenu = (dish: GeneratedDish) => {
    if (categories.length === 0) {
      alert('Belum ada kategori. Silakan buat kategori terlebih dahulu di menu Kategori.')
      return
    }
    setSelectedDishForCategory(dish)
    setShowCategoryModal(true)
  }

  // Actually add dish to menu with selected category
  const handleConfirmAddToMenu = async () => {
    if (!selectedDishForCategory || !selectedCategoryId) {
      alert('Pilih kategori terlebih dahulu')
      return
    }

    setAddingToMenu(selectedDishForCategory.id)
    setShowCategoryModal(false)

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedDishForCategory.name,
          description: selectedDishForCategory.description,
          price: selectedDishForCategory.suggestedPrice,
          image_url: selectedDishForCategory.imageUrl,
          category_id: selectedCategoryId,
          is_available: true,
          is_featured: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to menu')
      }

      setAddedDishName(selectedDishForCategory.name)
      setShowSuccessModal(true)
      setSelectedDishForCategory(null)
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
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl border border-orange-100 overflow-hidden">
      {/* Progress Header */}
      <div className="bg-white border-b border-orange-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Menu Creator</h2>
              <p className="text-xs text-gray-500">Generate ide menu baru dengan AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tutorial Button */}
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                showTutorial
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Tutorial
            </button>

            {/* Progress Steps */}
            <div className="hidden sm:flex items-center gap-2">
              {['Input', 'Generate', 'Hasil'].map((label, index) => {
                const stepIndex = step === 'input' ? 0 : step === 'generating' ? 1 : 2
                const isActive = index <= stepIndex
                const isCurrent = index === stepIndex

                return (
                  <div key={label} className="flex items-center">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white'
                        : isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isActive && index < stepIndex ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                      <span>{label}</span>
                    </div>
                    {index < 2 && (
                      <ArrowRight className={`w-3 h-3 mx-1 ${isActive ? 'text-orange-400' : 'text-gray-300'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Section */}
      {showTutorial && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Cara Menggunakan AI Menu Creator</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-blue-800">Pilih Preferensi</p>
                    <p className="text-blue-600 text-xs mt-0.5">Pilih jenis kuliner, bahan yang tersedia, range harga, tingkat kesulitan, dan jumlah porsi.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-blue-800">Generate dengan AI</p>
                    <p className="text-blue-600 text-xs mt-0.5">AI akan membuat ide menu lengkap dengan resep detail, estimasi harga, dan foto otomatis.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-blue-800">Tambah ke Menu</p>
                    <p className="text-blue-600 text-xs mt-0.5">Pilih ide yang Anda suka dan langsung tambahkan ke daftar menu restoran Anda.</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  <strong>Tips:</strong> Semakin spesifik bahan yang Anda masukkan, semakin relevan ide menu yang dihasilkan. AI juga akan memberikan tips memasak, variasi menu, dan info alergen.
                </p>
              </div>
            </div>
            <button onClick={() => setShowTutorial(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Cuisine Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                Jenis Kuliner
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {cuisineOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCuisineType(option.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                      cuisineType === option.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className={`text-[10px] font-medium ${cuisineType === option.id ? 'text-orange-700' : 'text-gray-600'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" />
                Bahan yang Tersedia
                <span className="text-xs font-normal text-gray-400">(opsional)</span>
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  placeholder="Ketik bahan lalu tekan Enter..."
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <button
                  onClick={addIngredient}
                  disabled={!ingredientInput.trim()}
                  className="px-3 py-2.5 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs font-medium"
                    >
                      {ing}
                      <button onClick={() => removeIngredient(index)} className="hover:text-orange-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Contoh: ayam, bawang putih, kecap manis</p>
              )}
            </div>

            {/* Settings Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Harga
                </h3>
                <div className="space-y-1.5">
                  {priceRanges.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPriceRange(option.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                        priceRange === option.id
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-500 ml-1">({option.range})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Kesulitan
                </h3>
                <div className="space-y-1.5">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setDifficulty(option.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                        difficulty === option.id
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-500 ml-1">- {option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Porsi
                </h3>
                <div className="space-y-1.5">
                  {portionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPortion(option.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                        portion === option.id
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-500 ml-1">- {option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Format */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Output
                </h3>
                <div className="space-y-1.5">
                  {outputOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setOutputFormat(option.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                        outputFormat === option.id
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-500 ml-1">- {option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
            >
              <Sparkles className="w-5 h-5" />
              Generate Ide Menu
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">AI sedang membuat ide menu...</h3>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
              Menganalisis preferensi dan menciptakan menu unik
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-orange-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              10-20 detik
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Ide Menu ({generatedDishes.length})
                </h3>
                <p className="text-xs text-gray-500">Pilih dan tambahkan ke menu Anda</p>
              </div>
              <button
                onClick={resetCreator}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Ulang
              </button>
            </div>

            {/* Dish Cards */}
            <div className="space-y-4">
              {generatedDishes.map((dish) => {
                const isExpanded = expandedCards.has(dish.id)
                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-56 h-40 md:h-auto relative bg-gradient-to-br from-orange-100 to-amber-100 flex-shrink-0">
                        {dish.imageUrl ? (
                          <>
                            <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" />
                            <button
                              onClick={() => handleDownloadImage(dish.imageUrl!, dish.name)}
                              className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {generatingImages.has(dish.id) ? (
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-2" />
                                <p className="text-xs text-orange-600">Generating foto...</p>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="w-10 h-10 text-orange-300 mb-2" />
                                <button
                                  onClick={() => handleGenerateImage(dish)}
                                  className="px-3 py-1.5 bg-white text-orange-600 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    Generate Foto
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-gray-900">{dish.name}</h4>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{dish.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-orange-600">{formatCurrency(dish.suggestedPrice)}</p>
                            <p className="text-[10px] text-gray-500">HPP: {formatCurrency(dish.costEstimate)}</p>
                            <p className="text-[10px] text-green-600 font-medium">Margin {dish.profitMargin}%</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            dish.difficulty === 'mudah' ? 'bg-green-100 text-green-700' :
                            dish.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {dish.difficulty}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dish.cookingTime}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {dish.servings} porsi
                          </span>
                          {dish.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Composition Summary */}
                        {dish.composition && (
                          <div className="mt-3 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                            <p className="text-[10px] font-medium text-orange-700 mb-1 flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              Komposisi:
                            </p>
                            <p className="text-xs text-orange-800">{dish.composition}</p>
                          </div>
                        )}

                        {/* Tips */}
                        {dish.tips && (
                          <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-[10px] text-amber-700 flex items-start gap-1">
                              <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span><strong>Tips:</strong> {dish.tips}</span>
                            </p>
                          </div>
                        )}

                        {/* Expand Button */}
                        <button
                          onClick={() => toggleCardExpanded(dish.id)}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Sembunyikan Detail
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Lihat Resep & Bahan Lengkap
                            </>
                          )}
                        </button>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAddToMenu(dish)}
                            disabled={addingToMenu === dish.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
                          >
                            {addingToMenu === dish.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {addingToMenu === dish.id ? 'Menambahkan...' : 'Tambah ke Menu'}
                          </button>
                          <button
                            onClick={() => handleCopy(`${dish.name}\n${dish.description}\n\nKomposisi: ${dish.composition}\n\nBahan:\n${dish.ingredients.join('\n')}\n\nCara Membuat:\n${dish.recipe?.steps?.join('\n') || ''}\n\nHarga: ${formatCurrency(dish.suggestedPrice)}`, `full-${dish.id}`)}
                            className="px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                            title="Copy resep lengkap"
                          >
                            {copied === `full-${dish.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 animate-in slide-in-from-top duration-300">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Ingredients Detail */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4 text-green-600" />
                              Bahan-bahan ({dish.servings} porsi)
                            </h5>
                            {dish.ingredientDetails && dish.ingredientDetails.length > 0 ? (
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-medium text-gray-600">Bahan</th>
                                      <th className="text-right px-3 py-2 font-medium text-gray-600">Takaran</th>
                                      <th className="text-right px-3 py-2 font-medium text-gray-600">Est. Harga</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {dish.ingredientDetails.map((ing, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-800">{ing.name}</td>
                                        <td className="px-3 py-2 text-gray-600 text-right">{ing.amount} {ing.unit}</td>
                                        <td className="px-3 py-2 text-gray-600 text-right">{formatCurrency(ing.price)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-green-50">
                                    <tr>
                                      <td colSpan={2} className="px-3 py-2 font-medium text-green-800">Total HPP</td>
                                      <td className="px-3 py-2 font-bold text-green-700 text-right">{formatCurrency(dish.costEstimate)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            ) : (
                              <ul className="space-y-1.5 bg-white rounded-lg border border-gray-200 p-3">
                                {dish.ingredients.map((ing, i) => (
                                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                    {ing}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Allergens */}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-[10px] text-red-700 flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span><strong>Alergen:</strong> {dish.allergens.join(', ')}</span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Recipe Steps */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              Cara Pembuatan
                            </h5>
                            {dish.recipe && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                  Persiapan: {dish.recipe.prepTime}
                                </span>
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                                  Masak: {dish.recipe.cookTime}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                  Total: {dish.recipe.totalTime}
                                </span>
                              </div>
                            )}
                            <div className="space-y-2 bg-white rounded-lg border border-gray-200 p-3">
                              {dish.recipe?.steps?.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <p className="text-xs text-gray-700 flex-1">{step}</p>
                                </div>
                              )) || (
                                <p className="text-xs text-gray-500 italic">Langkah pembuatan tidak tersedia</p>
                              )}
                            </div>

                            {/* Plating */}
                            {dish.plating && (
                              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-[10px] font-medium text-purple-700 mb-1 flex items-center gap-1">
                                  <Utensils className="w-3 h-3" />
                                  Plating & Penyajian:
                                </p>
                                <p className="text-xs text-purple-800">{dish.plating}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Info Row */}
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                          {/* Variations */}
                          {dish.variations && (
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                              <p className="text-[10px] font-medium text-indigo-700 mb-1 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Variasi Menu:
                              </p>
                              <p className="text-xs text-indigo-800">{dish.variations}</p>
                            </div>
                          )}

                          {/* Storage */}
                          {dish.storage && (
                            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                              <p className="text-[10px] font-medium text-cyan-700 mb-1 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                Penyimpanan:
                              </p>
                              <p className="text-xs text-cyan-800">{dish.storage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setStep('input')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke pengaturan
            </button>
          </div>
        )}
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && selectedDishForCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah ke Menu</h3>
                <p className="text-sm text-gray-500">Pilih kategori untuk menu ini</p>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mb-4">
              <p className="font-semibold text-gray-900">{selectedDishForCategory.name}</p>
              <p className="text-sm text-gray-600 mt-1">{formatCurrency(selectedDishForCategory.suggestedPrice)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-700">
                  Belum ada kategori. Silakan buat kategori terlebih dahulu.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        selectedCategoryId === category.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setSelectedDishForCategory(null)
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAddToMenu}
                disabled={!selectedCategoryId || categories.length === 0}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Tambahkan
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Berhasil!</h3>
            <p className="text-gray-600 text-sm mb-4">
              <span className="font-semibold text-orange-600">{addedDishName}</span> telah ditambahkan ke Menu.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Lanjut
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.refresh()
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <span className="flex items-center justify-center gap-1.5">
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
