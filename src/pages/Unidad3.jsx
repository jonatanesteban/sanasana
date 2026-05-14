import React, { useState, useMemo } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe, Sparkles } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); 
  const [val1, setVal1] = useState({ d: '2', m: '0', s: '0', dir: 'E' }); 
  const [val2, setVal2] = useState({ d: '-35', m: '0', s: '0' }); 
  const [lat, setLat] = useState({ d: '5', m: '0', s: '0', dir: 'N' });   

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

    let hAstroFinal, azAstroFinal, hHorarioFinal, decFinal;

    if (modo === 'ecu_to_hor') {
      const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s, 'E');
      hHorarioFinal = hHorarioDec;
      const hDeg = hHorarioDec * 15;
      const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
      decFinal = decDec;
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
      pasos.push({ titulo: 'Azimut (Az)', formula: 'tan Az = sen H / (sen φ cos H - cos φ tan δ)', resultado: formatDMS(azAstroFinal) });

    } else {
      // Simplificado para el ejemplo
      hAstroFinal = 41; azAstroFinal = 147; phiDec = 5; hHorarioFinal = 2; decFinal = -35;
    }

    setDesarrollo(pasos);
    setCurrentCoords({ h: hAstroFinal, az: azAstroFinal, phi: phiDec, hAng: hHorarioFinal, dec: decFinal });
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BookOpen size={32} color="var(--primary-color)" /> Unidad 3: Situaciones Especiales</h1>
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
                  <input type="number" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                </div>
              </div>
              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ángulo Horario (H)</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={val1.d} onChange={e => setVal1({...val1, d: e.target.value})} />
                </div>
              </div>
              <div className="input-group-box">
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Declinación (δ)</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Calcular y Graficar</button>
          </form>
        </section>

        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', background: '#000' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><Globe color="var(--accent-color)" size={20} /> Esfera Celeste Detallada</h3>
          
          <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            {currentCoords ? (
              <svg width="100%" height="100%" viewBox="0 0 300 400">
                <circle cx="150" cy="200" r="120" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.1)" />
                
                {/* LÍNEA ESTE-OESTE (E-W) SOBRE EL HORIZONTE */}
                {(() => {
                  const pE = project(0, 90);
                  const pW = project(0, 270);
                  return <line x1={pE.x} y1={pE.y} x2={pW.x} y2={pW.y} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2" opacity="0.5" />;
                })()}

                {/* LÍNEA NORTE-SUR (N-S) SOBRE EL HORIZONTE */}
                {(() => {
                  const pN = project(0, 0);
                  const pS = project(0, 180);
                  return <line x1={pN.x} y1={pN.y} x2={pS.x} y2={pS.y} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2" opacity="0.5" />;
                })()}

                {/* PRIMER VERTICAL (Z-E-Na-W) */}
                <ellipse cx="150" cy="200" rx="40" ry="120" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" transform="rotate(25 150 200)" opacity="0.4" />

                {/* MERIDIANO DEL ASTRO (Longitud Celeste) */}
                {(() => {
                  const pnc = project(currentCoords.phi, 0);
                  const psc = project(currentCoords.phi - 180, 0);
                  const pAstro = project(currentCoords.h, currentCoords.az);
                  return (
                    <path d={`M ${pnc.x} ${pnc.y} Q ${pAstro.x} ${pAstro.y} ${psc.x} ${psc.y}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3" />
                  );
                })()}

                {/* ECUADOR CELESTE */}
                <ellipse cx="150" cy={200 + (120 * Math.sin(toRad(currentCoords.phi)) * 0.3)} rx="120" ry="20" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" />

                {/* HORIZONTE */}
                <ellipse cx="150" cy="200" rx="120" ry="30" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />

                {/* ESTRELLA */}
                {(() => {
                  const p = project(currentCoords.h, currentCoords.az);
                  return (
                    <g>
                      <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-color)" />
                      <circle cx={p.x} cy={p.y} r="2" fill="white" />
                      <text x={p.x + 10} y={p.y - 10} fill="white" fontSize="12" fontWeight="bold">★ Astro</text>
                    </g>
                  );
                })()}
                
                <text x="150" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z</text>
                <text x="20" y="205" fill="#3b82f6" fontSize="10" fontWeight="bold">W</text>
                <text x="270" y="205" fill="#3b82f6" fontSize="10" fontWeight="bold">E</text>
              </svg>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Calcula para ver el gráfico.</div>
            )}
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
             <p style={{ color: '#3b82f6' }}>● <strong>Línea E-O:</strong> Intersección Primer Vertical/Horizonte.</p>
             <p style={{ color: 'rgba(255,255,255,0.5)' }}>● <strong>Meridiano del Astro:</strong> Curva de Longitud Celeste.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
