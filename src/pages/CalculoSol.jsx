import React, { useState } from 'react';
import { Sun, Clock, Calculator, ArrowRight, HelpCircle, Info, RefreshCw, MapPin } from 'lucide-react';

export default function CalculoSol() {
  const [lat, setLat] = useState({ d: '-34', m: '0', s: '0' });
  const [dec, setDec] = useState({ d: '-10', m: '0', s: '0' });
  const [et, setEt] = useState({ m: '0', s: '0', signo: '-' });
  const [longitud, setLongitud] = useState({ d: '-68', m: '0', s: '0' });
  const [huso, setHuso] = useState('-3');

  const [resHv, setResHv] = useState(null);
  const [resFinal, setResFinal] = useState(null);

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
    const cosAz = Math.sin(decRad) / Math.cos(phiRad);
    const az = toDeg(Math.acos(cosAz));

    setResHv({
      h: hHoras,
      az: az,
      hDeg: hDeg,
      steps: [
        { t: '1. Coseno de H', f: 'cos H = -tan φ · tan δ', v: cosH.toFixed(6) },
        { t: '2. Ángulo Horario (H)', f: 'H = arccos(cos H)', v: `${hHoras.toFixed(4)}h (${hDeg.toFixed(2)}°)` },
        { t: '3. Azimut en Horizonte', f: 'cos Az = sen δ / cos φ', v: `${az.toFixed(2)}°` }
      ]
    });
  };

  const calcularTiempos = (hvManual) => {
    const hvUse = hvManual !== undefined ? hvManual : (resHv ? resHv.h : 0);
    const etDec = (parseFloat(et.m || 0) / 60 + parseFloat(et.s || 0) / 3600) * (et.signo === '-' ? -1 : 1);
    const lambdaDec = dmsToDec(longitud.d, longitud.m, longitud.s);
    const husoVal = parseFloat(huso);

    // Hv -> TU / HOA
    let tv = hvUse;
    // Si es culminación (Hv=0), usamos base 24h
    if (tv === 0) tv = 24;

    const tm = tv - etDec;
    const hcl = tm + 12;
    const difLambdaHuso = (lambdaDec / 15) - husoVal;
    const hoa = hcl - difLambdaHuso;
    const tu = hoa - husoVal;

    setResFinal({
      hoa: formatH(hoa),
      tu: formatH(tu),
      steps: [
        { t: '1. Tiempo Medio (Tm)', f: 'Hv - Et', v: formatH(tm) },
        { t: '2. Hora Civil Local (HCL)', f: 'Tm + 12h', v: formatH(hcl) },
        { t: '3. Hora Oficial (HOA)', f: 'HCL - (λ/15 - Huso)', v: formatH(hoa) },
        { t: '4. Tiempo Universal (TU)', f: 'HOA - Huso', v: formatH(tu) }
      ]
    });
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
        
        {/* BLOQUE 1: DATOS DE ENTRADA Y HV */}
        <section className="glass-panel">
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

            <button className="btn-primary" onClick={calcularHv} style={{ padding: '0.8rem' }}>
              Calcular H (Salida/Puesta) y Azimut
            </button>

            {resHv && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-color)' }}>
                {resHv.error ? (
                  <div style={{ color: 'red' }}>{resHv.error}</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="result-badge" style={{ borderColor: '#ef4444' }}>H Puesta (W): {formatH(resHv.h)}</div>
                      <div className="result-badge" style={{ borderColor: '#10b981' }}>H Salida (E): {formatH(24 - resHv.h)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {resHv.steps.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{s.t}:</span>
                          <span style={{ fontWeight: 'bold' }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" style={{ flex: 1, fontSize: '0.75rem', background: '#ef4444' }} onClick={() => calcularTiempos(resHv.h)}>
                        Usar H Puesta (Oeste)
                      </button>
                      <button className="btn-primary" style={{ flex: 1, fontSize: '0.75rem', background: '#10b981' }} onClick={() => calcularTiempos(24 - resHv.h)}>
                        Usar H Salida (Este)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* BLOQUE 2: TRANSFORMACIÓN DE TIEMPO */}
        <section className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--accent-color)" /> Escala de Tiempos (HOA / TU)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Longitud (λ)</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input type="number" className="form-input" value={longitud.d} onChange={e => setLongitud({...longitud, d: e.target.value})} />
                  <input type="number" className="form-input" value={longitud.m} onChange={e => setLongitud({...longitud, m: e.target.value})} />
                  <input type="number" className="form-input" value={longitud.s} onChange={e => setLongitud({...longitud, s: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Huso</label>
                <select className="form-input" value={huso} onChange={e => setHuso(e.target.value)}>
                  <option value="-3">-3 (Argentina)</option>
                  <option value="0">0 (Greenwich)</option>
                </select>
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

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-color)', color: 'black' }} onClick={() => calcularTiempos()}>
                Calcular HOA/TU
              </button>
              <button className="btn-primary" style={{ flex: 1, background: '#10b981' }} onClick={() => calcularTiempos(0)}>
                Culminación (Hv=0)
              </button>
            </div>

            {resFinal && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="result-badge" style={{ borderColor: 'var(--accent-color)' }}>HOA: {resFinal.hoa}</div>
                  <div className="result-badge">TU: {resFinal.tu}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {resFinal.steps.map((s, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.t} ({s.f})</span>
                        <span style={{ fontWeight: 'bold' }}>{s.v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* FOOTER DE AYUDA RÁPIDA */}
      <footer className="glass-panel" style={{ marginTop: '2rem', borderTop: '4px solid #f59e0b' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '1rem' }}>
          <HelpCircle size={18} /> Guía de Resolución Solar
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', fontSize: '0.85rem' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>1. Salida/Puesta</p>
            <p style={{ color: 'var(--text-muted)' }}>Calcula el Ángulo Horario (H). Úsalo en el bloque derecho para obtener la hora del reloj (HOA).</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>2. Culminación</p>
            <p style={{ color: 'var(--text-muted)' }}>Presiona el botón verde. Automáticamente usará Hv=24h (0h) para darte el mediodía oficial.</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>3. Datos del SANA</p>
            <p style={{ color: 'var(--text-muted)' }}>La Declinación (δ) y la Et varían durante el día. Usa los valores más cercanos a la hora buscada.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
