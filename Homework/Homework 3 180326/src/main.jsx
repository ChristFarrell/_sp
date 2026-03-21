import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { AuthWrapper } from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  </React.StrictMode>,
)
