import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rules from './pages/Rules'
import Teams from './pages/Teams'
import TierMaker from './pages/TierMaker'
import Changelog from './pages/Changelog'
import Admin from './pages/Admin'
import SearchResults from './pages/SearchResults'
import Calculator from './pages/Calculator'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#D94819] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/tier-maker" element={<TierMaker />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/calculator" element={<Calculator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
