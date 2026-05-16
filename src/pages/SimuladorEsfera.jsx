import React, { useState, useEffect } from 'react';
import { Sun, Star, MapPin, Compass, Move, Info, HelpCircle, ChevronRight, Calculator, Zap } from 'lucide-react';

export default function SimuladorEsfera() {
  // Inputs del usuario
  const [phi, setPhi] = useState(35); // Latitud (valor absoluto)
  const [hemisferio, setHemisferio] = useState('S'); // 'N' o 'S'
  const [tsl, setTsl] = useState(10); // Tiempo Sidéreo Local (hs)
  const [hAngle, setHAngle] = useState(2); // Ángulo Horario (hs)
  const [delta, setDelta] = useState(-35); // Declinación
  
  // Coordenadas Manuales (Almacenadas en decimal para cálculos, pero ingresadas en GMS)
  const [azManual, setAzManual] = useState(45); 
  const [hManual, setHManual] = useState(30);   
  const [hManualEq, setHManualEq] = useState(3); // Horas
  const [deltaManualEq, setDeltaManualEq] = useState(40); 
  const [useManual, setUseManual] = useState(false); // Switch entre calc. automática o manual
  const [sistemaModo, setSistemaModo] = useState('HORIZONTAL'); // 'HORIZONTAL' o 'ECUATORIAL'
  
  // Latitud efectiva para cálculos
  const phiEfectiva = hemisferio === 'N' ? Math.abs(phi) : -Math.abs(phi);
  
  // Elementos visuales opcionales
  const [showVertical, setShowVertical] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  // Estado para la rotación de la vista
  const [viewRot, setViewRot] = useState(270);
  const [viewTilt, setViewTilt] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Cambiar orientación según el hemisferio
  useEffect(() => {
    if (hemisferio === 'N') setViewRot(270);
    else setViewRot(90);
  }, [hemisferio]);

  // Formateadores
  const formatDMS = (dec) => {
    const abs = Math.abs(dec);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = ((abs - d) * 60 - m) * 60;
    return `${dec < 0 ? '-' : ''}${d}° ${m}' ${s.toFixed(2)}''`;
  };

  // Helper para convertir GMS a Decimal
  const gmsToDec = (g, m, s) => {
    const sign = g < 0 ? -1 : 1;
    return (Math.abs(g) + m / 60 + s / 3600) * sign;
  };

  // Helper para desglosar decimal a objeto GMS
  const decToGMS = (dec) => {
    const abs = Math.abs(dec);
    const g = Math.floor(abs);
    const m = Math.floor((abs - g) * 60);
    const s = Math.round(((abs - g) * 60 - m) * 60);
    return { g: g * (dec < 0 ? -1 : 1), m, s };
  };

  // Componente de Input Sexagesimal
  const SexagesimalInput = ({ label, value, onChange, isHours = false }) => {
    const gms = decToGMS(value);
    const update = (field, val) => {
      const newGms = { ...gms, [field]: parseFloat(val) || 0 };
      onChange(gmsToDec(newGms.g, newGms.m, newGms.s));
    };

    return (
      <div className="form-group" style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '0.75rem', opacity: 0.8, color: 'var(--primary-color)', fontWeight: 'bold' }}>{label}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          <div style={{ position: 'relative' }}>
            <input type="number" className="form-input" value={gms.g} onChange={e => update('g', e.target.value)} style={{ paddingRight: '15px' }} />
            <span style={{ position: 'absolute', right: '5px', top: '8px', fontSize: '0.7rem', opacity: 0.5 }}>{isHours ? 'h' : '°'}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="number" className="form-input" value={gms.m} onChange={e => update('m', e.target.value)} style={{ paddingRight: '15px' }} />
            <span style={{ position: 'absolute', right: '5px', top: '8px', fontSize: '0.7rem', opacity: 0.5 }}>m</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="number" className="form-input" value={gms.s} onChange={e => update('s', e.target.value)} style={{ paddingRight: '15px' }} />
            <span style={{ position: 'absolute', right: '5px', top: '8px', fontSize: '0.7rem', opacity: 0.5 }}>s</span>
          </div>
        </div>
      </div>
    );
  };

  const formatHMS = (decimal) => {
    let abs = Math.abs(decimal);
    while (abs >= 24) abs -= 24;
    while (abs < 0) abs += 24;
    const h = Math.floor(abs);
    const m = Math.floor((abs - h) * 60);
    const s = ((abs - h) * 60 - m) * 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s.toFixed(2)).padStart(5, '0')}s`;
  };

  // Cálculos derivados
  const alpha = (tsl - hAngle + 24) % 24; 

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const hRad = toRad(hAngle * 15);
  const phiRad = toRad(phi);
  const deltaRad = toRad(delta);

  // sen h = sen phi * sen delta + cos phi * cos delta * cos H
  const sinPhi = Math.sin(toRad(phiEfectiva));
  const sinDelta = Math.sin(toRad(delta));
  const cosPhi = Math.cos(toRad(phiEfectiva));
  const cosDelta = Math.cos(toRad(delta));
  const cosH = Math.cos(toRad(hAngle * 15));

  const term1 = sinPhi * sinDelta;
  const term2 = cosPhi * cosDelta * cosH;
  const sinH = term1 + term2;
  const hAstroRad = Math.asin(Math.max(-1, Math.min(1, sinH)));
  const hAstroDeg = toDeg(hAstroRad);

  // cos Az = (sen delta - sen phi * sen h) / (cos phi * cos h)
  const numAz = sinDelta - (sinPhi * sinH);
  const denAz = cosPhi * Math.cos(hAstroRad);
  const cosAzValue = numAz / denAz;
  const azRad = Math.acos(Math.max(-1, Math.min(1, cosAzValue)));
  let azDeg = toDeg(azRad);
  if (Math.sin(hRad) < 0) azDeg = 360 - azDeg;

  // Configuración del gráfico SVG
  const size = 500;
  const center = size / 2;
  const radius = 180;

  const project = (lat, lon) => {
    const latR = toRad(lat);
    const lonR = toRad(lon);
    
    // Coordenadas 3D básicas
    const x = radius * Math.cos(latR) * Math.sin(lonR);
    const y = -radius * Math.sin(latR); 
    const z = radius * Math.cos(latR) * Math.cos(lonR);
    
    // Aplicar rotación de vista (Movable)
    const tiltR = toRad(viewTilt);
    const rotR = toRad(viewRot);
    
    // Rotación sobre el eje Y (giro lateral)
    const x1 = x * Math.cos(rotR) - z * Math.sin(rotR);
    const z1 = x * Math.sin(rotR) + z * Math.cos(rotR);
    
    // Rotación sobre el eje X (inclinación vertical)
    const y2 = y * Math.cos(tiltR) - z1 * Math.sin(tiltR);
    const z2 = y * Math.sin(tiltR) + z1 * Math.cos(tiltR);
    
    return { x: center + x1, y: center + y2, z: z2 };
  };

  // Manejadores de arrastre
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    setViewRot(prev => prev + dx * 0.5);
    setViewTilt(prev => Math.max(-90, Math.min(90, prev + dy * 0.5)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Función para convertir coordenadas ecuatoriales (dec, H) a locales (h, Az)
  const eqToLocal = (decVal, hVal) => {
    const dR = toRad(decVal);
    const HR = toRad(hVal);
    const phiR = toRad(phiEfectiva);

    // sen h = sen phi sen delta + cos phi cos delta cos H
    const sH = Math.sin(phiR) * Math.sin(dR) + Math.cos(phiR) * Math.cos(dR) * Math.cos(HR);
    const hR = Math.asin(Math.max(-1, Math.min(1, sH)));
    
    // Fórmulas para Azimut desde el Norte (0°)
    const numAz = -Math.cos(dR) * Math.sin(HR);
    const denAz = (Math.sin(dR) - Math.sin(phiR) * sH) / (Math.cos(phiR) * Math.cos(hR));
    
    // Usamos atan2 para mayor robustez
    const cosAz = (Math.sin(dR) * Math.cos(phiR) - Math.cos(dR) * Math.sin(phiR) * Math.cos(HR)) / Math.cos(hR);
    const sinAz = (Math.cos(dR) * Math.sin(HR)) / Math.cos(hR);
    
    let azR = Math.atan2(sinAz, cosAz);
    let azD = toDeg(azR);
    if (azD < 0) azD += 360;
    // Corregimos la rotación para que coincida con el gráfico (N=0, E=90)
    azD = (360 - azD) % 360; 

    return { h: toDeg(hR), az: azD };
  };

  const Z = project(90, 0); 
  const Na = project(-90, 0); 
  const N = project(0, 0); 
  const S = project(0, 180); 
  const E = project(0, 90); 
  const W = project(0, 270); 
  const PNC = project(phiEfectiva, 0); 
  const PSC = project(phiEfectiva - 180, 0); 

  // Función para determinar si un punto proyectado está al frente (z > 0)
  const isFront = (lat, lon) => {
    const latR = toRad(lat);
    const lonR = toRad(lon);
    const x = radius * Math.cos(latR) * Math.sin(lonR);
    const z = radius * Math.cos(latR) * Math.cos(lonR);
    const rotR = toRad(viewRot);
    const z1 = x * Math.sin(rotR) + z * Math.cos(rotR);
    return z1 > -10; // Un pequeño margen para visibilidad
  };

  // Cálculo de Estrella según el modo
  let hDeg_final, azDeg_final;

  if (useManual) {
    if (sistemaModo === 'HORIZONTAL') {
      azDeg_final = (180 + azManual) % 360;
      hDeg_final = hManual;
    } else {
      // Ecuatorial Horario: H y delta
      // Convertimos H (horas) y Delta a (h, Az) locales
      const loc = eqToLocal(deltaManualEq, hManualEq * 15);
      hDeg_final = loc.h;
      azDeg_final = loc.az;
    }
  } else {
    hDeg_final = hAstroDeg;
    azDeg_final = azDeg;
  }

  const zDist_final = 90 - hDeg_final;
  const deltaDist_final = 90 - (useManual && sistemaModo === 'ECUATORIAL' ? deltaManualEq : delta);

  const Estrella = project(hDeg_final, azDeg_final);
  const estrellaVisible = isFront(hDeg_final, azDeg_final);
  const P_horiz = project(0, azDeg_final);

  // Punto en el ecuador (pie del meridiano del astro)
  const locEqFoot = eqToLocal(0, useManual && sistemaModo === 'ECUATORIAL' ? hManualEq * 15 : hAngle * 15);
  const P_ecuador = project(locEqFoot.h, locEqFoot.az);

  // Medio Cielo Superior (MCs) - Intersección de meridiano y ecuador con h máxima
  // Para H=0
  const locMCs = eqToLocal(0, 0);
  const MCs = project(locMCs.h, locMCs.az);

  return (
    <div className="simulador-esfera-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--accent-color)', paddingBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Star size={32} color="var(--primary-color)" className="animate-pulse" /> Simulador de Esfera Celeste
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Representación gráfica y resolución detallada en GMS.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--primary-color)" /> Parámetros de la Estrella
          </h3>
          <div className="form-group">
            <label>Latitud del Observador (φ)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                className="form-input" 
                value={phi} 
                onChange={e => setPhi(parseFloat(e.target.value))} 
                style={{ flex: 2 }}
              />
              <select 
                className="form-input" 
                value={hemisferio} 
                onChange={e => setHemisferio(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="N">Norte</option>
                <option value="S">Sur</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={useManual} onChange={e => setUseManual(e.target.checked)} id="manualMode" />
            <label htmlFor="manualMode" style={{ fontWeight: 'bold', color: 'var(--primary-color)', cursor: 'pointer' }}>Ingreso Manual (Coordenadas Locales)</label>
          </div>

          {useManual ? (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Sistema de Coordenadas</label>
                <select className="form-input" value={sistemaModo} onChange={e => setSistemaModo(e.target.value)}>
                  <option value="HORIZONTAL">Horizontal (Az, h, z)</option>
                  <option value="ECUATORIAL">Ecuatorial Horaria (H, δ, Δ)</option>
                </select>
              </div>

              {sistemaModo === 'HORIZONTAL' ? (
                <>
                  <SexagesimalInput label="Azimut (Az) - Origen SUR [S-O-N-E]" value={azManual} onChange={setAzManual} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <SexagesimalInput label="Altura (h)" value={hManual} onChange={setHManual} />
                    <SexagesimalInput label="Zenital (z)" value={90 - hManual} onChange={(val) => setHManual(90 - val)} />
                  </div>
                </>
              ) : (
                <>
                  <SexagesimalInput label="Ángulo Horario (H)" value={hManualEq} onChange={setHManualEq} isHours={true} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <SexagesimalInput label="Declinación (δ)" value={deltaManualEq} onChange={setDeltaManualEq} />
                    <SexagesimalInput label="Polar (Δ)" value={90 - deltaManualEq} onChange={(val) => setDeltaManualEq(90 - val)} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>TSL (hs)</label>
                  <input type="number" className="form-input" value={tsl} onChange={e => setTsl(parseFloat(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Ang. Horario H (hs)</label>
                  <input type="number" className="form-input" value={hAngle} onChange={e => setHAngle(parseFloat(e.target.value))} />
                </div>
              </div>
              <div className="form-group">
                <label>Declinación (δ)</label>
                <input type="number" className="form-input" value={delta} onChange={e => setDelta(parseFloat(e.target.value))} />
              </div>
            </>
          )}
          
          <button 
            className="btn-primary" 
            style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', padding: '0.5rem' }}
            onClick={() => { setViewRot(hemisferio === 'N' ? 270 : 90); setViewTilt(10); }}
          >
            Resetear Vista de Perfil
          </button>

          <div className="form-group" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={showVertical} onChange={e => setShowVertical(e.target.checked)} />
              Mostrar Primer Vertical (Z-Na-E-W)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
              Mostrar Merid./Paral.
            </label>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
            <h4 style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} /> Desarrollo Matemático
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>1. Ascensión Recta (α):</p>
                <p style={{ fontFamily: 'monospace' }}>α = TSL - H = {tsl}h - {hAngle}h</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>α = {formatHMS(alpha)}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>2. Altura (h):</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>sen h = sen φ sen δ + cos φ cos δ cos H</p>
                <p style={{ fontFamily: 'monospace' }}>sen h = ({sinPhi.toFixed(4)})({sinDelta.toFixed(4)}) + ({cosPhi.toFixed(4)})({cosDelta.toFixed(4)})({cosH.toFixed(4)}) = {sinH.toFixed(6)}</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>h = {formatDMS(hAstroDeg)}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>3. Azimut (Az):</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>cos Az = (sen δ - sen φ sen h) / (cos φ cos h)</p>
                <p style={{ fontFamily: 'monospace' }}>cos Az = ({sinDelta.toFixed(4)} - {sinPhi.toFixed(4)}×{sinH.toFixed(4)}) / ({cosPhi.toFixed(4)}×{Math.cos(hAstroRad).toFixed(4)}) = {cosAzValue.toFixed(6)}</p>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Az = {formatDMS(azDeg)}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: 0, minHeight: '500px' }}>
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', textAlign: 'right', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)' }}>
               <p style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>SISTEMA LOCAL</p>
               <p style={{ fontSize: '1.1rem' }}>h: {formatDMS(hAstroDeg)}</p>
               <p style={{ fontSize: '1.1rem' }}>Az: {formatDMS(azDeg)}</p>
            </div>
          </div>

          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${size} ${size}`} 
            style={{ background: 'radial-gradient(circle at center, #1e1e2e 0%, #000 100%)', cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Definiciones de degradados */}
            <defs>
              <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>
            </defs>

            {/* Horizonte Shaded (Area inferior) */}
            <circle cx={center} cy={center} r={radius} fill="url(#sphereGrad)" />
            
            {/* Ejes Principales */}
            <line x1={Z.x} y1={Z.y} x2={Na.x} y2={Na.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={N.x} y1={N.y} x2={S.x} y2={S.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            <line x1={E.x} y1={E.y} x2={W.x} y2={W.y} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            
            {/* Ecuador Celeste (Geométricamente exacto: Pasa por E y W) */}
            {(() => {
              const eqFront = [];
              const eqBack = [];
              for (let i = 0; i <= 360; i += 5) {
                const loc = eqToLocal(0, i); 
                const p = project(loc.h, loc.az);
                if (isFront(loc.h, loc.az)) eqFront.push(`${p.x},${p.y}`);
                else eqBack.push(`${p.x},${p.y}`);
              }
              return (
                <g>
                  {/* Parte de atrás */}
                  <polyline points={eqBack.join(' ')} fill="none" stroke="var(--accent-color)" strokeWidth="1.5" strokeDasharray="3" opacity="0.3" />
                  {/* Parte de adelante */}
                  <polyline points={eqFront.join(' ')} fill="none" stroke="var(--accent-color)" strokeWidth="3" opacity="0.8" />
                  <text 
                    x={center + radius * 0.7} 
                    y={center - 30} 
                    fill="var(--accent-color)" 
                    fontSize="10" 
                    fontWeight="bold"
                    opacity="0.9"
                  >
                    ECUADOR CELESTE
                  </text>
                </g>
              );
            })()}

            {/* Textos de Puntos Cardinales */}
            <g opacity={isFront(90, 0) ? 1 : 0.4}>
              <circle cx={Z.x} cy={Z.y} r="3" fill="#fff" />
              <text x={Z.x} y={Z.y - 10} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Z (Zenit)</text>
            </g>
            <g opacity={isFront(-90, 0) ? 1 : 0.4}>
              <circle cx={Na.x} cy={Na.y} r="3" fill="#aaa" />
              <text x={Na.x} y={Na.y + 20} textAnchor="middle" fill="#aaa" fontSize="12">Na (Nadir)</text>
            </g>
            
            <g opacity={isFront(0, 0) ? 1 : 0.4}>
              <circle cx={N.x} cy={N.y} r="3" fill="#fff" />
              <text x={N.x + (N.x > center ? 15 : -15)} y={N.y + 5} textAnchor={N.x > center ? "start" : "end"} fill="#fff" fontSize="12" fontWeight="bold">N</text>
            </g>
            <g opacity={isFront(0, 180) ? 1 : 0.4}>
              <circle cx={S.x} cy={S.y} r="4" fill={useManual ? "#10b981" : "#fff"} />
              <text x={S.x + (S.x > center ? 15 : -15)} y={S.y + 5} textAnchor={S.x > center ? "start" : "end"} fill={useManual ? "#10b981" : "#fff"} fontSize={useManual ? "14" : "12"} fontWeight="bold">
                {useManual ? "S (0° Az)" : "S"}
              </text>
            </g>
            <g opacity={isFront(0, 90) ? 1 : 0.4}>
              <circle cx={E.x} cy={E.y} r="3" fill="#fff" />
              <text x={E.x + (E.x > center ? 10 : -10)} y={E.y} textAnchor={E.x > center ? "start" : "end"} fill="#fff" fontSize="11">E (270°)</text>
            </g>
            <g opacity={isFront(0, 270) ? 1 : 0.4}>
              <circle cx={W.x} cy={W.y} r="3" fill="#fff" />
              <text x={W.x + (W.x > center ? 10 : -10)} y={W.y} textAnchor={W.x > center ? "start" : "end"} fill="#fff" fontSize="11">O (90°)</text>
            </g>

            {/* Polos y Eje de Latitud (Se dibuja hacia el polo visible) */}
            <line 
              x1={PNC.x} 
              y1={PNC.y} 
              x2={PSC.x} 
              y2={PSC.y} 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1" 
              strokeDasharray="5"
            />
            <text x={center + (PNC.x-center)*0.5} y={center + (PNC.y-center)*0.5} fill="rgba(255,255,255,0.3)" fontSize="8" transform={`rotate(${toDeg(Math.atan2(PNC.y-center, PNC.x-center))}, ${center + (PNC.x-center)*0.5}, ${center + (PNC.y-center)*0.5})`}>EJE DEL MUNDO</text>

            <line 
              x1={center} 
              y1={center} 
              x2={phiEfectiva >= 0 ? PNC.x : PSC.x} 
              y2={phiEfectiva >= 0 ? PNC.y : PSC.y} 
              stroke="var(--primary-color)" 
              strokeWidth="3" 
              opacity="0.6" 
              strokeLinecap="round" 
            />
            <circle cx={PNC.x} cy={PNC.y} r="4" fill="#3b82f6" />
            <text x={PNC.x + 10} y={PNC.y} fill="#3b82f6" fontSize="11" fontWeight="bold">PNC</text>
            
            <circle cx={PSC.x} cy={PSC.y} r="4" fill="#ec4899" />
            <text x={PSC.x + 10} y={PSC.y} fill="#ec4899" fontSize="11" fontWeight="bold">PSC</text>
            
            <text x={center} y={center - radius - 20} textAnchor="middle" fill="var(--primary-color)" fontSize="12" fontWeight="bold">
              Latitud: {phi}° {hemisferio}
            </text>
            
            {/* Elementos Absolutos Eliminados por ahora */}

            {/* Grilla de Meridianos/Paralelos */}
            {showGrid && (
              <g opacity="0.1">
                {[ -60, -30, 0, 30, 60 ].map(lat => {
                  const points = [];
                  for(let lon=0; lon<=360; lon+=15) {
                    const p = project(lat, lon);
                    points.push(`${p.x},${p.y}`);
                  }
                  return <polyline key={lat} points={points.join(' ')} fill="none" stroke="#fff" strokeWidth="0.5" />;
                })}
              </g>
            )}

            {/* Circulo de Horizonte */}
            <ellipse cx={center} cy={center} rx={radius} ry={radius * 0.3} fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5" />
            <text x={center - radius * 0.8} y={center + 25} fill="#3b82f6" fontSize="10" fontWeight="bold" opacity="0.8">HORIZONTE</text>
            
            {/* Primer Vertical (Z-Na-E-W) */}
            {showVertical && (
              <g>
                {(() => {
                  const vertPoints = [];
                  // Azimuth 90 y 270 para el primer vertical
                  for (let h = -90; h <= 90; h += 10) {
                    const p = project(h, 90);
                    vertPoints.push(`${p.x},${p.y}`);
                  }
                  for (let h = 90; h >= -90; h -= 10) {
                    const p = project(h, 270);
                    vertPoints.push(`${p.x},${p.y}`);
                  }
                  return (
                    <>
                      <polyline points={vertPoints.join(' ')} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" opacity="0.4" />
                      <text x={center} y={center + radius * 0.4} fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle" opacity="0.7">PRIMER VERTICAL</text>
                    </>
                  );
                })()}
              </g>
            )}
            
            {/* Arcos de Coordenadas Locales (Visualización de Ejercicio) */}
            {useManual && sistemaModo === 'HORIZONTAL' && (
              <g opacity="0.8">
                {/* Arco de Azimut (Sur a P_horiz, sentido Horario S-O-N-E) */}
                {(() => {
                  const points = [];
                  const startAz = 180; // Sur
                  const steps = 30;
                  for (let i = 0; i <= steps; i++) {
                    const currAz = (startAz + (azManual * (i / steps))) % 360;
                    const p = project(0, currAz);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                      {mid && <text x={mid[0]} y={parseFloat(mid[1]) + 15} fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">Az</text>}
                    </g>
                  );
                })()}

                {/* Arco de Altura h (P_horiz a Estrella) */}
                {(() => {
                  const points = [];
                  const steps = 15;
                  for (let i = 0; i <= steps; i++) {
                    const currH = hDeg_final * (i / steps);
                    const p = project(currH, azDeg_final);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                      {mid && <text x={parseFloat(mid[0]) + 15} y={mid[1]} fill="#ef4444" fontSize="12" fontWeight="bold">h</text>}
                    </g>
                  );
                })()}

                {/* Arco de Distancia Zenital z (Zenit a Estrella) */}
                {(() => {
                  const points = [];
                  const steps = 15;
                  for (let i = 0; i <= steps; i++) {
                    const currH = 90 - (90 - hDeg_final) * (i / steps);
                    const p = project(currH, azDeg_final);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5" opacity="0.9" />
                      {mid && <text x={parseFloat(mid[0]) - 20} y={mid[1]} fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="end">z</text>}
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Arcos de Coordenadas Ecuatoriales (Visualización de Ejercicio) */}
            {useManual && sistemaModo === 'ECUATORIAL' && (
              <g opacity="0.8">
                {/* Arco de Ángulo Horario H (MCs a P_ecuador) */}
                {(() => {
                  const points = [];
                  const steps = 30;
                  for (let i = 0; i <= steps; i++) {
                    const currH_deg = (hManualEq * 15) * (i / steps);
                    const loc = eqToLocal(0, currH_deg);
                    const p = project(loc.h, loc.az);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
                      <circle cx={MCs.x} cy={MCs.y} r="4" fill="#10b981" />
                      <text x={MCs.x} y={MCs.y - 10} fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">MCs</text>
                      {mid && <text x={mid[0]} y={parseFloat(mid[1]) + 20} fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">H</text>}
                    </g>
                  );
                })()}

                {/* Arco de Declinación δ (P_ecuador a Estrella) */}
                {(() => {
                  const points = [];
                  const steps = 15;
                  for (let i = 0; i <= steps; i++) {
                    const currDec = deltaManualEq * (i / steps);
                    const loc = eqToLocal(currDec, hManualEq * 15);
                    const p = project(loc.h, loc.az);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                      {mid && <text x={parseFloat(mid[0]) + 15} y={mid[1]} fill="#ef4444" fontSize="12" fontWeight="bold">δ</text>}
                    </g>
                  );
                })()}

                {/* Arco de Distancia Polar Δ (Polo a Estrella) */}
                {(() => {
                  const points = [];
                  const steps = 15;
                  const elevatedPoleLat = phiEfectiva >= 0 ? phiEfectiva : phiEfectiva - 180;
                  // Delta va desde el polo (90) hasta la estrella (deltaManualEq)
                  for (let i = 0; i <= steps; i++) {
                    const currDec = 90 - (90 - deltaManualEq) * (i / steps);
                    const loc = eqToLocal(currDec, hManualEq * 15);
                    const p = project(loc.h, loc.az);
                    points.push(`${p.x},${p.y}`);
                  }
                  const mid = points[Math.floor(steps/2)]?.split(',');
                  return (
                    <g>
                      <polyline points={points.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5" opacity="0.9" />
                      {mid && <text x={parseFloat(mid[0]) - 20} y={mid[1]} fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="end">Δ</text>}
                    </g>
                  );
                })()}
              </g>
            )}

            {/* La Estrella */}
            <g opacity={estrellaVisible ? 1 : 0.3}>
              <line x1={center} y1={center} x2={Estrella.x} y2={Estrella.y} stroke="rgba(255,255,255,0.1)" strokeDasharray={estrellaVisible ? "0" : "2"} />
              <circle cx={Estrella.x} cy={Estrella.y} r="8" fill="var(--primary-color)" filter="blur(2px)">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={Estrella.x} cy={Estrella.y} r="4" fill="#fff" />
              <text x={Estrella.x + 12} y={Estrella.y - 12} fill="#fff" fontSize="14" fontWeight="bold">Estrella</text>
            </g>

            {/* Ayuda Visual: Instrucción */}
            {!isDragging && (
              <text x={center} y={size - 20} textAnchor="middle" fill="var(--text-muted)" fontSize="10" opacity="0.6">
                Haz clic y arrastra para rotar la esfera
              </text>
            )}
          </svg>
        </section>
      </div>

      <section className="glass-panel" style={{ marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Info size={20} color="var(--primary-color)" /> Análisis Teórico del Ejercicio
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div>
            <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Sistemas de Coordenadas:</p>
            <p style={{ color: 'var(--text-muted)' }}>La estrella está definida localmente por su Altura ({formatDMS(hAstroDeg)}) y Azimut ({formatDMS(azDeg)}). Absolutamente se define por su Declinación ({delta}°) y Ascensión Recta ({formatHMS(alpha)}).</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Resumen Final:</p>
            <p><strong>α:</strong> {formatHMS(alpha)}</p>
            <p><strong>h:</strong> {formatDMS(hAstroDeg)}</p>
            <p><strong>Az:</strong> {formatDMS(azDeg)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
