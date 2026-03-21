import { X } from 'lucide-react'

export default function MealDetailModal({ meal, category, language, onClose }) {
  if (!meal) return null

  const labels = {
    en: {
      description: 'Description',
      cookingSteps: 'Cooking Steps',
    },
    id: {
      description: 'Deskripsi',
      cookingSteps: 'Langkah Memasak',
    },
    zh: {
      description: '描述',
      cookingSteps: '烹飪步驟',
    }
  }

  const l = labels[language] || labels.en

  const categoryColors = {
    breakfast: 'from-amber-400 to-orange-500',
    lunch: 'from-emerald-400 to-teal-500',
    dinner: 'from-indigo-400 to-purple-500',
  }

  const categoryNames = {
    breakfast: language === 'id' ? 'Sarapan' : language === 'zh' ? '早餐' : 'Breakfast',
    lunch: language === 'id' ? 'Makan Siang' : language === 'zh' ? '午餐' : 'Lunch',
    dinner: language === 'id' ? 'Makan Malam' : language === 'zh' ? '晚餐' : 'Dinner',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${categoryColors[category]} p-4 text-white flex items-center justify-between`}>
          <div>
            <span className="text-sm opacity-80">{categoryNames[category]}</span>
            <h2 className="text-xl font-bold">{meal.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              {l.description}
            </h3>
            <p className="text-gray-600 leading-relaxed">{meal.description}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              {l.cookingSteps}
            </h3>
            <div className="space-y-3">
              {meal.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-600 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
