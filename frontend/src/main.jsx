import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LinkProvider } from './context/LinkContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LinkProvider>
        <App />
      </LinkProvider>
    </AuthProvider>
  </StrictMode>
)

