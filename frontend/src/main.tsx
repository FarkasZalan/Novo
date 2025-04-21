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
        position="top-center"
        gutter={16}
        containerClassName="mt-4 mx-4 sm:mx-0"
        toastOptions={{
          className: `
            flex items-start gap-3
            bg-white dark:bg-gray-800/80 
            shadow-xl dark:shadow-black/40 
            rounded-xl
            border border-gray-200 dark:border-gray-700/75
            p-4
            transition-all duration-500 ease-in-out
            max-w-[90vw] sm:max-w-md
            backdrop-blur-sm dark:backdrop-blur-sm
            animate-in fade-in-90 slide-in-from-top-8
          `,
          success: {
            icon: (
              <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full transition-colors duration-300">
                <FaCheckCircle className="text-indigo-600 text-sm" />
              </div>
            ),
            className: 'border-indigo-200',
          },
          error: {
            icon: (
              <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full transition-colors duration-300">
                <FaTimesCircle className="text-red-600 text-sm" />
              </div>
            ),
            className: 'border-red-200',
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)