import React, { useState, useMemo } from 'react';
import { Search, Calendar, Database, Trash2 } from 'lucide-react';

export default function DataViewer({ data, onDelete }) {
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredData = useMemo(() => {
    if (!searchDate) return data;
    
    return data.filter(item => {
      // Clean and normalize the stored date
      const itemDateStr = String(item.Fecha || '').trim();
      
      // Attempt to compare ignoring time if it exists
      if (itemDateStr.startsWith(searchDate)) return true;
      
      // Fallback robust date check
      try {
        const d1 = new Date(itemDateStr);
        const d2 = new Date(searchDate);
        return d1.getFullYear() === d2.getFullYear() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getDate() === d2.getDate();
      } catch (e) {
        return false;
      }
    });
  }, [data, searchDate]);

  // Extract all unique columns to build table headers dynamically
  const columns = useMemo(() => {
    const cols = new Set();
    filteredData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'id') cols.add(key);
      });
    });
    
    // Ensure "Fecha" is always first if it exists
    const colArray = Array.from(cols);
    if (colArray.includes('Fecha')) {
      return ['Fecha', ...colArray.filter(c => c !== 'Fecha')];
    }
    return colArray;
  }, [filteredData]);

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div className="data-viewer-header">
        <div>
          <h2>Consultar Datos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Total registros guardados: {data.length}
          </p>
        </div>

        <div className="search-box">
          <Calendar size={18} color="var(--text-muted)" />
          <input 
            type="date" 
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Search size={18} color="var(--primary-color)" />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="empty-state">
          <Database size={48} />
          <p>No se encontraron registros para la fecha seleccionada.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  {columns.map(col => (
                    <td key={`${item.id}-${col}`}>
                      {item[col] !== undefined && item[col] !== null ? String(item[col]) : '-'}
                    </td>
                  ))}
                  <td>
                    <button 
                      className="btn-danger"
                      onClick={() => onDelete(item.id)}
                      title="Eliminar registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
