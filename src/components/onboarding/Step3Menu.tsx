'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UtensilsCrossed, Plus, Trash2, ArrowLeft, SkipForward } from 'lucide-react'

interface MenuItem {
  name: string
  price: number
  category: string
}

interface Props {
  data: MenuItem[]
  storeId?: string
  onComplete: (data: MenuItem[]) => void
  onSkip: () => void
  onBack: () => void
}

const DEFAULT_CATEGORIES = [
  'Main Course',
  'Appetizer',
  'Beverage',
  'Dessert',
  'Side Dish',
]

export function OnboardingStep3Menu({ data, onComplete, onSkip, onBack }: Props) {
  const [items, setItems] = useState<MenuItem[]>(
    data.length > 0 ? data : [{ name: '', price: 0, category: 'Main Course' }]
  )

  const addItem = () => {
    setItems([...items, { name: '', price: 0, category: 'Main Course' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof MenuItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter out empty items
    const validItems = items.filter(item => item.name.trim() !== '' && item.price > 0)
    onComplete(validItems)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <UtensilsCrossed className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Menu Setup</h3>
          <p className="text-sm text-gray-500">Add your first menu items</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          You can skip this step and add menu items later from the admin dashboard. Adding a few items now will help you get started faster.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label>Item Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="e.g., Nasi Goreng Special"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.price || ''}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="25000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Item
        </Button>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for now
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
