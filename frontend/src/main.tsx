import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={12}
        containerClassName="mt-4"
        toastOptions={{
          className: `
      flex items-start gap-3
      bg-white dark:bg-gray-800/75 
      shadow-xl dark:shadow-black/40 
      rounded-xl
      border border-gray-200 dark:border-gray-700/75
      p-4
      transition-all duration-300
      max-w-md
      backdrop-blur-sm dark:backdrop-blur-none
      animate-in fade-in-90 slide-in-from-top-12
    `,
          success: {
            icon: (
              <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-500 text-sm" />
              </div>
            ),
            className: 'border-green-200 dark:border-green-500/80',
          },
          error: {
            icon: (
              <div className="flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/80 rounded-full">
                <FaTimesCircle className="text-red-500 dark:text-red-300 text-sm" />
              </div>
            ),
            className: 'border-red-200 dark:border-red-500/80',
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)