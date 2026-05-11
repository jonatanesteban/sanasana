import React, { useState, useEffect } from 'react'
import { Trash2, FileText, Upload, Database, Search, Edit3 } from 'lucide-react'
import DataUploader from '../components/DataUploader'
import DataEntryForm from '../components/DataEntryForm'
import PDFScanner from '../components/PDFScanner'
import DataViewer from '../components/DataViewer'
import { getData, saveData, deleteItem, clearData } from '../utils/storage'

export default function TiempoSidereo() {
  const [data, setData] = useState([])
  const [activeTab, setActiveTab] = useState('view')

  useEffect(() => {
    setData(getData())
  }, [])

  const handleDataUpdate = () => {
    setData(getData());
  };

  const handleClearDatabase = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODA la base de datos? Esta acción no se puede deshacer.')) {
      clearData();
      setData([]);
      alert('Base de datos borrada con éxito.');
    }
  };

  const handleSaveData = (newData) => {
    const updated = saveData(newData)
    setData(updated)
    setActiveTab('view')
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      const updated = deleteItem(id)
      setData(updated)
    }
  }

  return (
    <div className="tiempo-sidereo-container">
      <header className="page-header">
        <h1>SanaSana Data Manager</h1>
        <p>Tu asistente inteligente para cargar, guardar y consultar datos por fecha.</p>
      </header>

      <main className="main-content">
        <aside className="content-sidebar">
          <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search size={18} /> <span>PDF</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={18} /> <span>Excel</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              <Edit3 size={18} /> <span>Manual</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <Database size={18} /> <span>Ver Datos</span>
            </button>
          </div>
          
          <button 
            onClick={handleClearDatabase}
            style={{ 
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginBottom: '2rem'
            }}
          >
            <Trash2 size={16} /> Limpiar Base de Datos
          </button>

          <div style={{ flex: 1, marginTop: '2rem' }}>
            {activeTab === 'search' && <PDFScanner onSave={handleSaveData} />}
            {activeTab === 'upload' && <DataUploader onDataLoaded={handleSaveData} />}
            {activeTab === 'manual' && <DataEntryForm onSave={handleSaveData} />}
            {activeTab === 'view' && (
              <div className="glass-panel">
                <h3>Información de Almacenamiento</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Tenés <strong>{data.length}</strong> registros guardados en tu base de datos local.
                </p>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Los datos se guardan automáticamente cada vez que realizas un cálculo o cargas un archivo. 
                    Si deseas empezar de cero, utiliza el botón <strong>Limpiar DB</strong> arriba a la derecha.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="viewer-section">
          <DataViewer data={data} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  )
}
