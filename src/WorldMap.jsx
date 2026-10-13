import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const icon= saved => L.divIcon({className:'custom-map-marker',html:`<span class="map-pin ${saved?'saved':''}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>`,iconSize:[34,40],iconAnchor:[17,38],popupAnchor:[0,-36]});

function Focus({selected,places}) {
  const map=useMap();
  useEffect(()=>{
    if(selected) map.flyTo([selected.lat,selected.lng],8,{duration:1.2});
    else if(places.length>0) map.fitBounds(L.latLngBounds(places.map(d=>[d.lat,d.lng])),{padding:[50,50],maxZoom:5,animate:true});
  },[selected,places,map]);
  return null;
}

export default function WorldMap({places,trips,selected,onSelect,onDetail}) {
  const [failed,setFailed]=useState(false);
  return <><MapContainer center={[25,20]} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom={false} className="leaflet-world-map" worldCopyJump><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' eventHandlers={{tileerror:()=>setFailed(true),tileload:()=>setFailed(false)}}/><Focus selected={selected} places={places}/>{places.map(d=><Marker key={d.id} position={[d.lat,d.lng]} icon={icon(trips.some(t=>t.destinationId===d.id))} eventHandlers={{click:()=>onSelect(d)}}><Popup><div className="map-popup"><small>{d.country}</small><strong>{d.name}</strong><p>{d.subtitle}</p><button onClick={()=>onDetail(d)}>Scopri la località ↗</button></div></Popup></Marker>)}</MapContainer>{failed&&<div className="tile-error" role="status">Le immagini della mappa non rispondono. Le località restano consultabili nell’elenco.</div>}<div className="map-hint">Seleziona un punto per vedere la località.</div></>;
}
