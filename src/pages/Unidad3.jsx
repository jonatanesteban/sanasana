import React, { useState } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw, Info, ChevronRight, HelpCircle, Sun, Globe } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); // 'ecu_to_hor', 'hor_to_ecu', 'especiales'
  
  // Estados para inputs generales
  const [val1, setVal1] = useState({ d: '', m: '', s: '', dir: 'E' }); // H o Az
  const [val2, setVal2] = useState({ d: '', m: '', s: '' }); // Dec o z
  const [lat, setLat] = useState({ d: '', m: '', s: '', dir: 'S' });   // Latitud
  const [tslInput, setTslInput] = useState('10'); // TSL para ubicar Aries

  // Estados para Casos Especiales
  const [casoEspecial, setCasoEspecial] = useState('culminacion');
  const [subCaso, setSubCaso] = useState('superior_norte'); // Para culminación

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
    setSugerenciaSol(false);
    let newCoords = null;

    if (modo === 'ecu_to_hor') {
      const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s, 'E');
      const hDec = hHorarioDec * 15;
      const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
      const hRad = toRad(hDec);
      const decRad = toRad(decDec);

      const cosZ = (Math.sin(phiRad) * Math.sin(decRad)) + (Math.cos(phiRad) * Math.cos(decRad) * Math.cos(hRad));
      const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
      const zDec = toDeg(zRad);
      const hAstroFinal = 90 - zDec;

      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H(grados) = H(horas) × 15', desarrollo: `${hHorarioDec.toFixed(6)}h × 15`, resultado: `${hDec.toFixed(4)}°` });
      pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ sen δ + cos φ cos δ cos H', desarrollo: `sen(${phiDec.toFixed(2)})sen(${decDec.toFixed(2)}) + cos(${phiDec.toFixed(2)})cos(${decDec.toFixed(2)})cos(${hDec.toFixed(2)})`, resultado: formatDMS(zDec) });
      pasos.push({ titulo: 'Altura del Astro (h)', formula: 'h = 90° - z', desarrollo: `90° - ${zDec.toFixed(2)}°`, resultado: formatDMS(hAstroFinal) });

      const numAz = Math.sin(hRad);
      const denAz = (Math.sin(phiRad) * Math.cos(hRad)) - (Math.cos(phiRad) * Math.tan(decRad));
      let azDec = toDeg(Math.atan2(numAz, denAz));
      if (azDec < 0) azDec += 360;
      pasos.push({ titulo: 'Azimut (Az)', formula: 'tan Az = sen H / (sen φ cos H - cos φ tan δ)', desarrollo: `atan2(${numAz.toFixed(4)}, ${denAz.toFixed(4)})`, resultado: formatDMS(azDec) });

      newCoords = { h: hAstroFinal, az: azDec, phi: phiDec, hAng: hHorarioDec, dec: decDec, tsl: parseFloat(tslInput || 0) };

    } else if (modo === 'hor_to_ecu') {
      const azDec = dmsToDec(val1.d, val1.m, val1.s, 'N');
      const zDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
      const hAstro = 90 - zDec;
      const azRad = toRad(azDec);
      const zRad = toRad(zDec);

      const sinDec = (Math.cos(zRad) * Math.sin(phiRad)) - (Math.sin(zRad) * Math.cos(phiRad) * Math.cos(azRad));
      const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));
      const decFinal = toDeg(decRad);
      pasos.push({ titulo: 'Declinación (δ)', formula: 'sen δ = cos z sen φ - sen z cos φ cos Az', desarrollo: `cos(${zDec.toFixed(2)})sen(${phiDec.toFixed(2)}) - sen(${zDec.toFixed(2)})cos(${phiDec.toFixed(2)})cos(${azDec.toFixed(2)})`, resultado: formatDMS(decFinal) });

      const numH = Math.sin(azRad);
      const denH = (Math.cos(phiRad) * (1 / Math.tan(zRad))) + (Math.sin(phiRad) * Math.cos(azRad));
      const tanH = numH / denH;
      let hDecRaw = toDeg(Math.atan(tanH));
      let hFinal = hDecRaw;
      let nota = "";
      if (tanH > 0 && azDec < 180) { hFinal = hDecRaw; nota = "1er Cuadrante: Hv = Hcalc"; }
      else if (tanH > 0 && azDec > 180) { hFinal = hDecRaw + 180; nota = "3er Cuadrante: Hv = Hcalc + 180°"; }
      else if (tanH < 0 && azDec < 180) { hFinal = hDecRaw + 180; nota = "2do Cuadrante: Hv = Hcalc + 180°"; }
      else if (tanH < 0 && azDec > 180) { hFinal = hDecRaw + 360; nota = "4to Cuadrante: Hv = Hcalc + 360°"; }
      pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'tan H = sen Az / (cos φ cot z + sen φ cos Az)', desarrollo: `tan H = ${numH.toFixed(4)} / ${denH.toFixed(4)}`, resultado: formatDMS(hFinal), nota });

      newCoords = { h: hAstro, az: azDec, phi: phiDec, hAng: hFinal / 15, dec: decFinal, tsl: parseFloat(tslInput || 0) };

    } else if (modo === 'especiales') {
      const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
      const decRad = toRad(decDec);

      if (casoEspecial === 'culminacion') {
        let z, az, h_ang;
        if (subCaso === 'superior_norte') { az = 180; h_ang = 0; z = Math.abs(phiDec - decDec); }
        else if (subCaso === 'inferior_norte') { az = 180; h_ang = 12; z = 180 - Math.abs(phiDec + decDec); }
        else if (subCaso === 'superior_sur') { az = 0; h_ang = 0; z = Math.abs(phiDec - decDec); }
        else { az = 0; h_ang = 12; z = 180 - Math.abs(phiDec + decDec); }
        
        pasos.push({ titulo: 'Azimut e H', formula: 'Valores fijos por definición', desarrollo: `Caso: ${subCaso.replace('_',' ')}`, resultado: `Az = ${az}°, H = ${h_ang}h` });
        pasos.push({ titulo: 'Distancia Cenital (z)', formula: h_ang === 0 ? 'z = φ - δ (o δ - φ)' : 'z = 180 - (φ + δ)', desarrollo: `Cálculo de Cenit`, resultado: formatDMS(z) });

        newCoords = { h: 90 - z, az: az, phi: phiDec, hAng: h_ang, dec: decDec, tsl: parseFloat(tslInput || 0) };

      } else if (casoEspecial === 'elongacion') {
        const cosZ = Math.sin(phiRad) / Math.sin(decRad);
        const z = toDeg(Math.acos(cosZ));
        const sinAz = Math.cos(decRad) / Math.cos(phiRad);
        const az = toDeg(Math.asin(sinAz));
        const cosH = Math.tan(phiRad) / Math.tan(decRad);
        const h = toDeg(Math.acos(cosH));

        pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen φ / sen δ', desarrollo: `sen(${phiDec.toFixed(2)}) / sen(${decDec.toFixed(2)}) = ${cosZ.toFixed(4)}`, resultado: formatDMS(z) });
        pasos.push({ titulo: 'Azimut (Az)', formula: 'sen Az = cos δ / cos φ', desarrollo: `cos(${decDec.toFixed(2)}) / cos(${phiDec.toFixed(2)}) = ${sinAz.toFixed(4)}`, resultado: `Az W = ${az.toFixed(2)}° | Az E = ${(360-az).toFixed(2)}°` });
        pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'cos H = tan φ / tan δ', desarrollo: `tan(${phiDec.toFixed(2)}) / tan(${decDec.toFixed(2)}) = ${cosH.toFixed(4)}`, resultado: `${(h/15).toFixed(4)}h (${h.toFixed(2)}°)` });

        newCoords = { h: 90 - z, az: az, phi: phiDec, hAng: h/15, dec: decDec, tsl: parseFloat(tslInput || 0) };

      } else if (casoEspecial === 'vertical') {
        const cosZ = Math.sin(decRad) / Math.sin(phiRad);
        const z = toDeg(Math.acos(cosZ));
        const cosH = Math.tan(decRad) / Math.tan(phiRad);
        const h = toDeg(Math.acos(cosH));

        pasos.push({ titulo: 'Azimut (Az)', formula: 'Por definición (Primer Vertical)', desarrollo: 'El astro corta la línea E-O', resultado: 'Az = 90° o 270°' });
        pasos.push({ titulo: 'Distancia Cenital (z)', formula: 'cos z = sen δ / sen φ', desarrollo: `sen(${decDec.toFixed(2)}) / sen(${phiDec.toFixed(2)}) = ${cosZ.toFixed(4)}`, resultado: formatDMS(z) });
        pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'cos H = tan δ / tan φ', desarrollo: `tan(${decDec.toFixed(2)}) / tan(${phiDec.toFixed(2)}) = ${cosH.toFixed(4)}`, resultado: `${(h/15).toFixed(4)}h (${h.toFixed(2)}°)` });

        newCoords = { h: 90 - z, az: phiDec < 0 ? 90 : 270, phi: phiDec, hAng: h/15, dec: decDec, tsl: parseFloat(tslInput || 0) };

      } else if (casoEspecial === 'salida_puesta') {
        const cosH = -(Math.tan(phiRad) * Math.tan(decRad));
        pasos.push({ titulo: 'Coseno de H', formula: 'cos H = -tan φ · tan δ', desarrollo: `-tan(${phiDec.toFixed(2)}) · tan(${decDec.toFixed(2)}) = ${cosH.toFixed(6)}`, resultado: cosH.toFixed(6) });
        
        if (cosH > 1 || cosH < -1) {
          pasos.push({ titulo: 'Resultado', formula: 'Visibilidad', desarrollo: 'cos H fuera de rango [-1, 1]', resultado: 'Astro Circumpolar' });
        } else {
          const hDeg = toDeg(Math.acos(cosH));
          const hHoras = hDeg / 15;
          pasos.push({ titulo: 'Ángulo Horario (H)', formula: 'H = arccos(cos H)', desarrollo: `arccos(${cosH.toFixed(6)}) = ${hDeg.toFixed(4)}°`, resultado: `${hHoras.toFixed(4)}h (${hDeg.toFixed(2)}°)` });
          pasos.push({ titulo: 'Puesta / Salida', formula: 'H y 24 - H', desarrollo: `Puesta: ${hHoras.toFixed(4)}h | Salida: ${(24 - hHoras).toFixed(4)}h`, resultado: 'OK' });
          
          setSugerenciaSol(true);
          newCoords = { h: 0, az: toDeg(Math.acos(Math.sin(decRad)/Math.cos(phiRad))), phi: phiDec, hAng: hHoras, dec: decDec, tsl: parseFloat(tslInput || 0) };
        }
      }
    }

    setDesarrollo(pasos);
    if(newCoords) setCurrentCoords(newCoords);
  };

  const calcularAzSalida = () => {
    const phiDec = dmsToDec(lat.d, lat.m, lat.s, lat.dir);
    const decDec = dmsToDec(val2.d, val2.m, val2.s, 'N');
    const phiRad = toRad(phiDec);
    const decRad = toRad(decDec);
    const cosAz = Math.sin(decRad) / Math.cos(phiRad);
    const az = toDeg(Math.acos(cosAz));
    
    const nuevoPaso = { 
      titulo: 'Azimut de Salida/Puesta (SOL)', 
      formula: 'cos Az = sen δ / cos φ', 
      desarrollo: `sen(${decDec.toFixed(2)}) / cos(${phiDec.toFixed(2)}) = ${cosAz.toFixed(6)}`, 
      resultado: `Az = ${az.toFixed(2)}° (E o W)` 
    };
    setDesarrollo([...desarrollo, nuevoPaso]);
    setSugerenciaSol(false);
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={32} color="var(--primary-color)" /> Unidad 3: Gráfico de Examen
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className={`nav-btn ${modo === 'ecu_to_hor' ? 'active' : ''}`} onClick={() => { setModo('ecu_to_hor'); setDesarrollo([]); }}>
            Ecuatoriales ➔ Horiz.
          </button>
          <button className={`nav-btn ${modo === 'hor_to_ecu' ? 'active' : ''}`} onClick={() => { setModo('hor_to_ecu'); setDesarrollo([]); }}>
            Horiz. ➔ Ecuatoriales
          </button>
          <button className={`nav-btn ${modo === 'especiales' ? 'active' : ''}`} onClick={() => { setModo('especiales'); setDesarrollo([]); }}>
            <Star size={18} /> Casos Especiales
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem', marginTop: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcular} className="glass-panel">
            {modo === 'especiales' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Seleccionar Situación Especial</label>
                  <select className="form-input" value={casoEspecial} onChange={e => setCasoEspecial(e.target.value)}>
                    <option value="culminacion">Culminación del Astro</option>
                    <option value="salida_puesta">Salida y Puesta del Astro</option>
                    <option value="elongacion">Máximas Digresiones (Elongación)</option>
                    <option value="vertical">Paso por el Primer Vertical</option>
                  </select>
                </div>

                {casoEspecial === 'culminacion' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Tipo de Culminación</label>
                      <select className="form-input" value={subCaso} onChange={e => setSubCaso(e.target.value)}>
                        <option value="superior_norte">Superior al Norte del Cenit</option>
                        <option value="inferior_norte">Inferior al Norte del Cenit</option>
                        <option value="superior_sur">Superior al Sur del Cenit</option>
                        <option value="inferior_sur">Inferior al Sur del Cenit</option>
                      </select>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
                      <h5 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <HelpCircle size={14} /> ¿Cuál elegir?
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>1. Momento:</p>
                          <ul style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}>
                            <li><strong>Superior:</strong> Punto más alto (H=0h)</li>
                            <li><strong>Inferior:</strong> Punto más bajo (H=12h)</li>
                          </ul>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>2. Posición:</p>
                          <ul style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}>
                            <li><strong>Norte:</strong> Si δ &gt; φ</li>
                            <li><strong>Sur:</strong> Si δ &lt; φ</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  <div className="input-group-box">
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Declinación (δ)</h4>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input type="number" placeholder="°" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                      <input type="number" placeholder="'" className="form-input" value={val2.m} onChange={e => setVal2({...val2, m: e.target.value})} />
                      <input type="number" placeholder="''" className="form-input" value={val2.s} onChange={e => setVal2({...val2, s: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="input-group-box">
                  <label>Tiempo Sidéreo Local (TSL) - Para Aries (γ)</label>
                  <input type="number" className="form-input" value={tslInput} onChange={e => setTslInput(e.target.value)} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group-box">
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Ángulo Horario (H)' : 'Azimut (Az)'}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder={modo === 'ecu_to_hor' ? "h" : "°"} className="form-input" value={val1.d} onChange={e => setVal1({...val1, d: e.target.value})} />
                    <input type="number" placeholder={modo === 'ecu_to_hor' ? "m" : "'"} className="form-input" value={val1.m} onChange={e => setVal1({...val1, m: e.target.value})} />
                    <input type="number" placeholder={modo === 'ecu_to_hor' ? "s" : "''"} className="form-input" value={val1.s} onChange={e => setVal1({...val1, s: e.target.value})} />
                  </div>
                </div>
                <div className="input-group-box">
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Declinación (δ)' : 'Distancia Cenital (z)'}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" placeholder="°" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                    <input type="number" placeholder="'" className="form-input" value={val2.m} onChange={e => setVal2({...val2, m: e.target.value})} />
                    <input type="number" placeholder="''" className="form-input" value={val2.s} onChange={e => setVal2({...val2, s: e.target.value})} />
                  </div>
                </div>
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
                <div className="input-group-box">
                  <label>Tiempo Sidéreo Local (TSL) - Para Aries (γ)</label>
                  <input type="number" className="form-input" value={tslInput} onChange={e => setTslInput(e.target.value)} />
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
              Calcular Caso <ArrowRight size={18} />
            </button>
          </form>

          {desarrollo.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Desarrollo Matemático</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {desarrollo.map((paso, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                    <div style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>{paso.titulo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{paso.formula}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', margin: '0.25rem 0' }}>{paso.resultado}</div>
                    {paso.nota && <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>⚠️ {paso.nota}</div>}
                  </div>
                ))}
              </div>

              {sugerenciaSol && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(255, 193, 7, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-color)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Sun color="var(--accent-color)" size={24} />
                    <div>
                      <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>¿Estás calculando el SOL?</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Recuerda que en el caso especial del Sol, el <strong>Azimut (Az)</strong> de salida/puesta en el horizonte es fundamental.
                        Puedes calcularlo con: <code>cos Az = sen δ / cos φ</code>.
                      </p>
                      <button 
                        onClick={calcularAzSalida}
                        style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'var(--accent-color)', color: 'black', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        Calcular Azimut del Sol ahora
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ background: '#050505', padding: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
              <Globe size={20} /> Esfera Celeste (Hemisferio {lat.dir === 'S' ? 'Sur' : 'Norte'})
            </h3>
            
            <div style={{ width: '100%', height: '450px', position: 'relative' }}>
              {currentCoords ? (
                <svg width="100%" height="100%" viewBox="0 0 300 450">
                  {/* 1. Círculo base */}
                  <circle cx="150" cy="225" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  
                  {/* 2. Eje Vertical (Z - N') 3D */}
                  {(() => {
                    const pZ = project(90, 0);
                    const pNadir = project(-90, 0);
                    return (
                      <g>
                        <line x1={pZ.x} y1={pZ.y} x2={pNadir.x} y2={pNadir.y} stroke="#fff" strokeWidth="2" strokeDasharray="5" />
                        <text x={pZ.x} y={pZ.y - 10} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">Z</text>
                        <text x={pNadir.x} y={pNadir.y + 15} textAnchor="middle" fill="#aaa" fontSize="14" fontWeight="bold">N'</text>
                      </g>
                    );
                  })()}
  
                  {/* 3. LÍNEA DEL HORIZONTE Y PUNTOS CARDINALES */}
                  {(() => {
                    const pts = [];
                    for(let az=0; az<=360; az+=5) {
                      const p = project(0, az);
                      pts.push(`${p.x},${p.y}`);
                    }
                    const pn = project(0, 0);
                    const ps = project(0, 180);
                    const pe = project(0, 90);
                    const pw = project(0, 270);
                    return (
                      <g>
                        <polygon points={pts.join(' ')} fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
                        <g fontSize="11" fontWeight="bold" fill="#3b82f6">
                          <text x={pn.x - 5} y={pn.y - 8}>N</text>
                          <text x={ps.x + 5} y={ps.y + 12}>S</text>
                          <text x={pe.x + 8} y={pe.y + 5}>E</text>
                          <text x={pw.x - 15} y={pw.y + 5}>W</text>
                        </g>
                      </g>
                    );
                  })()}
                  
                  {/* 4. Elevación del Polo y Eje del Mundo */}
                  {(() => {
                    const phi = currentCoords.phi;
                    const poleAlt = Math.abs(phi);
                    const poleAz = phi < 0 ? 180 : 0; 
                    const pMain = project(poleAlt, poleAz);
                    const pOpp = project(-poleAlt, poleAz === 180 ? 0 : 180);
                    const isSouth = phi < 0;
  
                    return (
                      <g>
                        <line x1={pMain.x} y1={pMain.y} x2={pOpp.x} y2={pOpp.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                        <circle cx={pMain.x} cy={pMain.y} r="4" fill="#f59e0b" />
                        <text x={pMain.x + 8} y={pMain.y - 8} fill="#f59e0b" fontSize="12" fontWeight="bold">{isSouth ? 'Ps' : 'Pn'}</text>
                        <text x={pOpp.x - 15} y={pOpp.y + 15} fill="#f59e0b" fontSize="12" fontWeight="bold">{isSouth ? 'Pn' : 'Ps'}</text>
                      </g>
                    );
                  })()}
  
                  {/* 5. ECUADOR CELESTE (Polilínea 3D) */}
                  {(() => {
                    const phiRad = toRad(currentCoords.phi);
                    const points = [];
                    for (let h = 0; h <= 360; h += 5) {
                      const hRad = toRad(h);
                      const cosZ = Math.cos(phiRad) * Math.cos(hRad); 
                      const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
                      const alt = 90 - toDeg(zRad);
                      const numAz = Math.sin(hRad);
                      const denAz = Math.sin(phiRad) * Math.cos(hRad);
                      let az = toDeg(Math.atan2(numAz, denAz));
                      if (az < 0) az += 360;
                      const pt = project(alt, az);
                      points.push(`${pt.x},${pt.y}`);
                    }
                    return <polygon points={points.join(' ')} fill="none" stroke="var(--primary-color)" strokeWidth="2.5" />;
                  })()}
  
                  {/* PRIMER VERTICAL (Z-E-Na-W) */}
                  {(() => {
                    const points = [];
                    for (let alt = -90; alt <= 90; alt += 5) {
                      const pt = project(alt, 90);
                      points.push(`${pt.x},${pt.y}`);
                    }
                    for (let alt = 90; alt >= -90; alt -= 5) {
                      const pt = project(alt, 270);
                      points.push(`${pt.x},${pt.y}`);
                    }
                    return <polygon points={points.join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" opacity="0.6" />;
                  })()}

                  {/* 6. PUNTO ARIES (gamma) */}
                  {(() => {
                     const ariesH = currentCoords.tsl; 
                     const hRad = toRad(ariesH * 15);
                     const phiRad = toRad(currentCoords.phi);
                     
                     const cosZ = Math.cos(phiRad) * Math.cos(hRad);
                     const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
                     const alt = 90 - toDeg(zRad);
                     const numAz = Math.sin(hRad);
                     const denAz = Math.sin(phiRad) * Math.cos(hRad);
                     let az = toDeg(Math.atan2(numAz, denAz));
                     if (az < 0) az += 360;

                     const pAries = project(alt, az);
                     return (
                       <g>
                         <circle cx={pAries.x} cy={pAries.y} r="4" fill="var(--accent-color)" />
                         <text x={pAries.x + 8} y={pAries.y + 8} fill="var(--accent-color)" fontSize="18" fontWeight="bold">γ</text>
                       </g>
                     );
                  })()}
  
                  {/* 7. ESTRELLA Y CÍRCULO HORARIO */}
                  {(() => {
                    const p = project(currentCoords.h, currentCoords.az);
                    const phi = currentCoords.phi;
                    const poleAlt = Math.abs(phi);
                    const poleAz = phi < 0 ? 180 : 0; 
                    const pnc = project(poleAlt, poleAz);
                    const psc = project(-poleAlt, poleAz === 180 ? 0 : 180);
  
                    return (
                      <g>
                        <path d={`M ${pnc.x} ${pnc.y} Q ${p.x} ${p.y} ${psc.x} ${psc.y}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3" />
                        <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-color)" />
                        <circle cx={p.x} cy={p.y} r="2" fill="white" />
                        <text x={p.x + 10} y={p.y - 10} fill="white" fontSize="12" fontWeight="bold">S (Astro)</text>
                      </g>
                    );
                  })()}
                </svg>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Realiza un cálculo para generar el gráfico de la Esfera Celeste.
                </div>
              )}
            </div>
            {currentCoords && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', marginTop: '1rem' }}>
                 <p style={{ color: '#f59e0b' }}>● <strong>Eje del Mundo:</strong> Inclinado {Math.abs(currentCoords?.phi || 0)}°.</p>
                 <p style={{ color: 'var(--primary-color)' }}>● <strong>Ecuador:</strong> Perpendicular al eje del mundo.</p>
                 <p style={{ color: 'var(--accent-color)' }}>● <strong>γ (Aries):</strong> Ubicado a {currentCoords.tsl}h de origen.</p>
              </div>
            )}
          </div>

          {modo === 'especiales' && (
            <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-color)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                <Info color="var(--accent-color)" size={20} /> Guía de Especiales
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Culminación</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Cruce del meridiano. H = 0h (Superior) o 12h (Inferior).</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Salida / Puesta</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Corte del horizonte (z = 90°).</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Elongación</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Paralelo celeste tangente al vertical. (q = 90°).</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
