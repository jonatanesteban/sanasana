import React, { useState, useCallback } from 'react';
import { FileText, Search, Plus, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configuración del worker de PDF.js usando el archivo local del paquete
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFScanner({ onSave }) {
  const [pdfText, setPdfText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchMonth, setSearchMonth] = useState('');
  const [searchDay, setSearchDay] = useState('');
  const [snippet, setSnippet] = useState('');
  const [fileName, setFileName] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  
  // Formulario manual vinculado
  const [formData, setFormData] = useState({
    Fecha: '',
    'T. Sidéreo Aparente': '',
    Descripcion: ''
  });

  const extractText = async (file) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- PÁGINA ${i} ---\n${pageText}\n\n`;
      }
      
      setPdfText(fullText);
      setLoading(false);
    } catch (error) {
      console.error('Error al procesar PDF:', error);
      alert('Error al leer el PDF. Asegúrate de que no esté protegido por contraseña.');
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      extractText(file);
    }
  };

  const handleSearch = () => {
    if (!pdfText || (!searchMonth && !searchDay)) return;
    
    const terms = [searchMonth, searchDay].filter(t => t.trim().length > 0).map(t => t.toLowerCase());
    const pages = pdfText.split('--- PÁGINA');
    
    // Buscar la página que contenga TODOS los términos
    let foundPage = '';
    for (let page of pages) {
      const lowerPage = page.toLowerCase();
      const hasAllTerms = terms.every(term => lowerPage.includes(term));
      
      if (hasAllTerms && page.trim().length > 0) {
        foundPage = '--- PÁGINA' + page;
        break;
      }
    }
    
    if (foundPage) {
      setSnippet(foundPage);
    } else {
      setSnippet('No se encontró una página que contenga tanto "' + searchMonth + '" como "' + searchDay + '". Probá buscando solo uno de los dos.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Fecha) {
      alert('La fecha es obligatoria');
      return;
    }
    onSave([formData]);
    alert('Datos guardados correctamente');
    // Limpiamos solo el valor, mantenemos la fecha para el siguiente registro
    setFormData(prev => ({ ...prev, 'T. Sidéreo Aparente': '', Descripcion: '' }));
  };

  return (
    <div className="pdf-scanner-container">
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h2>Lector de PDF para Datos</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Sube un PDF (Efemérides, etc.), busca la fecha y transcribe los datos fácilmente.
        </p>

        {!pdfText ? (
          <div 
            className="uploader-area"
            onClick={() => document.getElementById('pdf-upload').click()}
            style={{ border: '2px dashed var(--glass-border)', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
            ) : (
              <FileText size={48} color="var(--text-muted)" />
            )}
            <h3 style={{ marginTop: '1rem' }}>{loading ? 'Procesando PDF...' : 'Haz clic para subir un PDF'}</h3>
            <input 
              id="pdf-upload" 
              type="file" 
              accept=".pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <FileText size={18} color="var(--primary-color)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{fileName}</span>
              <button 
                onClick={() => setPdfText('')} 
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cambiar archivo
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Mes (ej: octubre)" 
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
                style={{ flex: 2 }}
              />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Día (ej: 28)" 
                value={searchDay}
                onChange={(e) => setSearchDay(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={handleSearch} style={{ padding: '0.5rem 1rem' }}>
                <Search size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowFullText(!showFullText)}
              style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              {showFullText ? 'Ocultar texto completo' : 'Ver todo el texto extraído'}
            </button>
            
            {showFullText && (
              <div style={{ 
                marginTop: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                maxHeight: '300px', 
                overflowY: 'auto',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)'
              }}>
                {pdfText}
              </div>
            )}
          </div>
        )}
      </div>

      {snippet && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--accent-color)" />
            Referencia del PDF:
          </h3>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.9rem', 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid var(--glass-border)'
          }}>
            {snippet}
          </div>
        </div>
      )}

      {pdfText && (
        <div className="glass-panel">
          <h3>Trascripción de Datos</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fecha del Registro *</label>
                <input 
                  type="date" 
                  name="Fecha"
                  className="form-input" 
                  value={formData.Fecha}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>T. Sidéreo Aparente</label>
                <input 
                  type="text" 
                  name="T. Sidéreo Aparente"
                  className="form-input" 
                  placeholder="Ej: 15 30 12.4"
                  value={formData['T. Sidéreo Aparente']}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Nota / Descripción</label>
              <input 
                type="text" 
                name="Descripcion"
                className="form-input" 
                placeholder="Dato extraído del PDF"
                value={formData.Descripcion}
                onChange={handleFormChange}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              <Plus size={20} />
              Guardar en Base de Datos
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
