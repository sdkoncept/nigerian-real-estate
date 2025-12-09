import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { initGA } from './utils/analytics'
import './index.css'
import App from './App.tsx'

// Initialize Google Analytics if measurement ID is provided
// Note: Google tag is also loaded in index.html for faster initialization
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-VCSPFDYNK5';
if (gaId) {
  initGA(gaId);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
