import React, { useState } from 'react';
import { Plus, Clock, Calendar } from 'lucide-react';

export default function DataEntryForm({ onSave }) {
  const [formData, setFormData] = useState({
    Fecha: new Date().toISOString().split('T')[0],
    'T. Sidéreo Aparente': '',
    Observaciones: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Fecha || !formData['T. Sidéreo Aparente']) {
      alert('Por favor, ingresa al menos la fecha y el Tiempo Sidéreo.');
      return;
    }
    
    onSave([formData]);
    
    // Reset form for next entry but keep the date (handy for sequential entries)
    setFormData(prev => ({
      ...prev,
      'T. Sidéreo Aparente': '',
      Observaciones: ''
    }));
  };

  return (
    <div className="glass-panel">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={24} color="var(--primary-color)" />
        Ingreso de Datos Geodésicos
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Cargá manualmente los valores de tus efemérides para usarlos en la calculadora.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="Fecha" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} /> Fecha de Referencia *
          </label>
          <input 
            type="date" 
            id="Fecha" 
            name="Fecha" 
            className="form-input" 
            value={formData.Fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="TSidereo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> T. Sidéreo Aparente (Θ₀) *
          </label>
          <input 
            type="text" 
            id="TSidereo" 
            name="T. Sidéreo Aparente" 
            className="form-input" 
            placeholder="Ej: 15 30 12.45"
            value={formData['T. Sidéreo Aparente']}
            onChange={handleChange}
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Formato: HH MM SS.ss
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="Observaciones">Observaciones</label>
          <input 
            type="text" 
            id="Observaciones" 
            name="Observaciones" 
            className="form-input" 
            placeholder="Ej: Datos de Octubre - Pag 15"
            value={formData.Observaciones}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          <Plus size={20} />
          Guardar en Base de Datos
        </button>
      </form>
    </div>
  );
}
