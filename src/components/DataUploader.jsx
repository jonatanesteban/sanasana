import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataUploader({ onDataLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const processFile = (file) => {
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        
        if (jsonData.length === 0) {
          setError('El archivo Excel parece estar vacío.');
          return;
        }

        const getMonthFromFilename = (filename) => {
          const f = filename.toLowerCase();
          if (f.includes('enero')) return 1;
          if (f.includes('febrero')) return 2;
          if (f.includes('marzo')) return 3;
          if (f.includes('abril')) return 4;
          if (f.includes('mayo')) return 5;
          if (f.includes('junio')) return 6;
          if (f.includes('julio')) return 7;
          if (f.includes('agosto')) return 8;
          if (f.includes('septiembre') || f.includes('setiembre')) return 9;
          if (f.includes('octubre')) return 10;
          if (f.includes('noviembre')) return 11;
          if (f.includes('diciembre')) return 12;
          return new Date().getMonth() + 1;
        };

        const month = getMonthFromFilename(file.name);
        const year = new Date().getFullYear(); // Asume año actual

        // Normalize data to ensure it has a "Fecha" key.
        const normalizedData = jsonData.map(row => {
          let dateVal = row['Fecha'] || row['fecha'] || row['Date'] || row['date'] || null;
          
          if (!dateVal && row['Día'] !== undefined) {
            // Construye la fecha usando el Día y el mes detectado en el nombre
            dateVal = `${year}-${String(month).padStart(2, '0')}-${String(row['Día']).padStart(2, '0')}`;
            return {
              ...row,
              Fecha: dateVal
            };
          }

          return {
            ...row,
            Fecha: dateVal ? new Date(dateVal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] // Fallback
          };
        });

        onDataLoaded(normalizedData);
      } catch (err) {
        console.error(err);
        setError('Hubo un error al procesar el archivo Excel. Asegúrate de que tenga un formato válido.');
      }
    };
    
    reader.onerror = () => {
      setError('Hubo un error al leer el archivo.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setError('Por favor, sube un archivo Excel válido (.xlsx, .xls) o CSV.');
      }
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="glass-panel">
      <h2>Cargar desde Excel</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Sube tu archivo Excel. Si tienes una columna llamada "Fecha", la usaremos para las búsquedas.
      </p>

      <div 
        className={`uploader-area ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('excel-upload').click()}
      >
        <UploadCloud className="uploader-icon" size={48} />
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Haz clic o arrastra tu archivo aquí</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Soporta .xlsx, .xls, .csv
          </p>
        </div>
        <input 
          id="excel-upload" 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          style={{ display: 'none' }} 
          onChange={handleFileInput}
        />
      </div>
      
      {error && (
        <div style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}
