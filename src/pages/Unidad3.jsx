import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe, Sparkles } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); 
  const [val1, setVal1] = useState({ d: '2', m: '0', s: '0', dir: 'E' }); // H
  const [val2, setVal2] = useState({ d: '-35', m: '0', s: '0' }); // Dec
  const [lat, setLat] = useState({ d: '39', m: '0', s: '0', dir: 'S' }); // Latitud (Ej: Zapala)
  const [tslInput, setTslInput] = useState('10'); // TSL para ubicar Aries

  const [desarrollo, setDesarrollo] = useState([]);
  const [currentCoords, setCurrentCoords] = useState(null); 

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dmsToDec = (d, m, s, dir) => {
    let deg = parseFloat(d || 0);
    let val = (Math.abs(deg) + (parseFloat(m || 0) / 60) + (parseFloat(s || 0) / 3600));
    if (dir === 'S' || dir === 'W' || deg < 0) return -val;
    return val;
  };

  const formatDMS = (dec) => {
    const abs = Math.abs(dec);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${dec < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  // Proyección 3D mejorada para alineación astronómica
  const project = (alt, az, tiltVal = 15, rotVal = 25) => {
    const radius = 120;
    const center = 150;
    const hR = toRad(alt);
    const azR = toRad(az);
    const x = radius * Math.cos(hR) * Math.sin(azR);
    const y = -radius * Math.sin(hR);
    const z = radius * Math.cos(hR) * Math.cos(azR);
    const tilt = toRad(tiltVal);
    const rot = toRad(rotVal);
    const x1 = x * Math.cos(rot) - z * Math.sin(rot);
    const z1 = x * Math.sin(rot) + z * Math.cos(rot);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    return { x: center + x1, y: center + y2, z: z1 };
  };

  const calcular = (e) => {
    if (e) e.preventDefault();
    const pasos = [];
    const phiDec = dmsToDec(lat.d, lat.m, lat.s, lat.dir);
    const phiRad = toRad(phiDec);
    
    const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s, 'E');
    const hDeg = hHorarioDec * 15;
    const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
    const hRad = toRad(hDeg);
    const decRad = toRad(decDec);

    const cosZ = (Math.sin(phiRad) * Math.sin(decRad)) + (Math.cos(phiRad) * Math.cos(decRad) * Math.cos(hRad));
    const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
    const zDec = toDeg(zRad);
    const hAstroFinal = 90 - zDec;

    const numAz = Math.sin(hRad);
    const denAz = (Math.sin(phiRad) * Math.cos(hRad)) - (Math.cos(phiRad) * Math.tan(decRad));
    let azAstroFinal = toDeg(Math.atan2(numAz, denAz));
    if (azAstroFinal < 0) azAstroFinal += 360;

    pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H(grados) = H(horas) × 15', desarrollo: `${hHorarioDec.toFixed(4)}h × 15`, resultado: `${hDeg.toFixed(4)}°` });
    pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ sen δ + cos φ cos δ cos H', resultado: formatDMS(zDec) });
    pasos.push({ titulo: 'Altura (h)', formula: 'h = 90° - z', resultado: formatDMS(hAstroFinal) });
    pasos.push({ titulo: 'Azimut (Az)', formula: 'tan Az = sen H / (sen φ cos H - cos φ tan δ)', resultado: formatDMS(azAstroFinal) });

    setDesarrollo(pasos);
    setCurrentCoords({ 
      h: hAstroFinal, 
      az: azAstroFinal, 
      phi: phiDec, 
      hAng: hHorarioDec, 
      dec: decDec,
      tsl: parseFloat(tslInput || 0)
    });
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BookOpen size={32} color="var(--primary-color)" /> Unidad 3: Gráfico de Examen</h1>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcular} className="glass-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group-box">
                <label>Latitud (φ) - Hemisferio</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select className="form-input" style={{ width: '80px' }} value={lat.dir} onChange={e => setLat({...lat, dir: e.target.value})}>
                    <option value="N">Norte</option>
                    <option value="S">Sur</option>
                  </select>
                  <input type="number" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group-box">
                  <label>Ángulo Horario (H)</label>
                  <input type="number" className="form-input" value={val1.d} onChange={e => setVal1({...val1, d: e.target.value})} />
                </div>
                <div className="input-group-box">
                  <label>Declinación (δ)</label>
                  <input type="number" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                </div>
              </div>
              <div className="input-group-box">
                <label>Tiempo Sidéreo Local (TSL) - Para Aries (γ)</label>
                <input type="number" className="form-input" value={tslInput} onChange={e => setTslInput(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Calcular y Graficar (Paso a Paso)</button>
          </form>

          {desarrollo.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Desarrollo Matemático</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {desarrollo.map((paso, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                    <div style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>{paso.titulo}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{paso.resultado}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="glass-panel" style={{ background: '#050505', padding: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}><Globe size={20} /> Esfera Celeste (Hemisferio {lat.dir === 'S' ? 'Sur' : 'Norte'})</h3>
          
          <div style={{ width: '100%', height: '450px', position: 'relative' }}>
            {currentCoords ? (
              <svg width="100%" height="100%" viewBox="0 0 300 450">
                {/* 1. Círculo base */}
                <circle cx="150" cy="225" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                
                {/* 2. Eje Vertical (Z - N') */}
                <line x1="150" y1="105" x2="150" y2="345" stroke="#fff" strokeWidth="2" strokeDasharray="5" />
                <text x="150" y="95" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">Z</text>
                <text x="150" y="360" textAnchor="middle" fill="#aaa" fontSize="14" fontWeight="bold">N'</text>

                {/* 3. Línea del Horizonte */}
                <ellipse cx="150" cy="225" rx="120" ry="30" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
                <text x="25" y="230" fill="#3b82f6" fontSize="10" fontWeight="bold">N</text>
                <text x="270" y="230" fill="#3b82f6" fontSize="10" fontWeight="bold">S</text>
                
                {/* 4. Elevación del Polo y Eje del Mundo */}
                {(() => {
                  const phi = currentCoords.phi;
                  // Si lat es S, elevamos Ps sobre el punto S. Si es N, Pn sobre N.
                  const poleAlt = Math.abs(phi);
                  const poleAz = phi < 0 ? 180 : 0; 
                  const pMain = project(poleAlt, poleAz);
                  const pOpp = project(-poleAlt, poleAz + 180);
                  const isSouth = phi < 0;

                  return (
                    <g>
                      <line x1={pMain.x} y1={pMain.y} x2={pOpp.x} y2={pOpp.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                      <circle cx={pMain.x} cy={pMain.y} r="4" fill="#f59e0b" />
                      <text x={pMain.x + 10} y={pMain.y} fill="#f59e0b" fontSize="12" fontWeight="bold">{isSouth ? 'Ps' : 'Pn'}</text>
                      <text x={pOpp.x - 10} y={pOpp.y} fill="#f59e0b" fontSize="12" fontWeight="bold">{isSouth ? 'Pn' : 'Ps'}</text>
                    </g>
                  );
                })()}

                {/* 5. ECUADOR CELESTE (Perpendicular al eje del mundo) */}
                {(() => {
                   const phi = currentCoords.phi;
                   const eqTilt = 90 - Math.abs(phi);
                   const eqAz = phi < 0 ? 0 : 180; // Opuesto al polo elevado
                   // Dibujamos el ecuador como una elipse inclinada
                   return <ellipse cx="150" cy={225 + (120 * Math.sin(toRad(phi)) * 0.3)} rx="120" ry="20" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" />;
                })()}

                {/* 6. PUNTO ARIES (gamma) - Según TSL */}
                {(() => {
                   const ariesH = currentCoords.tsl; // Ang horario de Aries es el TSL
                   const pAries = project(0, ariesH * 15 + 180); // Aproximación visual sobre ecuador
                   return (
                     <g>
                       <text x={pAries.x} y={pAries.y} fill="var(--accent-color)" fontSize="18" fontWeight="bold">γ</text>
                     </g>
                   );
                })()}

                {/* 7. ESTRELLA Y CÍRCULO HORARIO */}
                {(() => {
                  const p = project(currentCoords.h, currentCoords.az);
                  const phi = currentCoords.phi;
                  const pnc = project(phi, phi < 0 ? 180 : 0);
                  const psc = project(phi - 180, phi < 0 ? 180 : 0);

                  return (
                    <g>
                      {/* Círculo Horario (entre polos) */}
                      <path d={`M ${pnc.x} ${pnc.y} Q ${p.x} ${p.y} ${psc.x} ${psc.y}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3" />
                      <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-color)" />
                      <circle cx={p.x} cy={p.y} r="2" fill="white" />
                      <text x={p.x + 10} y={p.y - 10} fill="white" fontSize="12" fontWeight="bold">S (Astro)</text>
                    </g>
                  );
                })()}

                {/* PRIMER VERTICAL (Z-E-Na-W) */}
                <ellipse cx="150" cy="225" rx="40" ry="120" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" transform="rotate(25 150 225)" opacity="0.4" />
              </svg>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Realiza un cálculo para generar el gráfico de examen.</div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
             <p style={{ color: '#f59e0b' }}>● <strong>Eje del Mundo:</strong> Ps-Pn inclinado {Math.abs(currentCoords?.phi || 0)}°.</p>
             <p style={{ color: 'var(--primary-color)' }}>● <strong>Ecuador:</strong> Perpendicular al eje del mundo.</p>
             <p style={{ color: 'var(--accent-color)' }}>● <strong>γ (Aries):</strong> Origen absoluto según TSL.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
