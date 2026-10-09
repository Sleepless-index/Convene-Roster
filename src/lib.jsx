import {useState,useEffect} from 'react'
export const BASE=import.meta.env.BASE_URL
export const ELEMENTS=['Glacio','Fusion','Electro','Aero','Spectro','Havoc']
// Raw JSON uses the clean {Id, Name, QualityId, Element, WeaponType} format; image paths follow the file naming convention.
const slug=n=>n.replace(/[: ]+/g,'_')
export const normalize=r=>({id:r.Id,name:r.Name,rarity:r.QualityId,element:r.Element,weapon:r.WeaponType,head:`assets/head/head_${slug(r.Name)}.webp`,role:`assets/pile/T_${slug(r.Name)}.webp`})
export const ElIcon=({e,cls='w-4 h-4'})=><img src={BASE+`assets/elements/${e}.webp`} alt="" aria-hidden="true" draggable={false} className={`${cls} rounded-full`}/>
export const useLS=(k,d)=>{const[v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[v]);return[v,s]}
export function useDialog(ref,onClose){
 useEffect(()=>{const prev=document.activeElement,el=ref.current
  const f=()=>[...el.querySelectorAll('button,input,[tabindex]:not([tabindex="-1"])')].filter(n=>!n.disabled)
  ;(f()[0]||el).focus()
  const esc=e=>{if(e.key==='Escape'){e.stopPropagation();onClose()}}
  const tab=e=>{if(e.key!=='Tab')return;const l=f();if(!l.length)return;const a=l[0],z=l[l.length-1]
   if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  document.addEventListener('keydown',esc);el.addEventListener('keydown',tab)
  return()=>{document.removeEventListener('keydown',esc);el.removeEventListener('keydown',tab);prev&&prev.focus&&prev.focus()}},[])
}
export function Badge({e,cls='w-6 h-6'}){return <span role="img" aria-label={e} className={`${cls} block rounded-full bg-bg/60 shadow-[0_0_0_1px_hsl(var(--bg)/0.6)]`}><img src={BASE+`assets/elements/${e}.webp`} alt="" draggable={false} className="w-full h-full rounded-full"/></span>}
export function Weapon({w,cls='w-6 h-6',pad='p-1'}){return <span role="img" aria-label={w} className={`${cls} ${pad} grid place-items-center rounded bg-bg/75 border border-line`}><img src={BASE+`assets/weapons/${w}.webp`} alt="" draggable={false} className="w-full h-full object-contain"/></span>}
export function Rarity({n,size=11}){return <img src={BASE+`assets/stars/${n}.png`} alt={`${n} star`} draggable={false} style={{height:size}} className="block w-auto"/>}
export const Seq=({s,cls='text-[12px] px-1.5 h-[18px]'})=>s?<span className={`${cls} shrink-0 inline-flex items-center rounded border font-semibold tabular-nums ${s===6?'bg-accent border-accent text-bg':'bg-s4 border-linemid text-hi'}`}>S{s}</span>:null
export const Stars=({n,size,cls=''})=><span className={`absolute inset-x-0 bottom-0 flex justify-center pb-1.5 pt-5 bg-gradient-to-t from-bg/80 to-transparent pointer-events-none ${cls}`}><Rarity n={n} size={size}/></span>
export function Portrait({c,kind}){
 const src=c[kind],[st,setSt]=useState(src?'load':'ph')
 if(!src||st==='ph'){
  const L=[20,23,26,29,24][[...String(c.id)].reduce((a,x)=>a+x.charCodeAt(0),0)%5],head=kind==='head'
  return <svg aria-hidden="true" viewBox={head?'0 0 100 100':'0 0 100 125'} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
   <rect width="100" height="125" fill={`hsl(240 6% ${L}%)`}/>
   {head?<><circle cx="50" cy="42" r="19" fill="hsl(240 5% 40%)"/><path d="M14 100c0-26 16-36 36-36s36 10 36 36z" fill="hsl(240 5% 33%)"/></>
   :<><circle cx="50" cy="38" r="13" fill="hsl(240 5% 40%)"/><path d="M26 125l7-62c2-8 9-13 17-13s15 5 17 13l7 62z" fill="hsl(240 5% 33%)"/></>}
   <text x="50" y={head?92:114} textAnchor="middle" fontSize="11" fill="hsl(240 5% 72%)" fontFamily="IBM Plex Sans,sans-serif">{c.name.replace(/^The /,'').slice(0,2)}</text></svg>}
 return <>{st==='load'&&<div className="skel absolute inset-0"/>}<img src={BASE+src} alt="" draggable={false} onLoad={()=>setSt('ok')} onError={()=>setSt('ph')} className="absolute inset-0 w-full h-full object-cover"/></>
}
// Reads Convene backups and WuwaTracker exports: any JSON containing pull records with a numeric resourceId.
// Owned = at least one Resonator pull; sequence = duplicate copies (capped at S6).
export function parseImport(text,chars){
 const byId=new Map(chars.map(c=>[c.id,c])),byName=new Map(chars.map(c=>[c.name.toLowerCase(),c])),n=new Map()
 const walk=v=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object'){
  if('resourceId' in v){const id=v.resourceId,res=v.resourceType?v.resourceType==='Resonator':id==null||id<2e7  // older WuwaTracker pulls have a null resourceId, so fall back to the name
   if(res){const c=byId.get(id)||byName.get(String(v.name).toLowerCase());if(c)n.set(c.id,(n.get(c.id)||0)+1)}}
  else Object.values(v).forEach(walk)}}
 walk(JSON.parse(text))
 return [...n].map(([id,k])=>({id,s:Math.min(6,k-1)})).sort((a,b)=>byId.get(b.id).rarity-byId.get(a.id).rarity||byId.get(a.id).name.localeCompare(byId.get(b.id).name))
}
export const chunk=(a,n,min)=>Array.from({length:Math.max(min,Math.ceil(a.length/n))},(_,i)=>a.slice(i*n,i*n+n))

// Locks page scroll while a modal surface is open; compensates for the scrollbar so the layout doesn't shift.
let locks=0
export function useScrollLock(){useEffect(()=>{const b=document.body,h=document.documentElement
 if(locks++===0){b.dataset.pad=b.style.paddingRight;b.style.paddingRight=(innerWidth-h.clientWidth)+'px';h.style.overflow='hidden'}
 return()=>{if(--locks===0){b.style.paddingRight=b.dataset.pad||'';h.style.overflow=''}}},[])}
