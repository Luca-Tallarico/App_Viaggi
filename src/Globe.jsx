import { useEffect, useMemo, useRef, useState } from 'react';
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import atlas from 'world-atlas/countries-110m.json';
import { Minus, Plus, RotateCcw, Play, Pause, Move } from 'lucide-react';

const countries = feature(atlas, atlas.objects.countries).features;
const graticule = geoGraticule10();
const INITIAL_ROTATION = [-12, -23];

export default function Globe({ places, trips, selected, onSelect, region = 'Tutte' }) {
  const [rotation, setRotation] = useState(INITIAL_ROTATION);
  const [zoom, setZoom] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width:550px)').matches);
  const drag = useRef(null);
  const svg = useRef(null);
  const savedIds = useMemo(() => new Set(trips.map(t => t.destinationId)), [trips]);
  const projection = useMemo(() => geoOrthographic().translate([350, 278]).scale(213 * zoom).rotate(rotation).clipAngle(90).precision(.35), [rotation, zoom]);
  const path = geoPath(projection);
  const center = [-rotation[0], -rotation[1]];

  useEffect(() => {
    const media=window.matchMedia('(max-width:550px)');
    const update=event=>setCompact(event.matches);
    media.addEventListener('change',update);
    return ()=>media.removeEventListener('change',update);
  },[]);

  useEffect(() => {
    if (selected) {
      setRotation([-selected.lng, -selected.lat]);
      setSpinning(false);
      setHovered(null);
    }
  }, [selected]);

  useEffect(() => {
    const centers={Europa:[-15,-45],Asia:[-95,-25],Africa:[-20,-2],Americhe:[95,-15],Oceania:[-155,15]};
    if(!selected && centers[region]){setRotation(centers[region]);setSpinning(false);}
  },[region,selected]);

  useEffect(() => {
    if (!spinning) return;
    let frame, previous = 0;
    const tick = now => {
      if (previous && now - previous >= 40) {
        const step = Math.min(now - previous, 100) * .006;
        setRotation(([lon, lat]) => [(lon + step) % 360, lat]);
        previous = now;
      } else if (!previous) previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spinning]);

  const begin = event => {
    if (event.button !== 0 || event.target.closest('[data-globe-marker]')) return;
    const bounds = svg.current.getBoundingClientRect();
    drag.current = { x: event.clientX, y: event.clientY, rotation, factor: Math.max((compact ? 480 : 700) / bounds.width, 560 / bounds.height) };
    svg.current.setPointerCapture(event.pointerId);
    setDragging(true); setSpinning(false); setHovered(null);
  };
  const move = event => {
    if (!drag.current) return;
    const initial = drag.current;
    setRotation([
      initial.rotation[0] + (event.clientX - initial.x) * .28 * initial.factor / zoom,
      Math.max(-85, Math.min(85, initial.rotation[1] - (event.clientY - initial.y) * .28 * initial.factor / zoom)),
    ]);
  };
  const end = () => { drag.current = null; setDragging(false); };
  const keydown = event => {
    const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] };
    if (directions[event.key]) {
      event.preventDefault(); setSpinning(false);
      const [x, y] = directions[event.key];
      setRotation(([lon, lat]) => [lon + x, Math.max(-85, Math.min(85, lat + y))]);
    }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(z => Math.min(1.55, z + .15)); }
    if (event.key === '-') { event.preventDefault(); setZoom(z => Math.max(.75, z - .15)); }
  };

  const visiblePlaces = places.filter(d => geoDistance([d.lng, d.lat], center) < Math.PI / 2 - .03);
  const label = hovered || selected;
  const labelPoint = label && geoDistance([label.lng, label.lat], center) < Math.PI / 2 - .03 ? projection([label.lng, label.lat]) : null;

  return <div className="globe-stage">
    <div className="globe-stage-top"><span><span className="globe-live-dot" /> ESPLORA IL MONDO</span><span>{places.length} località</span></div>
    <svg ref={svg} className={`interactive-globe ${dragging ? 'dragging' : ''}`} viewBox={compact ? '110 0 480 560' : '0 0 700 560'} role="group" tabIndex={0} aria-label="Mappamondo interattivo" aria-describedby="globe-instructions" data-rotation={rotation.join(',')} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={keydown}>
      <defs>
        <radialGradient id="globe-ocean" cx="35%" cy="28%" r="78%"><stop offset="0" stopColor="#faf8f0"/><stop offset=".6" stopColor="#ece8dd"/><stop offset="1" stopColor="#d3cdbc"/></radialGradient>
        <radialGradient id="globe-shade" cx="32%" cy="25%" r="78%"><stop offset=".35" stopColor="#fff" stopOpacity=".05"/><stop offset=".75" stopColor="#8b8063" stopOpacity=".06"/><stop offset="1" stopColor="#6e674e" stopOpacity=".27"/></radialGradient>
        <radialGradient id="ground-shadow"><stop offset="0" stopColor="#7d7154" stopOpacity=".17"/><stop offset="1" stopColor="#7d7154" stopOpacity="0"/></radialGradient>
        <clipPath id="globe-clip"><circle cx="350" cy="278" r={213 * zoom}/></clipPath>
      </defs>
      <ellipse cx="350" cy="517" rx="177" ry="22" fill="url(#ground-shadow)"/>
      <circle cx="350" cy="278" r={213 * zoom + 12} fill="none" stroke="#d8d1c0" strokeWidth=".7" strokeDasharray="2 6" opacity=".7"/>
      <circle cx="350" cy="278" r={213 * zoom} fill="url(#globe-ocean)" stroke="#c9c1ac" strokeWidth=".7"/>
      <g clipPath="url(#globe-clip)">
        <path d={path(graticule)} fill="none" stroke="#b6ae9b" strokeWidth=".5" opacity=".32"/>
        <g className="globe-land">{countries.map(country => <path key={country.id} d={path(country)} fill="#c6b99d" stroke="#eee8db" strokeWidth=".5" />)}</g>
        <circle cx="350" cy="278" r={213 * zoom} fill="url(#globe-shade)" pointerEvents="none"/>
        {visiblePlaces.map(d => {
          const [x, y] = projection([d.lng, d.lat]);
          const isSaved = savedIds.has(d.id), isSelected = selected?.id === d.id;
          return <g key={d.id} data-globe-marker={d.id} className={`globe-marker ${isSaved ? 'saved' : ''} ${isSelected ? 'selected' : ''}`} role="button" tabIndex={0} aria-label={`Seleziona ${d.name}, ${d.country}`} aria-pressed={isSelected} transform={`translate(${x},${y})`} onClick={() => onSelect(d)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onSelect(d); } }} onPointerEnter={() => { if (!dragging) setHovered(d); }} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(d)} onBlur={() => setHovered(null)}>
            <title>{d.name}, {d.country}{isSaved ? ' · Nei viaggi' : ''}</title>
            <circle r={compact ? 18 : 13} fill="transparent"/>
            {(isSelected || isSaved) && <circle r={isSelected ? 10 : 8} fill={isSelected ? '#514d3d' : '#616a51'} opacity=".14"/>}
            <circle r={isSelected ? 5 : 3.6} fill={isSaved ? '#46553c' : '#8c7250'} stroke="#fffcf3" strokeWidth="1.7"/>
          </g>;
        })}
      </g>
      {labelPoint && <g className="globe-city-label" pointerEvents="none" transform={`translate(${Math.max(85, Math.min(615, labelPoint[0]))},${Math.max(28, labelPoint[1] - 28)})`}><rect x={-(label.name.length * 3.6 + 16)} y="-13" width={label.name.length * 7.2 + 32} height="27" rx="5" fill="#fcfaf3" stroke="#d7ceba"/><text textAnchor="middle" dy="5">{label.name}</text></g>}
    </svg>
    <div className="globe-controls"><button className="icon-button" onClick={()=>setZoom(z=>Math.min(1.55,z+.15))} disabled={zoom>=1.55} aria-label="Ingrandisci globo"><Plus size={17}/></button><button className="icon-button" onClick={()=>setZoom(z=>Math.max(.75,z-.15))} disabled={zoom<=.75} aria-label="Riduci globo"><Minus size={17}/></button><span/><button className="icon-button" onClick={()=>{setRotation(INITIAL_ROTATION);setZoom(1);setSpinning(false);}} aria-label="Ripristina globo"><RotateCcw size={16}/></button><button className={`icon-button ${spinning?'enabled':''}`} aria-label={spinning?'Ferma rotazione':'Avvia rotazione'} aria-pressed={spinning} onClick={()=>setSpinning(value=>!value)}>{spinning?<Pause size={15}/>:<Play size={15}/>}</button></div>
    <div className="globe-stage-bottom"><span id="globe-instructions"><Move size={13}/> Trascina per ruotare · Clicca una località <span className="sr-only">. Usa le frecce della tastiera per ruotare e i pulsanti per lo zoom.</span></span><span>Geografia: Natural Earth</span></div>
  </div>;
}
