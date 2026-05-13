import React, { useState, useEffect } from 'react';
import { Clock, Info, Calculator, RefreshCw, ArrowRight, Calendar, BookOpen, Sun, Lightbulb, HelpCircle, ExternalLink } from 'lucide-react';

export default function Unidad4() {
  const [activeTab, setActiveTab] = useState('horas');
  const [huso, setHuso] = useState('-3');
  const [longitud, setLongitud] = useState({ d: '-68', m: '0', s: '0' });
  
  // Estados para cálculos de Sol
  const [modoSol, setModoSol] = useState('tu_to_hv');
  const [inputSol, setInputSol] = useState({ h: '12', m: '0', s: '0' });
  const [etInput, setEtInput] = useState({ m: '0', s: '0', signo: '-' });
  const [resSol, setResSol] = useState(null);
  
  // Estado para el Asistente
  const [problemaTipo, setProblemaTipo] = useState(null);

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
    return `${decimal < 0 ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`;
  };

  const calcularSol = () => {
    const steps = [];
    const valDec = dmsToDec(inputSol.h, inputSol.m, inputSol.s);
    const lambdaDec = dmsToDec(longitud.d, longitud.m, longitud.s);
    const husoVal = parseFloat(huso);
    const etDec = (parseFloat(etInput.m || 0) / 60 + parseFloat(etInput.s || 0) / 3600) * (etInput.signo === '-' ? -1 : 1);
    
    if (modoSol === 'tu_to_hv') {
      const hoa = valDec + husoVal;
      const difLambdaHuso = (lambdaDec / 15) - husoVal;
      const hcl = hoa + difLambdaHuso;
      const tm = hcl - 12;
      const tv = tm + etDec;
      steps.push({ t: '1. Tiempo Universal (TU)', v: formatH(valDec) });
      steps.push({ t: '2. Hora Oficial (HOA)', f: 'TU + Huso', d: `${valDec.toFixed(4)} + (${husoVal})`, v: formatH(hoa) });
      steps.push({ t: '3. Hora Civil Local (HCL)', f: 'HOA + (λ/15 - Huso)', d: `${hoa.toFixed(4)} + (${(lambdaDec/15).toFixed(4)} - ${husoVal})`, v: formatH(hcl) });
      steps.push({ t: '4. Tiempo Medio (Tm)', f: 'HCL - 12h', d: `${hcl.toFixed(4)} - 12`, v: formatH(tm) });
      steps.push({ t: '5. Tiempo Verdadero (Tv / Hv)', f: 'Tm + Et', d: `${tm.toFixed(4)} + (${etDec.toFixed(6)})`, v: formatH(tv) });
      setResSol({ final: formatH(tv), steps });
    } else {
      // Hv -> TU (Incluye modo Culminación donde Hv=0)
      const tv = valDec;
      const tm = tv - etDec;
      const hcl = tm + 12;
      const difLambdaHuso = (lambdaDec / 15) - husoVal;
      const hoa = hcl - difLambdaHuso;
      const tu = hoa - husoVal;
      
      steps.push({ t: '1. Ángulo Horario Verdadero (Hv)', v: formatH(tv) });
      steps.push({ t: '2. Tiempo Medio (Tm)', f: 'Hv - Et', d: `${tv.toFixed(4)} - (${etDec.toFixed(6)})`, v: formatH(tm) });
      steps.push({ t: '3. Hora Civil Local (HCL)', f: 'Tm + 12h', d: `${tm.toFixed(4)} + 12`, v: formatH(hcl) });
      steps.push({ t: '4. Hora Oficial (HOA)', f: 'HCL - (λ/15 - Huso)', d: `${hcl.toFixed(4)} - (${(lambdaDec/15).toFixed(4)} - ${husoVal})`, v: formatH(hoa) });
      steps.push({ t: '5. Tiempo Universal (TU)', f: 'HOA - Huso', d: `${hoa.toFixed(4)} - (${husoVal})`, v: formatH(tu) });
      setResSol({ final: formatH(hoa), nota: 'Resultado final en Hora Oficial (HOA)', steps });
    }
  };

  return (
    <div className="unidad-4-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Unidad 4: El Sol y el Tiempo</h1>
        <p>Asistente de cálculos solares y escalas de tiempo.</p>
      </header>

      {/* ASISTENTE INTELIGENTE (WIZARD) */}
      <section className="glass-panel" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--primary-color)', background: 'rgba(99, 102, 241, 0.05)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
          <Lightbulb color="var(--primary-color)" /> Asistente de Problemas
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>¿Qué tipo de ejercicio estás resolviendo?</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <button 
            className={`mode-btn ${problemaTipo === 'culminacion_sol' ? 'active' : ''}`}
            onClick={() => { setProblemaTipo('culminacion_sol'); setModoSol('hv_to_tu'); setInputSol({h:'0', m:'0', s:'0'}); setHuso('-3'); }}
            style={{ textAlign: 'left', padding: '1rem' }}
          >
            <strong>Culminación del Sol</strong>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>El Sol cruza el meridiano. Hv es siempre 0.</div>
          </button>
          <button 
            className={`mode-btn ${problemaTipo === 'salida' ? 'active' : ''}`}
            onClick={() => { setProblemaTipo('salida'); setModoSol('hv_to_tu'); }}
            style={{ textAlign: 'left', padding: '1rem' }}
          >
            <strong>Salida/Puesta del Sol</strong>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Hv es el valor H calculado en la Unidad 3.</div>
          </button>
          <button 
            className={`mode-btn ${problemaTipo === 'hora_hv' ? 'active' : ''}`}
            onClick={() => { setProblemaTipo('hora_hv'); setModoSol('tu_to_hv'); }}
            style={{ textAlign: 'left', padding: '1rem' }}
          >
            <strong>Posición del Sol</strong>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Tengo la hora del reloj y quiero saber el Hv.</div>
          </button>
        </div>

        {problemaTipo === 'culminacion_sol' && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={16} /> Estrategia: Culminación Solar
            </h4>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>Dato Clave:</strong> En culminación, <strong>Hv = 00:00:00</strong> (ya está cargado abajo).</li>
                <li>Busca la <strong>Et</strong> en el SANA (columna 0h) e ingrésala con su signo.</li>
                <li>El cálculo te dará la <strong>Hora Oficial (HOA)</strong> exacta del mediodía solar.</li>
              </ul>
            </div>
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
        
        <div className="main-calc">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {modoSol === 'tu_to_hv' ? <Clock color="var(--primary-color)" /> : <Sun color="var(--primary-color)" />}
                {problemaTipo === 'culminacion_sol' ? 'Culminación del Sol' : (modoSol === 'tu_to_hv' ? 'Transformación: TU ➔ Hv' : 'Transformación: Hv ➔ TU')}
              </h3>
              <div className="mode-selector" style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                <button className={`mode-btn ${modoSol === 'tu_to_hv' ? 'active' : ''}`} onClick={() => setModoSol('tu_to_hv')}>TU ➔ Hv</button>
                <button className={`mode-btn ${modoSol === 'hv_to_tu' ? 'active' : ''}`} onClick={() => setModoSol('hv_to_tu')}>Hv ➔ TU</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>{modoSol === 'tu_to_hv' ? 'Tiempo Universal (TU)' : 'Ángulo Horario Verdadero (Hv)'}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" placeholder="h" value={inputSol.h} onChange={e => setInputSol({...inputSol, h: e.target.value})} disabled={problemaTipo === 'culminacion_sol'} />
                  <input type="number" className="form-input" placeholder="m" value={inputSol.m} onChange={e => setInputSol({...inputSol, m: e.target.value})} disabled={problemaTipo === 'culminacion_sol'} />
                  <input type="number" className="form-input" placeholder="s" value={inputSol.s} onChange={e => setInputSol({...inputSol, s: e.target.value})} disabled={problemaTipo === 'culminacion_sol'} />
                </div>
                {problemaTipo === 'culminacion_sol' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', marginTop: '0.25rem' }}>* Hv fijo en 0 para culminación</span>}
              </div>
              <div className="form-group">
                <label>Ecuación del Tiempo (Et del SANA)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select className="form-input" style={{ width: '60px' }} value={etInput.signo} onChange={e => setEtInput({...etInput, signo: e.target.value})}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  <input type="number" className="form-input" placeholder="m" value={etInput.m} onChange={e => setEtInput({...etInput, m: e.target.value})} />
                  <input type="number" className="form-input" placeholder="s" value={etInput.s} onChange={e => setEtInput({...etInput, s: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Longitud (λ)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-input" placeholder="°" value={longitud.d} onChange={e => setLongitud({...longitud, d: e.target.value})} />
                  <input type="number" className="form-input" placeholder="'" value={longitud.m} onChange={e => setLongitud({...longitud, m: e.target.value})} />
                  <input type="number" className="form-input" placeholder="''" value={longitud.s} onChange={e => setLongitud({...longitud, s: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Huso Horario</label>
                <select className="form-input" value={huso} onChange={e => setHuso(e.target.value)}>
                  <option value="0">0 (Greenwich)</option>
                  <option value="-3">-3 (Argentina)</option>
                  <option value="-4">-4 (HOA anterior)</option>
                </select>
              </div>
            </div>

            <button className="btn-primary" onClick={calcularSol} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Calculator size={18} /> Calcular Culminación
            </button>

            {resSol && (
              <div style={{ marginTop: '2rem' }}>
                <div className="result-badge" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderColor: 'var(--accent-color)' }}>
                  {problemaTipo === 'culminacion_sol' ? 'Culminación (HOA) = ' : (modoSol === 'tu_to_hv' ? 'Hv Final = ' : 'TU Final = ')} {resSol.final}
                </div>
                {resSol.nota && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>{resSol.nota}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {resSol.steps.map((s, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.t}</span>
                        <span style={{ fontWeight: 'bold' }}>{s.v}</span>
                      </div>
                      {s.f && <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginTop: '0.25rem' }}>{s.f} ➔ {s.d}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside>
          {/* ... mantener el contenido del aside ... */}
          <div className="glass-panel" style={{ height: '100%', borderLeft: '3px solid var(--accent-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              <Info color="var(--accent-color)" size={20} /> Tips de Problemas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sun size={16} /> Culminación del Sol
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Cuando el Sol culmina, está en el meridiano local. Por eso <strong>Hv = 0h</strong>.
                </p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <HelpCircle size={16} /> Et en SANA
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Usa el valor de la columna <strong>0h</strong> de la Ecuación del Tiempo para mayor precisión en la culminación.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
