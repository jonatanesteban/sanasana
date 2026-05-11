import React, { useState } from 'react';
import { Calculator, Clock, Star, MapPin, ArrowRight, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const CalculatorCard = ({ title, icon: Icon, children, formula }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderLeft: '3px solid var(--primary-color)' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.1rem' }}>
          <Icon size={20} color="var(--primary-color)" /> {title}
        </h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {isOpen && (
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            Fórmula: {formula}
          </p>
          {children}
        </div>
      )}
    </div>
  );
};

export default function FormulasCalculos() {
  const [activeTab, setActiveTab] = useState('u4');

  // --- Estados Unidad 4 ---
  const [tuLegal, setTuLegal] = useState({ h: '', m: '', s: '' });
  const [tuResult, setTuResult] = useState(null);
  const [isTu, setIsTu] = useState({ h: '', m: '', s: '' });
  const [isResult, setIsResult] = useState(null);
  const [tgTheta0, setTgTheta0] = useState('');
  const [tgIs, setTgIs] = useState({ h: '', m: '', s: '' });
  const [tgResult, setTgResult] = useState(null);
  const [hThetaL, setHThetaL] = useState({ h: '', m: '', s: '' });
  const [hAr, setHAr] = useState({ h: '', m: '', s: '' });
  const [hResult, setHResult] = useState(null);

  // --- Estados Unidad 3 ---
  const [u3Z, setU3Z] = useState({ lat: {d:'', m:'', s:''}, dec: {d:'', m:'', s:''}, h: {d:'', m:'', s:''} });
  const [u3ZResult, setU3ZResult] = useState(null);
  const [u3ZDesarrollo, setU3ZDesarrollo] = useState(null);
  const [u3H, setU3H] = useState('');
  const [u3HResult, setU3HResult] = useState(null);
  const [u3Az, setU3Az] = useState({ lat: {d:'', m:'', s:''}, dec: {d:'', m:'', s:''}, h: {d:'', m:'', s:''} });
  const [u3AzResult, setU3AzResult] = useState(null);
  const [u3AzDesarrollo, setU3AzDesarrollo] = useState(null);
  const [u3SP, setU3SP] = useState({ lat: {d:'', m:'', s:''}, dec: {d:'', m:'', s:''}, h: {d:'', m:'', s:''} });
  const [u3SPResult, setU3SPResult] = useState(null);
  const [u3SPDesarrollo, setU3SPDesarrollo] = useState(null);

  // --- Helpers ---
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dmsToDecimal = (d, m, s) => {
    const deg = parseFloat(d || 0);
    return (Math.abs(deg) + (parseFloat(m || 0) / 60) + (parseFloat(s || 0) / 3600)) * (deg < 0 ? -1 : 1);
  };
  const formatDMS = (decimal) => {
    const abs = Math.abs(decimal);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${decimal < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  // --- Funciones U4 ---
  const calcTU = () => {
    const h = parseInt(tuLegal.h || 0);
    const diff = -3;
    let resH = h - diff;
    if (resH >= 24) resH -= 24;
    if (resH < 0) resH += 24;
    setTuResult(`${String(resH).padStart(2, '0')}:${String(tuLegal.m || 0).padStart(2, '0')}:${String(parseFloat(tuLegal.s || 0).toFixed(2)).padStart(5, '0')}`);
  };

  const calcIS = () => {
    const tu = dmsToDecimal(isTu.h, isTu.m, isTu.s);
    const is = tu * 1.0027379;
    const h = Math.floor(is);
    const m = Math.floor((is - h) * 60);
    const s = ((is - h) * 60 - m) * 60;
    setIsResult(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(4)).padStart(7, '0')}`);
  };

  const calcTG = () => {
    const parts = tgTheta0.split(' ').filter(Boolean);
    if (parts.length < 3) return alert('Formato de Theta 0 inválido');
    const t0 = parseInt(parts[0]) + (parseInt(parts[1])/60) + (parseFloat(parts[2])/3600);
    const is = parseInt(tgIs.h || 0) + (parseInt(tgIs.m || 0)/60) + (parseFloat(tgIs.s || 0)/3600);
    let tg = t0 + is;
    while (tg >= 24) tg -= 24;
    const h = Math.floor(tg);
    const m = Math.floor((tg - h) * 60);
    const s = ((tg - h) * 60 - m) * 60;
    setTgResult(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(4)).padStart(7, '0')}`);
  };

  const calcH = () => {
    const tl = dmsToDecimal(hThetaL.h, hThetaL.m, hThetaL.s);
    const ar = dmsToDecimal(hAr.h, hAr.m, hAr.s);
    let hVal = tl - ar;
    while (hVal < 0) hVal += 24;
    while (hVal >= 24) hVal -= 24;
    const h = Math.floor(hVal);
    const m = Math.floor((hVal - h) * 60);
    const s = ((hVal - h) * 60 - m) * 60;
    setHResult(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(4)).padStart(7, '0')}`);
  };

  // --- Funciones U3 ---
  const calcU3Z = () => {
    const latDeg = dmsToDecimal(u3Z.lat.d, u3Z.lat.m, u3Z.lat.s);
    const decDeg = dmsToDecimal(u3Z.dec.d, u3Z.dec.m, u3Z.dec.s);
    const hDeg = dmsToDecimal(u3Z.h.d, u3Z.h.m, u3Z.h.s);
    
    const latRad = toRad(latDeg);
    const decRad = toRad(decDeg);
    const hRad = toRad(hDeg);
    
    const term1 = Math.sin(latRad) * Math.sin(decRad);
    const term2 = Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad);
    const cosZ = term1 + term2;
    const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
    const zDeg = toDeg(zRad);

    let desarrollo = `lat = ${latDeg.toFixed(4)}°, dec = ${decDeg.toFixed(4)}°, H = ${hDeg.toFixed(4)}°\n`;
    desarrollo += `cos Z = (sen ${latDeg.toFixed(4)}° · sen ${decDeg.toFixed(4)}°) + (cos ${latDeg.toFixed(4)}° · cos ${decDeg.toFixed(4)}° · cos ${hDeg.toFixed(4)}°)\n`;
    desarrollo += `cos Z = (${Math.sin(latRad).toFixed(4)} · ${Math.sin(decRad).toFixed(4)}) + (${Math.cos(latRad).toFixed(4)} · ${Math.cos(decRad).toFixed(4)} · ${Math.cos(hRad).toFixed(4)})\n`;
    desarrollo += `cos Z = ${term1.toFixed(6)} + ${term2.toFixed(6)} = ${cosZ.toFixed(6)}\n`;
    desarrollo += `Z = arccos(${cosZ.toFixed(6)}) = ${zDeg.toFixed(4)}°`;
    
    setU3ZDesarrollo(desarrollo);
    setU3ZResult(formatDMS(zDeg));
  };

  const calcU3Az = () => {
    const latDeg = dmsToDecimal(u3Az.lat.d, u3Az.lat.m, u3Az.lat.s);
    const decDeg = dmsToDecimal(u3Az.dec.d, u3Az.dec.m, u3Az.dec.s);
    const hDeg = dmsToDecimal(u3Az.h.d, u3Az.h.m, u3Az.h.s);
    
    const latRad = toRad(latDeg);
    const decRad = toRad(decDeg);
    const hRad = toRad(hDeg);
    
    const num = Math.sin(hRad);
    const den = (Math.sin(latRad) * Math.cos(hRad)) - (Math.cos(latRad) * Math.tan(decRad));
    
    let az = toDeg(Math.atan2(num, den));
    if (az < 0) az += 360;

    let desarrollo = `lat = ${latDeg.toFixed(4)}°, dec = ${decDeg.toFixed(4)}°, H = ${hDeg.toFixed(4)}°\n`;
    desarrollo += `tan Az = sen H / (sen lat · cos H - cos lat · tan dec)\n`;
    desarrollo += `tan Az = ${num.toFixed(4)} / (${(Math.sin(latRad) * Math.cos(hRad)).toFixed(4)} - ${(Math.cos(latRad) * Math.tan(decRad)).toFixed(4)})\n`;
    desarrollo += `tan Az = ${num.toFixed(4)} / ${den.toFixed(4)}\n`;
    desarrollo += `Az = atan2(${num.toFixed(4)}, ${den.toFixed(4)}) = ${az.toFixed(4)}°`;
    
    setU3AzDesarrollo(desarrollo);
    setU3AzResult(formatDMS(az));
  };

  const calcU3SP = () => {
    const latDeg = dmsToDecimal(u3SP.lat.d, u3SP.lat.m, u3SP.lat.s);
    const decDeg = dmsToDecimal(u3SP.dec.d, u3SP.dec.m, u3SP.dec.s);
    const latRad = toRad(latDeg);
    const decRad = toRad(decDeg);
    const cosH = -(Math.tan(latRad) * Math.tan(decRad));
    
    let desarrollo = `lat = ${latDeg.toFixed(4)}°, dec = ${decDeg.toFixed(4)}°\n`;
    desarrollo += `cos H = -tan(${latDeg.toFixed(4)}°) · tan(${decDeg.toFixed(4)}°)\n`;
    desarrollo += `cos H = -(${Math.tan(latRad).toFixed(4)}) · (${Math.tan(decRad).toFixed(4)}) = ${cosH.toFixed(6)}`;
    
    setU3SPDesarrollo(desarrollo);

    if (cosH > 1 || cosH < -1) {
      setU3SPResult({ angular: 'Circumpolar', horario: '---' });
      return;
    }
    
    const hDeg = toDeg(Math.acos(cosH));
    const hHorario = hDeg / 15;
    const hSalida = 24 - hHorario;
    const durDia = (2 * hDeg) / 15;
    const durNoche = 24 - durDia;
    
    // Formatear tiempos a HH:MM:SS
    const formatH = (decimal) => {
      const h = Math.floor(decimal);
      const m = Math.floor((decimal - h) * 60);
      const s = ((decimal - h) * 60 - m) * 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`;
    };

    let desarrolloFull = desarrollo;
    desarrolloFull += `\nH (puesta) = ${hDeg.toFixed(4)}° / 15 = ${hHorario.toFixed(4)}h`;
    desarrolloFull += `\nH (salida) = 24h - ${hHorario.toFixed(4)}h = ${hSalida.toFixed(4)}h`;
    desarrolloFull += `\nDuración Día = (2 · ${hDeg.toFixed(4)}°) / 15 = ${durDia.toFixed(4)}h`;
    desarrolloFull += `\nDuración Noche = 24h - ${durDia.toFixed(4)}h = ${durNoche.toFixed(4)}h`;
    setU3SPDesarrollo(desarrolloFull);

    setU3SPResult({ 
      puesta: formatH(hHorario),
      salida: formatH(hSalida),
      dia: formatH(durDia),
      noche: formatH(durNoche)
    });
  };

  return (
    <div className="formulas-container" style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Biblioteca de Fórmulas</h1>
        <p>Calculadoras individuales organizadas por unidad temática.</p>
      </header>

      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', marginTop: '2rem' }}>
        <button 
          className={`nav-btn ${activeTab === 'u3' ? 'active' : ''}`} 
          onClick={() => setActiveTab('u3')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <BookOpen size={18} /> Unidad 3
        </button>
        <button 
          className={`nav-btn ${activeTab === 'u4' ? 'active' : ''}`} 
          onClick={() => setActiveTab('u4')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Calculator size={18} /> Unidad 4
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        
        {/* --- CONTENIDO UNIDAD 3 --- */}
        {activeTab === 'u3' && (
          <div>
            <CalculatorCard title="Distancia Cenital (Z)" icon={MapPin} formula="cos Z = sen lat · sen dec + cos lat · cos dec · cos H">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Latitud (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Z.lat.d} onChange={e => setU3Z({...u3Z, lat: {...u3Z.lat, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Z.lat.m} onChange={e => setU3Z({...u3Z, lat: {...u3Z.lat, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Z.lat.s} onChange={e => setU3Z({...u3Z, lat: {...u3Z.lat, s: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group"><label>Declinación (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Z.dec.d} onChange={e => setU3Z({...u3Z, dec: {...u3Z.dec, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Z.dec.m} onChange={e => setU3Z({...u3Z, dec: {...u3Z.dec, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Z.dec.s} onChange={e => setU3Z({...u3Z, dec: {...u3Z.dec, s: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group"><label>H Angular (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Z.h.d} onChange={e => setU3Z({...u3Z, h: {...u3Z.h, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Z.h.m} onChange={e => setU3Z({...u3Z, h: {...u3Z.h, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Z.h.s} onChange={e => setU3Z({...u3Z, h: {...u3Z.h, s: e.target.value}})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcU3Z} style={{ gridColumn: '1 / -1' }}>Calcular Z</button>
                
                {u3ZDesarrollo && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    <strong>Paso a paso:</strong><br />
                    {u3ZDesarrollo}
                  </div>
                )}

                {u3ZResult && <div className="result-badge" style={{ gridColumn: '1 / -1' }}>Z = {u3ZResult}</div>}
              </div>
            </CalculatorCard>

            <CalculatorCard title="Azimut (Az)" icon={Star} formula="tan Az = sen H / (sen lat · cos H - cos lat · tan dec)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Latitud (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Az.lat.d} onChange={e => setU3Az({...u3Az, lat: {...u3Az.lat, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Az.lat.m} onChange={e => setU3Az({...u3Az, lat: {...u3Az.lat, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Az.lat.s} onChange={e => setU3Az({...u3Az, lat: {...u3Az.lat, s: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group"><label>Declinación (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Az.dec.d} onChange={e => setU3Az({...u3Az, dec: {...u3Az.dec, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Az.dec.m} onChange={e => setU3Az({...u3Az, dec: {...u3Az.dec, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Az.dec.s} onChange={e => setU3Az({...u3Az, dec: {...u3Az.dec, s: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group"><label>H Angular (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3Az.h.d} onChange={e => setU3Az({...u3Az, h: {...u3Az.h, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3Az.h.m} onChange={e => setU3Az({...u3Az, h: {...u3Az.h, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3Az.h.s} onChange={e => setU3Az({...u3Az, h: {...u3Az.h, s: e.target.value}})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcU3Az} style={{ gridColumn: '1 / -1' }}>Calcular Azimut</button>
                
                {u3AzDesarrollo && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    <strong>Paso a paso:</strong><br />
                    {u3AzDesarrollo}
                  </div>
                )}

                {u3AzResult && <div className="result-badge" style={{ gridColumn: '1 / -1' }}>Az = {u3AzResult}</div>}
              </div>
            </CalculatorCard>

            <CalculatorCard title="Salida y Puesta (H)" icon={Clock} formula="cos H = -tan lat · tan dec">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Latitud (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3SP.lat.d} onChange={e => setU3SP({...u3SP, lat: {...u3SP.lat, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3SP.lat.m} onChange={e => setU3SP({...u3SP, lat: {...u3SP.lat, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3SP.lat.s} onChange={e => setU3SP({...u3SP, lat: {...u3SP.lat, s: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group"><label>Declinación (° ' '')</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="number" className="form-input" placeholder="°" value={u3SP.dec.d} onChange={e => setU3SP({...u3SP, dec: {...u3SP.dec, d: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="'" value={u3SP.dec.m} onChange={e => setU3SP({...u3SP, dec: {...u3SP.dec, m: e.target.value}})} />
                    <input type="number" className="form-input" placeholder="''" value={u3SP.dec.s} onChange={e => setU3SP({...u3SP, dec: {...u3SP.dec, s: e.target.value}})} />
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <h5 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Condiciones de Visibilidad:</h5>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                    <li><strong>δ &lt; 90° - |φ|:</strong> El astro sale y se oculta.</li>
                    <li><strong>δ &gt; 90° - |φ|:</strong> El astro es circumpolar (no se oculta o no sale).</li>
                  </ul>
                </div>

                <button className="btn-primary" onClick={calcU3SP} style={{ gridColumn: '1 / -1' }}>Calcular H de Salida/Puesta</button>
                
                {u3SPDesarrollo && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    <strong>Paso a paso:</strong><br />
                    {u3SPDesarrollo}
                  </div>
                )}

                {u3SPResult && (
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="result-badge">H Puesta: {u3SPResult.puesta}</div>
                    <div className="result-badge" style={{ borderColor: 'var(--accent-color)' }}>H Salida: {u3SPResult.salida}</div>
                    <div className="result-badge" style={{ borderColor: '#10b981' }}>Duración Día: {u3SPResult.dia}</div>
                    <div className="result-badge" style={{ borderColor: '#f59e0b' }}>Duración Noche: {u3SPResult.noche}</div>
                  </div>
                )}
              </div>
            </CalculatorCard>
          </div>
        )}

        {/* --- CONTENIDO UNIDAD 4 --- */}
        {activeTab === 'u4' && (
          <div>
            <CalculatorCard title="Tiempo Universal (TU)" icon={Clock} formula="TU = Hora Legal - Diferencia Local (-3)">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Hora Legal (h m s)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={tuLegal.h} onChange={e => setTuLegal({...tuLegal, h: e.target.value})} />
                    <input type="number" placeholder="m" className="form-input" value={tuLegal.m} onChange={e => setTuLegal({...tuLegal, m: e.target.value})} />
                    <input type="number" placeholder="s" className="form-input" value={tuLegal.s} onChange={e => setTuLegal({...tuLegal, s: e.target.value})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcTU} style={{ marginTop: 0, width: 'auto', padding: '0.85rem 1.5rem' }}>Calcular</button>
                {tuResult && <div className="result-badge">TU: {tuResult}</div>}
              </div>
            </CalculatorCard>

            <CalculatorCard title="Intervalo Sidéreo (IS)" icon={Clock} formula="IS = TU (decimal) × 1.0027379">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Tiempo Universal (TU)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={isTu.h} onChange={e => setIsTu({...isTu, h: e.target.value})} />
                    <input type="number" placeholder="m" className="form-input" value={isTu.m} onChange={e => setIsTu({...isTu, m: e.target.value})} />
                    <input type="number" placeholder="s" className="form-input" value={isTu.s} onChange={e => setIsTu({...isTu, s: e.target.value})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcIS} style={{ marginTop: 0, width: 'auto', padding: '0.85rem 1.5rem' }}>Calcular</button>
                {isResult && <div className="result-badge" style={{ borderColor: 'var(--accent-color)' }}>IS: {isResult}</div>}
              </div>
            </CalculatorCard>

            <CalculatorCard title="Theta Greenwich (ΘG)" icon={Star} formula="ΘG = Θ₀ + IS">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Θ₀ (Theta 0)</label>
                  <input type="text" placeholder="HH MM SS.ss" className="form-input" value={tgTheta0} onChange={e => setTgTheta0(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>IS (Intervalo Sidéreo)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={tgIs.h} onChange={e => setTgIs({...tgIs, h: e.target.value})} />
                    <input type="number" placeholder="m" className="form-input" value={tgIs.m} onChange={e => setTgIs({...tgIs, m: e.target.value})} />
                    <input type="number" placeholder="s" className="form-input" value={tgIs.s} onChange={e => setTgIs({...tgIs, s: e.target.value})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcTG}>Calcular</button>
                {tgResult && <div className="result-badge" style={{ gridColumn: '1 / -1', borderColor: 'var(--accent-color-2)' }}>ΘG: {tgResult}</div>}
              </div>
            </CalculatorCard>

            <CalculatorCard title="Ángulo Horario (H)" icon={Calculator} formula="H = ΘL - AR">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>ΘL (TSL)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={hThetaL.h} onChange={e => setHThetaL({...hThetaL, h: e.target.value})} />
                    <input type="number" placeholder="m" className="form-input" value={hThetaL.m} onChange={e => setHThetaL({...hThetaL, m: e.target.value})} />
                    <input type="number" placeholder="s" className="form-input" value={hThetaL.s} onChange={e => setHThetaL({...hThetaL, s: e.target.value})} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>AR (Ascensión Recta)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={hAr.h} onChange={e => setHAr({...hAr, h: e.target.value})} />
                    <input type="number" placeholder="m" className="form-input" value={hAr.m} onChange={e => setHAr({...hAr, m: e.target.value})} />
                    <input type="number" placeholder="s" className="form-input" value={hAr.s} onChange={e => setHAr({...hAr, s: e.target.value})} />
                  </div>
                </div>
                <button className="btn-primary" onClick={calcH}>Calcular</button>
                {hResult && <div className="result-badge" style={{ gridColumn: '1 / -1', borderColor: '#10b981' }}>H: {hResult}</div>}
              </div>
            </CalculatorCard>
          </div>
        )}

      </div>
    </div>
  );
}
