import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../LanguageContext'

const COLORS = {
  protein: '#ef4444',
  carbs: '#3b82f6',
  fat: '#8b5cf6',
  fiber: '#22c55e',
  calories: '#f59e0b',
}

function NutritionChart({ meals }) {
  const { t } = useLanguage()

  const totalNutrition = meals.reduce((acc, meal) => ({
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
    fiber: acc.fiber + (meal.fiber || 0),
    calories: acc.calories + meal.calories,
  }), { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 })

  const displayData = {
    protein: totalNutrition.protein,
    carbs: totalNutrition.carbs,
    fat: totalNutrition.fat,
    fiber: totalNutrition.fiber,
    calories: totalNutrition.calories,
  }

  const pieData = [
    { name: t('protein'), value: displayData.protein, color: COLORS.protein },
    { name: t('carbs'), value: displayData.carbs, color: COLORS.carbs },
    { name: t('fat'), value: displayData.fat, color: COLORS.fat },
    { name: t('fiber'), value: displayData.fiber, color: COLORS.fiber },
  ]

  const getMealLabel = (meal) => {
    if (meal.category === 'breakfast') return t('breakfast')
    if (meal.category === 'lunch') return t('lunch')
    if (meal.category === 'dinner') return t('dinner')
    return meal.name.length > 6 ? meal.name.substring(0, 6) + '...' : meal.name
  }

  const barData = meals.map((meal) => ({
    name: getMealLabel(meal),
    [t('protein')]: meal.protein,
    [t('carbs')]: meal.carbs,
    [t('fat')]: meal.fat,
  }))

  const dailyTarget = { protein: 60, carbs: 300, fat: 65, fiber: 25 }
  const calorieTarget = 2000
  
  const progressData = [
    { name: t('protein'), value: displayData.protein, target: dailyTarget.protein, color: COLORS.protein },
    { name: t('carbs'), value: displayData.carbs, target: dailyTarget.carbs, color: COLORS.carbs },
    { name: t('fat'), value: displayData.fat, target: dailyTarget.fat, color: COLORS.fat },
    { name: t('fiber'), value: displayData.fiber, target: dailyTarget.fiber, color: COLORS.fiber },
  ]

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('nutritionRatio')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}g`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('dailyCalories')}</h3>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${Math.min(displayData.calories / calorieTarget * 440, 440)} 440`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-primary-600">{displayData.calories}</span>
                  <span className="text-sm text-gray-500">{t('kcal')}</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{t('todayIntake')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('mealNutrition')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={t('protein')} fill={COLORS.protein} radius={[4, 4, 0, 0]} />
            <Bar dataKey={t('carbs')} fill={COLORS.carbs} radius={[4, 4, 0, 0]} />
            <Bar dataKey={t('fat')} fill={COLORS.fat} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('intakeProgress')}</h3>
        <div className="space-y-4">
          {progressData.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">{item.name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((item.value / item.target) * 100, 100)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <div className="w-32 text-right text-sm">
                <span className="font-semibold" style={{ color: item.color }}>
                  {item.value}g
                </span>
                <span className="text-gray-400"> / {item.target}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {meals.map((meal, index) => (
          <div key={index} className="bg-primary-50 rounded-xl p-4 text-center">
            <p className="text-sm text-primary-600 font-medium mb-1">
              {meal.category === 'breakfast' ? t('breakfast') : meal.category === 'lunch' ? t('lunch') : t('dinner')}
            </p>
            <p className="font-bold text-gray-800 truncate">{meal.name}</p>
            <p className="text-2xl font-bold text-primary-600 mt-2">
              {meal.calories}
            </p>
            <p className="text-xs text-gray-500">{t('kcal')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NutritionChart
