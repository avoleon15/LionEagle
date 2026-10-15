import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Admin } from './Admin'
import { App } from './App'
import { Sprites } from './Sprites'
import './styles.css'

const gallery = import.meta.env.DEV && window.location.pathname === '/sprites'

const admin = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')!).render(<StrictMode>{admin ? <Admin /> : gallery ? <Sprites /> : <App />}</StrictMode>)
