import { useState } from 'react'
import { Settings, Key, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { saveApiKey, getApiKey, clearApiKey, testApiKey } from '../openaiService'
import { useLanguage } from '../LanguageContext'

function ApiKeySettings({ onApiKeyChange }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleSave = async () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim())
      onApiKeyChange(apiKey.trim())
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
      
      setIsTesting(true)
      const result = await testApiKey(apiKey.trim())
      setTestResult(result)
      setIsTesting(false)
    }
  }

  const handleClear = () => {
    clearApiKey()
    setApiKey('')
    onApiKeyChange('')
    setTestResult(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          apiKey ? 'bg-emerald-500/20 text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="hidden sm:inline text-sm">{apiKey ? 'API ✓' : 'API'}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <h3 className="font-bold">{t('groqApiKey')}</h3>
              </div>
              <p className="text-sm text-purple-100 mt-1">{t('apiKeyInstructionsGroq')}</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('apiKey')}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setTestResult(null)
                    }}
                    placeholder="gsk_..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-xs text-purple-800">
                  <strong>{t('getApiKey')}:</strong> console.groq.com
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {t('groqFree')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim() || isTesting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    apiKey.trim() && !isTesting
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('saved')}
                    </>
                  ) : (
                    t('saveKey')
                  )}
                </button>
                
                {apiKey && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {testResult && (
                <div className={`flex items-center gap-2 text-sm rounded-xl p-3 ${
                  testResult.success 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <>
                      <Check className="w-4 h-4" />
                      API Key Valid - Ready!
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      {testResult.error}
                    </>
                  )}
                </div>
              )}

              {apiKey && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3">
                  <Check className="w-4 h-4" />
                  {t('apiKeyConnectedGroq')}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ApiKeySettings
