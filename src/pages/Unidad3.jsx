import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe, Sparkles } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); 
  const [val1, setVal1] = useState({ d: '2', m: '0', s: '0' }); 
  const [val2, setVal2] = useState({ d: '-35', m: '0', s: '0' }); 
  const [lat, setLat] = useState({ d: '5', m: '0', s: '0' });   

  const [casoEspecial, setCasoEspecial] = useState('culminacion');
  const [subCaso, setSubCaso] = useState('superior_norte'); 

  const [desarrollo, setDesarrollo] = useState([]);
  const [sugerenciaSol, setSugerenciaSol] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null); 

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dmsToDec = (d, m, s) => {
    const deg = parseFloat(d || 0);
    return (Math.abs(deg) + (parseFloat(m || 0) / 60) + (parseFloat(s || 0) / 3600)) * (deg < 0 ? -1 : 1);
  };
  const formatDMS = (dec) => {
    const abs = Math.abs(dec);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${dec < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  const project = (h, az, tiltVal = 15, rotVal = 25) => {
    const radius = 120;
    const center = 150;
    const hR = toRad(h);
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
    const phiDec = dmsToDec(lat.d, lat.m, lat.s);
    const phiRad = toRad(phiDec);
    setSugerenciaSol(false);

    let hAstroFinal, azAstroFinal;

    if (modo === 'ecu_to_hor') {
      const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s);
      const hDeg = hHorarioDec * 15;
      const decDec = dmsToDec(val2.d, val2.m, val2.s);
      const hRad = toRad(hDeg);
      const decRad = toRad(decDec);

      const cosZ = (Math.sin(phiRad) * Math.sin(decRad)) + (Math.cos(phiRad) * Math.cos(decRad) * Math.cos(hRad));
      const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
      const zDec = toDeg(zRad);
      hAstroFinal = 90 - zDec;

      const numAz = Math.sin(hRad);
      const denAz = (Math.sin(phiRad) * Math.cos(hRad)) - (Math.cos(phiRad) * Math.tan(decRad));
      azAstroFinal = toDeg(Math.atan2(numAz, denAz));
      if (azAstroFinal < 0) azAstroFinal += 360;

      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H(grados) = H(horas) × 15', desarrollo: `${hHorarioDec.toFixed(4)}h × 15`, resultado: `${hDeg.toFixed(4)}°` });
      pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ sen δ + cos φ cos δ cos H', desarrollo: `sen(${phiDec.toFixed(2)})sen(${decDec.toFixed(2)}) + cos(${phiDec.toFixed(2)})cos(${decDec.toFixed(2)})cos(${hDeg.toFixed(2)})`, resultado: formatDMS(zDec) });
      pasos.push({ titulo: 'Altura del Astro (h)', formula: 'h = 90° - z', desarrollo: `90° - ${zDec.toFixed(2)}°`, resultado: formatDMS(90 - zDec) });
      pasos.push({ titulo: 'Azimut (Az)', formula: 'tan Az = sen H / (sen φ cos H - cos φ tan δ)', desarrollo: `atan2(${numAz.toFixed(4)}, ${denAz.toFixed(4)})`, resultado: formatDMS(azAstroFinal) });

    } else if (modo === 'hor_to_ecu') {
      const azDec = dmsToDec(val1.d, val1.m, val1.s);
      const zDec = dmsToDec(val2.d, val2.m, val2.s);
      azAstroFinal = azDec;
      hAstroFinal = 90 - zDec;
      const azRad = toRad(azDec);
      const zRad = toRad(zDec);

      const sinDec = (Math.cos(zRad) * Math.sin(phiRad)) - (Math.sin(zRad) * Math.cos(phiRad) * Math.cos(azRad));
      const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));
      const numH = Math.sin(azRad);
      const denH = (Math.cos(phiRad) * (1 / Math.tan(zRad))) + (Math.sin(phiRad) * Math.cos(azRad));
      let hDecRaw = toDeg(Math.atan2(numH, denH));
      if (hDecRaw < 0) hDecRaw += 360;
      
      pasos.push({ titulo: 'Declinación (δ)', formula: 'sen δ = cos z sen φ - sen z cos φ cos Az', desarrollo: `cos(${zDec.toFixed(2)})sen(${phiDec.toFixed(2)}) - sen(${zDec.toFixed(2)})cos(${phiDec.toFixed(2)})cos(${azDec.toFixed(2)})`, resultado: formatDMS(toDeg(decRad)) });
      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'tan H = sen Az / (cos φ cot z + sen φ cos Az)', desarrollo: `atan2(${numH.toFixed(4)}, ${denH.toFixed(4)})`, resultado: formatDMS(hDecRaw) });

    } else if (modo === 'especiales') {
      const decDec = dmsToDec(val2.d, val2.m, val2.s);
      if (casoEspecial === 'culminacion') {
        let z, az, h_ang;
        if (subCaso === 'superior_norte') { az = 180; h_ang = 0; z = phiDec - decDec; }
        else if (subCaso === 'inferior_norte') { az = 180; h_ang = 12; z = 180 - (phiDec + decDec); }
        else if (subCaso === 'superior_sur') { az = 0; h_ang = 0; z = phiDec - decDec; }
        else { az = 0; h_ang = 12; z = 180 - (phiDec + decDec); }
        hAstroFinal = 90 - z;
        azAstroFinal = az;
        pasos.push({ titulo: 'Azimut e H', formula: 'Valores fijos por definición', desarrollo: `Caso: ${subCaso.replace('_',' ')}`, resultado: `Az = ${az}°, H = ${h_ang}h` });
        pasos.push({ titulo: 'Distancia Cenital (z)', formula: h_ang === 0 ? 'z = φ - δ' : 'z = 180 - (φ + δ)', desarrollo: h_ang === 0 ? `${phiDec.toFixed(2)} - ${decDec.toFixed(2)}` : `180 - (${phiDec.toFixed(2)} + ${decDec.toFixed(2)})`, resultado: formatDMS(z) });
      }
    }

    setDesarrollo(pasos);
    setCurrentCoords({ h: hAstroFinal, az: azAstroFinal, phi: phiDec });
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BookOpen size={32} color="var(--primary-color)" /> Unidad 3: Situaciones Especiales</h1>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className={`nav-btn ${modo === 'ecu_to_hor' ? 'active' : ''}`} onClick={() => { setModo('ecu_to_hor'); setDesarrollo([]); }}>Ecuatoriales ➔ Horiz.</button>
          <button className={`nav-btn ${modo === 'hor_to_ecu' ? 'active' : ''}`} onClick={() => { setModo('hor_to_ecu'); setDesarrollo([]); }}>Horiz. ➔ Ecuatoriales</button>
          <button className={`nav-btn ${modo === 'especiales' ? 'active' : ''}`} onClick={() => { setModo('especiales'); setDesarrollo([]); }}><Star size={18} /> Casos Especiales</button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcular} className="glass-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {modo === 'especiales' && (
                <div className="form-group">
                  <label>Situación Especial</label>
                  <select className="form-input" value={casoEspecial} onChange={e => setCasoEspecial(e.target.value)}>
                    <option value="culminacion">Culminación</option>
                    <option value="salida_puesta">Salida y Puesta</option>
                  </select>
                </div>
              )}
              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Ángulo Horario (H)' : modo === 'hor_to_ecu' ? 'Azimut (Az)' : 'Latitud (φ)'}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={modo === 'especiales' ? lat.d : val1.d} onChange={e => modo === 'especiales' ? setLat({...lat, d: e.target.value}) : setVal1({...val1, d: e.target.value})} />
                  <input type="number" className="form-input" value={modo === 'especiales' ? lat.m : val1.m} onChange={e => modo === 'especiales' ? setLat({...lat, m: e.target.value}) : setVal1({...val1, m: e.target.value})} />
                  <input type="number" className="form-input" value={modo === 'especiales' ? lat.s : val1.s} onChange={e => modo === 'especiales' ? setLat({...lat, s: e.target.value}) : setVal1({...val1, s: e.target.value})} />
                </div>
              </div>
              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Declinación (δ)' : modo === 'hor_to_ecu' ? 'Distancia Cenital (z)' : 'Declinación (δ)'}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                  <input type="number" className="form-input" value={val2.m} onChange={e => setVal2({...val2, m: e.target.value})} />
                  <input type="number" className="form-input" value={val2.s} onChange={e => setVal2({...val2, s: e.target.value})} />
                </div>
              </div>
              {modo !== 'especiales' && (
                <div className="input-group-box">
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Latitud (φ)</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                    <input type="number" className="form-input" value={lat.m} onChange={e => setLat({...lat, m: e.target.value})} />
                    <input type="number" className="form-input" value={lat.s} onChange={e => setLat({...lat, s: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>Calcular y Graficar <Sparkles size={18} /></button>
          </form>

          {desarrollo.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Desarrollo del Cálculo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {desarrollo.map((paso, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                    <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}>{paso.titulo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{paso.formula}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', margin: '0.5rem 0' }}>{paso.desarrollo}</div>
                    <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{paso.resultado}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><Globe color="var(--accent-color)" size={20} /> Esfera Celeste Premium</h3>
          
          <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)', boxShadow: 'inset 0 0 50px rgba(59, 130, 246, 0.1)' }}>
            {currentCoords ? (
              <svg width="100%" height="100%" viewBox="0 0 300 400">
                <defs>
                  <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e1e2e" />
                    <stop offset="100%" stopColor="#000" />
                  </radialGradient>
                </defs>
                
                {/* Fondo de Estrellas */}
                {[...Array(20)].map((_, i) => (
                  <circle key={i} cx={Math.random() * 300} cy={Math.random() * 400} r={Math.random() * 1} fill="white" opacity={Math.random()} />
                ))}

                {/* Esfera Principal */}
                <circle cx="150" cy="200" r="120" fill="url(#skyGradient)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                
                {/* ELEMENTOS ABSOLUTOS: Meridiano del Lugar */}
                <ellipse cx="150" cy="200" rx="40" ry="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5" />
                
                {/* EJE DEL MUNDO Y POLOS */}
                {(() => {
                  const pnc = project(currentCoords.phi, 0);
                  const psc = project(currentCoords.phi - 180, 0);
                  return (
                    <g>
                      <line x1={pnc.x} y1={pnc.y} x2={psc.x} y2={psc.y} stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                      <circle cx={pnc.x} cy={pnc.y} r="3" fill="#3b82f6" />
                      <text x={pnc.x + 8} y={pnc.y} fill="#3b82f6" fontSize="10" fontWeight="bold">PNC</text>
                    </g>
                  );
                })()}

                {/* VERTICAL DEL LUGAR */}
                <line x1="150" y1="80" x2="150" y2="320" stroke="var(--primary-color)" strokeWidth="2" strokeDasharray="4" opacity="0.5" />
                <text x="150" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z (Zenit)</text>

                {/* Horizonte y Almucantaráts */}
                <ellipse cx="150" cy="200" rx="120" ry="30" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
                <ellipse cx="150" cy="185" rx="115" ry="25" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" />
                <ellipse cx="150" cy="165" rx="100" ry="20" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" />

                {/* Ecuador Celeste */}
                <ellipse cx="150" cy={200 + (120 * Math.sin(toRad(currentCoords.phi)) * 0.3)} rx="120" ry="20" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" opacity="0.5" />

                {/* Estrella y Trazados */}
                {(() => {
                  const p = project(currentCoords.h, currentCoords.az);
                  const pProjH = project(0, currentCoords.az);
                  return (
                    <g>
                      {/* Arco de Altura */}
                      <path d={`M ${pProjH.x} ${pProjH.y} Q 150 200 ${p.x} ${p.y}`} fill="none" stroke="var(--primary-color)" strokeWidth="1" strokeDasharray="2" opacity="0.6" />
                      <line x1="150" y1="200" x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" />
                      
                      <circle cx={p.x} cy={p.y} r="8" fill="var(--primary-color)" filter="blur(2px)">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={p.x} cy={p.y} r="4" fill="white" />
                      <text x={p.x + 12} y={p.y - 12} fill="white" fontSize="12" fontWeight="bold">★ Estrella</text>
                    </g>
                  );
                })()}
                
                {/* Referencias Cardinales */}
                <text x="35" y="203" fill="#3b82f6" fontSize="10" fontWeight="bold">W</text>
                <text x="265" y="203" fill="#3b82f6" fontSize="10" fontWeight="bold">E</text>
              </svg>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                <Globe size={48} opacity={0.2} />
                <p style={{ fontSize: '0.85rem', textAlign: 'center', padding: '0 2rem' }}>Ingresa los datos para generar la Esfera Celeste 3D detallada.</p>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
             <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Elementos Añadidos:</p>
             <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
               <li>🌌 <strong>Starfield:</strong> Fondo de estrellas dinámico.</li>
               <li>🌐 <strong>Meridiano del Lugar:</strong> Círculo que une Z y PNC.</li>
               <li>🔄 <strong>Almucantaráts:</strong> Círculos de altura secundaria.</li>
               <li>📌 <strong>Polos Celestes:</strong> Ubicación del PNC y PSC.</li>
               <li>💡 <strong>Brillo:</strong> Efecto de atmósfera en la estrella.</li>
             </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
