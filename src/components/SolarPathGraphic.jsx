import React from 'react';

const SolarPathGraphic = ({ lat, dec, sunriseH, sunsetH, culminationH }) => {
  const size = 300;
  const padding = 40;
  const graphWidth = size - padding * 2;
  const graphHeight = size - padding * 2;
  const center = size / 2;

  const toRad = (deg) => (deg * Math.PI) / 180;
  
  // Función para calcular la altura del sol (h) dado un ángulo horario (H)
  const calculateHeight = (hAngle) => {
    const phiRad = toRad(lat);
    const deltaRad = toRad(dec);
    const hRad = toRad(hAngle * 15);
    
    const sinH = Math.sin(phiRad) * Math.sin(deltaRad) + 
                 Math.cos(phiRad) * Math.cos(deltaRad) * Math.cos(hRad);
    return Math.asin(Math.max(-1, Math.min(1, sinH)));
  };

  // Generar puntos de la curva (de 0 a 24 hs)
  const points = [];
  for (let i = 0; i <= 24; i += 0.5) {
    // El mediodía astronómico es H=0. 
    // Mapeamos 0-24hs a un rango donde 12hs sea el centro.
    const hAngle = (i - 12); 
    const hRad = calculateHeight(hAngle);
    const hDeg = (hRad * 180) / Math.PI;
    
    // Mapear a coordenadas SVG
    const x = padding + (i / 24) * graphWidth;
    const y = center - (hDeg / 90) * (graphHeight / 2);
    points.push(`${x},${y}`);
  }

  const pathData = `M ${points.join(' L ')}`;

  return (
    <div className="solar-path-graphic" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid var(--glass-border)' }}>
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase' }}>
        Trayectoria Solar (Altura vs Tiempo)
      </h4>
      <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Ejes */}
        <line x1={padding} y1={center} x2={size - padding} y2={center} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Etiquetas Ejes */}
        <text x={size - padding} y={center + 15} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">Tiempo (hs)</text>
        <text x={padding - 5} y={padding} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end" transform={`rotate(-90, ${padding - 5}, ${padding})`}>Altura (°)</text>

        {/* Curva del Sol */}
        <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        
        {/* Area bajo la curva (Sol sobre horizonte) */}
        <path 
          d={`${pathData} L ${size - padding},${center} L ${padding},${center} Z`} 
          fill="url(#solarFill)" 
          opacity="0.2" 
        />
        
        <defs>
          <linearGradient id="solarFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Marcadores de Eventos */}
        {sunriseH !== undefined && (
          <g>
            <circle cx={padding + ((24 - sunriseH) / 24) * graphWidth} cy={center} r="4" fill="#10b981" />
            <text x={padding + ((24 - sunriseH) / 24) * graphWidth} y={center + 20} fill="#10b981" fontSize="9" textAnchor="middle">Salida</text>
          </g>
        )}
        
        {sunsetH !== undefined && (
          <g>
            <circle cx={padding + (sunsetH / 24) * graphWidth} cy={center} r="4" fill="#ef4444" />
            <text x={padding + (sunsetH / 24) * graphWidth} y={center + 20} fill="#ef4444" fontSize="9" textAnchor="middle">Puesta</text>
          </g>
        )}

        <circle cx={center} cy={center - (culminationH / 90) * (graphHeight / 2)} r="5" fill="#f59e0b" />
        <text x={center} y={center - (culminationH / 90) * (graphHeight / 2) - 10} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">Cenit</text>
      </svg>
    </div>
  );
};

export default SolarPathGraphic;
