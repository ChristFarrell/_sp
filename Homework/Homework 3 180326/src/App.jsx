import { useState, useEffect } from 'react'
import { Sparkles, Check, RotateCcw, Utensils, BarChart3, Moon, Sun, Globe, ChevronDown, Home, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import MealCard from './components/MealCard'
import MealDescription from './components/MealDescription'
import NutritionChart from './components/NutritionChart'
import ApiKeySettings from './components/ApiKeySettings'
import MealDetailModal from './components/MealDetailModal'
import MemoryModal from './components/MemoryModal'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { useAuth } from './context/AuthContext'
import { getApiKey, generateHealthyMeal } from './openaiService'
import AuthScreen from './screens/AuthScreen'

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'zh', label: '繁體中文', flag: '🇹🇼' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">{t('language')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg py-2 z-50 min-w-[220px]">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 transition-colors ${
                  language === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function getGreeting(language, userName) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = language === 'id' ? 'Selamat Pagi' : language === 'zh' ? '早安' : 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = language === 'id' ? 'Selamat Siang' : language === 'zh' ? '午安' : 'Good Afternoon';
  } else {
    greeting = language === 'id' ? 'Selamat Malam' : language === 'zh' ? '晚安' : 'Good Evening';
  }
  
  if (userName) {
    greeting += `, ${userName}`;
  }
  
  return greeting;
}

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getUserStorageKeys(userId) {
  return {
    CONFIRMED_MEALS_KEY: `user_${userId}_confirmed_meals`,
    DATE_KEY: `user_${userId}_saved_date`,
    HISTORY_KEY: `user_${userId}_meal_history`,
  };
}

function loadConfirmedMeals(userId) {
  const keys = getUserStorageKeys(userId);
  try {
    const savedDate = localStorage.getItem(keys.DATE_KEY);
    const today = getTodayDateString();
    
    if (savedDate !== today) {
      if (savedDate) {
        const savedMeals = localStorage.getItem(keys.CONFIRMED_MEALS_KEY);
        saveToHistory(userId, savedDate, savedMeals ? JSON.parse(savedMeals) : null);
      }
      localStorage.removeItem(keys.CONFIRMED_MEALS_KEY);
      localStorage.setItem(keys.DATE_KEY, today);
      return { breakfast: null, lunch: null, dinner: null };
    }
    
    const saved = localStorage.getItem(keys.CONFIRMED_MEALS_KEY);
    return saved ? JSON.parse(saved) : { breakfast: null, lunch: null, dinner: null };
  } catch (e) {
    return { breakfast: null, lunch: null, dinner: null };
  }
}

function saveConfirmedMeals(userId, meals) {
  const keys = getUserStorageKeys(userId);
  try {
    localStorage.setItem(keys.DATE_KEY, getTodayDateString());
    localStorage.setItem(keys.CONFIRMED_MEALS_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals:', e);
  }
}

function saveToHistory(userId, date, meals) {
  const keys = getUserStorageKeys(userId);
  try {
    const history = JSON.parse(localStorage.getItem(keys.HISTORY_KEY) || '{}');
    if (meals && (meals.breakfast || meals.lunch || meals.dinner)) {
      history[date] = meals;
      localStorage.setItem(keys.HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

function loadHistory(userId) {
  const keys = getUserStorageKeys(userId);
  try {
    return JSON.parse(localStorage.getItem(keys.HISTORY_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function Calendar({ history, confirmedMeals, language, onDateClick }) {
  const { t } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekDays = [
    t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateKey = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getTotalCalories = (dateKey) => {
    const today = getTodayDateString();
    
    let total = 0;
    
    if (dateKey === today) {
      if (confirmedMeals.breakfast?.calories) total += confirmedMeals.breakfast.calories;
      if (confirmedMeals.lunch?.calories) total += confirmedMeals.lunch.calories;
      if (confirmedMeals.dinner?.calories) total += confirmedMeals.dinner.calories;
    } else {
      const meals = history[dateKey];
      if (meals) {
        if (meals.breakfast?.calories) total += meals.breakfast.calories;
        if (meals.lunch?.calories) total += meals.lunch.calories;
        if (meals.dinner?.calories) total += meals.dinner.calories;
      }
    }
    
    return total;
  };

  const formatCalories = (cal) => {
    if (cal >= 1000) {
      return (cal / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return cal.toString();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString(
    language === 'id' ? 'id-ID' : language === 'zh' ? 'zh-TW' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const days = getDaysInMonth(currentMonth);
  const today = getTodayDateString();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square"></div>;
          }
          
          const dateKey = formatDateKey(day);
          const calories = getTotalCalories(dateKey);
          const isToday = dateKey === today;
          const hasData = calories > 0;
          
          return (
            <button
              key={index}
              onClick={() => hasData && onDateClick(dateKey)}
              disabled={!hasData}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                hasData 
                  ? 'bg-primary-50 hover:bg-primary-100 cursor-pointer' 
                  : 'bg-gray-50 cursor-default'
              } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
            >
              <span className={`font-semibold text-xl ${isToday ? 'text-primary-600' : 'text-gray-700'}`} style={{ fontSize: '30px' }}>
                {day}
              </span>
              {hasData && (
                <span className="text-amber-600 font-bold text-base">{formatCalories(calories)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HomeTab({ confirmedMeals, history, language, onMealClick, onDateClick, userName }) {
  const { t } = useLanguage()
  const greeting = getGreeting(language, userName);
  
  const hasAnyMeal = confirmedMeals.breakfast || confirmedMeals.lunch || confirmedMeals.dinner;

  const categoryLabels = {
    breakfast: t('breakfast'),
    lunch: t('lunch'),
    dinner: t('dinner'),
  };

  const categoryColors = {
    breakfast: 'from-amber-400 to-orange-500',
    lunch: 'from-emerald-400 to-teal-500',
    dinner: 'from-indigo-400 to-purple-500',
  };

  return (
    <div className="space-y-6">
      {hasAnyMeal ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['breakfast', 'lunch', 'dinner'].map(category => {
            const meal = confirmedMeals[category];
            if (!meal) return null;

            return (
              <button
                key={category}
                onClick={() => onMealClick(meal, category)}
                className="bg-white rounded-2xl shadow-lg text-left hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden flex flex-col"
              >
                <div className={`bg-gradient-to-r ${categoryColors[category]} p-3 text-white rounded-t-2xl`}>
                  <span className="text-sm font-medium opacity-90">{categoryLabels[category]}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-3 line-clamp-2">{meal.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-amber-600">{meal.calories}</p>
                      <p className="text-xs text-gray-500">{t('calories')}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-red-500">{meal.protein}g</p>
                      <p className="text-xs text-gray-500">{t('protein')}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-500">{meal.carbs}g</p>
                      <p className="text-xs text-gray-500">{t('carbs')}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-yellow-500">{meal.fat}g</p>
                      <p className="text-xs text-gray-500">{t('fat')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">{t('tapForDetails')}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t('noConfirmedMeal')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('generateHint')}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📅</span> {t('mealHistory')}
        </h2>
        <Calendar history={history} confirmedMeals={confirmedMeals} language={language} onDateClick={onDateClick} />
      </div>
    </div>
  );
}

function AppContent() {
  const { language, t } = useLanguage()
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [approvedMeals, setApprovedMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  })
  const [confirmedMeals, setConfirmedMeals] = useState(() => loadConfirmedMeals(currentUser?.id))
  const [history, setHistory] = useState(() => loadHistory(currentUser?.id))
  const [generatingMeal, setGeneratingMeal] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  })
  const [apiError, setApiError] = useState(null)
  const [openaiApiKey, setOpenaiApiKey] = useState(getApiKey())
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHistoryMeals, setSelectedHistoryMeals] = useState(null)

  useEffect(() => {
    if (currentUser) {
      setConfirmedMeals(loadConfirmedMeals(currentUser.id))
      setHistory(loadHistory(currentUser.id))
    }
  }, [currentUser])

  useEffect(() => {
    const handleMidnight = () => {
      if (!currentUser) return
      const newDate = getTodayDateString();
      const keys = getUserStorageKeys(currentUser.id)
      const savedDate = localStorage.getItem(keys.DATE_KEY);
      if (savedDate && savedDate !== newDate) {
        saveToHistory(currentUser.id, savedDate, confirmedMeals);
        setConfirmedMeals({ breakfast: null, lunch: null, dinner: null });
        setHistory(loadHistory(currentUser.id));
        localStorage.removeItem(keys.CONFIRMED_MEALS_KEY);
        localStorage.setItem(keys.DATE_KEY, newDate);
      }
    };

    const interval = setInterval(handleMidnight, 60000);
    return () => clearInterval(interval);
  }, [confirmedMeals, currentUser]);

  const generateMealWithAI = async (category) => {
    console.log('Generate button clicked for:', category)
    setGeneratingMeal(prev => ({ ...prev, [category]: true }))
    setApiError(null)

    const currentApiKey = getApiKey()
    const currentLanguage = language

    if (!currentApiKey) {
      const errMsg = currentLanguage === 'id' ? 'Silakan masukkan API key Groq terlebih dahulu' : currentLanguage === 'en' ? 'Please enter your Groq API key first' : '請先輸入 Groq API key'
      setApiError(errMsg)
      setGeneratingMeal(prev => ({ ...prev, [category]: false }))
      return
    }

    try {
      console.log('Calling API for:', category, currentLanguage)
      const mealData = await generateHealthyMeal(category, currentLanguage, currentApiKey)
      console.log('Received meal data:', mealData)
      setApprovedMeals(prev => ({ 
        ...prev, 
        [category]: { 
          ...mealData,
          approved: false
        } 
      }))
      console.log('State updated successfully')
    } catch (error) {
      console.error('API Error:', error)
      setApiError(error.message)
    } finally {
      setGeneratingMeal(prev => ({ ...prev, [category]: false }))
    }
  }

  const handleApiKeyChange = (key) => {
    setOpenaiApiKey(key)
  }

  const approveMeal = (category) => {
    if (approvedMeals[category] && currentUser) {
      const mealToConfirm = { ...approvedMeals[category], approved: true };
      setApprovedMeals(prev => ({ ...prev, [category]: mealToConfirm }))
      
      const newConfirmed = { ...confirmedMeals, [category]: mealToConfirm };
      setConfirmedMeals(newConfirmed);
      saveConfirmedMeals(currentUser.id, newConfirmed);
      
      const today = getTodayDateString();
      const newHistory = { ...history, [today]: newConfirmed };
      setHistory(newHistory);
      const keys = getUserStorageKeys(currentUser.id)
      localStorage.setItem(keys.HISTORY_KEY, JSON.stringify(newHistory));
    }
  }

  const handleRecook = (category, meal) => {
    setApprovedMeals(prev => ({ ...prev, [category]: meal }));
    setActiveTab(category);
    setSelectedDate(null);
    setSelectedHistoryMeals(null);
  };

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedHistoryMeals(history[dateKey] || null);
  };

  const closeMealModal = () => {
    setSelectedMeal(null);
    setSelectedCategory(null);
  };

  const closeMemoryModal = () => {
    setSelectedDate(null);
    setSelectedHistoryMeals(null);
  };

  const tabs = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'breakfast', label: t('breakfast'), icon: Sun },
    { id: 'lunch', label: t('lunch'), icon: Utensils },
    { id: 'dinner', label: t('dinner'), icon: Moon },
    { id: 'chart', label: t('nutrition'), icon: BarChart3 },
  ]

  const getMealIcon = (category) => {
    switch(category) {
      case 'breakfast': return <Sun className="w-6 h-6" />
      case 'lunch': return <Utensils className="w-6 h-6" />
      case 'dinner': return <Moon className="w-6 h-6" />
      default: return null
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'breakfast': return 'from-amber-400 to-orange-500'
      case 'lunch': return 'from-emerald-400 to-teal-500'
      case 'dinner': return 'from-indigo-400 to-purple-500'
      default: return 'from-primary-400 to-primary-600'
    }
  }

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'breakfast': return t('breakfast')
      case 'lunch': return t('lunch')
      case 'dinner': return t('dinner')
      default: return ''
    }
  }

  const approvedMealsArray = Object.entries(approvedMeals)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => ({ ...value, category: key }))

  const handleMealClick = (meal, category) => {
    setSelectedMeal(meal);
    setSelectedCategory(category);
  };

  const headerGreeting = getGreeting(language, currentUser?.name);
  
  return (
    <div className="min-h-screen pb-8">
      <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{headerGreeting}!</h1>
                <p className="text-primary-100 mt-1 hidden sm:block">
                  {openaiApiKey ? '🤖 AI Ready - Powered by Groq (FREE)' : '⚙️ Set API Key for AI Generation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-2 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
              <ApiKeySettings onApiKeyChange={handleApiKeyChange} />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <nav className="container mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 mt-6">
        {activeTab === 'home' ? (
          <HomeTab 
            confirmedMeals={confirmedMeals} 
            history={history}
            language={language} 
            onMealClick={handleMealClick}
            onDateClick={handleDateClick}
            userName={currentUser?.name}
          />
        ) : activeTab !== 'chart' ? (
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
              <div className={`bg-gradient-to-r ${getCategoryColor(activeTab)} p-4 text-white`}>
                <div className="flex items-center gap-2">
                  {getMealIcon(activeTab)}
                  <h2 className="text-xl font-bold">{getCategoryLabel(activeTab)}</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-5 border border-primary-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                      {language === 'id' ? 'Pemilihan Menu' : language === 'en' ? 'Meal Selection' : '選擇菜單'}
                    </h3>
                    {approvedMeals[activeTab] ? (
                      <MealCard meal={approvedMeals[activeTab]} />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary-300" />
                        <p>{t('noMeal')}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => generateMealWithAI(activeTab)}
                        disabled={generatingMeal[activeTab]}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                          generatingMeal[activeTab]
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-md'
                        }`}
                      >
                        <RotateCcw className={`w-4 h-4 ${generatingMeal[activeTab] ? 'animate-spin' : ''}`} />
                        {generatingMeal[activeTab] ? t('approving') : t('generateMeal')}
                      </button>
                      
                      {approvedMeals[activeTab] && (
                        <button
                          onClick={() => approveMeal(activeTab)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                            approvedMeals[activeTab].approved
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-md'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          {approvedMeals[activeTab].approved ? t('confirmed') : t('approve')}
                        </button>
                      )}
                    </div>
                    
                    {apiError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                        <strong>API Error:</strong> {apiError}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-blue-600" />
                      {language === 'id' ? 'Deskripsi' : language === 'en' ? 'Description' : '描述'}
                      {generatingMeal[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full animate-pulse">
                          AI...
                        </span>
                      )}
                      {!generatingMeal[activeTab] && approvedMeals[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                          AI ✓
                        </span>
                      )}
                    </h3>
                    {generatingMeal[activeTab] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-blue-600 text-sm">{t('generatingDescription')}</p>
                      </div>
                    ) : approvedMeals[activeTab] ? (
                      <MealDescription meal={approvedMeals[activeTab]} showSteps={false} />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-2 text-blue-200" />
                        <p className="text-sm">{t('noMeal')}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                      {language === 'id' ? 'Langkah Memasak' : language === 'en' ? 'Cooking Steps' : '烹飪步驟'}
                      {generatingMeal[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full animate-pulse">
                          AI...
                        </span>
                      )}
                      {!generatingMeal[activeTab] && approvedMeals[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                          AI ✓
                        </span>
                      )}
                    </h3>
                    {generatingMeal[activeTab] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-amber-600 text-sm">{t('generatingSteps')}</p>
                      </div>
                    ) : approvedMeals[activeTab] ? (
                      <MealDescription meal={approvedMeals[activeTab]} showDescription={false} />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-amber-200" />
                        <p className="text-sm">{t('noMeal')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              {t('nutrition')}
            </h2>
            
            {approvedMealsArray.length > 0 ? (
              <NutritionChart meals={approvedMealsArray} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-16 h-16 mx-auto mb-4 text-primary-300" />
                <p className="text-lg">{t('generateFirst')}</p>
                <p className="text-sm mt-2">{t('generateHint')}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 mt-8 text-center text-gray-500 text-sm">
        <p>AI {t('title')} - 健康飲食，從今天開始 / Healthy eating, start today / Makan sehat, mulai hari ini</p>
      </footer>

      {selectedMeal && (
        <MealDetailModal 
          meal={selectedMeal} 
          category={selectedCategory} 
          language={language}
          onClose={closeMealModal}
        />
      )}

      {selectedDate && (
        <MemoryModal
          date={selectedDate}
          meals={selectedHistoryMeals}
          language={language}
          onClose={closeMemoryModal}
          onRecook={handleRecook}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export function AuthWrapper() {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-500">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }
   
  if (!currentUser) {
    return <AuthScreen />
  }
  
  return <App />
}

export default AuthWrapper
