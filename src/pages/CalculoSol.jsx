import React, { useState } from 'react';
import { Sun, Clock, Calculator, ArrowRight, HelpCircle, Info, RefreshCw, MapPin, Moon, Navigation, Target, Zap } from 'lucide-react';

export default function CalculoSol() {
  const [lat, setLat] = useState({ d: '-34', m: '0', s: '0' });
  const [dec, setDec] = useState({ d: '-10', m: '0', s: '0' });
  const [et, setEt] = useState({ m: '0', s: '0', signo: '-' });
  const [longitud, setLongitud] = useState({ d: '-68', m: '0', s: '0' });
  const [huso, setHuso] = useState('-3');

  const [resHv, setResHv] = useState(null);
  const [resFinalGeneral, setResFinalGeneral] = useState(null);
  const [resVertical, setResVertical] = useState(null);
  const [resVerticalTime, setResVerticalTime] = useState(null);
  const [resHvTime, setResHvTime] = useState(null);

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  
  const dmsToDec = (d, m, s) => {
    const deg = parseFloat(d || 0);
    return (Math.abs(deg) + (parseFloat(m || 0) / 60) + (parseFloat(s || 0) / 3600)) * (deg < 0 ? -1 : 1);
  };

  const formatH = (decimal) => {
    let abs = Math.abs(decimal);
    while (abs >= 24) abs -= 24;
    while (abs < 0) abs += 24;
    const h = Math.floor(abs);
    const m = Math.floor((abs - h) * 60);
    const s = ((abs - h) * 60 - m) * 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`;
  };

  const formatDMS = (dec) => {
    const abs = Math.abs(dec);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${dec < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  const calcularHv = () => {
    const phiRad = toRad(dmsToDec(lat.d, lat.m, lat.s));
    const decRad = toRad(dmsToDec(dec.d, dec.m, dec.s));
    const cosH = -(Math.tan(phiRad) * Math.tan(decRad));
    
    if (cosH > 1 || cosH < -1) {
      setResHv({ error: 'Astro Circumpolar (no sale/pone)' });
      return;
    }
    
    const hDeg = toDeg(Math.acos(cosH));
    const hHoras = hDeg / 15;
    const cosAz = -(Math.sin(decRad) / Math.cos(phiRad));
    const azW = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
    const azE = 360 - azW;

    setResHv({
      h: hHoras, azW, azE, hDeg, 
      durDia: hHoras * 2, durNoche: 24 - (hHoras * 2),
      steps: [
        { t: '1. Coseno de H', f: 'cos H = -tan φ · tan δ', v: cosH.toFixed(6) },
        { t: '2. Ángulo Horario (H)', f: 'H = arccos(cos H)', v: `${hHoras.toFixed(4)}h (${hDeg.toFixed(2)}°)` },
        { t: '3. Azimut Puesta (W)', f: 'cos Az = -(sen δ / cos φ)', v: formatDMS(azW) },
        { t: '4. Azimut Salida (E)', f: '360° - Az(W)', v: formatDMS(azE) }
      ]
    });
    setResHvTime(null);
  };

  const calcularVertical = () => {
    const phiDec = dmsToDec(lat.d, lat.m, lat.s);
    const decDec = dmsToDec(dec.d, dec.m, dec.s);
    const phiRad = toRad(phiDec);
    const decRad = toRad(decDec);

    const cosZ = Math.sin(decRad) / Math.sin(phiRad);
    const cosH = Math.tan(decRad) / Math.tan(phiRad);
    
    if (Math.abs(cosZ) > 1 || Math.abs(cosH) > 1) {
      setResVertical({ error: 'El astro no pasa por el Primer Vertical' });
      return;
    }

    const zDec = toDeg(Math.acos(cosZ));
    const hAngHoras = toDeg(Math.acos(cosH)) / 15;

    setResVertical({
      z: zDec, h: 90 - zDec, hAng: hAngHoras,
      steps: [
        { t: '1. Distancia Cenital (z)', f: 'cos z = sen δ / sen φ', v: formatDMS(zDec) },
        { t: '2. Altura (h)', f: 'h = 90° - z', v: formatDMS(90 - zDec) },
        { t: '3. Ángulo Horario (H)', f: 'cos H = tan δ / tan φ', v: `${hAngHoras.toFixed(4)}h` }
      ]
    });
    setResVerticalTime(null);
  };

  const transformarTiempo = (hv, context) => {
    const etDec = (parseFloat(et.m || 0) / 60 + parseFloat(et.s || 0) / 3600) * (et.signo === '-' ? -1 : 1);
    const lambdaDec = dmsToDec(longitud.d, longitud.m, longitud.s);
    const husoVal = parseFloat(huso);

    let tv = hv || 24;
    const tm = tv - etDec;
    const hcl = tm + 12;
    const difLambdaHuso = (lambdaDec / 15) - husoVal;
    const hoa = hcl - difLambdaHuso;
    const tu = hoa - husoVal;

    return {
      hoa: formatH(hoa),
      tu: formatH(tu),
      steps: [
        { t: `Hm/Tm`, f: 'Hv - Et', d: `${tv.toFixed(4)} - (${etDec.toFixed(6)})`, v: formatH(tm) },
        { t: `HCL`, f: 'Tm + 12h', d: `${tm.toFixed(4)} + 12`, v: formatH(hcl) },
        { t: `HOA`, f: 'HCL - (λ/15 - Huso)', d: `${hcl.toFixed(4)} - (${(lambdaDec/15).toFixed(4)} - ${husoVal})`, v: formatH(hoa) },
        { t: `TU`, f: 'HOA - Huso', d: `${hoa.toFixed(4)} - (${husoVal})`, v: formatH(tu) }
      ]
    };
  };

  return (
    <div className="calculo-sol-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ borderBottom: '1px solid var(--accent-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sun size={32} color="#f59e0b" /> Tablero de Control Solar
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Cálculos integrados de Salida, Puesta, Culminación y Tiempos del Sol.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* BLOQUE 1: DATOS Y CÁLCULOS ASTRONÓMICOS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--primary-color)" /> Datos de Ubicación y Astro
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Latitud (φ)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                  <input type="number" className="form-input" value={lat.m} onChange={e => setLat({...lat, m: e.target.value})} />
                  <input type="number" className="form-input" value={lat.s} onChange={e => setLat({...lat, s: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Declinación del Sol (δ)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" value={dec.d} onChange={e => setDec({...dec, d: e.target.value})} />
                  <input type="number" className="form-input" value={dec.m} onChange={e => setDec({...dec, m: e.target.value})} />
                  <input type="number" className="form-input" value={dec.s} onChange={e => setDec({...dec, s: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={calcularHv}>Calcular Salida/Puesta</button>
                <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-color)', color: 'black' }} onClick={calcularVertical}>Primer Vertical</button>
              </div>
            </div>
          </div>

          {/* RESULTADOS SALIDA / PUESTA */}
          {resHv && (
            <div className="glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} /> Resultados de Salida y Puesta
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="result-badge" style={{ borderColor: '#ef4444' }}>H Puesta: {formatH(resHv.h)}</div>
                <div className="result-badge" style={{ borderColor: '#10b981' }}>H Salida: {formatH(24 - resHv.h)}</div>
                <div className="result-badge" style={{ borderColor: '#f59e0b' }}>Día: {formatH(resHv.durDia)}</div>
                <div className="result-badge" style={{ borderColor: '#3b82f6' }}>Noche: {formatH(resHv.durNoche)}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.7rem', background: '#ef4444' }} onClick={() => setResHvTime(transformarTiempo(resHv.h, 'Puesta'))}>Transformar Puesta</button>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.7rem', background: '#10b981' }} onClick={() => setResHvTime(transformarTiempo(24 - resHv.h, 'Salida'))}>Transformar Salida</button>
              </div>
              {resHvTime && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem', color: '#10b981' }}>
                    <span>HOA {resHvTime.context}: {resHvTime.hoa}</span>
                    <span>TU: {resHvTime.tu}</span>
                  </div>
                  {resHvTime.steps.map((s, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                      <span>{s.t}:</span><span>{s.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESULTADOS PRIMER VERTICAL */}
          {resVertical && (
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} /> Resultados del Primer Vertical
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="result-badge" style={{ borderColor: '#ef4444' }}>H Oeste: {formatH(resVertical.hAng)}</div>
                <div className="result-badge" style={{ borderColor: '#10b981' }}>H Este: {formatH(24 - resVertical.hAng)}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.7rem', background: '#ef4444' }} onClick={() => setResVerticalTime(transformarTiempo(resVertical.hAng, 'Vertical W'))}>Transformar Oeste</button>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.7rem', background: '#10b981' }} onClick={() => setResVerticalTime(transformarTiempo(24 - resVertical.hAng, 'Vertical E'))}>Transformar Este</button>
              </div>
              {resVerticalTime && (
                <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
                    <span>HOA {resVerticalTime.context}: {resVerticalTime.hoa}</span>
                    <span>TU: {resVerticalTime.tu}</span>
                  </div>
                  {resVerticalTime.steps.map((s, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                      <span>{s.t}:</span><span>{s.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* BLOQUE 2: ESCALA DE TIEMPOS Y CULMINACIÓN */}
        <section className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--accent-color)" /> Datos de Tiempo (Et / λ / Huso)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Longitud (λ)</label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <input type="number" className="form-input" value={longitud.d} onChange={e => setLongitud({...longitud, d: e.target.value})} />
                <input type="number" className="form-input" value={longitud.m} onChange={e => setLongitud({...longitud, m: e.target.value})} />
                <input type="number" className="form-input" value={longitud.s} onChange={e => setLongitud({...longitud, s: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Ecuación del Tiempo (Et)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="form-input" style={{ width: '60px' }} value={et.signo} onChange={e => setEt({...et, signo: e.target.value})}>
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <input type="number" className="form-input" placeholder="m" value={et.m} onChange={e => setEt({...et, m: e.target.value})} />
                <input type="number" className="form-input" placeholder="s" value={et.s} onChange={e => setEt({...et, s: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Huso</label>
              <select className="form-input" value={huso} onChange={e => setHuso(e.target.value)}>
                <option value="-3">-3 (Argentina)</option>
                <option value="0">0 (Greenwich)</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#10b981' }} onClick={() => setResFinalGeneral(transformarTiempo(0, 'Culminación'))}>
                Calcular Culminación Superior (Hv=0)
              </button>
            </div>

            {resFinalGeneral && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                <h4 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} /> Resultado de Culminación
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="result-badge" style={{ borderColor: '#10b981' }}>HOA: {resFinalGeneral.hoa}</div>
                  <div className="result-badge">TU: {resFinalGeneral.tu}</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#10b981', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                  Este es el valor de la culminación superior
                </p>
                {resFinalGeneral.steps.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', marginBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{s.t}:</span>
                      <span style={{ fontWeight: 'bold' }}>{s.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="glass-panel" style={{ marginTop: '2rem', borderTop: '4px solid #f59e0b' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '1rem' }}>
          <HelpCircle size={18} /> Guía de Uso del Tablero
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          1. Ingresa Latitud y Declinación a la izquierda. 2. Calcula el evento (Salida o Vertical). 3. Ingresa Et y Longitud a la derecha. 4. Presiona "Transformar" en el bloque del evento para obtener la hora oficial.
        </p>
      </footer>
    </div>
  );
}
