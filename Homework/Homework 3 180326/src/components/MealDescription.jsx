import { ChefHat } from 'lucide-react'
import { useLanguage } from '../LanguageContext'

function MealDescription({ meal, showDescription = true, showSteps = true }) {
  const { t, language } = useLanguage()

  return (
    <div className="space-y-4">
      {showDescription && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">{meal.name}</h4>
          <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
            {meal.description}
          </p>
        </div>
      )}

      {showSteps && meal.steps && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            {t('cookingSteps')}
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {meal.steps.length} {language === 'id' ? 'Langkah' : language === 'en' ? 'Steps' : '步'}
            </span>
          </h4>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {meal.steps.map((step, index) => (
              <div key={index} className="flex gap-3 items-start bg-white/50 rounded-lg p-3 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MealDescription
