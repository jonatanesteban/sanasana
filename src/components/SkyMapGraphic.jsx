import React from 'react';

const SkyMapGraphic = ({ az, alt, name }) => {
  const size = 300;
  const center = size / 2;
  const radius = 120;

  const toRad = (deg) => (deg * Math.PI) / 180;
  
  // En astronomía, Azimut se mide desde el Norte (0) hacia el Este (90)
  // En SVG, 0 grados es a la derecha (Este). Ajustamos restando 90.
  const angleRad = toRad(az - 90);
  
  // La distancia al centro depende de la distancia cenital (90 - alt)
  const dist = radius * (1 - alt / 90);
  
  const starX = center + dist * Math.cos(angleRad);
  const starY = center + dist * Math.sin(angleRad);

  return (
    <div className="sky-map-graphic" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 'bold' }}>
        Mapa del Cielo Local
      </h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Circulos de Altura */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius * 2/3} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius * 1/3} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* Ejes Cardinales */}
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        <text x={center} y={center - radius - 10} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">N</text>
        <text x={center} y={center + radius + 20} fill="#fff" fontSize="12" textAnchor="middle">S</text>
        <text x={center + radius + 15} y={center + 5} fill="#fff" fontSize="12">E</text>
        <text x={center - radius - 25} y={center + 5} fill="#fff" fontSize="12">W</text>

        {/* Horizonte Shaded */}
        <circle cx={center} cy={center} r={radius} fill="radial-gradient(circle, transparent 70%, rgba(99,102,241,0.05) 100%)" />

        {/* La Estrella */}
        {alt > 0 ? (
          <g>
            <line x1={center} y1={center} x2={starX} y2={starY} stroke="var(--primary-color)" strokeWidth="1" strokeDasharray="3" opacity="0.3" />
            <circle cx={starX} cy={starY} r="6" fill="var(--primary-color)" filter="blur(2px)">
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={starX} cy={starY} r="3" fill="#fff" />
            <text x={starX + 10} y={starY - 10} fill="#fff" fontSize="11" fontWeight="bold">{name || 'Estrella'}</text>
          </g>
        ) : (
          <text x={center} y={center} fill="var(--danger-color)" fontSize="10" textAnchor="middle">Bajo el horizonte</text>
        )}
      </svg>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Posición: Az {az.toFixed(1)}° | Alt {alt.toFixed(1)}°
      </div>
    </div>
  );
};

export default SkyMapGraphic;
