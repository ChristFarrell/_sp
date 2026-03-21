import { X, RotateCcw } from 'lucide-react'

export default function MemoryModal({ date, meals, language, onClose, onRecook }) {
  if (!date) return null

  const labels = {
    en: {
      pastMeals: 'Past Meals',
      recook: 'Recook',
      noMealsForDay: 'No meals recorded for this day',
      kcal: 'kcal',
    },
    id: {
      pastMeals: 'Makanan Terdahulu',
      recook: 'Masak Lagi',
      noMealsForDay: 'Tidak ada makanan tercatat untuk hari ini',
      kcal: 'kkal',
    },
    zh: {
      pastMeals: '過去餐點',
      recook: '重新烹飪',
      noMealsForDay: '此日沒有記錄的餐點',
      kcal: '卡',
    }
  }

  const l = labels[language] || labels.en

  const categoryNames = {
    breakfast: language === 'id' ? 'Sarapan' : language === 'zh' ? '早餐' : 'Breakfast',
    lunch: language === 'id' ? 'Makan Siang' : language === 'zh' ? '午餐' : 'Lunch',
    dinner: language === 'id' ? 'Makan Malam' : language === 'zh' ? '晚餐' : 'Dinner',
  }

  const categoryColors = {
    breakfast: 'from-amber-400 to-orange-500',
    lunch: 'from-emerald-400 to-teal-500',
    dinner: 'from-indigo-400 to-purple-500',
  }

  const formattedDate = new Date(date).toLocaleDateString(
    language === 'id' ? 'id-ID' : language === 'zh' ? 'zh-TW' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  const hasMeals = meals && Object.values(meals).some(m => m !== null)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 text-white flex items-center justify-between">
          <div>
            <span className="text-sm opacity-80">{l.pastMeals}</span>
            <h2 className="text-xl font-bold">{formattedDate}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {hasMeals ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map(category => {
                const meal = meals[category];
                if (!meal) return null;

                return (
                  <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className={`bg-gradient-to-r ${categoryColors[category]} p-2 text-white text-center`}>
                      <span className="text-sm font-medium">{categoryNames[category]}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 text-sm line-clamp-2">{meal.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">{meal.description?.substring(0, 60)}...</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-amber-50 rounded-lg p-2 text-center">
                          <p className="font-bold text-amber-600">{meal.calories}</p>
                          <p className="text-gray-500">{l.kcal}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <p className="font-bold text-red-500">{meal.protein}g</p>
                          <p className="text-gray-500">{language === 'id' ? 'Protein' : language === 'zh' ? '蛋白質' : 'Protein'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRecook(category, meal)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {l.recook}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{l.noMealsForDay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
