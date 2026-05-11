import React, { useState } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock, RefreshCw } from 'lucide-react';

export default function Unidad3() {
  const [modo, setModo] = useState('ecu_to_hor'); // 'ecu_to_hor' o 'hor_to_ecu'
  
  // Estados para inputs
  const [val1, setVal1] = useState({ d: '', m: '', s: '' }); // H o Az
  const [val2, setVal2] = useState({ d: '', m: '', s: '' }); // Dec o z
  const [lat, setLat] = useState({ d: '', m: '', s: '' });   // Latitud

  const [desarrollo, setDesarrollo] = useState([]);

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

  const calcular = (e) => {
    e.preventDefault();
    const pasos = [];
    const phiDec = dmsToDec(lat.d, lat.m, lat.s);
    const phiRad = toRad(phiDec);

    if (modo === 'ecu_to_hor') {
      // Ecuatoriales -> Horizontales (Calcula Z, h, Az)
      const hHorarioDec = dmsToDec(val1.d, val1.m, val1.s);
      const hDec = hHorarioDec * 15; // Convertir horas a grados
      const decDec = dmsToDec(val2.d, val2.m, val2.s);
      const hRad = toRad(hDec);
      const decRad = toRad(decDec);

      // 1. Z
      const cosZ = (Math.sin(phiRad) * Math.sin(decRad)) + (Math.cos(phiRad) * Math.cos(decRad) * Math.cos(hRad));
      const zRad = Math.acos(Math.max(-1, Math.min(1, cosZ)));
      const zDec = toDeg(zRad);

      pasos.push({
        titulo: 'Ángulo Horario (H)',
        formula: 'H(grados) = H(horas) × 15',
        desarrollo: `${hHorarioDec.toFixed(6)}h × 15`,
        resultado: `${hDec.toFixed(4)}°`
      });

      pasos.push({
        titulo: 'Distancia Cenital (z)',
        formula: 'cos z = sen φ sen δ + cos φ cos δ cos H',
        desarrollo: `sen(${phiDec.toFixed(4)})sen(${decDec.toFixed(4)}) + cos(${phiDec.toFixed(4)})cos(${decDec.toFixed(4)})cos(${hDec.toFixed(4)})`,
        resultado: formatDMS(zDec)
      });

      // 1.1 Altura (h)
      const hAstro = 90 - zDec;
      pasos.push({
        titulo: 'Altura del Astro (h)',
        formula: 'h = 90° - z',
        desarrollo: `90° - ${zDec.toFixed(4)}°`,
        resultado: formatDMS(hAstro)
      });

      // 2. Az
      const numAz = Math.sin(hRad);
      const denAz = (Math.sin(phiRad) * Math.cos(hRad)) - (Math.cos(phiRad) * Math.tan(decRad));
      let azDec = toDeg(Math.atan2(numAz, denAz));
      if (azDec < 0) azDec += 360;

      pasos.push({
        titulo: 'Azimut (Az)',
        formula: 'tan Az = sen H / (sen φ cos H - cos φ tan δ)',
        desarrollo: `atan2(${numAz.toFixed(4)}, ${denAz.toFixed(4)})`,
        resultado: formatDMS(azDec)
      });
    } else {
      // Horizontales -> Ecuatoriales (Calcula δ, H)
      const azDec = dmsToDec(val1.d, val1.m, val1.s);
      const zDec = dmsToDec(val2.d, val2.m, val2.s);
      const azRad = toRad(azDec);
      const zRad = toRad(zDec);

      // 1. Declinación (δ)
      const sinDec = (Math.cos(zRad) * Math.sin(phiRad)) - (Math.sin(zRad) * Math.cos(phiRad) * Math.cos(azRad));
      const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));
      const decFinal = toDeg(decRad);

      pasos.push({
        titulo: 'Declinación (δ)',
        formula: 'sen δ = cos z sen φ - sen z cos φ cos Az',
        desarrollo: `cos(${zDec.toFixed(4)})sen(${phiDec.toFixed(4)}) - sen(${zDec.toFixed(4)})cos(${phiDec.toFixed(4)})cos(${azDec.toFixed(4)})`,
        resultado: formatDMS(decFinal)
      });

      // 2. Ángulo Horario (H)
      const numH = Math.sin(azRad);
      const denH = (Math.cos(phiRad) * (1 / Math.tan(zRad))) + (Math.sin(phiRad) * Math.cos(azRad));
      const tanH = numH / denH;
      let hDecRaw = toDeg(Math.atan(tanH));
      let hFinal = hDecRaw;

      // Lógica de cuadrantes según la imagen
      let notaCuadrante = "";
      if (tanH > 0 && azDec > 0 && azDec < 180) {
        hFinal = hDecRaw; 
        notaCuadrante = "1er Cuadrante: Hv = Hcalc";
      } else if (tanH > 0 && azDec > 180 && azDec < 360) {
        hFinal = hDecRaw + 180;
        notaCuadrante = "3er Cuadrante: Hv = Hcalc + 180°";
      } else if (tanH < 0 && azDec > 0 && azDec < 180) {
        hFinal = hDecRaw + 180;
        notaCuadrante = "2do Cuadrante: Hv = Hcalc + 180°";
      } else if (tanH < 0 && azDec > 180 && azDec < 360) {
        hFinal = hDecRaw + 360;
        notaCuadrante = "4to Cuadrante: Hv = Hcalc + 360°";
      }

      pasos.push({
        titulo: 'Ángulo Horario (H)',
        formula: 'tan H = sen Az / (cos φ cot z + sen φ cos Az)',
        desarrollo: `tan H = ${numH.toFixed(4)} / ${denH.toFixed(4)} = ${tanH.toFixed(4)}`,
        resultado: formatDMS(hFinal),
        nota: notaCuadrante
      });
    }

    setDesarrollo(pasos);
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Unidad 3: Transformación de Sistemas</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className={`nav-btn ${modo === 'ecu_to_hor' ? 'active' : ''}`}
            onClick={() => { setModo('ecu_to_hor'); setDesarrollo([]); }}
          >
            Ecuatoriales ➔ Horizontales
          </button>
          <button 
            className={`nav-btn ${modo === 'hor_to_ecu' ? 'active' : ''}`}
            onClick={() => { setModo('hor_to_ecu'); setDesarrollo([]); }}
          >
            Horizontales ➔ Ecuatoriales
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcular} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} color="var(--primary-color)" /> Datos ({modo === 'ecu_to_hor' ? 'H, δ, φ' : 'Az, z, φ'})
            </h3>

            {/* Input 1: H o Az */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Ángulo Horario (H)' : 'Azimut (Az)'}</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder={modo === 'ecu_to_hor' ? "h" : "°"} className="form-input" value={val1.d} onChange={e => setVal1({...val1, d: e.target.value})} />
                <input type="number" placeholder={modo === 'ecu_to_hor' ? "m" : "'"} className="form-input" value={val1.m} onChange={e => setVal1({...val1, m: e.target.value})} />
                <input type="number" placeholder={modo === 'ecu_to_hor' ? "s" : "''"} className="form-input" value={val1.s} onChange={e => setVal1({...val1, s: e.target.value})} />
              </div>
            </div>

            {/* Input 2: Dec o Z */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{modo === 'ecu_to_hor' ? 'Declinación (δ)' : 'Distancia Cenital (z)'}</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="°" className="form-input" value={val2.d} onChange={e => setVal2({...val2, d: e.target.value})} />
                <input type="number" placeholder="'" className="form-input" value={val2.m} onChange={e => setVal2({...val2, m: e.target.value})} />
                <input type="number" placeholder="''" className="form-input" value={val2.s} onChange={e => setVal2({...val2, s: e.target.value})} />
              </div>
            </div>

            {/* Input 3: Latitud */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Latitud (φ)</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="°" className="form-input" value={lat.d} onChange={e => setLat({...lat, d: e.target.value})} />
                <input type="number" placeholder="'" className="form-input" value={lat.m} onChange={e => setLat({...lat, m: e.target.value})} />
                <input type="number" placeholder="''" className="form-input" value={lat.s} onChange={e => setLat({...lat, s: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Calcular Transformación <ArrowRight size={18} />
            </button>
          </form>
        </section>

        <section className="results-section">
          <div className="glass-panel" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--primary-color)" /> Desarrollo del Cálculo
            </h3>
            
            {desarrollo.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {desarrollo.map((paso, index) => (
                  <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{index + 1}. {paso.titulo}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Fórmula: {paso.formula}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{paso.desarrollo}</p>
                    {paso.nota && <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ {paso.nota}</p>}
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                      Resultado: {paso.resultado}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                Selecciona el modo y completa los datos.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
