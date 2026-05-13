import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); // 'ecu_to_hor', 'hor_to_ecu', 'especiales'
  
  // Estados para inputs generales
  const [val1, setVal1] = useState({ d: '2', m: '0', s: '0' }); // H o Az
  const [val2, setVal2] = useState({ d: '-35', m: '0', s: '0' }); // Dec o z
  const [lat, setLat] = useState({ d: '5', m: '0', s: '0' });   // Latitud

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

  const project = (h, az) => {
    const radius = 120;
    const center = 150;
    const hR = toRad(h);
    const azR = toRad(az);
    
    // Proyección 3D simple
    const x = radius * Math.cos(hR) * Math.sin(azR);
    const y = -radius * Math.sin(hR);
    const z = radius * Math.cos(hR) * Math.cos(azR);

    const tilt = toRad(15);
    const rot = toRad(25);
    
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

      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H(grados) = H(horas) × 15', desarrollo: `${hHorarioDec.toFixed(4)}h × 15`, resultado: `${hDeg.toFixed(4)}°` });
      pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ sen δ + cos φ cos δ cos H', desarrollo: `sen(${phiDec.toFixed(2)})sen(${decDec.toFixed(2)}) + cos(${phiDec.toFixed(2)})cos(${decDec.toFixed(2)})cos(${hDeg.toFixed(2)})`, resultado: formatDMS(zDec) });
      pasos.push({ titulo: 'Altura del Astro (h)', formula: 'h = 90° - z', desarrollo: `90° - ${zDec.toFixed(2)}°`, resultado: formatDMS(90 - zDec) });

      const numAz = Math.sin(hRad);
      const denAz = (Math.sin(phiRad) * Math.cos(hRad)) - (Math.cos(phiRad) * Math.tan(decRad));
      azAstroFinal = toDeg(Math.atan2(numAz, denAz));
      if (azAstroFinal < 0) azAstroFinal += 360;
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
      pasos.push({ titulo: 'Declinación (δ)', formula: 'sen δ = cos z sen φ - sen z cos φ cos Az', desarrollo: `cos(${zDec.toFixed(2)})sen(${phiDec.toFixed(2)}) - sen(${zDec.toFixed(2)})cos(${phiDec.toFixed(2)})cos(${azDec.toFixed(2)})`, resultado: formatDMS(toDeg(decRad)) });

      const numH = Math.sin(azRad);
      const denH = (Math.cos(phiRad) * (1 / Math.tan(zRad))) + (Math.sin(phiRad) * Math.cos(azRad));
      let hDecRaw = toDeg(Math.atan2(numH, denH));
      if (hDecRaw < 0) hDecRaw += 360;
      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'tan H = sen Az / (cos φ cot z + sen φ cos Az)', desarrollo: `atan2(${numH.toFixed(4)}, ${denH.toFixed(4)})`, resultado: formatDMS(hDecRaw) });

    } else if (modo === 'especiales') {
      const decDec = dmsToDec(val2.d, val2.m, val2.s);
      const decRad = toRad(decDec);

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

      } else if (casoEspecial === 'elongacion') {
        const cosZ = Math.sin(phiRad) / Math.sin(decRad);
        const z = toDeg(Math.acos(cosZ));
        const sinAz = Math.cos(decRad) / Math.cos(phiRad);
        const az = toDeg(Math.asin(sinAz));
        hAstroFinal = 90 - z;
        azAstroFinal = az;
        pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ / sen δ', desarrollo: `sen(${phiDec.toFixed(2)}) / sen(${decDec.toFixed(2)}) = ${cosZ.toFixed(4)}`, resultado: formatDMS(z) });
        pasos.push({ titulo: 'Azimut (Az)', formula: 'sen Az = cos δ / cos φ', desarrollo: `cos(${decDec.toFixed(2)}) / cos(${phiDec.toFixed(2)}) = ${sinAz.toFixed(4)}`, resultado: `Az = ${az.toFixed(2)}°` });

      } else if (casoEspecial === 'vertical') {
        const cosZ = Math.sin(decRad) / Math.sin(phiRad);
        const z = toDeg(Math.acos(cosZ));
        hAstroFinal = 90 - z;
        azAstroFinal = 90;
        pasos.push({ titulo: 'Azimut (Az)', formula: 'Por definición (Primer Vertical)', desarrollo: 'El astro corta la línea E-O', resultado: 'Az = 90° o 270°' });
        pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen δ / sen φ', desarrollo: `sen(${decDec.toFixed(2)}) / sen(${phiDec.toFixed(2)}) = ${cosZ.toFixed(4)}`, resultado: formatDMS(z) });

      } else if (casoEspecial === 'salida_puesta') {
        const cosH = -(Math.tan(phiRad) * Math.tan(decRad));
        if (cosH <= 1 && cosH >= -1) {
          const hDeg = toDeg(Math.acos(cosH));
          hAstroFinal = 0;
          azAstroFinal = toDeg(Math.acos(Math.sin(decRad) / Math.cos(phiRad)));
          setSugerenciaSol(true);
          pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H = arccos(-tan φ tan δ)', desarrollo: `arccos(${cosH.toFixed(4)})`, resultado: `${(hDeg/15).toFixed(2)}h` });
        }
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

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcular} className="glass-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {modo === 'especiales' && (
                <div className="form-group">
                  <label>Situación Especial</label>
                  <select className="form-input" value={casoEspecial} onChange={e => setCasoEspecial(e.target.value)}>
                    <option value="culminacion">Culminación</option>
                    <option value="salida_puesta">Salida y Puesta</option>
                    <option value="elongacion">Elongación</option>
                    <option value="vertical">Primer Vertical</option>
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
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>Calcular Caso <ArrowRight size={18} /></button>
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

        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><Globe color="var(--accent-color)" size={20} /> Graficador de Esfera</h3>
          
          <div style={{ width: '100%', height: '350px', background: 'radial-gradient(circle at center, #1e1e2e 0%, #000 100%)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)' }}>
            {currentCoords ? (
              <svg width="100%" height="100%" viewBox="0 0 300 350">
                {/* Esfera */}
                <circle cx="150" cy="175" r="120" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
                
                {/* VERTICAL DEL LUGAR (Zenit-Nadir) */}
                <line x1="150" y1="55" x2="150" y2="295" stroke="var(--primary-color)" strokeWidth="2" strokeDasharray="5" opacity="0.6" />
                <text x="150" y="45" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">Z (Zenit)</text>
                <text x="150" y="315" textAnchor="middle" fill="#aaa" fontSize="14" fontWeight="bold">Na (Nadir)</text>

                {/* Horizonte Astronómico */}
                <ellipse cx="150" cy="175" rx="120" ry="30" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
                <text x="35" y="178" fill="#3b82f6" fontSize="10">W</text>
                <text x="265" y="178" fill="#3b82f6" fontSize="10">E</text>

                {/* Ecuador Celeste */}
                <ellipse cx="150" cy={175 + (120 * Math.sin(toRad(currentCoords.phi)) * 0.3)} rx="120" ry="20" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" opacity="0.4" />

                {/* Estrella y Arcos */}
                {(() => {
                  const p = project(currentCoords.h, currentCoords.az);
                  const pZ = { x: 150, y: 55 }; // Punto Zenit
                  const pProjH = project(0, currentCoords.az); // Proyección en horizonte

                  return (
                    <g>
                      {/* Arco Zenital (desde vertical) */}
                      <path d={`M ${pZ.x} ${pZ.y} Q 150 175 ${p.x} ${p.y}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="2" />
                      
                      {/* Vertical de la Estrella */}
                      <line x1={p.x} y1={p.y} x2={pProjH.x} y2={pProjH.y} stroke="var(--primary-color)" strokeWidth="1" strokeDasharray="3" opacity="0.5" />

                      {/* Punto de la Estrella */}
                      <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-color)" filter="blur(1px)" />
                      <circle cx={p.x} cy={p.y} r="3" fill="white" />
                      <text x={p.x + 10} y={p.y - 10} fill="white" fontSize="12" fontWeight="bold">★ Estrella</text>
                    </g>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                Realiza un cálculo para visualizar la estrella en la esfera.
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Elementos Locales:</p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
              <li><strong>Vertical:</strong> Línea punteada rosa (Z-Na).</li>
              <li><strong>Distancia Cenital ($z$):</strong> Arco desde el Zenit.</li>
              <li><strong>Altura ($h$):</strong> Medida desde el horizonte.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
