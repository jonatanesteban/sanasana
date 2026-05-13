import React, { useState, useEffect } from 'react';
import { Clock, Info, Calculator, RefreshCw, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import eneroData from '../enero_data.json';

export default function Unidad4() {
  const [activeTab, setActiveTab] = useState('horas');
  const [fecha, setFecha] = useState('2026-01-01');
  const [huso, setHuso] = useState('-3');
  
  // Estados para cálculos
  const [horaInput, setHoraInput] = useState({ h: '12', m: '0', s: '0' });
  const [resHoras, setResHoras] = useState(null);
  
  const [intervaloInput, setIntervaloInput] = useState({ h: '1', m: '0', s: '0', tipo: 'solar_to_sid' });
  const [resIntervalo, setResIntervalo] = useState(null);

  const [tvInput, setTvInput] = useState({ h: '', m: '', s: '' });
  const [tmInput, setTmInput] = useState({ h: '', m: '', s: '' });
  const [resEt, setResEt] = useState(null);

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

  // 1. Cálculos de Horas (TU, HL, Civil)
  const calcularHoras = () => {
    const hlDec = dmsToDec(horaInput.h, horaInput.m, horaInput.s);
    const husoVal = parseFloat(huso);
    
    // TU = HL - Huso
    let tuDec = hlDec - husoVal;
    
    // Tm = TU (simplificado para ejercicios)
    const tmDec = tuDec;
    
    // Hc = Tm + 12h
    let hcDec = tmDec + 12;

    setResHoras({
      hl: formatH(hlDec),
      tu: formatH(tuDec),
      hc: formatH(hcDec),
      desarrollo: [
        { t: 'Hora Legal (HL)', v: formatH(hlDec) },
        { t: 'Tiempo Universal (TU)', f: 'HL - Huso', d: `${hlDec.toFixed(4)} - (${husoVal})`, v: formatH(tuDec) },
        { t: 'Hora Civil (Hc)', f: 'Tm + 12h', d: `${tmDec.toFixed(4)} + 12`, v: formatH(hcDec) }
      ]
    });
  };

  // 2. Ecuación del Tiempo
  const calcularET = () => {
    const tv = dmsToDec(tvInput.h, tvInput.m, tvInput.s);
    const tm = dmsToDec(tmInput.h, tmInput.m, tmInput.s);
    const et = tv - tm;
    
    // Convertir ET a minutos y segundos para mejor lectura
    const etMin = et * 60;
    const m = Math.floor(Math.abs(etMin));
    const s = (Math.abs(etMin) - m) * 60;

    setResEt({
      et: `${et < 0 ? '-' : ''}${m}m ${s.toFixed(2)}s`,
      decimal: et.toFixed(6),
      desarrollo: `ET = Tv - Tm = ${tv.toFixed(4)}h - ${tm.toFixed(4)}h = ${et.toFixed(6)}h`
    });
  };

  // 3. Conversión de Intervalos
  const calcularIntervalo = () => {
    const dec = dmsToDec(intervaloInput.h, intervaloInput.m, intervaloInput.s);
    let res;
    let factor;
    if (intervaloInput.tipo === 'solar_to_sid') {
      factor = 1.0027379;
      res = dec * factor;
    } else {
      factor = 0.9972696;
      res = dec * factor;
    }

    setResIntervalo({
      original: formatH(dec),
      resultado: formatH(res),
      factor: factor,
      tipo: intervaloInput.tipo === 'solar_to_sid' ? 'Solar a Sidéreo' : 'Sidéreo a Solar'
    });
  };

  return (
    <div className="unidad-4-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Unidad 4: Sistemas de Tiempo</h1>
        <p>Estudio de las escalas de tiempo solar y sidéreo.</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button className={`nav-btn ${activeTab === 'horas' ? 'active' : ''}`} onClick={() => setActiveTab('horas')}>
            <Clock size={18} /> Sistemas de Hora
          </button>
          <button className={`nav-btn ${activeTab === 'et' ? 'active' : ''}`} onClick={() => setActiveTab('et')}>
            <Calculator size={18} /> Ecuación del Tiempo
          </button>
          <button className={`nav-btn ${activeTab === 'intervalos' ? 'active' : ''}`} onClick={() => setActiveTab('intervalos')}>
            <RefreshCw size={18} /> Intervalos
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
        
        {/* PANEL PRINCIPAL */}
        <div className="main-calc">
          
          {activeTab === 'horas' && (
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock color="var(--primary-color)" /> Conversión de Horas
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Hora Legal (HL)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="form-input" placeholder="h" value={horaInput.h} onChange={e => setHoraInput({...horaInput, h: e.target.value})} />
                    <input type="number" className="form-input" placeholder="m" value={horaInput.m} onChange={e => setHoraInput({...horaInput, m: e.target.value})} />
                    <input type="number" className="form-input" placeholder="s" value={horaInput.s} onChange={e => setHoraInput({...horaInput, s: e.target.value})} />
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
              <button className="btn-primary" onClick={calcularHoras} style={{ marginTop: '1rem', width: '100%' }}>Calcular Sistema de Horas</button>

              {resHoras && (
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {resHoras.desarrollo.map((p, i) => (
                    <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{p.t}</span>
                        <span style={{ fontWeight: 'bold' }}>{p.v}</span>
                      </div>
                      {p.f && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fórmula: {p.f} ➔ {p.d}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'et' && (
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator color="var(--primary-color)" /> Ecuación del Tiempo (Et)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Et = Tv - Tm (Tiempo Solar Verdadero - Tiempo Solar Medio)</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Tv (Tiempo Solar Verdadero)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="form-input" placeholder="h" value={tvInput.h} onChange={e => setTvInput({...tvInput, h: e.target.value})} />
                    <input type="number" className="form-input" placeholder="m" value={tvInput.m} onChange={e => setTvInput({...tvInput, m: e.target.value})} />
                    <input type="number" className="form-input" placeholder="s" value={tvInput.s} onChange={e => setTvInput({...tvInput, s: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tm (Tiempo Solar Medio)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="form-input" placeholder="h" value={tmInput.h} onChange={e => setTmInput({...tmInput, h: e.target.value})} />
                    <input type="number" className="form-input" placeholder="m" value={tmInput.m} onChange={e => setTmInput({...tmInput, m: e.target.value})} />
                    <input type="number" className="form-input" placeholder="s" value={tmInput.s} onChange={e => setTmInput({...tmInput, s: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <button className="btn-primary" onClick={calcularET} style={{ marginTop: '1rem', width: '100%' }}>Calcular Et</button>

              {resEt && (
                <div style={{ marginTop: '2rem' }}>
                  <div className="result-badge" style={{ fontSize: '1.5rem', padding: '1.5rem' }}>Et = {resEt.et}</div>
                  <div style={{ marginTop: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'center', color: 'var(--text-muted)' }}>{resEt.desarrollo}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'intervalos' && (
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw color="var(--primary-color)" /> Conversión de Intervalos
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div className="form-group">
                  <label>Duración del Intervalo</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" className="form-input" placeholder="h" value={intervaloInput.h} onChange={e => setIntervaloInput({...intervaloInput, h: e.target.value})} />
                    <input type="number" className="form-input" placeholder="m" value={intervaloInput.m} onChange={e => setIntervaloInput({...intervaloInput, m: e.target.value})} />
                    <input type="number" className="form-input" placeholder="s" value={intervaloInput.s} onChange={e => setIntervaloInput({...intervaloInput, s: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tipo de Conversión</label>
                  <select className="form-input" value={intervaloInput.tipo} onChange={e => setIntervaloInput({...intervaloInput, tipo: e.target.value})}>
                    <option value="solar_to_sid">Solar Medio ➔ Sidéreo (x1.0027379)</option>
                    <option value="sid_to_solar">Sidéreo ➔ Solar Medio (x0.9972696)</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={calcularIntervalo} style={{ marginTop: '1.5rem', width: '100%' }}>Convertir Intervalo</button>

              {resIntervalo && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{resIntervalo.tipo}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ fontSize: '1.2rem' }}>{resIntervalo.original}</div>
                    <ArrowRight color="var(--primary-color)" />
                    <div className="result-badge" style={{ fontSize: '1.5rem' }}>{resIntervalo.resultado}</div>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Factor aplicado: {resIntervalo.factor}</div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* SIDEBAR DE AYUDA */}
        <aside>
          <div className="glass-panel" style={{ height: '100%', borderLeft: '3px solid var(--accent-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Info size={20} color="var(--accent-color)" /> Ayuda Unidad 4
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Datos que necesitas:</h4>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>Fecha:</strong> Para buscar Θ₀ y EE en el SANA.</li>
                  <li><strong>Huso Horario:</strong> Argentina usa -3 actualmente.</li>
                  <li><strong>Tv / Tm:</strong> El ángulo horario del Sol (Verdadero o Medio).</li>
                </ul>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>¿Qué es la Et?</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Es la diferencia entre el tiempo solar verdadero y el medio. 
                  Se debe a la excentricidad de la órbita terrestre y la oblicuidad de la eclíptica.
                  <strong> Siempre es menor a 16 minutos.</strong>
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Escalas de Tiempo:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                    <span>Civil</span>
                    <span style={{ fontFamily: 'monospace' }}>Tm + 12h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                    <span>Legal</span>
                    <span style={{ fontFamily: 'monospace' }}>TU + Huso</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <BookOpen size={40} color="rgba(255,255,255,0.05)" />
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
