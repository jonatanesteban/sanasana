import React, { useState, useEffect } from 'react';
import { Star, Clock, Calculator, MapPin, ArrowRight } from 'lucide-react';
import { getData } from '../utils/storage';

export default function PosicionEstrellas() {
  // Input States
  const [arH, setArH] = useState('');
  const [arM, setArM] = useState('');
  const [arS, setArS] = useState('');
  
  const [decD, setDecD] = useState('');
  const [decM, setDecM] = useState('');
  const [decS, setDecS] = useState('');

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('');
  const [minuto, setMinuto] = useState('');
  const [segundo, setSegundo] = useState('');
  
  const [latDeg, setLatDeg] = useState('');
  const [latMin, setLatMin] = useState('');
  const [latSec, setLatSec] = useState('');

  const [lonDeg, setLonDeg] = useState('');
  const [lonMin, setLonMin] = useState('');
  const [lonSec, setLonSec] = useState('');

  const [theta0Manual, setTheta0Manual] = useState('');

  // Results
  const [resultadoTU, setResultadoTU] = useState(null);
  const [desarrollo, setDesarrollo] = useState([]);

  const diferenciaLocal = -3; // Argentina por defecto

  // Auto-completar Theta 0 desde la base de datos
  useEffect(() => {
    const dbData = getData();
    const existingRecord = dbData.find(item => {
      const itemDate = String(item.Fecha || '').split('T')[0];
      return itemDate === fecha;
    });

    if (existingRecord && existingRecord['T. Sidéreo Aparente']) {
      setTheta0Manual(existingRecord['T. Sidéreo Aparente']);
    }
  }, [fecha]);

  const calcularPosicion = (e) => {
    e.preventDefault();
    const pasos = [];

    // 1. Calcular TU
    const h = parseInt(hora || 0, 10);
    const m = parseInt(minuto || 0, 10);
    const s = parseFloat(segundo || 0);

    let h_tu_raw = h - diferenciaLocal;
    let h_tu = h_tu_raw;
    let diaExtra = 0;

    if (h_tu >= 24) {
      h_tu -= 24;
      diaExtra = 1;
    } else if (h_tu < 0) {
      h_tu += 24;
      diaExtra = -1;
    }

    const tuResult = {
      horas: h_tu,
      minutos: m,
      segundos: s,
      diaExtra: diaExtra
    };
    setResultadoTU(tuResult);

    pasos.push({
      titulo: 'Cálculo de Tiempo Universal (TU)',
      formula: 'TU = Hora Legal - Diferencia Local',
      desarrollo: `${h}:${m}:${s} - (${diferenciaLocal}) = ${h_tu}:${m}:${s}${diaExtra !== 0 ? (diaExtra > 0 ? ' (+1 día)' : ' (-1 día)') : ''}`,
      resultado: `${String(h_tu).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`,
      nota: diaExtra > 0 ? '⚠️ ATENCIÓN: Al pasar al día siguiente, debés buscar los datos (Theta 0, etc.) para la fecha siguiente en el almanaque/base de datos.' : 
            diaExtra < 0 ? '⚠️ ATENCIÓN: Al ser el día anterior, debés buscar los datos para la fecha anterior.' : null
    });

    // 2. Calcular IS (Intervalo Sidéreo)
    const tu_decimal = h_tu + (m / 60) + (s / 3600);
    const constante_is = 1.0027379;
    const is_decimal = tu_decimal * constante_is;

    const is_h = Math.floor(is_decimal);
    const is_m_dec = (is_decimal - is_h) * 60;
    const is_m = Math.floor(is_m_dec);
    const is_s = (is_m_dec - is_m) * 60;

    pasos.push({
      titulo: 'Intervalo Sidéreo (IS)',
      formula: 'IS = TU (decimal) × 1.0027379',
      desarrollo: `${tu_decimal.toFixed(6)} × ${constante_is}`,
      resultado: `${String(is_h).padStart(2, '0')}:${String(is_m).padStart(2, '0')}:${String(is_s.toFixed(6)).padStart(9, '0')}`
    });

    // 3. Calcular Theta G (Theta 0 + IS)
    if (theta0Manual) {
      const parts = theta0Manual.split(' ').filter(Boolean);
      if (parts.length >= 3) {
        const t0_h = parseInt(parts[0]);
        const t0_m = parseInt(parts[1]);
        const t0_s = parseFloat(parts[2]);
        const t0_decimal = t0_h + (t0_m / 60) + (t0_s / 3600);

        let tg_decimal = t0_decimal + is_decimal;
        while (tg_decimal >= 24) tg_decimal -= 24;
        while (tg_decimal < 0) tg_decimal += 24;

        const tg_h = Math.floor(tg_decimal);
        const tg_m_dec = (tg_decimal - tg_h) * 60;
        const tg_m = Math.floor(tg_m_dec);
        const tg_s = (tg_m_dec - tg_m) * 60;

        pasos.push({
          titulo: 'Tiempo Sidéreo en Greenwich (ΘG)',
          formula: 'ΘG = Θ₀ + IS',
          desarrollo: `${theta0Manual} + ${String(is_h).padStart(2, '0')}:${String(is_m).padStart(2, '0')}:${String(is_s.toFixed(2)).padStart(5, '0')}`,
          resultado: `${String(tg_h).padStart(2, '0')}:${String(tg_m).padStart(2, '0')}:${String(tg_s.toFixed(6)).padStart(9, '0')}`
        });

        // 4. Calcular Lambda (Longitud en Tiempo)
        if (lonDeg) {
          const l_d = parseFloat(lonDeg || 0);
          const l_m = parseFloat(lonMin || 0);
          const l_s = parseFloat(lonSec || 0);
          const lonDecimal = (Math.abs(l_d) + (l_m / 60) + (l_s / 3600)) * (l_d < 0 ? -1 : 1);
          const lambda_decimal = lonDecimal / 15;

          const abs_lambda = Math.abs(lambda_decimal);
          const lam_h = Math.floor(abs_lambda);
          const lam_m_dec = (abs_lambda - lam_h) * 60;
          const lam_m = Math.floor(lam_m_dec);
          const lam_s = (lam_m_dec - lam_m) * 60;

          pasos.push({
            titulo: 'Longitud en Tiempo (λ)',
            formula: 'λ = Longitud / 15',
            desarrollo: `${lonDecimal.toFixed(6)}° / 15`,
            resultado: `${lambda_decimal < 0 ? '-' : ''}${String(lam_h).padStart(2, '0')}:${String(lam_m).padStart(2, '0')}:${String(lam_s.toFixed(6)).padStart(9, '0')}`
          });

          // 5. Calcular Theta L (TSL)
          let tl_decimal = tg_decimal + lambda_decimal;
          while (tl_decimal >= 24) tl_decimal -= 24;
          while (tl_decimal < 0) tl_decimal += 24;

          const tl_h = Math.floor(tl_decimal);
          const tl_m_dec = (tl_decimal - tl_h) * 60;
          const tl_m = Math.floor(tl_m_dec);
          const tl_s = (tl_m_dec - tl_m) * 60;

          pasos.push({
            titulo: 'Tiempo Sidéreo Local (ΘL / TSL)',
            formula: 'ΘL = ΘG + λ',
            desarrollo: `${String(tg_h).padStart(2, '0')}:${String(tg_m).padStart(2, '0')}:${String(tg_s.toFixed(2)).padStart(5, '0')} + (${lambda_decimal < 0 ? '-' : ''}${String(lam_h).padStart(2, '0')}:${String(lam_m).padStart(2, '0')}:${String(lam_s.toFixed(2)).padStart(5, '0')})`,
            resultado: `${String(tl_h).padStart(2, '0')}:${String(tl_m).padStart(2, '0')}:${String(tl_s.toFixed(6)).padStart(9, '0')}`
          });

          // 6. Calcular Ángulo Horario (H)
          if (arH) {
            const a_h = parseInt(arH || 0);
            const a_m = parseInt(arM || 0);
            const a_s = parseFloat(arS || 0);
            const arDecimal = a_h + (a_m / 60) + (a_s / 3600);

            let h_decimal = tl_decimal - arDecimal;
            while (h_decimal < 0) h_decimal += 24;
            while (h_decimal >= 24) h_decimal -= 24;

            const h_h = Math.floor(h_decimal);
            const h_m_dec = (h_decimal - h_h) * 60;
            const h_m = Math.floor(h_m_dec);
            const h_s = (h_m_dec - h_m) * 60;

            pasos.push({
              titulo: 'Ángulo Horario (H)',
              formula: 'H = ΘL - AR',
              desarrollo: `${tl_h}:${tl_m}:${tl_s.toFixed(2)} - ${a_h}:${a_m}:${a_s.toFixed(2)}`,
              resultado: `${String(h_h).padStart(2, '0')}:${String(h_m).padStart(2, '0')}:${String(h_s.toFixed(6)).padStart(9, '0')}`
            });

            // 7. Calcular H Angular (H * 15)
            const h_angular_decimal = h_decimal * 15;
            const ha_d = Math.floor(h_angular_decimal);
            const ha_m_dec = (h_angular_decimal - ha_d) * 60;
            const ha_m = Math.floor(ha_m_dec);
            const ha_s = (ha_m_dec - ha_m) * 60;

            pasos.push({
              titulo: 'Ángulo Horario Angular (H angular)',
              formula: 'H angular = H × 15',
              desarrollo: `${h_decimal.toFixed(6)}h × 15`,
              resultado: `${ha_d}° ${ha_m}' ${ha_s.toFixed(2)}''`
            });

            // 8. Calcular Z (Distancia Cenital)
            if (latDeg && decD) {
              const toRad = (deg) => (deg * Math.PI) / 180;
              const toDeg = (rad) => (rad * 180) / Math.PI;

              // Latitud a decimal y radianes
              const l_d = parseFloat(latDeg || 0);
              const l_m = parseFloat(latMin || 0);
              const l_s = parseFloat(latSec || 0);
              const latDecimal = (Math.abs(l_d) + (l_m / 60) + (l_s / 3600)) * (l_d < 0 ? -1 : 1);
              const latRad = toRad(latDecimal);

              // Declinación a decimal y radianes
              const d_d = parseFloat(decD || 0);
              const d_m = parseFloat(decM || 0);
              const d_s = parseFloat(decS || 0);
              const decDecimal = (Math.abs(d_d) + (d_m / 60) + (d_s / 3600)) * (d_d < 0 ? -1 : 1);
              const decRad = toRad(decDecimal);

              // H angular (ya calculado en ha_d, ha_m, ha_s) a radianes
              const hRad = toRad(h_angular_decimal);

              // Fórmula: cos Z = sen DEC * sen lat + cos DEC * cos lat * cos H
              const cosZ = (Math.sin(decRad) * Math.sin(latRad)) + 
                           (Math.cos(decRad) * Math.cos(latRad) * Math.cos(hRad));
              
              // Evitar errores de precisión fuera de [-1, 1]
              const cosZClamped = Math.max(-1, Math.min(1, cosZ));
              const zRad = Math.acos(cosZClamped);
              const zDecimal = toDeg(zRad);

              const z_d = Math.floor(zDecimal);
              const z_m_dec = (zDecimal - z_d) * 60;
              const z_m = Math.floor(z_m_dec);
              const z_s = (z_m_dec - z_m) * 60;

              pasos.push({
                titulo: 'Distancia Cenital (Z)',
                formula: 'cos Z = sen DEC · sen lat + cos DEC · cos lat · cos H',
                desarrollo: `sen(${decDecimal.toFixed(4)}°)·sen(${latDecimal.toFixed(4)}°) + cos(${decDecimal.toFixed(4)}°)·cos(${latDecimal.toFixed(4)}°)·cos(${h_angular_decimal.toFixed(4)}°)`,
                resultado: `Z = ${z_d}° ${z_m}' ${z_s.toFixed(2)}'' (${zDecimal.toFixed(6)}°)`
              });

              // 9. Calcular Altura (h)
              const h_astro_decimal = 90 - zDecimal;
              const has_d = Math.floor(h_astro_decimal);
              const has_m_dec = (h_astro_decimal - has_d) * 60;
              const has_m = Math.floor(has_m_dec);
              const has_s = (has_m_dec - has_m) * 60;

              pasos.push({
                titulo: 'Altura del Astro (h)',
                formula: 'h = 90° - Z',
                desarrollo: `90° - ${zDecimal.toFixed(6)}°`,
                resultado: `h = ${has_d}° ${has_m}' ${has_s.toFixed(2)}''`
              });

              // 10. Calcular Azimut (Az)
              // Fórmula solicitada corregida: tan AZ = (sen H) / ((sen latitud * cos H) - (cos latitud * tan DEC))
              
              const numAz = Math.sin(hRad);
              const denAz = (Math.sin(latRad) * Math.cos(hRad)) - (Math.cos(latRad) * Math.tan(decRad));
              
              // Usamos atan2 para obtener el cuadrante correcto
              let azRad_new = Math.atan2(numAz, denAz);
              let azDecimal_new = toDeg(azRad_new);
              
              // Ajustar para que el Azimut sea 0-360
              if (azDecimal_new < 0) azDecimal_new += 360;

              const az_d = Math.floor(azDecimal_new);
              const az_m_dec = (azDecimal_new - az_d) * 60;
              const az_m = Math.floor(az_m_dec);
              const az_s = (az_m_dec - az_m) * 60;

              pasos.push({
                titulo: 'Azimut del Astro (Az)',
                formula: 'tan AZ = sen H / (sen lat · cos H - cos lat · tan DEC)',
                desarrollo: `sen(${h_angular_decimal.toFixed(4)}°) / (sen(${latDecimal.toFixed(4)}°)·cos(${h_angular_decimal.toFixed(4)}°) - cos(${latDecimal.toFixed(4)}°)·tan(${decDecimal.toFixed(4)}°))`,
                resultado: `Az = ${az_d}° ${az_m}' ${az_s.toFixed(2)}'' (${azDecimal_new.toFixed(6)}°)`,
                nota: 'Nota: Se aplica la fórmula final corregida. El resultado indica el azimut astronómico.'
              });
            }
          }
        }
      } else {
        pasos.push({
          titulo: 'Tiempo Sidéreo en Greenwich (ΘG)',
          formula: 'ΘG = Θ₀ + IS',
          desarrollo: 'Error: Formato de Theta 0 inválido.',
          resultado: '---'
        });
      }
    } else {
      pasos.push({
        titulo: 'Tiempo Sidéreo en Greenwich (ΘG)',
        formula: 'ΘG = Θ₀ + IS',
        desarrollo: 'Falta ingresar el valor de Theta 0.',
        resultado: '---'
      });
    }

    setDesarrollo(pasos);
  };

  return (
    <div className="posicion-estrellas-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1>Cálculo de Posición Aparente</h1>
        <p>Determinación de las coordenadas celestes de estrellas.</p>
      </header>

      <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-color)', background: 'rgba(236, 72, 153, 0.05)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>
          Ejercicio de Guía:
        </h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>
          ¿Qué coordenadas acimutales tuvo la estrella <strong>β Orionis (Rigel) (194)</strong> el 10 de marzo a las 22:48 de hora legal en un sitio con coordenadas (-23º, -68)?
        </p>
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>H:</span> {desarrollo.find(p => p.titulo === 'Ángulo Horario (H)')?.resultado || '---'}
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Z:</span> {desarrollo.find(p => p.titulo === 'Distancia Cenital (Z)')?.resultado.split('(')[0] || '---'}
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>h:</span> {desarrollo.find(p => p.titulo === 'Altura del Astro (h)')?.resultado || '---'}
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Acimut:</span> {desarrollo.find(p => p.titulo === 'Azimut del Astro (Az)')?.resultado.split('(')[0] || '---'}
          </div>
        </div>
      </div>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        <section className="inputs-section">
          <form onSubmit={calcularPosicion} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Coordenadas de la Estrella */}
            <div className="input-group-box">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} color="var(--primary-color)" /> Coordenadas de la Estrella (Catálogo)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ascensión Recta (AR)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={arH} onChange={(e) => setArH(e.target.value)} style={{ flex: '1' }} />
                    <input type="number" placeholder="m" className="form-input" value={arM} onChange={(e) => setArM(e.target.value)} style={{ flex: '1' }} />
                    <input type="number" placeholder="s" className="form-input" value={arS} onChange={(e) => setArS(e.target.value)} style={{ flex: '2' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Declinación (DEC)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="°" className="form-input" value={decD} onChange={(e) => setDecD(e.target.value)} style={{ flex: '1' }} />
                    <input type="number" placeholder="'" className="form-input" value={decM} onChange={(e) => setDecM(e.target.value)} style={{ flex: '1' }} />
                    <input type="number" placeholder="''" className="form-input" value={decS} onChange={(e) => setDecS(e.target.value)} style={{ flex: '2' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha y Hora de Observación */}
            <div className="input-group-box">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--primary-color)" /> Momento de Observación
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha</label>
                  <input type="date" className="form-input" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: '100%', marginTop: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hora Legal</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="h" className="form-input" value={hora} onChange={(e) => setHora(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="m" className="form-input" value={minuto} onChange={(e) => setMinuto(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="s" className="form-input" value={segundo} onChange={(e) => setSegundo(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Θ₀ (Theta 0) - Tiempo Sidéreo en Greenwich (0h)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: 15 30 12.45" 
                  value={theta0Manual} 
                  onChange={(e) => setTheta0Manual(e.target.value)} 
                  style={{ width: '100%', marginTop: '0.5rem' }} 
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Formato: HH MM SS.ssss</span>
              </div>
            </div>

            {/* Ubicación (Opcional por ahora, pero útil) */}
            <div className="input-group-box">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--primary-color)" /> Ubicación (GMS)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latitud</label>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="°" className="form-input" value={latDeg} onChange={(e) => setLatDeg(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="'" className="form-input" value={latMin} onChange={(e) => setLatMin(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="''" className="form-input" value={latSec} onChange={(e) => setLatSec(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Longitud</label>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="°" className="form-input" value={lonDeg} onChange={(e) => setLonDeg(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="'" className="form-input" value={lonMin} onChange={(e) => setLonMin(e.target.value)} style={{ width: '100%' }} />
                    <input type="number" placeholder="''" className="form-input" value={lonSec} onChange={(e) => setLonSec(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
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
                    {paso.nota && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        {paso.nota}
                      </div>
                    )}
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                      Resultado: {paso.resultado}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                Ingresa los datos de la estrella y el momento de observación para comenzar.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
