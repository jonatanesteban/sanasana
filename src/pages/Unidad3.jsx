import React, { useState } from 'react';
import { BookOpen, Calculator, ArrowRight, MapPin, Star, Clock } from 'lucide-react';

export default function Unidad3() {
  // Estados para los inputs
  const [hDeg, setHDeg] = useState('');
  const [hMin, setHMin] = useState('');
  const [hSec, setHSec] = useState('');

  const [latDeg, setLatDeg] = useState('');
  const [latMin, setLatMin] = useState('');
  const [latSec, setLatSec] = useState('');

  const [decDeg, setDecDeg] = useState('');
  const [decMin, setDecMin] = useState('');
  const [decSec, setDecSec] = useState('');

  const [desarrollo, setDesarrollo] = useState([]);

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const calcularTransformacion = (e) => {
    e.preventDefault();
    const pasos = [];

    // 1. Convertir H a decimal y radianes
    const hdVal = parseFloat(hDeg || 0);
    const hmVal = parseFloat(hMin || 0);
    const hsVal = parseFloat(hSec || 0);
    const hDecimal = (Math.abs(hdVal) + (hmVal / 60) + (hsVal / 3600)) * (hdVal < 0 ? -1 : 1);
    const hRad = toRad(hDecimal);

    pasos.push({
      titulo: 'Ángulo Horario (H)',
      formula: 'H (decimal)',
      desarrollo: `${hdVal}° ${hmVal}' ${hsVal}''`,
      resultado: `${hDecimal.toFixed(4)}°`
    });

    // 2. Convertir Latitud a decimal y radianes
    const ld = parseFloat(latDeg || 0);
    const lm = parseFloat(latMin || 0);
    const ls = parseFloat(latSec || 0);
    const latDecimal = (Math.abs(ld) + (lm / 60) + (ls / 3600)) * (ld < 0 ? -1 : 1);
    const latRad = toRad(latDecimal);

    // 3. Convertir Declinación a decimal y radianes
    const dd = parseFloat(decDeg || 0);
    const dm = parseFloat(decMin || 0);
    const ds = parseFloat(decSec || 0);
    const decDecimal = (Math.abs(dd) + (dm / 60) + (ds / 3600)) * (dd < 0 ? -1 : 1);
    const decRad = toRad(decDecimal);

    // 4. Calcular Z (Distancia Cenital)
    // Fórmula: cos Z = sen lat * sen dec + cos lat * cos dec * cos H
    const cosZ = (Math.sin(latRad) * Math.sin(decRad)) + 
                 (Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad));
    
    const cosZClamped = Math.max(-1, Math.min(1, cosZ));
    const zRad = Math.acos(cosZClamped);
    const zDecimal = toDeg(zRad);

    const zd = Math.floor(zDecimal);
    const zm = Math.floor((zDecimal - zd) * 60);
    const zs = ((zDecimal - zd) * 60 - zm) * 60;

    pasos.push({
      titulo: 'Distancia Cenital (Z)',
      formula: 'cos Z = sen φ · sen δ + cos φ · cos δ · cos H',
      desarrollo: `sen(${latDecimal.toFixed(4)}°)·sen(${decDecimal.toFixed(4)}°) + cos(${latDecimal.toFixed(4)}°)·cos(${decDecimal.toFixed(4)}°)·cos(${hDecimal.toFixed(4)}°)`,
      resultado: `${zd}° ${zm}' ${zs.toFixed(2)}'' (${zDecimal.toFixed(6)}°)`
    });

    // 5. Calcular Altura (h)
    const hAstro = 90 - zDecimal;
    const hAd = Math.floor(Math.abs(hAstro));
    const hAm = Math.floor((Math.abs(hAstro) - hAd) * 60);
    const hAs = ((Math.abs(hAstro) - hAd) * 60 - hAm) * 60;

    pasos.push({
      titulo: 'Altura del Astro (h)',
      formula: 'h = 90° - Z',
      desarrollo: `90° - ${zDecimal.toFixed(4)}°`,
      resultado: `${hAstro < 0 ? '-' : ''}${hAd}° ${hAm}' ${hAs.toFixed(2)}''`
    });

    // 6. Calcular Azimut (Az)
    // Fórmula: tan AZ = sen H / (sen lat * cos H - cos lat * tan dec)
    const numAz = Math.sin(hRad);
    const denAz = (Math.sin(latRad) * Math.cos(hRad)) - (Math.cos(latRad) * Math.tan(decRad));
    
    const azRad = Math.atan2(numAz, denAz);
    let azDecimal = toDeg(azRad);
    if (azDecimal < 0) azDecimal += 360;

    const azd = Math.floor(azDecimal);
    const azm = Math.floor((azDecimal - azd) * 60);
    const azs = ((azDecimal - azd) * 60 - azm) * 60;

    pasos.push({
      titulo: 'Azimut del Astro (Az)',
      formula: 'tan AZ = sen H / (sen φ · cos H - cos φ · tan δ)',
      desarrollo: `sen(${hDecimal.toFixed(4)}°) / (sen(${latDecimal.toFixed(4)}°)·cos(${hDecimal.toFixed(4)}°) - cos(${latDecimal.toFixed(4)}°)·tan(${decDecimal.toFixed(4)}°))`,
      resultado: `${azd}° ${azm}' ${azs.toFixed(2)}'' (${azDecimal.toFixed(6)}°)`
    });

    setDesarrollo(pasos);
  };

  return (
    <div className="unidad-3-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Unidad 3: Transformación entre Sistemas Locales</h1>
        <p>Cálculo de Distancia Cenital (Z), Altura (h) y Azimut (Az).</p>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcularTransformacion} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--primary-color)" /> Datos de Entrada
            </h3>

            {/* Ángulo Horario H */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Clock size={18} color="var(--primary-color)" /> Ángulo Horario (H)
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="°" className="form-input" value={hDeg} onChange={(e) => setHDeg(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="'" className="form-input" value={hMin} onChange={(e) => setHMin(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="''" className="form-input" value={hSec} onChange={(e) => setHSec(e.target.value)} style={{ flex: 1.5 }} />
              </div>
            </div>

            {/* Latitud */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <MapPin size={18} color="var(--primary-color)" /> Latitud (φ)
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="°" className="form-input" value={latDeg} onChange={(e) => setLatDeg(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="'" className="form-input" value={latMin} onChange={(e) => setLatMin(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="''" className="form-input" value={latSec} onChange={(e) => setLatSec(e.target.value)} style={{ flex: 1.5 }} />
              </div>
            </div>

            {/* Declinación */}
            <div className="input-group-box">
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Star size={18} color="var(--primary-color)" /> Declinación (δ)
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" placeholder="°" className="form-input" value={decDeg} onChange={(e) => setDecDeg(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="'" className="form-input" value={decMin} onChange={(e) => setDecMin(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder="''" className="form-input" value={decSec} onChange={(e) => setDecSec(e.target.value)} style={{ flex: 1.5 }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Iniciar Cálculo <ArrowRight size={18} />
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
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                      Resultado: {paso.resultado}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                Completa los datos de entrada para ver el desarrollo.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
