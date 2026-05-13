import React, { useState } from 'react';
import { Sun, Star, MapPin, Compass, Move, Info, HelpCircle, ChevronRight, Calculator, Zap } from 'lucide-react';

export default function SimuladorEsfera() {
  // Inputs del usuario
  const [phi, setPhi] = useState(5); // Latitud
  const [tsl, setTsl] = useState(10); // Tiempo Sidéreo Local (hs)
  const [hAngle, setHAngle] = useState(2); // Ángulo Horario (hs)
  const [delta, setDelta] = useState(-35); // Declinación

  // Formateadores
  const formatDMS = (dec) => {
    const abs = Math.abs(dec);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${dec < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  const formatHMS = (decimal) => {
    let abs = Math.abs(decimal);
    while (abs >= 24) abs -= 24;
    while (abs < 0) abs += 24;
    const h = Math.floor(abs);
    const m = Math.floor((abs - h) * 60);
    const s = ((abs - h) * 60 - m) * 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s.toFixed(2)).padStart(5, '0')}s`;
  };

  // Cálculos derivados
  const alpha = (tsl - hAngle + 24) % 24; 

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const hRad = toRad(hAngle * 15);
  const phiRad = toRad(phi);
  const deltaRad = toRad(delta);

  // sen h = sen phi * sen delta + cos phi * cos delta * cos H
  const sinPhi = Math.sin(phiRad);
  const sinDelta = Math.sin(deltaRad);
  const cosPhi = Math.cos(phiRad);
  const cosDelta = Math.cos(deltaRad);
  const cosH = Math.cos(hRad);

  const term1 = sinPhi * sinDelta;
  const term2 = cosPhi * cosDelta * cosH;
  const sinH = term1 + term2;
  const hAstroRad = Math.asin(Math.max(-1, Math.min(1, sinH)));
  const hAstroDeg = toDeg(hAstroRad);

  // cos Az = (sen delta - sen phi * sen h) / (cos phi * cos h)
  const numAz = sinDelta - (sinPhi * sinH);
  const denAz = cosPhi * Math.cos(hAstroRad);
  const cosAzValue = numAz / denAz;
  const azRad = Math.acos(Math.max(-1, Math.min(1, cosAzValue)));
  let azDeg = toDeg(azRad);
  if (Math.sin(hRad) < 0) azDeg = 360 - azDeg;

  // Configuración del gráfico SVG
  const size = 500;
  const center = size / 2;
  const radius = 180;

  const project = (lat, lon) => {
    const latR = toRad(lat);
    const lonR = toRad(lon);
    const x = radius * Math.cos(latR) * Math.sin(lonR);
    const y = -radius * Math.sin(latR); 
    const z = radius * Math.cos(latR) * Math.cos(lonR);
    const tilt = toRad(20);
    const rot = toRad(30);
    const x1 = x * Math.cos(rot) - z * Math.sin(rot);
    const z1 = x * Math.sin(rot) + z * Math.cos(rot);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    return { x: center + x1, y: center + y2, z: z2 };
  };

  const Z = project(90, 0); 
  const Na = project(-90, 0); 
  const N = project(0, 0); 
  const S = project(0, 180); 
  const E = project(0, 90); 
  const W = project(0, 270); 
  const PNC = project(phi, 0); 
  const PSC = project(phi - 180, 0); 
  const Estrella = project(hAstroDeg, azDeg);

  return (
    <div className="simulador-esfera-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--accent-color)', paddingBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Star size={32} color="var(--primary-color)" className="animate-pulse" /> Simulador de Esfera Celeste
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Representación gráfica y resolución detallada en GMS.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--primary-color)" /> Parámetros de la Estrella
          </h3>
          <div className="form-group">
            <label>Latitud del Observador (φ)</label>
            <input type="number" className="form-input" value={phi} onChange={e => setPhi(parseFloat(e.target.value))} />
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

          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
            <h4 style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} /> Desarrollo Matemático
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>1. Ascensión Recta (α):</p>
                <p style={{ fontFamily: 'monospace' }}>α = TSL - H = {tsl}h - {hAngle}h</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>α = {formatHMS(alpha)}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>2. Altura (h):</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>sen h = sen φ sen δ + cos φ cos δ cos H</p>
                <p style={{ fontFamily: 'monospace' }}>sen h = ({sinPhi.toFixed(4)})({sinDelta.toFixed(4)}) + ({cosPhi.toFixed(4)})({cosDelta.toFixed(4)})({cosH.toFixed(4)}) = {sinH.toFixed(6)}</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>h = {formatDMS(hAstroDeg)}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>3. Azimut (Az):</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>cos Az = (sen δ - sen φ sen h) / (cos φ cos h)</p>
                <p style={{ fontFamily: 'monospace' }}>cos Az = ({sinDelta.toFixed(4)} - {sinPhi.toFixed(4)}×{sinH.toFixed(4)}) / ({cosPhi.toFixed(4)}×{Math.cos(hAstroRad).toFixed(4)}) = {cosAzValue.toFixed(6)}</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Az = {formatDMS(azDeg)}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: 0, minHeight: '500px' }}>
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', textAlign: 'right', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)' }}>
               <p style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>SISTEMA LOCAL</p>
               <p style={{ fontSize: '1.1rem' }}>h: {formatDMS(hAstroDeg)}</p>
               <p style={{ fontSize: '1.1rem' }}>Az: {formatDMS(azDeg)}</p>
            </div>
          </div>

          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ background: 'radial-gradient(circle at center, #1e1e2e 0%, #000 100%)' }}>
            <circle cx={center} cy={center} r={radius} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1={Z.x} y1={Z.y} x2={Na.x} y2={Na.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={N.x} y1={N.y} x2={S.x} y2={S.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={E.x} y1={E.y} x2={W.x} y2={W.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <ellipse cx={center} cy={center + (radius * Math.sin(toRad(20)) * Math.sin(toRad(phi)))} rx={radius} ry={radius * Math.cos(toRad(phi)) * 0.4} fill="none" stroke="var(--accent-color)" strokeWidth="1.5" opacity="0.4" />
            <text x={Z.x} y={Z.y - 10} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z (Zenit)</text>
            <text x={Na.x} y={Na.y + 20} textAnchor="middle" fill="#aaa" fontSize="12">Na (Nadir)</text>
            <text x={N.x - 15} y={N.y} textAnchor="end" fill="#fff" fontSize="12">N</text>
            <text x={S.x + 15} y={S.y} textAnchor="start" fill="#fff" fontSize="12">S</text>
            <circle cx={PNC.x} cy={PNC.y} r="3" fill="#3b82f6" />
            <text x={PNC.x + 10} y={PNC.y} fill="#3b82f6" fontSize="11" fontWeight="bold">PNC</text>
            <ellipse cx={center} cy={center} rx={radius} ry={radius * 0.3} fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5" />
            <g>
              <line x1={center} y1={center} x2={Estrella.x} y2={Estrella.y} stroke="rgba(255,255,255,0.1)" />
              <circle cx={Estrella.x} cy={Estrella.y} r="6" fill="var(--primary-color)" filter="blur(1px)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={Estrella.x} cy={Estrella.y} r="3" fill="#fff" />
              <text x={Estrella.x + 10} y={Estrella.y - 10} fill="#fff" fontSize="14" fontWeight="bold">Estrella</text>
            </g>
          </svg>
        </section>
      </div>

      <section className="glass-panel" style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Info size={20} color="var(--primary-color)" /> Análisis Teórico del Ejercicio
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div>
            <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Sistemas de Coordenadas:</p>
            <p style={{ color: 'var(--text-muted)' }}>La estrella está definida localmente por su Altura ({formatDMS(hAstroDeg)}) y Azimut ({formatDMS(azDeg)}). Absolutamente se define por su Declinación ({delta}°) y Ascensión Recta ({formatHMS(alpha)}).</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Resumen Final:</p>
            <p><strong>α:</strong> {formatHMS(alpha)}</p>
            <p><strong>h:</strong> {formatDMS(hAstroDeg)}</p>
            <p><strong>Az:</strong> {formatDMS(azDeg)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
