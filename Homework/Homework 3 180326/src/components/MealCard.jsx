import { Flame, Drumstick, Wheat, Droplets } from 'lucide-react'
import { useLanguage } from '../LanguageContext'

function MealCard({ meal }) {
  const { t } = useLanguage()

  return (
    <div className="relative">
      {meal.approved && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg z-10">
          <span>✓</span> {t('confirmed')}
        </div>
      )}
      
      <h3 className="text-lg font-bold text-gray-800 mb-2">{meal.name}</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-amber-50 rounded-lg p-2 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-xs text-gray-500">{t('calories')}</p>
            <p className="font-semibold text-amber-700">{meal.calories} {t('kcal')}</p>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-2 flex items-center gap-2">
          <Drumstick className="w-4 h-4 text-red-500" />
          <div>
            <p className="text-xs text-gray-500">{t('protein')}</p>
            <p className="font-semibold text-red-700">{meal.protein}g</p>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-2 flex items-center gap-2">
          <Wheat className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">{t('carbs')}</p>
            <p className="font-semibold text-blue-700">{meal.carbs}g</p>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-2 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">{t('fat')}</p>
            <p className="font-semibold text-purple-700">{meal.fat}g</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealCard
