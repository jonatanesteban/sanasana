import React, { useState } from 'react'
import { Home, Clock, Menu, Star, BookOpen, Calculator, Sun, Globe } from 'lucide-react'
import Inicio from './pages/Inicio'
import TiempoSidereo from './pages/TiempoSidereo'
import PosicionEstrellas from './pages/PosicionEstrellas'
import Unidad3 from './pages/Unidad3'
import Unidad4 from './pages/Unidad4'
import CalculoSol from './pages/CalculoSol'
import SimuladorEsfera from './pages/SimuladorEsfera'
import FormulasCalculos from './pages/FormulasCalculos'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('inicio')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="global-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <h2 className="brand">SanaSana</h2>
        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} color="white" />
        </button>
      </div>

      {/* Global Sidebar Menu */}
      <nav className={`global-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>SanaSana</h2>
          <p>Data Manager</p>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-btn ${activePage === 'inicio' ? 'active' : ''}`}
            onClick={() => { setActivePage('inicio'); setIsMobileMenuOpen(false); }}
          >
            <Home size={20} />
            <span>Inicio</span>
          </button>
          
          <button 
            className={`nav-btn ${activePage === 'tiemposidereo' ? 'active' : ''}`}
            onClick={() => { setActivePage('tiemposidereo'); setIsMobileMenuOpen(false); }}
          >
            <Clock size={20} />
            <span>Tiempo Sidéreo</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'estrellas' ? 'active' : ''}`}
            onClick={() => { setActivePage('estrellas'); setIsMobileMenuOpen(false); }}
          >
            <Star size={20} />
            <span>Posición Estrellas</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'esfera' ? 'active' : ''}`}
            onClick={() => { setActivePage('esfera'); setIsMobileMenuOpen(false); }}
          >
            <Globe size={20} />
            <span>Simulador Esfera</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'unidad3' ? 'active' : ''}`}
            onClick={() => { setActivePage('unidad3'); setIsMobileMenuOpen(false); }}
          >
            <BookOpen size={20} />
            <span>Unidad 3</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'unidad4' ? 'active' : ''}`}
            onClick={() => { setActivePage('unidad4'); setIsMobileMenuOpen(false); }}
          >
            <Clock size={20} />
            <span>Unidad 4</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'sol' ? 'active' : ''}`}
            onClick={() => { setActivePage('sol'); setIsMobileMenuOpen(false); }}
          >
            <Sun size={20} />
            <span>Cálculo de Sol</span>
          </button>

          <button 
            className={`nav-btn ${activePage === 'formulas' ? 'active' : ''}`}
            onClick={() => { setActivePage('formulas'); setIsMobileMenuOpen(false); }}
          >
            <Calculator size={20} />
            <span>Fórmulas</span>
          </button>
        </div>
      </nav>

      {/* Main Page Content */}
      <main className="page-container">
        {activePage === 'inicio' && <Inicio />}
        {activePage === 'tiemposidereo' && <TiempoSidereo />}
        {activePage === 'estrellas' && <PosicionEstrellas />}
        {activePage === 'esfera' && <SimuladorEsfera />}
        {activePage === 'unidad3' && <Unidad3 />}
        {activePage === 'unidad4' && <Unidad4 />}
        {activePage === 'sol' && <CalculoSol />}
        {activePage === 'formulas' && <FormulasCalculos />}
      </main>
    </div>
  )
}

export default App
