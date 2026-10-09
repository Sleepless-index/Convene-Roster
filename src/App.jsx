import {useState,useEffect,useMemo,useRef,forwardRef,useLayoutEffect} from 'react'
import {Plus,X,Search,Check,Trash2,Download,Copy,FileUp,ImageDown,ArrowUp,ArrowDown,Users,LayoutGrid,ListFilter} from 'lucide-react'
import {toCanvas} from 'html-to-image'
import {BASE,ELEMENTS,ElIcon,useLS,useDialog,useScrollLock,Badge,Weapon,Rarity,Seq,Stars,Portrait,parseImport,normalize,chunk} from './lib.jsx'

const Empty=({onClick})=><li className="min-h-[150px]"><button onClick={onClick} aria-label="Add character" className="w-full h-full min-h-[150px] grid place-items-center rounded-md border border-dashed border-linemid text-lo hover:text-mid hover:bg-s1"><Plus size={18}/></button></li>

function Card({c,onOpen,onRemove,onMenu}){
 const t=useRef()
 return <li className="group relative a-pop">
  <button onClick={e=>onOpen(c,e.currentTarget.getBoundingClientRect())} onContextMenu={e=>{e.preventDefault();onMenu(c,e.clientX,e.clientY)}}
   onTouchStart={e=>{const p=e.touches[0];t.current=setTimeout(()=>onMenu(c,p.clientX,p.clientY),550)}} onTouchEnd={()=>clearTimeout(t.current)} onTouchMove={()=>clearTimeout(t.current)}
   aria-label={`${c.name}, ${c.rarity} star ${c.element} ${c.weapon}, resonance chain S${c.s}. Edit`} className="block w-full text-left rounded-md border border-line bg-s2 hover:border-linemid overflow-hidden">
   <div className="relative aspect-[4/5] bg-s3"><Portrait c={c} kind="role"/><span className="absolute top-1.5 left-1.5 flex flex-col gap-1"><Badge e={c.element}/><Weapon w={c.weapon}/></span><span className="absolute top-1.5 right-1.5"><Seq s={c.s}/></span><Stars n={c.rarity} size={17} cls="pt-4"/></div>
   <div className="px-2 py-2 text-center truncate text-[13px] font-medium">{c.name}</div>
  </button>
  <button onClick={()=>onRemove(c)} aria-label={`Remove ${c.name}`} className="ibtn absolute bottom-[42px] right-1.5 bg-bg/80 border border-line opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"><Trash2 size={14}/></button>
 </li>
}
const SkelCard=()=><li><div className="rounded-md border border-line bg-s2 overflow-hidden"><div className="skel aspect-[4/5]"/><div className="p-2 space-y-1.5"><div className="skel h-3 w-3/4 rounded"/><div className="skel h-3 w-1/3 rounded"/></div></div></li>
const WEAPONS=['Broadblade','Gauntlets','Pistols','Rectifier','Sword']
const cmp={added:()=>0,name:(a,b)=>a.name.localeCompare(b.name),rarity:(a,b)=>a.rarity-b.rarity,element:(a,b)=>ELEMENTS.indexOf(a.element)-ELEMENTS.indexOf(b.element),weapon:(a,b)=>a.weapon.localeCompare(b.weapon),seq:(a,b)=>a.s-b.s}
const SORTS=[['added','Added'],['name','Name'],['rarity','Rarity'],['element','Element'],['weapon','Weapon'],['seq','Sequence']]

const GRID='grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(112px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(136px,1fr))]'

function FilterPop({rect,rf,rtog,onClear,onClose}){
 const ref=useRef();useDialog(ref,onClose)
 useEffect(()=>{const d=e=>{if(!ref.current.contains(e.target)&&!e.target.closest('[data-filter-trigger]'))onClose()};document.addEventListener('mousedown',d);return()=>document.removeEventListener('mousedown',d)},[])
 const l=Math.min(Math.max(rect.left,8),innerWidth-316),Sec=({t,children})=><div><div className="text-xs text-lo mb-1.5">{t}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>
 return <div ref={ref} role="dialog" aria-label="Filter roster" tabIndex={-1} style={{'--t':rect.bottom+6+'px','--l':l+'px'}}
  className="fixed z-30 bg-s1 border border-linemid rounded-md p-3 space-y-3 sm:w-[308px] sm:top-[var(--t)] sm:left-[var(--l)] max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-b-none max-sm:p-4 max-sm:pb-8 a-pm">
  <div className="flex items-center justify-between"><h2 className="font-semibold text-[14px]">Filter</h2><div className="flex items-center gap-1"><button className="chip" onClick={onClear}>Clear all</button><button className="ibtn" onClick={onClose} aria-label="Close filters"><X size={16}/></button></div></div>
  <Sec t="Rarity">{[4,5].map(n=><button key={n} className="chip" aria-pressed={rf.rar.includes(n)} aria-label={`${n} star`} onClick={()=>rtog('rar',n)}>{n}*</button>)}</Sec>
  <Sec t="Element">{ELEMENTS.map(e=><button key={e} className="chip" aria-pressed={rf.el.includes(e)} onClick={()=>rtog('el',e)}><ElIcon e={e}/>{e}</button>)}</Sec>
  <Sec t="Weapon">{WEAPONS.map(w=><button key={w} className="chip" aria-pressed={rf.wp.includes(w)} onClick={()=>rtog('wp',w)}><img src={BASE+`assets/weapons/${w}.webp`} alt="" draggable={false} className="w-4 h-4 object-contain"/>{w}</button>)}</Sec>
 </div>
}

function Edit({c,rect,onS,onClose}){
 const ref=useRef();useDialog(ref,onClose)
 useEffect(()=>{const d=e=>{if(!ref.current.contains(e.target))onClose()};document.addEventListener('mousedown',d);return()=>document.removeEventListener('mousedown',d)},[])
 const l=Math.min(Math.max(rect.left+rect.width/2-130,8),innerWidth-268),t=rect.bottom+170>innerHeight?Math.max(8,rect.top-170):rect.bottom+6
 return <div ref={ref} role="dialog" aria-label={`Edit ${c.name}`} tabIndex={-1} style={{'--t':t+'px','--l':l+'px'}}
  className="fixed z-40 bg-s1 border border-linemid p-3 rounded-md sm:w-[260px] sm:top-[var(--t)] sm:left-[var(--l)] max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-b-none max-sm:p-4 max-sm:pb-8 a-pm">
  <div className="flex items-center gap-2 mb-3"><Badge e={c.element}/><Weapon w={c.weapon}/><div className="min-w-0 flex-1 space-y-1"><div className="truncate font-medium">{c.name}</div><Rarity n={c.rarity}/></div>
   <button className="ibtn" onClick={onClose} aria-label="Close"><X size={16}/></button></div>
  <div id="rc" className="text-xs text-lo mb-1.5">Resonance Chain</div>
  <div role="radiogroup" aria-labelledby="rc" className="grid grid-cols-7 gap-1">
   {[0,1,2,3,4,5,6].map(n=><button key={n} role="radio" aria-checked={c.s===n} aria-label={`S${n}`} onClick={()=>onS(c.id,n)} className={`h-8 rounded border text-[13px] ${c.s===n?'bg-accentdim border-accentline text-hi':'border-line bg-s2 text-mid hover:bg-s3'}`}>S{n}</button>)}
  </div></div>
}

function Drawer({chars,loading,owned,onAdd,onClose,f,setF}){
 const ref=useRef();useDialog(ref,onClose);useScrollLock()
 const list=chars.filter(c=>(!f.q||c.name.toLowerCase().includes(f.q.toLowerCase()))&&(!f.rar.length||f.rar.includes(c.rarity))&&(!f.el.length||f.el.includes(c.element)))
 const tog=(k,v)=>setF({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]})
 return <><div className="fixed -inset-10 z-40 bg-black/65 backdrop-blur-lg a-fade" onClick={onClose}/>
  <aside ref={ref} role="dialog" aria-modal="true" aria-label="Add character" tabIndex={-1} className="fixed z-50 flex flex-col bg-s1 border-linemid a-sheet sm:inset-y-0 sm:right-0 sm:w-[400px] sm:border-l max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[88vh] max-sm:border-t max-sm:rounded-t-lg">
   <div className="flex items-center justify-between px-4 h-12 border-b border-line"><h2 className="font-semibold text-[15px]">Add character</h2><button className="ibtn" onClick={onClose} aria-label="Close drawer"><X size={16}/></button></div>
   <div className="p-3 space-y-2.5 border-b border-line">
    <label htmlFor="q" className="sr-only">Search characters by name</label>
    <div className="relative"><Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lo" aria-hidden="true"/>
     <input id="q" value={f.q} onChange={e=>setF({...f,q:e.target.value})} onKeyDown={e=>{if(e.key==='Enter'){const t=list.find(c=>!owned.has(c.id));t&&onAdd(t)}}} placeholder="Search by name" autoComplete="off"
      className="w-full h-9 pl-8 pr-3 rounded border border-linemid bg-s2 text-sm placeholder:text-lo"/></div>
    <div role="group" aria-label="Filter by rarity" className="flex gap-1.5">{[4,5].map(n=><button key={n} className="chip" aria-pressed={f.rar.includes(n)} aria-label={`${n} star`} onClick={()=>tog('rar',n)}>{n}*</button>)}</div>
    <div role="group" aria-label="Filter by element" className="flex flex-wrap gap-1.5">{ELEMENTS.map(e=><button key={e} className="chip" aria-pressed={f.el.includes(e)} onClick={()=>tog('el',e)}><ElIcon e={e}/>{e}</button>)}</div>
   </div>
   <ul role="list" className="flex-1 overflow-y-auto overscroll-contain p-3 grid grid-cols-3 sm:grid-cols-4 gap-2 content-start">
    {loading?Array.from({length:12},(_,i)=><li key={i}><div className="skel aspect-square rounded-md"/><div className="skel h-3 w-3/4 rounded mt-1.5"/></li>)
     :list.length?list.map(c=>{const own=owned.has(c.id);return <li key={c.id}><button aria-disabled={own} aria-label={own?`${c.name}, already added`:`Add ${c.name}`} onClick={()=>!own&&onAdd(c)} className={`w-full text-left rounded-md ${own?'cursor-default':'hover:bg-s2'} p-1`}>
      <div className={`relative aspect-square rounded border overflow-hidden bg-s3 ${own?'border-accentline opacity-55':'border-line'}`}><Portrait c={c} kind="head"/><span className="absolute top-1 left-1"><Badge e={c.element} cls="w-4 h-4"/></span>
       {own&&<span className="absolute inset-0 grid place-items-center bg-bg/40"><span className="w-6 h-6 rounded-full bg-accent text-bg grid place-items-center"><Check size={14} strokeWidth={2.5}/></span></span>}</div>
      <div className="mt-1 truncate text-xs font-medium">{c.name}</div><div className="mt-0.5 text-[11px] text-lo h-[10px] flex items-center">{own?'Already added':<Rarity n={c.rarity} size={9}/>}</div></button></li>})
     :<li className="col-span-full text-center text-lo py-8">No characters match these filters.</li>}
   </ul>
   <div className="flex items-center justify-between px-4 h-14 border-t border-line"><span className="text-xs text-lo">{owned.size} of {chars.length} added</span><button className="btn" onClick={onClose}>Done</button></div>
  </aside></>
}

function Dialog({label,onClose,children,w='max-w-md'}){
 const ref=useRef();useDialog(ref,onClose);useScrollLock()
 return <div className="fixed inset-0 z-50 grid place-items-center p-3 overscroll-contain max-sm:place-items-end max-sm:p-0">
  <div className="absolute -inset-10 bg-black/65 backdrop-blur-lg a-fade" onMouseDown={onClose}/>
  <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`relative w-full ${w} max-h-[92vh] overflow-y-auto bg-s1 border border-linemid rounded-lg max-sm:rounded-b-none a-pm`}>
   <div className="flex items-center justify-between px-4 h-12 border-b border-line"><h2 className="font-semibold text-[15px]">{label}</h2><button className="ibtn" onClick={onClose} aria-label="Close"><X size={16}/></button></div>{children}</div></div>
}

function Import({chars,count,onApply,onClose}){
 const[err,setErr]=useState(''),[found,setFound]=useState(null)
 const fromFile=async e=>{const f=e.target.files[0];if(!f)return
  try{const r=parseImport(await f.text(),chars);r.length?(setErr(''),setFound(r)):setErr('No owned characters were found in that file. Use a Convene backup or a WuwaTracker pulls export.')}catch{setErr('That file is not valid JSON.')}}
 return <Dialog label="Import from gacha tracker" onClose={onClose}>
  {found?<div className="p-4 space-y-4"><p className="text-sm text-mid">Found <b className="text-hi">{found.length}</b> owned characters. Importing replaces your current roster{count?` of ${count}`:''}. Sequence levels are set from duplicate pulls.</p>
   <div className="flex justify-end gap-2"><button className="btn" onClick={()=>setFound(null)}>Back</button><button className="btn btn-pri" onClick={()=>onApply(found)}>Replace roster</button></div></div>
  :<div className="p-4 space-y-3"><p className="text-sm text-mid">Upload a JSON export from Convene or WuwaTracker. Owned characters and sequence levels are read from your pull history.</p>
   <label className="btn cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-[hsl(var(--accent))]"><FileUp size={15} aria-hidden="true"/>Choose JSON file<input type="file" accept=".json,application/json" onChange={fromFile} className="sr-only"/></label>
   {err&&<p role="alert" className="text-sm text-mid border border-accentline bg-accentdim rounded px-3 py-2">{err}</p>}</div>}
 </Dialog>
}

const Sheet=forwardRef(({items,layout,group,view,head},ref)=>{
 const compact=layout==='compact',teams=view==='teams'
 const mini=teams&&!compact,cw=compact?122:mini?176:212,gap=compact?20:18   // fixed card width => card, star and text sizes are identical in every view
 const Cell=({c})=>compact
  ?<div className="min-w-0"><div className="relative aspect-square rounded-lg overflow-hidden bg-s3 border border-line"><Portrait c={c} kind="head"/><span className="absolute top-1.5 left-1.5 flex flex-col gap-1"><Badge e={c.element} cls="w-5 h-5"/><Weapon w={c.weapon} cls="w-5 h-5" pad="p-0.5"/></span>
    <span className="absolute top-1.5 right-1.5"><Seq s={c.s} cls="text-[13px] px-1.5 h-5"/></span><Stars n={c.rarity} size={15} cls="pt-3"/></div>
    <div className="mt-2 text-[14px] font-medium truncate text-center">{c.name}</div></div>
  :<div className="min-w-0"><div className={`relative overflow-hidden border border-line bg-s3 ${mini?'rounded-lg':'rounded-xl'}`} style={{aspectRatio:'696/960'}}><Portrait c={c} kind="role"/>
    <span className={`absolute flex flex-col ${mini?'top-2 left-2 gap-1':'top-2.5 left-2.5 gap-1.5'}`}><Badge e={c.element} cls={mini?'w-6 h-6':'w-8 h-8'}/><Weapon w={c.weapon} cls={mini?'w-6 h-6':'w-8 h-8'} pad={mini?'p-1':'p-1.5'}/></span>
    <span className={`absolute ${mini?'top-2 right-2':'top-2.5 right-2.5'}`}><Seq s={c.s} cls={mini?'text-[12px] px-1.5 h-5':'text-[15px] px-2 h-7'}/></span><Stars n={c.rarity} size={mini?22:26} cls={mini?'pb-2 pt-6':'pb-3 pt-8'}/></div>
    <div className={`${mini?'mt-2 text-[17px]':'mt-2.5 text-[21px]'} font-medium truncate text-center`}>{c.name}</div></div>
 const Row=({list,g=gap})=><div className="flex flex-wrap" style={{gap:g}}>{list.map(c=><div key={c.id} style={{width:cw}}><Cell c={c}/></div>)}</div>
 const Slot=()=><div><div className={`border border-dashed border-linemid ${compact?'rounded-lg':'rounded-xl'}`} style={{aspectRatio:compact?'1':'696/960'}}/><div style={{height:compact?28:mini?34:39}}/></div>
 const groups=group&&!teams?ELEMENTS.map(e=>({e,items:items.filter(c=>c.element===e)})).filter(g=>g.items.length):[{e:null,items}]
 const hasHead=head.name||head.uid
 return <div ref={ref} className={`w-[1200px] ${compact?'p-10':'p-8'} bg-bg text-hi font-sans`}>
  {hasHead&&<div className="flex items-center gap-6 mb-8"><div className="min-w-0 flex-1">{head.name&&<div className="text-[34px] font-semibold leading-tight truncate">{head.name}</div>}{head.uid&&<div className="text-[18px] text-mid">UID {head.uid}</div>}</div></div>}
  {teams?(()=>{const T=chunk(items,3,3),cells=(t,g)=><div className="flex" style={{gap:g}}>{[0,1,2].map(k=><div key={k} style={{width:cw}}>{t[k]?<Cell c={t[k]}/>:<Slot/>}</div>)}</div>
   return compact?<div className="flex flex-wrap items-start gap-6">{T.map((t,i)=><div key={i} className="rounded-xl border border-line bg-s1 p-4"><div className="text-[15px] text-lo mb-3">Team {i+1}</div>{cells(t,16)}</div>)}</div>
   :<div className="grid grid-cols-2 gap-x-8 gap-y-9 items-start" style={{gridAutoFlow:'column',gridTemplateRows:`repeat(${Math.ceil(T.length/2)},auto)`}}>{T.map((t,i)=><div key={i}><div className="flex items-center gap-3 mb-3"><span className="text-[17px] text-mid">Team {i+1}</span><span aria-hidden="true" className="flex-1 h-px bg-linemid"/></div>{cells(t,12)}</div>)}</div>})()
  :groups.map(g=><section key={g.e||'all'} className={g.e?'mb-9 last:mb-0':''}>
   {g.e&&<div className="flex items-center gap-3 mb-4"><ElIcon e={g.e} cls="w-8 h-8"/><span className="text-[22px] font-medium">{g.e}</span><span className="text-[18px] text-lo">{g.items.length}</span><span aria-hidden="true" className="flex-1 h-px bg-linemid"/></div>}
   <Row list={g.items}/></section>)}</div>
})

function Export({items,view,onClose,say}){
 const[layout,setLayout]=useLS('wr:layout','compact'),[five,setFive]=useLS('wr:five',true),[group,setGroup]=useLS('wr:group',false),[player,setPlayer]=useLS('wr:player',{name:'',uid:''}),[ready,setReady]=useState(false),[scale,setScale]=useState(.5),[h,setH]=useState(600),[busy,setBusy]=useState(false)
 const sheet=useRef(),wrap=useRef(),list=five?items.filter(c=>c.rarity===5):items
 useEffect(()=>{setReady(false);const t=setTimeout(()=>setReady(true),450);return()=>clearTimeout(t)},[layout,five,group,view])
 useLayoutEffect(()=>{const a=new ResizeObserver(()=>setScale(wrap.current.clientWidth/1200)),b=new ResizeObserver(()=>setH(sheet.current.offsetHeight));a.observe(wrap.current);b.observe(sheet.current);return()=>{a.disconnect();b.disconnect()}},[])
 const blob=type=>toCanvas(sheet.current,{pixelRatio:2,cacheBust:true,backgroundColor:'#17171a'}).then(cv=>new Promise(r=>cv.toBlob(r,type,.95)))
 const dl=async()=>{setBusy(true);const b=await blob('image/webp'),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='wuwa-roster.webp';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);say('Roster exported as WebP');setBusy(false)}
 const cp=async()=>{setBusy(true);try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob('image/png')})]);say('Roster image copied to clipboard')}catch{say('Copy failed. Use Download WebP instead.')}setBusy(false)}
 return <Dialog label="Export roster" onClose={onClose} w="max-w-4xl">
  <div className="p-4 space-y-3">
   <div className="flex flex-wrap items-center justify-between gap-2"><div role="radiogroup" aria-label="Export layout" className="flex flex-wrap gap-1.5">
     {[['compact','Compact'],['spacious','Spacious']].map(([k,l])=><button key={k} role="radio" aria-checked={layout===k} onClick={()=>setLayout(k)} className={`chip ${layout===k?'!bg-accentdim !border-accentline !text-hi':''}`}>{l}</button>)}
     <button className="chip" aria-pressed={five} onClick={()=>setFive(!five)}>Only 5*</button>
     <button className="chip disabled:opacity-40 disabled:pointer-events-none" aria-pressed={group&&view!=='teams'} disabled={view==='teams'} title={view==='teams'?'Not available in teams view':undefined} onClick={()=>setGroup(!group)}>Group by element</button></div>
    <div className="flex gap-2 max-sm:w-full"><button className="btn max-sm:flex-1 justify-center" onClick={cp} disabled={!ready||busy||!list.length}><Copy size={15} aria-hidden="true"/>Copy to clipboard</button><button className="btn btn-pri max-sm:flex-1 justify-center" onClick={dl} disabled={!ready||busy||!list.length}><Download size={15} aria-hidden="true"/>Download WebP</button></div></div>
   <div className="grid grid-cols-2 gap-2 max-w-md max-sm:max-w-none">
    <div><label htmlFor="pn" className="sr-only">Player name</label><input id="pn" maxLength={24} value={player.name} onChange={e=>setPlayer({...player,name:e.target.value})} placeholder="Player name" autoComplete="off" className="w-full h-8 px-2.5 rounded border border-linemid bg-s2 text-sm placeholder:text-lo"/></div>
    <div><label htmlFor="pu" className="sr-only">UID</label><input id="pu" maxLength={12} inputMode="numeric" value={player.uid} onChange={e=>setPlayer({...player,uid:e.target.value.replace(/\D/g,'')})} placeholder="UID" autoComplete="off" className="w-full h-8 px-2.5 rounded border border-linemid bg-s2 text-sm placeholder:text-lo"/></div></div>
   <div ref={wrap} className="relative w-full overflow-hidden rounded border border-line" style={{height:h*scale}}>
    <div style={{width:1200,transform:`scale(${scale})`,transformOrigin:'0 0'}}><Sheet ref={sheet} items={list} layout={layout} group={group} view={view} head={{name:player.name.trim(),uid:player.uid}}/></div>
    {!ready&&<div className="skel absolute inset-0" aria-hidden="true"/>}</div>
   <p className="text-xs text-lo">{list.length?'Preview matches the exported image. Output is 2x resolution.':items.length?'No 5-star characters in your roster. Turn off the 5-star filter to export the rest.':'Add characters to your roster before exporting.'}</p></div></Dialog>
}

export default function App(){
 const[chars,setChars]=useState(null),[roster,setRoster]=useLS('wr:roster',[]),[f,setF]=useLS('wr:filters',{q:'',rar:[],el:[]}),[sort,setSort]=useLS('wr:sort',{key:'added',dir:'asc'}),[view,setView]=useLS('wr:view','owned'),[rf,setRf]=useLS('wr:rf',{rar:[],el:[],wp:[]})
 const[panel,setPanel]=useState(null),[edit,setEdit]=useState(null),[menu,setMenu]=useState(null),[msg,setMsg]=useState('')
 useEffect(()=>{Promise.all([fetch(BASE+'characters.json').then(r=>r.json()),new Promise(r=>setTimeout(r,600))]).then(([d])=>setChars(d.map(normalize))).catch(()=>setChars([]))},[])
 useEffect(()=>{if(!menu)return;const c=()=>setMenu(null),k=e=>e.key==='Escape'&&c();addEventListener('click',c);addEventListener('keydown',k);return()=>{removeEventListener('click',c);removeEventListener('keydown',k)}},[menu])
 const byId=useMemo(()=>Object.fromEntries((chars||[]).map(c=>[c.id,c])),[chars])
 const items=roster.map(r=>({...byId[r.id],s:r.s})).filter(c=>c.id),owned=new Set(roster.map(r=>r.id)),loading=!chars
 const d=sort.dir==='asc'?1:-1
 const sorted=items.map((c,i)=>({...c,_i:i})).sort((a,b)=>sort.key==='added'?(a._i-b._i)*d:(cmp[sort.key](a,b)*d||a.name.localeCompare(b.name)))
 const fc=rf.rar.length+rf.el.length+rf.wp.length,active=fc>0,[fp,setFp]=useState(null)
 const shown=sorted.filter(c=>(!rf.rar.length||rf.rar.includes(c.rarity))&&(!rf.el.length||rf.el.includes(c.element))&&(!rf.wp.length||rf.wp.includes(c.weapon)))
 const rtog=(k,v)=>setRf({...rf,[k]:rf[k].includes(v)?rf[k].filter(x=>x!==v):[...rf[k],v]})
 const say=m=>{setMsg('');setTimeout(()=>setMsg(m),40)}
 const add=c=>{setRoster(r=>r.some(x=>x.id===c.id)?r:[...r,{id:c.id,s:0}]);say(`${c.name} added`)}
 const remove=c=>{setRoster(r=>r.filter(x=>x.id!==c.id));setEdit(null);say(`${c.name} removed`)}
 const apply=list=>{setRoster(list);setPanel(null);say(`Imported ${list.length} characters`)}
 const open=(c,rect)=>setEdit({id:c.id,rect}),ed=edit&&items.find(c=>c.id===edit.id)
 const card=c=><Card key={c.id} c={c} onOpen={open} onRemove={remove} onMenu={(c,x,y)=>setMenu({c,x,y})}/>
 const openAdd=()=>setPanel('add')
 return <>
  <div className="min-h-screen" inert={panel?true:undefined}>
  <header className="sticky top-0 z-20 bg-bg border-b border-line"><div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
   <h1 className="sr-only">Wuwa-Roster</h1>
   <div role="group" aria-label="Roster view" className="flex rounded border border-linemid overflow-hidden">
    {[['owned','Owned',LayoutGrid],['teams','Teams',Users]].map(([k,l,I])=><button key={k} aria-pressed={view===k} onClick={()=>setView(k)} aria-label={`${l} view`} className={`h-8 px-2.5 inline-flex items-center gap-1.5 text-[13px] ${view===k?'bg-accentdim text-hi':'bg-s2 text-mid hover:bg-s3'}`}><I size={14} aria-hidden="true"/><span className="max-sm:sr-only">{l}</span></button>)}</div>
   <div className="ml-auto flex items-center gap-2">
    <button className="btn" onClick={()=>setPanel('import')} aria-label="Import from gacha tracker"><FileUp size={15} aria-hidden="true"/><span className="max-sm:sr-only">Import</span></button>
    <button className="btn" onClick={()=>setPanel('export')} aria-label="Export as WebP"><ImageDown size={15} aria-hidden="true"/><span className="max-sm:sr-only">Export</span></button>
    <button className="btn btn-pri" onClick={openAdd} aria-label="Add character"><Plus size={15} aria-hidden="true"/><span className="max-sm:sr-only">Add character</span></button></div></div></header>
  <main className="max-w-6xl mx-auto px-4 py-5">
   <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
    <div className="flex items-center gap-1.5"><label htmlFor="sort" className="sr-only">Sort by</label>
     <select id="sort" value={sort.key} onChange={e=>setSort({key:e.target.value,dir:['rarity','seq'].includes(e.target.value)?'desc':'asc'})} className="h-7 rounded border border-linemid bg-s2 px-2 text-xs text-hi">{SORTS.map(([k,l])=><option key={k} value={k}>Sort: {l}</option>)}</select>
     <button className="ibtn border border-line bg-s2" onClick={()=>setSort({...sort,dir:sort.dir==='asc'?'desc':'asc'})} aria-label={`Sort direction: ${sort.dir==='asc'?'ascending':'descending'}. Switch`}>{sort.dir==='asc'?<ArrowUp size={14}/>:<ArrowDown size={14}/>}</button></div>
    <button data-filter-trigger className="btn" aria-haspopup="dialog" aria-expanded={!!fp} onClick={e=>fp?setFp(null):setFp(e.currentTarget.getBoundingClientRect())}><ListFilter size={15} aria-hidden="true"/>Filter{fc>0&&<span className="min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[11px] font-semibold grid place-items-center" aria-label={`${fc} active`}>{fc}</span>}</button>
    {active&&<button className="chip" onClick={()=>setRf({rar:[],el:[],wp:[]})}><X size={12} aria-hidden="true"/>Clear filters</button>}
    {active&&<span className="text-xs text-lo" role="status">{shown.length} of {items.length}</span>}</div>
   {loading?<ul role="list" aria-label="Loading roster" className={GRID}>{Array.from({length:8},(_,i)=><SkelCard key={i}/>)}</ul>
   :view==='teams'?<div className="grid gap-3 sm:grid-cols-3">{chunk(shown,3,active?0:3).map((t,i)=><section key={i} aria-label={`Team ${i+1}`} className="rounded-md border border-line bg-s1 p-2.5"><h2 className="text-xs text-lo mb-2">Team {i+1}</h2><ul role="list" className="grid grid-cols-3 gap-2">{t.map(card)}{!active&&Array.from({length:3-t.length},(_,k)=><Empty key={k} onClick={openAdd}/>)}</ul></section>)}</div>
   :<ul role="list" aria-label="Owned characters" className={GRID}>{shown.map(card)}{!active&&<Empty onClick={openAdd}/>}</ul>}
   {!loading&&active&&!shown.length&&<p className="text-center text-lo py-12">No characters match these filters.</p>}
  </main>
  </div>
  {fp&&<FilterPop rect={fp} rf={rf} rtog={rtog} onClear={()=>setRf({rar:[],el:[],wp:[]})} onClose={()=>setFp(null)}/>}
  {panel==='add'&&<Drawer chars={chars||[]} loading={loading} owned={owned} onAdd={add} onClose={()=>setPanel(null)} f={f} setF={setF}/>}
  {panel==='import'&&<Import chars={chars||[]} count={items.length} onApply={apply} onClose={()=>setPanel(null)}/>}
  {panel==='export'&&<Export items={sorted} view={view} say={say} onClose={()=>setPanel(null)}/>}
  {ed&&<Edit c={ed} rect={edit.rect} onS={(id,s)=>setRoster(r=>r.map(x=>x.id===id?{...x,s}:x))} onClose={()=>setEdit(null)}/>}
  {menu&&<div role="menu" style={{left:Math.min(menu.x,innerWidth-140),top:menu.y}} className="fixed z-50 bg-s3 border border-linemid rounded p-1 a-pm"><button role="menuitem" autoFocus className="btn !border-0 !bg-transparent w-full" onClick={()=>remove(menu.c)}><Trash2 size={14} aria-hidden="true"/>Remove {menu.c.name}</button></div>}
  <div role="status" aria-live="polite" className="sr-only">{msg}</div>
 </>
}
