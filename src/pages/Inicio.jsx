import React, { useState, useEffect } from 'react';
import { Calculator, Clock, ArrowRight, FileText } from 'lucide-react';
import { saveData, getData } from '../utils/storage';

export default function Inicio() {
  const [categoria, setCategoria] = useState('tiempo_sidereo');
  const [calculo, setCalculo] = useState('tu');
  
  // States for TU calculation
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [calculoMode, setCalculoMode] = useState('legalToTsl'); // 'legalToTsl' or 'tslToLegal'
  const [hora, setHora] = useState('');
  const [minuto, setMinuto] = useState('');
  const [segundo, setSegundo] = useState('');
  const [tslHora, setTslHora] = useState('');
  const [tslMinuto, setTslMinuto] = useState('');
  const [tslSegundo, setTslSegundo] = useState('');
  const [theta0Manual, setTheta0Manual] = useState('');
  
  // Latitud DMS
  const [latDeg, setLatDeg] = useState('');
  const [latMin, setLatMin] = useState('');
  const [latSec, setLatSec] = useState('');

  // Longitud DMS
  const [lonDeg, setLonDeg] = useState('');
  const [lonMin, setLonMin] = useState('');
  const [lonSec, setLonSec] = useState('');

  const [resultadoTU, setResultadoTU] = useState(null);
  const [resultadoIS, setResultadoIS] = useState(null);
  const [resultadoTheta0, setResultadoTheta0] = useState(null);
  const [resultadoThetaG, setResultadoThetaG] = useState(null);
  const [resultadoLambda, setResultadoLambda] = useState(null);
  const [resultadoThetaL, setResultadoThetaL] = useState(null);
  const [resultadoFinalLegal, setResultadoFinalLegal] = useState(null);
  const [resultadoISInverse, setResultadoISInverse] = useState(null);
  const [desarrollo, setDesarrollo] = useState(null);

  const diferenciaLocal = -3; // Argentina

  // AUTO-COMPLETADO: Buscar si ya existe un valor para esta fecha al cambiarla
  useEffect(() => {
    const dbData = getData();
    const existingRecord = dbData.find(item => {
      const itemDate = String(item.Fecha || '').split('T')[0];
      return itemDate === fecha;
    });

    if (existingRecord && existingRecord['T. Sidéreo Aparente']) {
      setTheta0Manual(existingRecord['T. Sidéreo Aparente']);
    } else {
      // Opcional: limpiar si no existe, o dejar el que estaba. 
      // Por ahora lo dejamos para no borrar lo que el usuario esté escribiendo.
    }
  }, [fecha]);

  const calcularTU = (e) => {
    e.preventDefault();
    
    // Ya no buscamos en la DB, usamos el valor manual
    let theta0Result = null;
    if (theta0Manual) {
      // Normalizar: convertir comas a puntos para evitar errores de parseo
      const normalizedTheta0 = theta0Manual.replace(',', '.');
      const parts = normalizedTheta0.split(' ').filter(Boolean);
      if (parts.length >= 3) {
        theta0Result = {
          horas: parseInt(parts[0], 10),
          minutos: parseInt(parts[1], 10),
          segundos: parseFloat(parts[2]),
          raw: theta0Manual
        };
      } else {
        // Si no tiene 3 partes, lo tomamos como valor crudo
        theta0Result = { raw: theta0Manual, horas: 0, minutos: 0, segundos: 0 };
      }
    }
    setResultadoTheta0(theta0Result);

    // AUTO-GUARDADO: Guardar este valor en la base de datos para el futuro
    if (theta0Manual && fecha) {
      saveData([{
        Fecha: fecha,
        'T. Sidéreo Aparente': theta0Manual,
        Observaciones: 'Guardado desde Calculadora'
      }]);
    }

    let h = parseInt(hora || 0, 10);
    let m = parseInt(minuto || 0, 10);
    let s = parseFloat(segundo || 0);

    // Fórmula: TU = Hora Legal - Diferencia Local
    let h_tu_raw = h - diferenciaLocal;
    let h_tu = h_tu_raw;

    // Ajuste de formato 24 horas
    let diaExtra = 0;
    if (h_tu >= 24) {
      h_tu = h_tu - 24;
      diaExtra = 1;
    } else if (h_tu < 0) {
      h_tu = h_tu + 24;
      diaExtra = -1;
    }

    setResultadoTU({
      horas: h_tu,
      horasRaw: h_tu_raw,
      minutos: m,
      segundos: s,
      diaExtra: diaExtra
    });

    // Calcular IS (Intervalo Sidéreo)
    let tu_decimal = h_tu + (m / 60) + (s / 3600);
    let is_decimal = tu_decimal * 1.0027379;

    let is_h = Math.floor(is_decimal);
    let is_m_dec = (is_decimal - is_h) * 60;
    let is_m = Math.floor(is_m_dec);
    let is_s = (is_m_dec - is_m) * 60;

    let is_diaExtra = diaExtra;
    if (is_h >= 24) {
      is_h = is_h - 24;
      is_diaExtra += 1;
    }

    setResultadoIS({
      horas: is_h,
      minutos: is_m,
      segundos: is_s,
      diaExtra: is_diaExtra
    });

    // Convertir Longitud DMS a Decimal (el signo lo da lonDeg)
    let lonDecimal = 0;
    if (lonDeg) {
      const d = parseFloat(lonDeg || 0);
      const m = parseFloat(lonMin || 0);
      const s = parseFloat(lonSec || 0);
      lonDecimal = (Math.abs(d) + (m / 60) + (s / 3600)) * (d < 0 ? -1 : 1);
    }

    // Calcular Lambda (Longitud en Tiempo)
    let lambda_decimal = 0;
    let lambda_h = 0, lambda_m = 0, lambda_s = 0;
    if (lonDeg) {
      lambda_decimal = lonDecimal / 15;
      
      let abs_lambda = Math.abs(lambda_decimal);
      lambda_h = Math.floor(abs_lambda);
      let rem_m = (abs_lambda - lambda_h) * 60;
      lambda_m = Math.floor(rem_m);
      lambda_s = (rem_m - lambda_m) * 60;
      
      setResultadoLambda({
        horas: lambda_h,
        minutos: lambda_m,
        segundos: lambda_s,
        decimal: lambda_decimal
      });
    }

    // Calcular Theta G (Theta 0 + IS)
    let thetaG_h = 0, thetaG_m = 0, thetaG_s = 0;
    let total_thetaG_decimal = 0;
    if (theta0Result) {
      let theta0_decimal = theta0Result.horas + (theta0Result.minutos / 60) + (theta0Result.segundos / 3600);
      total_thetaG_decimal = theta0_decimal + is_decimal;
      while (total_thetaG_decimal >= 24) total_thetaG_decimal -= 24;
      while (total_thetaG_decimal < 0) total_thetaG_decimal += 24;

      thetaG_h = Math.floor(total_thetaG_decimal);
      let rem_m = (total_thetaG_decimal - thetaG_h) * 60;
      thetaG_m = Math.floor(rem_m);
      thetaG_s = (rem_m - thetaG_m) * 60;

      setResultadoThetaG({
        horas: thetaG_h,
        minutos: thetaG_m,
        segundos: thetaG_s,
        decimal: total_thetaG_decimal
      });
    }

    // Calcular Theta L (TSL) = Theta G + Lambda
    if (theta0Result && lonDeg) {
      let total_thetaL_decimal = total_thetaG_decimal + lambda_decimal;
      while (total_thetaL_decimal >= 24) total_thetaL_decimal -= 24;
      while (total_thetaL_decimal < 0) total_thetaL_decimal += 24;

      let thetaL_h = Math.floor(total_thetaL_decimal);
      let rem_m = (total_thetaL_decimal - thetaL_h) * 60;
      let thetaL_m = Math.floor(rem_m);
      let thetaL_s = (rem_m - thetaL_m) * 60;

      setResultadoThetaL({
        horas: thetaL_h,
        minutos: thetaL_m,
        segundos: thetaL_s,
        decimal: total_thetaL_decimal
      });

      // Guardar desarrollo completo
      setDesarrollo({
        horaLegal: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`,
        dl: diferenciaLocal,
        tuResult: `${String(h_tu).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s.toFixed(2)).padStart(5, '0')}`,
        tuDecimal: tu_decimal.toFixed(6),
        isDecimal: is_decimal.toFixed(6),
        isResult: `${String(is_h).padStart(2, '0')}:${String(is_m).padStart(2, '0')}:${String(is_s.toFixed(6)).padStart(9, '0')}`,
        constante: 1.0027379,
        theta0: theta0Result ? theta0Result.raw : 'No encontrado',
        thetaGResult: `${String(thetaG_h).padStart(2, '0')}:${String(thetaG_m).padStart(2, '0')}:${String(thetaG_s.toFixed(6)).padStart(9, '0')}`,
        longitud: `${lonDeg}° ${lonMin}' ${lonSec}'' (${lonDecimal.toFixed(6)}°)`,
        lambdaDecimal: lambda_decimal.toFixed(8),
        lambdaResult: `${lambda_decimal < 0 ? '-' : ''}${String(lambda_h).padStart(2, '0')}:${String(lambda_m).padStart(2, '0')}:${String(lambda_s.toFixed(6)).padStart(9, '0')}`,
        thetaLResult: `${String(thetaL_h).padStart(2, '0')}:${String(thetaL_m).padStart(2, '0')}:${String(thetaL_s.toFixed(6)).padStart(9, '0')}`
      });
    }
  };

  const ejecutarCalculo = () => {
    if (calculoMode === 'legalToTsl') {
      calcularTU();
    } else {
      calcularDesdeTSL();
    }
  };

  const calcularDesdeTSL = () => {
    if (!tslHora || !theta0Manual || !lonDeg) {
      alert('Por favor, completa TSL, Theta 0 y Longitud');
      return;
    }

    // 1. Longitud DMS a Decimal y Lambda
    const d = parseFloat(lonDeg || 0);
    const m_lon = parseFloat(lonMin || 0);
    const s_lon = parseFloat(lonSec || 0);
    const lonDecimal = (Math.abs(d) + (m_lon / 60) + (s_lon / 3600)) * (d < 0 ? -1 : 1);
    const lambda_decimal = lonDecimal / 15;

    // 2. TSL a Decimal
    const tsl_decimal = parseInt(tslHora) + (parseInt(tslMinuto || 0) / 60) + (parseFloat(tslSegundo || 0) / 3600);

    // 3. Theta G = TSL - Lambda
    let tg_decimal = tsl_decimal - lambda_decimal;
    while (tg_decimal < 0) tg_decimal += 24;
    while (tg_decimal >= 24) tg_decimal -= 24;

    // 4. IS = Theta G - Theta 0
    const normalizedTheta0 = theta0Manual.replace(',', '.');
    const p0 = normalizedTheta0.split(' ').filter(Boolean);
    const t0_decimal = parseInt(p0[0]) + (parseInt(p0[1] || 0) / 60) + (parseFloat(p0[2] || 0) / 3600);

    let is_decimal = tg_decimal - t0_decimal;
    while (is_decimal < 0) is_decimal += 24;
    while (is_decimal >= 24) is_decimal -= 24;

    // 5. TU = IS / 1.0027379
    const tu_decimal = is_decimal / 1.0027379;
    
    // 6. Hora Legal = TU + DL (-3)
    let hl_decimal = tu_decimal + diferenciaLocal;
    let diaExtra = 0;
    while (hl_decimal < 0) { hl_decimal += 24; diaExtra -= 1; }
    while (hl_decimal >= 24) { hl_decimal -= 24; diaExtra += 1; }

    // Formatear resultados
    const formatTime = (dec) => {
      const h = Math.floor(dec);
      const m = Math.floor((dec - h) * 60);
      const s = ((dec - h) * 60 - m) * 60;
      return { h, m, s };
    };

    const resHL = formatTime(hl_decimal);
    const resIS = formatTime(is_decimal);
    const resTG = formatTime(tg_decimal);
    const resTU = formatTime(tu_decimal);
    const resLambda = formatTime(Math.abs(lambda_decimal));

    setResultadoFinalLegal({ ...resHL, diaExtra });
    setResultadoTU({ horas: resTU.h, minutos: resTU.m, segundos: resTU.s, diaExtra: 0, horasRaw: tu_decimal });
    setResultadoISInverse(resIS);
    setResultadoThetaG({ horas: resTG.h, minutos: resTG.m, segundos: resTG.s });

    setDesarrollo({
      mode: 'tslToLegal',
      tsl: `${tslHora}:${tslMinuto}:${tslSegundo}`,
      lambdaResult: `${lambda_decimal < 0 ? '-' : ''}${String(resLambda.h).padStart(2, '0')}:${String(resLambda.m).padStart(2, '0')}:${String(resLambda.s.toFixed(6)).padStart(9, '0')}`,
      thetaGResult: `${String(resTG.h).padStart(2, '0')}:${String(resTG.m).padStart(2, '0')}:${String(resTG.s.toFixed(6)).padStart(9, '0')}`,
      theta0: theta0Manual,
      isResult: `${String(resIS.h).padStart(2, '0')}:${String(resIS.m).padStart(2, '0')}:${String(resIS.s.toFixed(6)).padStart(9, '0')}`,
      tuResult: `${String(resTU.h).padStart(2, '0')}:${String(resTU.m).padStart(2, '0')}:${String(resTU.s.toFixed(6)).padStart(9, '0')}`,
      hlResult: `${String(resHL.h).padStart(2, '0')}:${String(resHL.m).padStart(2, '0')}:${String(resHL.s.toFixed(2)).padStart(5, '0')}`,
      dl: diferenciaLocal
    });
  };

  return (
    <div className="inicio-container" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Calculadora Astronómica</h1>
        <p>Selecciona el tipo de cálculo que deseas realizar.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
            <label>Categoría</label>
            <select 
              className="form-input" 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="tiempo_sidereo">Tiempo Sidéreo</option>
              <option value="efemerides_sol">Efemérides del Sol</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
            <label>Cálculo a realizar</label>
            <select 
              className="form-input" 
              value={calculo} 
              onChange={(e) => setCalculo(e.target.value)}
              style={{ width: '100%' }}
            >
              {categoria === 'tiempo_sidereo' ? (
                <option value="tu">Tiempo Universal (TU)</option>
              ) : (
                <>
                  <option value="posicion_solar">Posición Solar (α, δ, E)</option>
                  <option value="hora_solar">Hora Solar Verdadera</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {categoria === 'tiempo_sidereo' && calculo === 'tu' && (
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, pointerEvents: 'none' }}>
            <Clock size={200} />
          </div>
          
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={24} color="var(--primary-color)" />
            Cálculo de Tiempo Universal (TU) e IS
          </h2>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Calcula automáticamente el TU, el Intervalo Sidéreo (IS) y busca <strong style={{ color: 'var(--primary-color)' }}>Θ₀ (Theta 0)</strong> en tu base de datos para la fecha seleccionada.
            <br/>
            <strong>Diferencia Local configurada:</strong> {diferenciaLocal} (Argentina)
          </p>

          {/* SELECTOR DE MODO MUY VISIBLE */}
          <div style={{ marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>TIPO DE CÁLCULO:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setCalculoMode('legalToTsl')}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: calculoMode === 'legalToTsl' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                  color: calculoMode === 'legalToTsl' ? 'white' : 'var(--text-muted)',
                  fontWeight: '600',
                  border: '1px solid ' + (calculoMode === 'legalToTsl' ? 'var(--primary-color)' : 'var(--glass-border)')
                }}
              >
                1. Hora Legal ⮕ TSL
              </button>
              <button 
                type="button"
                onClick={() => setCalculoMode('tslToLegal')}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: calculoMode === 'tslToLegal' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                  color: calculoMode === 'tslToLegal' ? 'white' : 'var(--text-muted)',
                  fontWeight: '600',
                  border: '1px solid ' + (calculoMode === 'tslToLegal' ? 'var(--primary-color)' : 'var(--glass-border)')
                }}
              >
                2. TSL ⮕ Hora Legal
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ejecutarCalculo(); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Box Fecha y Theta 0 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>1. Datos de Referencia</h3>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Valor de Θ₀ (Theta 0) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej: 15 30 12.456789"
                    value={theta0Manual}
                    onChange={(e) => setTheta0Manual(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Formato: HH MM SS.ssssss</span>
                </div>
              </div>

              {/* Box Latitud y Longitud DMS */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>2. Ubicación Geográfica (GMS)</h3>
                
                {/* Latitud */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'block', marginBottom: '0.5rem' }}>Latitud (Signo (-) para Sur)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input type="number" step="any" className="form-input" placeholder="Grados" value={latDeg} onChange={(e) => setLatDeg(e.target.value)} style={{ width: '100px' }} />
                    <span style={{ fontSize: '1.2rem' }}>°</span>
                    <input type="number" step="any" className="form-input" placeholder="Min" value={latMin} onChange={(e) => setLatMin(e.target.value)} style={{ width: '100px' }} />
                    <span style={{ fontSize: '1.2rem' }}>'</span>
                    <input type="number" step="any" className="form-input" placeholder="Seg" value={latSec} onChange={(e) => setLatSec(e.target.value)} style={{ width: '120px' }} />
                    <span style={{ fontSize: '1.2rem' }}>''</span>
                  </div>
                </div>

                {/* Longitud */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'block', marginBottom: '0.5rem' }}>Longitud (Signo (-) para Oeste)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input type="number" step="any" className="form-input" placeholder="Grados" value={lonDeg} onChange={(e) => setLonDeg(e.target.value)} style={{ width: '100px' }} />
                    <span style={{ fontSize: '1.2rem' }}>°</span>
                    <input type="number" step="any" className="form-input" placeholder="Min" value={lonMin} onChange={(e) => setLonMin(e.target.value)} style={{ width: '100px' }} />
                    <span style={{ fontSize: '1.2rem' }}>'</span>
                    <input type="number" step="any" className="form-input" placeholder="Seg" value={lonSec} onChange={(e) => setLonSec(e.target.value)} style={{ width: '120px' }} />
                    <span style={{ fontSize: '1.2rem' }}>''</span>
                  </div>
                </div>
              </div>

              {/* Box Hora Dinámica */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  {calculoMode === 'legalToTsl' ? '3. Ingresar Hora Legal' : '3. Ingresar Tiempo Sidéreo (TSL)'}
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>h</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="23" 
                      value={calculoMode === 'legalToTsl' ? hora : tslHora} 
                      onChange={(e) => calculoMode === 'legalToTsl' ? setHora(e.target.value) : setTslHora(e.target.value)} 
                      style={{ width: '70px', textAlign: 'center' }}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>m</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="59" 
                      value={calculoMode === 'legalToTsl' ? minuto : tslMinuto} 
                      onChange={(e) => calculoMode === 'legalToTsl' ? setMinuto(e.target.value) : setTslMinuto(e.target.value)} 
                      style={{ width: '70px', textAlign: 'center' }}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>s</label>
                    <input 
                      type="number" 
                      step="any" 
                      className="form-input" 
                      min="0" max="59.999999" 
                      value={calculoMode === 'legalToTsl' ? segundo : tslSegundo} 
                      onChange={(e) => calculoMode === 'legalToTsl' ? setSegundo(e.target.value) : setTslSegundo(e.target.value)} 
                      style={{ width: '120px', textAlign: 'center' }}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                  Calcular {calculoMode === 'legalToTsl' ? 'TSL' : 'Hora Legal'} <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
              {resultadoTU !== null ? (
                <>
                  {/* Resultado Theta 0 */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      Θ₀ (Theta 0) - Tiempo Sidéreo en Greenwich
                    </h3>
                    {resultadoTheta0 ? (
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                        {String(resultadoTheta0.horas).padStart(2, '0')}:
                        {String(resultadoTheta0.minutos).padStart(2, '0')}:
                        {String(resultadoTheta0.segundos.toFixed(6)).padStart(9, '0')}
                      </div>
                    ) : (
                      <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Por favor, ingresa un valor de Theta 0 arriba.
                      </div>
                    )}
                  </div>

                  {/* Resultado TU */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      Tiempo Universal (TU)
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)', textShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
                      {String(resultadoTU.horas).padStart(2, '0')}:
                      {String(resultadoTU.minutos).padStart(2, '0')}:
                      {String(resultadoTU.segundos.toFixed(4)).padStart(7, '0')}
                    </div>
                    {resultadoTU.diaExtra !== 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          (Valor original: {String(resultadoTU.horasRaw).padStart(2, '0')}:{String(resultadoTU.minutos).padStart(2, '0')}:{String(resultadoTU.segundos.toFixed(2)).padStart(5, '0')})
                        </span>
                        <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {resultadoTU.diaExtra > 0 ? '⚠️ +1 Día' : '⚠️ -1 Día'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Resultado IS */}
                  {resultadoIS !== null && (
                    <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(236, 72, 153, 0.3)', textAlign: 'center' }}>
                      <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        Intervalo Sidéreo (IS)
                      </h3>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)', textShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}>
                        {String(resultadoIS.horas).padStart(2, '0')}:
                        {String(resultadoIS.minutos).padStart(2, '0')}:
                        {String(resultadoIS.segundos.toFixed(6)).padStart(9, '0')}
                      </div>
                    </div>
                  )}

                  {/* Resultado Theta G */}
                  {resultadoThetaG !== null && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center' }}>
                      <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        ΘG (Sidéreo en Greenwich)
                      </h3>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', textShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
                        {String(resultadoThetaG.horas).padStart(2, '0')}:
                        {String(resultadoThetaG.minutos).padStart(2, '0')}:
                        {String(resultadoThetaG.segundos.toFixed(6)).padStart(9, '0')}
                      </div>
                    </div>
                  )}

                  {/* Resultado Theta L */}
                  {resultadoThetaL !== null && (
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center' }}>
                      <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        ΘL (Sidéreo Local / TSL)
                      </h3>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa', textShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
                        {String(resultadoThetaL.horas).padStart(2, '0')}:
                        {String(resultadoThetaL.minutos).padStart(2, '0')}:
                        {String(resultadoThetaL.segundos.toFixed(6)).padStart(9, '0')}
                      </div>
                    </div>
                  )}
                  {/* Resultados para Modo TSL -> Legal (INVERSO) */}
                  {calculoMode === 'tslToLegal' && resultadoFinalLegal && (
                    <>
                      {/* 1. Theta 0 */}
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          Theta 0 (TS 0hs G)
                        </h3>
                        <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#10b981' }}>
                          {theta0Manual}
                        </div>
                      </div>

                      {/* 2. Theta G */}
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          Theta G (TSG)
                        </h3>
                        <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#f59e0b' }}>
                          {String(resultadoThetaG.horas).padStart(2, '0')}:
                          {String(resultadoThetaG.minutos).padStart(2, '0')}:
                          {String(resultadoThetaG.segundos.toFixed(6)).padStart(9, '0')}
                        </div>
                      </div>

                      {/* 3. IS (Intervalo Sidéreo) */}
                      <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(236, 72, 153, 0.3)', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          IS (Intervalo Sidéreo)
                        </h3>
                        <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ec4899' }}>
                          {String(resultadoISInverse.h).padStart(2, '0')}:
                          {String(resultadoISInverse.m).padStart(2, '0')}:
                          {String(resultadoISInverse.s.toFixed(6)).padStart(9, '0')}
                        </div>
                      </div>

                      {/* 4. TU (Tiempo Universal) */}
                      <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          TU (Tiempo Universal)
                        </h3>
                        <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#6366f1' }}>
                          {String(resultadoTU.horas).padStart(2, '0')}:
                          {String(resultadoTU.minutos).padStart(2, '0')}:
                          {String(resultadoTU.segundos.toFixed(6)).padStart(9, '0')}
                        </div>
                      </div>

                      {/* 5. HOA / Hora Legal Resultante */}
                      <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid #10b981', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                          HOA / Hora Legal Resultante
                        </h3>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#10b981', textShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
                          {String(resultadoFinalLegal.h).padStart(2, '0')}:
                          {String(resultadoFinalLegal.m).padStart(2, '0')}:
                          {String(resultadoFinalLegal.s.toFixed(2)).padStart(5, '0')}
                        </div>
                        {resultadoFinalLegal.diaExtra !== 0 && (
                          <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            {resultadoFinalLegal.diaExtra > 0 ? '⚠️ +1 Día' : '⚠️ -1 Día'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Ingresa los datos y presiona Calcular para ver los resultados aquí.</p>
                </div>
              )}
            </div>

          </form>
        </div>
      )}

      {categoria === 'tiempo_sidereo' && calculo === 'tu' && desarrollo && (
        <div className="glass-panel" style={{ marginTop: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
            <Clock size={20} />
            Desarrollo del Cálculo ({calculoMode === 'legalToTsl' ? 'Directo' : 'Inverso'})
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {calculoMode === 'legalToTsl' ? (
              // Desarrollo Directo Completo
              <>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>1. TIEMPO UNIVERSAL (TU)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    TU = Hora Legal - Diferencia Local<br/>
                    TU = {desarrollo.horaLegal} - ({desarrollo.dl})<br/>
                    <strong style={{ color: 'var(--text-main)' }}>TU Final = {desarrollo.tuResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>2. INTERVALO SIDÉREO (IS)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    IS = TU (decimal) × {desarrollo.constante}<br/>
                    IS = {desarrollo.tuDecimal} × {desarrollo.constante}<br/>
                    <strong style={{ color: 'var(--text-main)' }}>IS = {desarrollo.isResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>3. VALOR DE Θ₀ UTILIZADO</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    Fecha: {fecha}<br/>
                    <strong style={{ color: '#10b981' }}>Θ₀ = {desarrollo.theta0}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <h4 style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.9rem' }}>4. TIEMPO SIDÉREO GREENWICH (ΘG)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    ΘG = Θ₀ + IS<br/>
                    ΘG = {desarrollo.theta0} + {desarrollo.isResult}<br/>
                    <strong style={{ color: '#f59e0b' }}>ΘG = {desarrollo.thetaGResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <h4 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '0.9rem' }}>5. LONGITUD EN TIEMPO (λ)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    λ = Longitud / 15<br/>
                    λ = {desarrollo.longitud} / 15<br/>
                    <strong style={{ color: '#a78bfa' }}>λ = {desarrollo.lambdaResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <h4 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '0.9rem' }}>6. TIEMPO SIDÉREO LOCAL (ΘL)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    ΘL = ΘG + λ<br/>
                    ΘL = {desarrollo.thetaGResult} + ({desarrollo.lambdaResult})<br/>
                    <strong style={{ color: '#a78bfa' }}>ΘL = {desarrollo.thetaLResult}</strong>
                  </p>
                </div>
              </>
            ) : (
              // Desarrollo Inverso (Nuevo)
              <>
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <h4 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '0.9rem' }}>1. LONGITUD EN TIEMPO (λ)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    λ = Longitud / 15<br/>
                    <strong style={{ color: '#a78bfa' }}>λ = {desarrollo.lambdaResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <h4 style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.9rem' }}>2. TIEMPO SIDÉREO GREENWICH (ΘG)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    ΘG = ΘL - λ<br/>
                    ΘG = {desarrollo.tsl} - ({desarrollo.lambdaResult})<br/>
                    <strong style={{ color: '#f59e0b' }}>ΘG = {desarrollo.thetaGResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>3. INTERVALO SIDÉREO (IS)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    IS = ΘG - Θ₀<br/>
                    IS = {desarrollo.thetaGResult} - {desarrollo.theta0}<br/>
                    <strong style={{ color: 'var(--text-main)' }}>IS = {desarrollo.isResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>4. TIEMPO UNIVERSAL (TU)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    TU = IS / 1.0027379<br/>
                    <strong style={{ color: 'var(--text-main)' }}>TU = {desarrollo.tuResult}</strong>
                  </p>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.9rem' }}>5. HORA LEGAL (HL)</h4>
                  <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    HL = TU + DL (-3h)<br/>
                    <strong style={{ color: '#10b981' }}>Hora Legal = {desarrollo.hlResult}</strong>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN DE EJEMPLOS PRÁCTICOS */}
      <div className="glass-panel" style={{ marginTop: '3rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed rgba(99, 102, 241, 0.3)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
          <FileText size={20} />
          Guía de Ejemplos: Casos Prácticos
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Ejemplo 1 */}
          <div style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              "1. ¿Cuál es el TSL para las 18:29 en (-34°53', -67°48') el 25 de octubre?"
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <strong>Modo:</strong> Hora Legal a TSL<br/>
              <strong>Se busca:</strong> TU, IS, Θ₀, ΘG, ΘL
            </div>
          </div>

          {/* Ejemplo 2 */}
          <div style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              "2. ¿Cuál fue la hora legal en (-32º, -66º) el 1 de agosto si el TSL fue de 22:35?"
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <strong>Modo:</strong> TSL a Hora Legal<br/>
              <strong>Se busca:</strong> ΘG, IS, TU, Hora Legal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
