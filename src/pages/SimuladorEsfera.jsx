import React, { useState, useMemo } from 'react';
import { Sun, Star, MapPin, Compass, Move, Info, HelpCircle, ChevronRight, Calculator } from 'lucide-react';

export default function SimuladorEsfera() {
  // Inputs del usuario
  const [phi, setPhi] = useState(5); // Latitud
  const [tsl, setTsl] = useState(10); // Tiempo Sidéreo Local (hs)
  const [hAngle, setHAngle] = useState(2); // Ángulo Horario (hs)
  const [delta, setDelta] = useState(-35); // Declinación

  // Cálculos derivados
  const alpha = (tsl - hAngle + 24) % 24; // Ascensión Recta

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  // Coordenadas Azimutales (Aproximación para gráfico)
  const hRad = toRad(hAngle * 15);
  const phiRad = toRad(phi);
  const deltaRad = toRad(delta);

  // sen h = sen phi * sen delta + cos phi * cos delta * cos H
  const sinH = Math.sin(phiRad) * Math.sin(deltaRad) + Math.cos(phiRad) * Math.cos(deltaRad) * Math.cos(hRad);
  const hAstroRad = Math.asin(Math.max(-1, Math.min(1, sinH)));
  const hAstroDeg = toDeg(hAstroRad);

  // cos Az = (sen delta - sen phi * sen h) / (cos phi * cos h)
  const cosAz = (Math.sin(deltaRad) - Math.sin(phiRad) * sinH) / (Math.cos(phiRad) * Math.cos(hAstroRad));
  const azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  let azDeg = toDeg(azRad);
  if (Math.sin(hRad) < 0) azDeg = 360 - azDeg;

  // Configuración del gráfico SVG
  const size = 500;
  const center = size / 2;
  const radius = 180;

  // Proyección 3D simple (Perspectiva Isométrica/Ortogonal)
  const project = (lat, lon) => {
    const latR = toRad(lat);
    const lonR = toRad(lon);
    
    // Rotamos la esfera para que el Zenit esté arriba y el Norte al fondo
    const x = radius * Math.cos(latR) * Math.sin(lonR);
    const y = -radius * Math.sin(latR); // Invertimos Y para que Zenit esté arriba
    const z = radius * Math.cos(latR) * Math.cos(lonR);

    // Aplicamos una rotación de inclinación para vista 3D
    const tilt = toRad(20);
    const rot = toRad(30);
    
    const x1 = x * Math.cos(rot) - z * Math.sin(rot);
    const z1 = x * Math.sin(rot) + z * Math.cos(rot);
    
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);

    return { x: center + x1, y: center + y2, z: z2 };
  };

  // Puntos clave
  const Z = project(90, 0); // Zenit
  const Na = project(-90, 0); // Nadir
  const N = project(0, 0); // Norte
  const S = project(0, 180); // Sur
  const E = project(0, 90); // Este
  const W = project(0, 270); // Oeste
  const PNC = project(phi, 0); // Polo Norte Celeste
  const PSC = project(phi - 180, 0); // Polo Sur Celeste

  // La Estrella (usando Azimut y Altura calculados)
  const Estrella = project(hAstroDeg, azDeg);

  return (
    <div className="simulador-esfera-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--accent-color)', paddingBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Star size={32} color="var(--primary-color)" className="animate-pulse" /> Simulador de Esfera Celeste
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Representación gráfica de elementos locales y absolutos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        
        {/* PANEL DE CONTROL */}
        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--primary-color)" /> Parámetros de la Estrella
          </h3>
          
          <div className="form-group">
            <label>Latitud del Observador (φ)</label>
            <input type="number" className="form-input" value={phi} onChange={e => setPhi(parseFloat(e.target.value))} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{phi >= 0 ? 'Norte' : 'Sur'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>TSL (hs)</label>
              <input type="number" className="form-input" value={tsl} onChange={e => setTsl(parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Ang. Horario H (hs)</label>
              <input type="number" className="form-input" value={hAngle} onChange={e => setHAngle(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label>Declinación (δ)</label>
            <input type="number" className="form-input" value={delta} onChange={e => setDelta(parseFloat(e.target.value))} />
          </div>

          <div className="result-card" style={{ marginTop: '1rem', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid var(--primary-color)' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Ascensión Recta (α):</p>
            <h2 style={{ fontSize: '2rem' }}>{alpha.toFixed(2)} hs</h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Fórmula: α = TSL - H</p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Coordenadas Locales (Calculadas):</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Altura (h):</strong> {hAstroDeg.toFixed(2)}°</li>
              <li><strong>Azimut (Az):</strong> {azDeg.toFixed(2)}°</li>
            </ul>
          </div>
        </aside>

        {/* RECUADRO DEL GRÁFICO */}
        <section className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: 0, minHeight: '500px' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
             <span className="badge" style={{ background: 'var(--primary-color)' }}>Vista 3D Isométrica</span>
          </div>

          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ background: 'radial-gradient(circle at center, #1e1e2e 0%, #000 100%)' }}>
            {/* Esfera de Fondo */}
            <circle cx={center} cy={center} r={radius} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            
            {/* Ejes Principales (Lineas de trazo suave) */}
            <line x1={Z.x} y1={Z.y} x2={Na.x} y2={Na.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={N.x} y1={N.y} x2={S.x} y2={S.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={E.x} y1={E.y} x2={W.x} y2={W.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />

            {/* Ecuador Celeste (Inclinado según latitud) */}
            <ellipse 
              cx={center} 
              cy={center + (radius * Math.sin(toRad(20)) * Math.sin(toRad(phi)))} 
              rx={radius} 
              ry={radius * Math.cos(toRad(phi)) * 0.4} 
              fill="none" 
              stroke="var(--accent-color)" 
              strokeWidth="1.5" 
              opacity="0.4"
            />

            {/* Etiquetas de Puntos Locales */}
            <text x={Z.x} y={Z.y - 10} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z (Zenit)</text>
            <text x={Na.x} y={Na.y + 20} textAnchor="middle" fill="#aaa" fontSize="12">Na (Nadir)</text>
            <text x={N.x - 15} y={N.y} textAnchor="end" fill="#fff" fontSize="12">N</text>
            <text x={S.x + 15} y={S.y} textAnchor="start" fill="#fff" fontSize="12">S</text>
            
            {/* Polo Celeste */}
            <circle cx={PNC.x} cy={PNC.y} r="3" fill="#3b82f6" />
            <text x={PNC.x + 10} y={PNC.y} fill="#3b82f6" fontSize="11" fontWeight="bold">PNC</text>

            {/* Horizonte */}
            <ellipse cx={center} cy={center} rx={radius} ry={radius * 0.3} fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5" />

            {/* LA ESTRELLA */}
            <g>
              {/* Linea vertical a horizonte (Altura) */}
              <line x1={center} y1={center} x2={Estrella.x} y2={Estrella.y} stroke="rgba(255,255,255,0.1)" />
              <circle cx={Estrella.x} cy={Estrella.y} r="6" fill="var(--primary-color)" filter="blur(1px)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={Estrella.x} cy={Estrella.y} r="3" fill="#fff" />
              <text x={Estrella.x + 10} y={Estrella.y - 10} fill="#fff" fontSize="14" fontWeight="bold">Estrella</text>
            </g>

            {/* Mención de Coordenadas en el gráfico */}
            <g transform={`translate(20, ${size - 60})`}>
              <rect width="180" height="45" rx="8" fill="rgba(0,0,0,0.5)" stroke="var(--primary-color)" strokeWidth="1" />
              <text x="10" y="20" fill="var(--primary-color)" fontSize="11" fontWeight="bold">SIS. LOCAL: Az {azDeg.toFixed(1)}°, h {hAstroDeg.toFixed(1)}°</text>
              <text x="10" y="36" fill="var(--accent-color)" fontSize="11" fontWeight="bold">SIS. ABSOLUTO: H {hAngle}h, δ {delta}°</text>
            </g>
          </svg>
        </section>
      </div>

      <section className="glass-panel" style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Info size={20} color="var(--primary-color)" /> Análisis del Ejercicio
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div>
            <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Elementos Locales (Dependen del observador):</p>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li><strong>Vertical del lugar:</strong> Línea Z-Na.</li>
              <li><strong>Horizonte astronómico:</strong> Círculo máximo perpendicular a la vertical.</li>
              <li><strong>Puntos cardinales:</strong> N, S, E, W marcados sobre el horizonte.</li>
              <li><strong>Eje del mundo:</strong> Línea que une los polos celestes (PNC-PSC).</li>
            </ul>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>Elementos Absolutos (Independientes del observador):</p>
            <ul style={{ color: 'var(--text-muted)' }}>
              <li><strong>Ecuador Celeste:</strong> Círculo máximo perpendicular al eje del mundo.</li>
              <li><strong>Meridiano Celeste:</strong> Círculo máximo que pasa por los polos y el Zenit.</li>
              <li><strong>Coordenadas:</strong> Ascensión Recta (α) y Declinación (δ).</li>
            </ul>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Resolución Paso a Paso:</p>
            <p>1. <strong>Ascensión Recta:</strong> Se obtiene restando el Ángulo Horario al Tiempo Sidéreo: α = 10h - 2h = <strong>8hs</strong>.</p>
            <p>2. <strong>Ubicación:</strong> Al ser Latitud 5°N, el PNC está casi sobre el horizonte norte. Con Declinación -35°, la estrella se encuentra en el hemisferio sur celeste.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
