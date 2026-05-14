import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe, Sparkles } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); 
  const [val1, setVal1] = useState({ d: '2', m: '0', s: '0', dir: 'E' }); 
  const [val2, setVal2] = useState({ d: '-35', m: '0', s: '0' }); 
  const [lat, setLat] = useState({ d: '5', m: '0', s: '0', dir: 'N' });   

  const [casoEspecial, setCasoEspecial] = useState('culminacion');
  const [subCaso, setSubCaso] = useState('superior_norte'); 

  const [desarrollo, setDesarrollo] = useState([]);
  const [sugerenciaSol, setSugerenciaSol] = useState(false);
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
    const phiDec = dmsToDec(lat.d, lat.m, lat.s, lat.dir);
    const phiRad = toRad(phiDec);
    setSugerenciaSol(false);

    let hAstroFinal, azAstroFinal;

    if (modo === 'ecu_to_hor') {
      const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s, 'E');
      const hDeg = hHorarioDec * 15;
      const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
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
      const azDec = dmsToDec(val1.d, val1.m, val1.s, 'E');
      const zDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
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
      const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
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
              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Latitud (φ)</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select className="form-input" style={{ width: '65px' }} value={lat.dir} onChange={e => setLat({...lat, dir: e.target.value})}>
                    <option value="N">Norte</option>
                    <option value="S">Sur</option>
                  </select>
                  <input type="number" placeholder="°" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                  <input type="number" placeholder="'" className="form-input" value={lat.m} onChange={e => setLat({...lat, m: e.target.value})} />
                  <input type="number" className="form-input" value={lat.s} onChange={e => setLat({...lat, s: e.target.value})} />
                </div>
              </div>

              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Ángulo Horario (H)' : modo === 'hor_to_ecu' ? 'Azimut (Az)' : 'Longitud (λ)'}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={val1.d} onChange={e => setVal1({...val1, d: e.target.value})} />
                  <input type="number" className="form-input" value={val1.m} onChange={e => setVal1({...val1, m: e.target.value})} />
                  <input type="number" className="form-input" value={val1.s} onChange={e => setVal1({...val1, s: e.target.value})} />
                </div>
              </div>

              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Declinación (δ)' : modo === 'hor_to_ecu' ? 'Distancia Cenital (z)' : 'Declinación (δ)'}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={val2.d} onChange={e => setVal2({...val2.d, d: e.target.value})} />
                  <input type="number" className="form-input" value={val2.m} onChange={e => setVal2({...val2.m, m: e.target.value})} />
                  <input type="number" className="form-input" value={val2.s} onChange={e => setVal2({...val2.s, s: e.target.value})} />
                </div>
              </div>
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

        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><Globe color="var(--accent-color)" size={20} /> Esfera Celeste Detallada</h3>
          
          <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)', background: '#000' }}>
            {currentCoords ? (
              <svg width="100%" height="100%" viewBox="0 0 300 400">
                <circle cx="150" cy="200" r="120" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.1)" />
                
                {/* PRIMER VERTICAL: Círculo máximo que pasa por Z, E, Na, W */}
                <ellipse cx="150" cy="200" rx="40" ry="120" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" transform="rotate(25 150 200)" opacity="0.6" />
                <text x="175" y="100" fill="#ef4444" fontSize="9" fontWeight="bold">PRIMER VERTICAL (Z-E-Na-W)</text>

                {/* VERTICAL DEL LUGAR (Z-Na) */}
                <line x1="150" y1="80" x2="150" y2="320" stroke="#fff" strokeWidth="2" strokeDasharray="5" />
                <text x="150" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z (Zenit)</text>
                <text x="150" y="335" textAnchor="middle" fill="#aaa" fontSize="12" fontWeight="bold">Na (Nadir)</text>

                {/* ECUADOR CELESTE */}
                <ellipse cx="150" cy={200 + (120 * Math.sin(toRad(currentCoords.phi)) * 0.3)} rx="120" ry="20" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" />
                <text x="35" y={200 + (120 * Math.sin(toRad(currentCoords.phi)) * 0.3) + 15} fill="var(--accent-color)" fontSize="9" fontWeight="bold">ECUADOR CELESTE</text>

                {/* HORIZONTE */}
                <ellipse cx="150" cy="200" rx="120" ry="30" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
                <text x="20" y="205" fill="#3b82f6" fontSize="10" fontWeight="bold">W</text>
                <text x="270" y="205" fill="#3b82f6" fontSize="10" fontWeight="bold">E</text>

                {/* ESTRELLA */}
                {(() => {
                  const p = project(currentCoords.h, currentCoords.az);
                  return (
                    <g>
                      <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-color)" />
                      <circle cx={p.x} cy={p.y} r="2" fill="white" />
                      <text x={p.x + 10} y={p.y - 10} fill="white" fontSize="12" fontWeight="bold">★ Estrella</text>
                    </g>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Calcula para ver el gráfico.
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
             <p style={{ color: '#ef4444', marginBottom: '0.4rem' }}>● <strong>Primer Vertical:</strong> Arco rojo (Zenit ↔ Nadir).</p>
             <p style={{ color: 'var(--accent-color)', marginBottom: '0.4rem' }}>● <strong>Ecuador:</strong> Línea naranja principal.</p>
             <p style={{ color: '#fff' }}>● <strong>Eje Z-Na:</strong> Vertical del Lugar.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
