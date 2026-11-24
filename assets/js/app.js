(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const pad2=n=>String(n).padStart(2,'0');
const toMin=s=>{const p=s.split(':');return +p[0]*60+ +p[1];};
const t12=m=>{m=((m%1440)+1440)%1440;let h=Math.floor(m/60),mm=m%60,ap=h<12?'AM':'PM';h=h%12||12;return h+':'+pad2(mm)+' '+ap;};
const h12=h=>{h=((h%24)+24)%24;return (h%12||12)+' '+(h<12?'AM':'PM');};
const rs=n=>'Rs '+n.toLocaleString('en-US');
const hm=m=>{const h=Math.floor(m/60),r=m%60;return (h?h+'h':'')+(r?(h?' ':'')+r+'m':'');};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label=c=>c.lab||c.n;
const pkNow=()=>new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Karachi'}));
const nowMin=()=>{const d=pkNow();return d.getHours()*60+d.getMinutes();};
const iso=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const today=()=>iso(pkNow());
const fromIso=s=>{const p=s.split('-');return new Date(+p[0],p[1]-1,+p[2]);};
const addDays=(s,n)=>{const d=fromIso(s);d.setDate(d.getDate()+n);return iso(d);};
const dLbl=s=>{const t=today();if(s===t)return 'Today';if(s===addDays(t,1))return 'Tomorrow';return fromIso(s).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}).replace(',','');};
const dShort=s=>fromIso(s).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}).replace(',','');
const bandOf=m=>{m=((m%1440)+1440)%1440;if(m>=240&&m<480)return 'dawn';if(m>=480&&m<960)return 'day';if(m>=960&&m<1200)return 'dusk';return 'night';};
const BAND=k=>BANDS.find(b=>b.k===k);
const CMF=k=>COMFORT.find(c=>c.k===k);
const cName=k=>({t:'Standard',e:'Recliner',b:'Massage seat',s:'Sleeper'}[k]);
const bandHrs=b=>h12(b.a/60)+' – '+h12(b.b/60);
const cIdx=n=>CITIES.findIndex(c=>c.n===n);
function rng(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const LAY={t:{b:[2,2],rows:11},e:{b:[2,2],rows:10},b:{b:[2,1],rows:10},s:{b:[2,1],rows:8}};
const seatsTotal=k=>LAY[k].rows*(LAY[k].b[0]+LAY[k].b[1]);

/* trips */
const TC={};
function tripsFor(ci,d){const key=ci+'|'+d;if(TC[key])return TC[key];const c=CITIES[ci];const avail=['t','e','b','s'].filter(k=>c.f[k]);const out=[],seen={};
 c.w.forEach((w,wi)=>{let a=toMin(w[0]),b=toMin(w[1]);if(b<=a)b+=1440;const span=b-a;const n=Math.max(2,Math.min(8,Math.round(span/40)));
  for(let i=0;i<n;i++){const m=(a+Math.round(span*(i+.5)/n/5)*5)%1440;const k=avail[(i+wi)%avail.length];if(seen[m+k])continue;seen[m+k]=1;
   const op=c.ops[(i*2+wi)%c.ops.length];const r=rng(c.n+d+m+k);const tot=seatsTotal(k);const left=Math.max(3,Math.round(tot*(.2+r()*.6)));
   out.push({id:ci+'.'+d+'.'+m+'.'+k,ci,c,d,m,k,op,fare:c.f[k],left,tot});}});
 out.sort((x,y)=>x.m-y.m);return TC[key]=out;}
function avTrips(ci,d){const t=tripsFor(ci,d);if(d!==today())return t;const n=nowMin()+15;return t.filter(x=>x.m>=n);}
function tripById(id){if(!id)return null;const p=id.split('.');const ci=+p[0];if(!CITIES[ci])return null;return tripsFor(ci,p[1]).find(t=>t.id===id)||null;}

/* state */
let S={};try{S=JSON.parse(sessionStorage.getItem('mm2')||'{}');}catch(e){}
S.d=S.d&&S.d>=today()?S.d:today();S.b=S.b||bandOf(nowMin());S.pax=S.pax||1;S.sel=S.sel||[];S.px=S.px||{};S.reg=S.reg??0;
const save=()=>{try{sessionStorage.setItem('mm2',JSON.stringify(S));}catch(e){}};
const city=()=>S.to!=null&&cIdx(S.to)>=0?CITIES[cIdx(S.to)]:null;
function qs(){const q=new URLSearchParams();if(S.to)q.set('to',S.to);q.set('d',S.d);if(S.b)q.set('b',S.b);if(S.c)q.set('c',S.c);if(S.t)q.set('t',S.t);if(S.pax>1)q.set('pax',S.pax);return q.toString();}
const ORDER=['','where','when','comfort','trips','trip','seat','details','done'];
const PARENT={where:'',when:'where',comfort:'when',trips:'comfort',trip:'trips',seat:'trip',details:'seat',done:'',deals:'',live:''};
let cur=null,depth=0;
function go(r,replace){const h='#/'+r+(r&&!['deals','live'].includes(r)?'?'+qs():'');save();if(replace)history.replaceState(null,'',h),route();else{depth++;location.hash=h;}}
function parse(){const h=location.hash.replace(/^#\/?/,'');const [r,q]=h.split('?');const p=new URLSearchParams(q||'');
 if(p.has('to')&&cIdx(p.get('to'))>=0)S.to=p.get('to');if(p.has('d')&&/^\d{4}-\d\d-\d\d$/.test(p.get('d')))S.d=p.get('d')<today()?today():p.get('d');
 if(p.has('b'))S.b=p.get('b');if(p.has('c'))S.c=p.get('c');if(p.has('pax'))S.pax=Math.max(1,Math.min(6,+p.get('pax')||1));
 if(p.has('t')&&p.get('t')!==S.t){S.t=p.get('t');S.sel=[];S.px={};}
 return r||'';}

/* ui helpers */
const app=$('#app'),cta=$('#cta'),crumb=$('#crumb');
const ARR='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function setCta(html,bind){if(!html){document.body.classList.remove('has-cta');cta.innerHTML='';return;}document.body.classList.add('has-cta');cta.innerHTML=html;bind&&bind();}
function setCrumb(parts){if(!parts){delete document.body.dataset.crumb;return;}document.body.dataset.crumb=1;crumb.innerHTML=parts.filter(Boolean).map((p,i)=>i===0?`<b>${esc(p)}</b>`:esc(p)).join(' · ');}
function setWiz(step){const b=document.body,prev=+(b.dataset.wiz||0);if(!step){delete b.dataset.wiz;return;}b.dataset.wiz=step;
 $$('.segs i').forEach((x,i)=>x.classList.toggle('on',i<step));const hop=$('#hop');hop.style.setProperty('--hx',((step-1)*33.333+31)+'%');hop.style.left=`calc(var(--gut) + (100% - 2*var(--gut)) * ${(step)/3} - 18px)`;
 if(prev&&prev!==step){hop.classList.remove('jump');void hop.offsetWidth;hop.classList.add('jump');}}
function crumbBase(){const c=city();return [dShort(S.d),c?label(c):null];}
const bandTxt=()=>S.b&&S.b!=='any'?BAND(S.b).n:null;
const cmfTxt=()=>S.c&&S.c!=='any'?cName(S.c):null;

/* views */
const V={};
V['']=()=>{setCrumb(null);setWiz(0);setCta(null);
 const c=city();
 app.innerHTML=`<div class="v0"><section class="hero"><picture><source media="(max-width:760px)" srcset="assets/img/hero-m.svg"><img src="assets/img/hero.svg" alt="Karachi Bus Terminal gate"></picture>
 <h1>Jab chao,<br><span>jidhar bhi.</span></h1>
 <form class="bar" id="bar" autocomplete="off">
  <button type="button" class="fld" id="fTo"><small>Going to</small><b class="${c?'':'ph'}">${c?esc(label(c)):'Any city'}</b></button>
  <label class="fld" id="fD"><small>Leaving on</small><b>${dLbl(S.d)}${S.d===today()||S.d===addDays(today(),1)?' · '+dShort(S.d).split(' ').slice(1).join(' '):''}</b><input type="date" id="dIn" value="${S.d}" min="${today()}"></label>
  <div class="seg" id="seg">${BANDS.map(b=>`<button type="button" data-b="${b.k}" class="${S.b===b.k?'on':''}">${b.n}<small>${h12(b.a/60).replace(' ','')}–${h12(b.b/60).replace(' ','')}</small></button>`).join('')}</div>
  <button class="btn btn-red" type="submit">Find departures ${ARR}</button>
 </form></section>
 <section class="sec"><div class="sec-h"><h2>Routes</h2><a href="#/where">All ${CITIES.length} ${ARR}</a></div>
 <div class="rail">${['Lahore','Rawalpindi','Hyderabad','Sukkur','Multan','Peshawar','Quetta','Swat','Gilgit','Gwadar'].map(n=>{const x=CITIES[cIdx(n)];return `<button class="pc" data-c="${x.n}"><img src="${x.img}" alt="" loading="lazy"><div class="pt"><h3>${esc(label(x).replace(' – Islamabad',''))}</h3><div class="meta"><span>${x.km.toLocaleString()} km</span><span>${hm(x.m)}</span></div></div></button>`;}).join('')}</div></section>
 <section class="sec"><div class="sec-h"><h2>Departures</h2><a href="#/live">Live ${ARR}</a></div><div class="board">${liveRows(5)}</div></section>
 ${FOOT}</div>`;
 $('#fTo').onclick=()=>cityPicker(n=>{S.to=n;save();V['']();});
 $('#dIn').onchange=e=>{if(e.target.value){S.d=e.target.value<today()?today():e.target.value;save();V['']();}};
 $('#fD').onclick=e=>{const i=$('#dIn');try{i.showPicker();e.preventDefault();}catch(_){}};
 $$('#seg button').forEach(b=>b.onclick=()=>{S.b=b.dataset.b;save();$$('#seg button').forEach(x=>x.classList.toggle('on',x===b));});
 $('#bar').onsubmit=e=>{e.preventDefault();S.c=null;S.t=null;go(city()?'comfort':'where');};
 $$('.rail .pc').forEach(b=>b.onclick=()=>{S.to=b.dataset.c;S.c=null;S.t=null;go('when');});
 bindRows();};
const FOOT=`<footer class="foot"><span><b>Meri Manzil</b> — Seat sachi, manzil pakki</span><span>Karachi Bus Terminal, Super Highway · <a href="https://wa.me/923703450407">0370 3450407</a></span><span>© 2026 Meri Manzil Technologies</span></footer>`;

function liveList(){const t=today(),n=nowMin()-10,out=[];CITIES.forEach((c,ci)=>{tripsFor(ci,t).forEach(x=>{if(x.m>=n)out.push({...x,abs:x.m});});tripsFor(ci,addDays(t,1)).forEach(x=>out.push({...x,abs:x.m+1440}));});return out.sort((a,b)=>a.abs-b.abs);}
function rowHtml(x){const diff=x.abs-nowMin();const st=diff<=30?'<i class="bd">Boarding</i>':(x.abs>=1440?'<i>Tomorrow</i>':'<i>On time</i>');
 return `<button class="row" data-t="${x.id}"><span class="t">${t12(x.m)}</span><span class="d"><b>${esc(label(x.c))}</b><small>${esc(x.op)} · ${cName(x.k)}</small></span><span class="o">${esc(x.op)}</span><span class="c">${cName(x.k)}</span><span class="s">${st}</span></button>`;}
function liveRows(n,f){let l=liveList();if(f)l=l.filter(f);return l.slice(0,n).map(rowHtml).join('');}
function bindRows(){$$('.row[data-t]').forEach(b=>b.onclick=()=>pickTrip(b.dataset.t));}
function pickTrip(id){const t=tripById(id);if(!t)return;S.to=t.c.n;S.d=t.d;S.b=bandOf(t.m);S.c=t.k;if(S.t!==id){S.sel=[];S.px={};}S.t=id;go('trip');}

V.where=()=>{setCrumb([dShort(S.d)]);setWiz(0);
 const c=city();if(c&&S.reg==null)S.reg=c.r;
 app.innerHTML=`<div class="view"><h1 class="ttl">Where</h1><div class="chips" id="rg">${REGIONS.map((r,i)=>`<button class="chip ${i===S.reg?'on':''}" data-i="${i}">${r.n}</button>`).join('')}</div><div class="grid g5" id="cg"></div></div>`;
 const draw=()=>{$('#cg').innerHTML=CITIES.filter(x=>x.r===S.reg).map(x=>`<button class="pc ${S.to===x.n?'on':''}" data-c="${x.n}"><img src="${x.img}" alt=""><div class="pt"><h3>${esc(label(x))}</h3><div class="meta"><span>${x.km.toLocaleString()} km</span><span>${hm(x.m)}</span></div></div></button>`).join('');
  $$('#cg .pc').forEach(b=>b.onclick=()=>{$$('#cg .pc').forEach(x=>x.classList.toggle('on',x===b));if(S.to!==b.dataset.c){S.t=null;S.c=null;}S.to=b.dataset.c;save();setTimeout(()=>go('when'),240);});};
 draw();$$('#rg .chip').forEach(b=>b.onclick=()=>{S.reg=+b.dataset.i;save();$$('#rg .chip').forEach(x=>x.classList.toggle('on',x===b));draw();});
 setCta(c?`<div class="cta-in"><button class="btn btn-red" id="nx">${esc(label(c))} ${ARR}</button></div>`:null,()=>$('#nx').onclick=()=>go('when'));};

V.when=()=>{const c=city();if(!c)return go('where',1);setCrumb(crumbBase());setWiz(0);const ci=cIdx(c.n);
 const days=[...Array(7)].map((_,i)=>addDays(today(),i));
 const all=avTrips(ci,S.d);
 app.innerHTML=`<div class="view"><h1 class="ttl q">What time do you prefer?</h1>
 <div class="chips">${days.map((d,i)=>{const f=fromIso(d);return `<button class="chip day ${d===S.d?'on':''}" data-d="${d}"><small>${i===0?'Today':i===1?'Tmrw':f.toLocaleDateString('en-GB',{weekday:'short'})}</small><b>${f.getDate()}</b></button>`;}).join('')}</div>
 <div class="grid">${BANDS.map(b=>{const l=all.filter(t=>bandOf(t.m)===b.k);const fs=l.map(t=>t.fare);const mn=Math.min(...fs),mx=Math.max(...fs);
  return `<button class="pc tall ${l.length?'':'off'} ${S.b===b.k&&l.length?'on':''}" data-b="${b.k}"><img src="${b.img}" alt=""><div class="pt"><h3>${b.n}</h3><span class="big">${bandHrs(b)}</span>${l.length?`<span class="big">${mn===mx?rs(mn):rs(mn)+'–'+mx.toLocaleString()}</span><span class="pill">${l.length} trip${l.length>1?'s':''}</span>`:'<span class="pill">No trips</span>'}</div></button>`;}).join('')}</div></div>`;
 $$('.chip.day').forEach(b=>b.onclick=()=>{S.d=b.dataset.d;S.t=null;save();go('when',1);});
 $$('.pc[data-b]').forEach(b=>b.onclick=()=>{$$('.pc[data-b]').forEach(x=>x.classList.toggle('on',x===b));S.b=b.dataset.b;S.c=null;save();setTimeout(()=>go('comfort'),240);});
 setCta(`<div class="cta-in"><button class="btn btn-red" id="all"${all.length?'':' disabled'}>${all.length===1?'Show 1 trip':'Show all '+all.length+' trips'}</button><button class="lnk" id="ns">Not sure, next →</button></div>`,()=>{$('#all').onclick=()=>{S.b='any';S.c='any';go('trips');};$('#ns').onclick=()=>{S.b='any';S.c=null;go('comfort');};});};

V.comfort=()=>{const c=city();if(!c)return go('where',1);setCrumb([...crumbBase(),bandTxt()]);setWiz(0);const ci=cIdx(c.n);
 const l=avTrips(ci,S.d).filter(t=>!S.b||S.b==='any'||bandOf(t.m)===S.b);
 app.innerHTML=`<div class="view"><h1 class="ttl">Comfort</h1><div class="grid">${COMFORT.map(k=>{const x=l.filter(t=>t.k===k.k);const p=c.f[k.k];
  return `<button class="pc tall ${x.length?'':'off'} ${S.c===k.k?'on':''}" data-k="${k.k}"><img src="${k.img}" alt=""><div class="pt"><h3>${k.n}</h3>${x.length?`<span class="big">${rs(p)}</span><span class="pill">${x.length} trip${x.length>1?'s':''}</span>`:'<span class="pill">No trips</span>'}</div></button>`;}).join('')}</div></div>`;
 $$('.pc[data-k]').forEach(b=>b.onclick=()=>{$$('.pc[data-k]').forEach(x=>x.classList.toggle('on',x===b));S.c=b.dataset.k;save();setTimeout(()=>go('trips'),240);});
 setCta(`<div class="cta-in"><button class="btn btn-red" id="all"${l.length?'':' disabled'}>${l.length===1?'Show 1 trip':'Show all '+l.length+' trips'}</button>${l.length?'':'<button class="lnk" id="ns">Change time</button>'}</div>`,()=>{$('#all').onclick=()=>{S.c='any';go('trips');};const n=$('#ns');if(n)n.onclick=()=>go('when');});};

V.trips=()=>{const c=city();if(!c)return go('where',1);setCrumb([...crumbBase(),bandTxt(),cmfTxt()]);setWiz(0);setCta(null);const ci=cIdx(c.n);
 const base=avTrips(ci,S.d);const l=base.filter(t=>(!S.b||S.b==='any'||bandOf(t.m)===S.b)&&(!S.c||S.c==='any'||t.k===S.c));
 const chip=(k,v,t,on)=>`<button class="chip ${on?'on':''}" data-${k}="${v}">${t}</button>`;
 app.innerHTML=`<div class="view"><div class="flow2"><aside class="side"><div class="city"><img src="${c.img}" alt=""><div><b>${esc(label(c))}</b><small>${dLbl(S.d)} · ${c.km.toLocaleString()} km</small></div></div>
 <h4>Time</h4><div class="chips">${chip('b','any','Any',!S.b||S.b==='any')}${BANDS.map(b=>chip('b',b.k,b.n,S.b===b.k)).join('')}</div>
 <h4>Comfort</h4><div class="chips">${chip('c','any','Any',!S.c||S.c==='any')}${COMFORT.filter(k=>c.f[k.k]).map(k=>chip('c',k.k,k.n,S.c===k.k)).join('')}</div></aside>
 <div><h1 class="ttl">Trips</h1>${l.length?`<div class="trips">${l.map(t=>`<button class="trip" data-t="${t.id}"><div><h3>${esc(t.op)}</h3><div class="tm">${t12(t.m)}<small>${BAND(bandOf(t.m)).n}</small></div><div class="k"><b>${cName(t.k)}</b> · ${t.left} left</div></div><span class="price">${rs(t.fare)}</span></button>`).join('')}</div>`:`<div class="empty">No trips<br><button class="btn btn-red" id="ch">Show all ${base.length} trips</button></div>`}</div></div></div>`;
 $$('.trip').forEach(b=>b.onclick=()=>pickTrip(b.dataset.t));
 $$('.side [data-b]').forEach(b=>b.onclick=()=>{S.b=b.dataset.b;go('trips',1);});
 $$('.side [data-c]').forEach(b=>b.onclick=()=>{S.c=b.dataset.c;go('trips',1);});
 const ch=$('#ch');if(ch)ch.onclick=()=>{S.b='any';S.c='any';go('trips',1);};};

function tripCrumb(t){return [dShort(t.d),label(t.c),t12(t.m),cName(t.k),S.sel.length?S.sel.length+' traveller'+(S.sel.length>1?'s':''):null];}
const mono=op=>op.split(/[\s-]+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
V.trip=()=>{const t=tripById(S.t);if(!t)return go(city()?'trips':'where',1);setCrumb(tripCrumb(t));setWiz(1);
 const arr=t.m+t.c.m;const days=Math.floor(arr/1440);
 app.innerHTML=`<div class="view"><div class="wz one"><div><h1 class="ttl">Trip</h1><div class="tcard"><div class="hd"><span class="mono">${mono(t.op)}</span><div><h2>${esc(t.op)}</h2><small>${cName(t.k)} · ${dLbl(t.d)}</small></div></div>
 <div class="leg"><div><b>${t12(t.m)}</b><small>Karachi</small></div><div class="ln"><span>${hm(t.c.m)}</span></div><div><b>${t12(arr)}</b><small>${esc(label(t.c))}${days?' · +'+days:''}</small></div></div>
 <img src="${CMF(t.k).img}" alt="">
 <div class="facts"><div><small>From</small><b>KBT</b></div><div><small>Distance</small><b>${t.c.km.toLocaleString()} km</b></div><div><small>Seats left</small><b>${t.left}</b></div></div>
 <div class="ft"><span>${rs(t.fare)}<small>per seat</small></span><span>${hm(t.c.m)}</span></div></div></div><div class="aside"></div></div></div>`;
 setCta(`<div class="cta-in"><button class="btn btn-red" id="nx">Next</button></div>`,()=>$('#nx').onclick=()=>go('seat'));};

function seatMap(t){const L=LAY[t.k];const r=rng('seats'+t.id);const tot=seatsTotal(t.k);const booked={};const nb=tot-t.left;const nums=[...Array(tot)].map((_,i)=>i+1);
 for(let i=nums.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[nums[i],nums[j]]=[nums[j],nums[i]];}
 nums.slice(0,nb).forEach(n=>booked[n]=r()<.5?'m':'f');
 const rows=[];let n=1;for(let i=0;i<L.rows;i++){const a=[],b=[];for(let j=0;j<L.b[0];j++)a.push(n++);for(let j=0;j<L.b[1];j++)b.push(n++);rows.push([a,b]);}
 const partner={};rows.forEach(([a,b])=>[a,b].forEach(g=>{if(g.length===2){partner[g[0]]=g[1];partner[g[1]]=g[0];}}));
 return {rows,booked,partner,L};}
function allowed(map,n){const p=map.partner[n];const pb=p&&map.booked[p];return pb?[pb]:['m','f'];}
V.seat=()=>{const t=tripById(S.t);if(!t)return go('where',1);setWiz(2);const map=seatMap(t);
 const draw=()=>{setCrumb(tripCrumb(t));
  const seat=n=>{const b=map.booked[n];const s=S.sel.findIndex(x=>x.n===n);const cls=b?'b'+b:(s>=0?S.sel[s].g:'');return `<button class="seat ${cls}" data-n="${n}" aria-label="Seat ${n}">${n}${s>=0?`<span class="ix">${s+1}</span>`:''}</button>`;};
  const cols=map.L.b[0]+'x';
  $('#bus').innerHTML=`<div class="front"><span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="14" r="8"/><path d="M12 14v.01M4.5 12h15"/></svg></div>`+map.rows.map(([a,b])=>`<div class="srow" style="grid-template-columns:repeat(${a.length},52px) 22px repeat(${b.length},52px)">${a.map(seat).join('')}<i class="gap"></i>${b.map(seat).join('')}</div>`).join('');
  $('#stpN').textContent=S.pax+' traveller'+(S.pax>1?'s':'');
  $$('#bus .seat').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;const al=allowed(map,n);const i=S.sel.findIndex(x=>x.n===n);
   if(i<0){if(S.sel.length>=S.pax){if(S.pax<6)S.pax++;else S.sel.shift();}S.sel.push({n,g:al[0]});}
   else{const g=S.sel[i].g;const nx=al[al.indexOf(g)+1];if(nx)S.sel[i].g=nx;else S.sel.splice(i,1);}
   save();draw();});
  const ok=S.sel.length===S.pax;const tot=S.sel.length*t.fare;
  $('#sl').innerHTML=S.sel.length?S.sel.map((x,i)=>`<div class="row" style="grid-template-columns:auto 1fr auto"><span class="dot ${x.g}"></span><span><b>Seat ${x.n}</b></span><span class="num">${rs(t.fare)}</span></div>`).join(''):'';
  setCta(`<div class="cta-box"><div class="cta-sum"><span>${S.sel.length?'Seats '+S.sel.map(x=>x.n).sort((a,b)=>a-b).join(', '):'Pick '+S.pax+' seat'+(S.pax>1?'s':'')}</span><span>${rs(tot||t.fare*S.pax)}</span></div><div class="cta-in"><button class="btn btn-red" id="nx"${ok?'':' disabled'}>Next</button></div></div>`,()=>$('#nx').onclick=()=>go('details'));};
 app.innerHTML=`<div class="view"><h1 class="ttl">Seat</h1><div class="stp"><button id="pm" aria-label="Fewer">−</button><b id="stpN"></b><button id="pp" aria-label="More">+</button></div>
 <div class="seatwrap"><div class="bus" id="bus"></div><div><div class="legend"><span><i style="background:var(--male)"></i>Male</span><span><i style="background:var(--female)"></i>Female</span><span><i style="border:1.5px solid rgba(255,255,255,.3)"></i>Open</span></div><div class="sel-list board" id="sl" style="margin-top:18px"></div></div></div></div>`;
 $('#pm').onclick=()=>{if(S.pax>1){S.pax--;if(S.sel.length>S.pax)S.sel.length=S.pax;save();draw();}};
 $('#pp').onclick=()=>{if(S.pax<6){S.pax++;save();draw();}};
 draw();};

const fmtMob=v=>{v=v.replace(/\D/g,'');if(v[0]==='0')v=v.slice(1);if(v.startsWith('92'))v=v.slice(2);v=v.slice(0,10);return v.length>3?v.slice(0,3)+'-'+v.slice(3):v;};
const fmtCnic=v=>{v=v.replace(/\D/g,'').slice(0,13);return v.length>12?v.slice(0,5)+'-'+v.slice(5,12)+'-'+v.slice(12):v.length>5?v.slice(0,5)+'-'+v.slice(5):v;};
const okName=v=>/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v.trim());
const okMob=v=>/^3\d{2}-\d{7}$/.test(v);
const okCnic=v=>/^\d{5}-\d{7}-\d$/.test(v);
const cg=v=>(+v.slice(-1))%2?'m':'f';
V.details=()=>{const t=tripById(S.t);if(!t)return go('where',1);if(S.sel.length!==S.pax||!S.sel.length)return go('seat',1);setCrumb(tripCrumb(t));setWiz(3);const map=seatMap(t);
 S.mob=S.mob||'';
 const inp=(id,lbl,val,ph,extra,err)=>`<label class="inp" id="w-${id}"><span>${lbl}</span><div class="box">${extra||''}<input id="${id}" value="${esc(val||'')}" placeholder="${ph}" ${id.startsWith('c')||id==='mob'?'inputmode="numeric" class="mono2"':'autocomplete="off" autocapitalize="words"'}></div><div class="err">${err}</div></label>`;
 app.innerHTML=`<div class="view"><div class="wz"><div><h1 class="ttl">Details</h1>${S.sel.map((x,i)=>{const p=S.px[x.n]||{};return `<div class="pcard" data-n="${x.n}"><h3><span class="dot ${x.g}" id="dot${x.n}"></span>Seat ${x.n}</h3>
  <div class="two">${inp('fn'+x.n,'First name',p.fn,'As on CNIC','','Letters only')}${inp('ln'+x.n,'Last name',p.ln,'As on CNIC','','Letters only')}</div>
  ${i===0?inp('mob','Mobile',S.mob,'3XX-XXXXXXX','<span class="pre">+92</span>','Enter 3XX-XXXXXXX'):''}
  ${inp('cn'+x.n,'CNIC',p.cn,'XXXXX-XXXXXXX-X','','')}</div>`;}).join('')}</div><div class="aside"><div class="sum"><img src="${t.c.img}" alt=""><div><h3>Karachi → ${esc(label(t.c))}</h3><p>${dLbl(t.d)} · ${t12(t.m)} · ${esc(t.op)} · ${cName(t.k)}</p><ul>${S.sel.map(x=>`<li><span class="dot ${x.g}" data-sd="${x.n}"></span><span>Seat ${x.n}</span><span>${rs(t.fare)}</span></li>`).join('')}</ul><div class="tt"><span>Total</span><span>${rs(t.fare*S.sel.length)}</span></div></div></div></div></div></div>`;
 const check=(show)=>{let all=true;
  S.sel.forEach(x=>{const p=S.px[x.n]||(S.px[x.n]={});
   [['fn',okName],['ln',okName]].forEach(([k,f])=>{const v=p[k]||'';const w=$('#w-'+k+x.n);const g=f(v);w.classList.toggle('bad',!!(v&&!g||show&&!v));w.classList.toggle('ok',!!g);if(!g)all=false;});
   const v=p.cn||'';const w=$('#w-cn'+x.n);let err='';
   if(okCnic(v)){const g=cg(v);if(allowed(map,x.n).includes(g)){x.g=g;}else err="CNIC doesn't match seat gender";}
   else if(v.length>=15||show&&v)err='Enter XXXXX-XXXXXXX-X';else if(show)err='Enter XXXXX-XXXXXXX-X';
   $('#dot'+x.n).className='dot '+x.g;const sd=$('[data-sd="'+x.n+'"]');if(sd)sd.className='dot '+x.g;w.querySelector('.err').textContent=err;w.classList.toggle('bad',!!err);w.classList.toggle('ok',!!(okCnic(v)&&!err));if(!okCnic(v)||err)all=false;});
  const mw=$('#w-mob');const mg=okMob(S.mob);mw.classList.toggle('bad',!!(S.mob.length>=11&&!mg||show&&!mg));mw.classList.toggle('ok',!!mg);if(!mg)all=false;
  $('#cf').disabled=!all;save();return all;};
 setCta(`<div class="cta-box"><div class="cta-sum"><span>${S.sel.length} × ${rs(t.fare)}</span><span>${rs(S.sel.length*t.fare)}</span></div><div class="cta-in"><button class="btn btn-red" id="cf" disabled>Confirm</button></div></div>`,()=>$('#cf').onclick=()=>{if(check(true)){S.ref='MM-'+[...Array(4)].map(()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');S.done={t:S.t,sel:S.sel.map(x=>({...x,...S.px[x.n]})),mob:S.mob,ref:S.ref,pax:S.pax};go('done');}});
 S.sel.forEach(x=>{['fn','ln'].forEach(k=>{const e=$('#'+k+x.n);e.oninput=()=>{const c=e.value.replace(/[^A-Za-z ]/g,'').replace(/\s{2,}/g,' ').replace(/^\s/,'');if(c!==e.value)e.value=c;S.px[x.n][k]=c;check();};});
  const c=$('#cn'+x.n);c.oninput=()=>{c.value=fmtCnic(c.value);S.px[x.n].cn=c.value;check();};});
 const m=$('#mob');m.oninput=()=>{m.value=fmtMob(m.value);S.mob=m.value;check();};
 check();};

V.done=()=>{const D=S.done;const t=D&&tripById(D.t);if(!t)return go('',1);setCrumb([dShort(t.d),label(t.c),t12(t.m),cName(t.k),D.sel.length+' traveller'+(D.sel.length>1?'s':'')]);setWiz(0);
 const mask=c=>'*****-*****'+c.slice(-5);
 app.innerHTML=`<div class="view"><div class="conf-w"><h1 class="ttl">Confirmed</h1><div class="conf"><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span>
 <div class="ref">${D.ref}</div><h2>Karachi → ${esc(label(t.c))}</h2>
 <div class="sub">${dLbl(t.d)}, ${dShort(t.d)} · ${t12(t.m)}<br>${esc(t.op)} · ${cName(t.k)} · ${BAND(bandOf(t.m)).n}<br>+92 ${D.mob.slice(0,1)}**-****${D.mob.slice(-3)}</div>
 <div class="tot">${rs(t.fare*D.sel.length)}<small>${rs(t.fare)} × ${D.sel.length}</small></div>
 <ul>${D.sel.map(x=>`<li><span class="dot ${x.g}"></span>Seat ${x.n} · ${esc(x.fn+' '+x.ln)}<span>${mask(x.cn)}</span></li>`).join('')}</ul></div></div></div>`;
 const txt=`Meri Manzil ${D.ref}\nKarachi → ${label(t.c)}\n${dShort(t.d)} · ${t12(t.m)}\n${t.op} · ${cName(t.k)}\nSeats ${D.sel.map(x=>x.n).join(', ')}\n${rs(t.fare*D.sel.length)}`;
 setCta(`<div class="cta-in"><a class="btn btn-wa" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Send to WhatsApp</a></div>`);};

V.deals=()=>{setCrumb(null);setWiz(0);setCta(null);
 const t=today(),tm=addDays(t,1);const deals=CITIES.map((c,ci)=>{const l=[...avTrips(ci,t),...tripsFor(ci,tm)];if(!l.length)return null;return l.reduce((a,b)=>b.fare<a.fare?b:a);}).filter(Boolean);
 app.innerHTML=`<div class="view"><h1 class="ttl">Deals</h1><div class="chips" id="dr"><button class="chip on" data-r="-1">All</button>${REGIONS.map((r,i)=>`<button class="chip" data-r="${i}">${r.n}</button>`).join('')}</div><div class="grid g5" id="dg"></div></div>${FOOT}`;
 const draw=r=>{$('#dg').innerHTML=deals.filter(x=>r<0||x.c.r===r).map(x=>`<button class="deal" data-t="${x.id}"><img src="${x.c.img}" alt="" loading="lazy"><div><h3>${esc(label(x.c).replace(' – Islamabad',''))}</h3><small>${esc(x.op)}</small><small>${x.d===t?'Today':'Tomorrow'} ${t12(x.m)} · ${cName(x.k)}</small><div class="p">${rs(x.fare)}</div></div></button>`).join('');$$('.deal').forEach(b=>b.onclick=()=>pickTrip(b.dataset.t));};
 draw(-1);$$('#dr .chip').forEach(b=>b.onclick=()=>{$$('#dr .chip').forEach(x=>x.classList.toggle('on',x===b));draw(+b.dataset.r);});};

let liveTimer;
V.live=()=>{setCrumb(null);setWiz(0);setCta(null);let fb='all',fr=-1,n=10;
 app.innerHTML=`<div class="view"><div class="live-h"><div class="top"><h1>Departures</h1><span class="clock" id="clk"></span></div>
 <div class="chips" id="lb"><button class="chip on" data-b="all">All</button>${BANDS.map(b=>`<button class="chip" data-b="${b.k}">${b.n}</button>`).join('')}<span style="width:1px;background:var(--line);flex:none;margin:6px 4px"></span><button class="chip on" data-r="-1">All regions</button>${REGIONS.map((r,i)=>`<button class="chip" data-r="${i}">${r.s||r.n}</button>`).join('')}</div></div>
 <div class="board" id="lv"></div><div class="more"><button class="btn btn-ghost" id="mo">Show more</button></div></div>${FOOT}`;
 const draw=()=>{const f=x=>(fb==='all'||bandOf(x.m)===fb)&&(fr<0||x.c.r===fr);const l=liveList().filter(f);$('#lv').innerHTML=l.slice(0,n).map(rowHtml).join('')||'<div class="empty" style="border:0">No departures</div>';bindRows();$('#mo').style.display=l.length>n?'':'none';$('#clk').textContent='Karachi '+t12(nowMin());};
 $$('#lb [data-b]').forEach(b=>b.onclick=()=>{fb=b.dataset.b;n=10;$$('#lb [data-b]').forEach(x=>x.classList.toggle('on',x===b));draw();});
 $$('#lb [data-r]').forEach(b=>b.onclick=()=>{fr=+b.dataset.r;n=10;$$('#lb [data-r]').forEach(x=>x.classList.toggle('on',x===b));draw();});
 $('#mo').onclick=()=>{n+=10;draw();};draw();clearInterval(liveTimer);liveTimer=setInterval(()=>{if(cur==='live')draw();},30000);};

/* city picker sheet */
function cityPicker(cb){const sh=$('#sheet'),si=$('#sheetIn');let reg=-1,q='';
 si.innerHTML=`<div class="sh-top"><label class="inp" style="margin:0;flex:1"><div class="box"><input id="cq" placeholder="Search city" autocomplete="off"></div></label><button class="x" id="cx" aria-label="Close">×</button></div><div class="chips" id="cr"><button class="chip on" data-r="-1">All</button>${REGIONS.map((r,i)=>`<button class="chip" data-r="${i}">${r.s||r.n}</button>`).join('')}</div><div class="list" id="cl"></div>`;
 const draw=()=>{$('#cl').innerHTML=REGIONS.map((r,i)=>{if(reg>=0&&reg!==i)return '';const l=CITIES.filter(c=>c.r===i&&(c.n+' '+(c.lab||'')).toLowerCase().includes(q));return l.length?`<h4>${r.n}</h4>`+l.map(c=>`<button data-c="${c.n}" class="${S.to===c.n?'on':''}">${esc(label(c))}<span>${rs(Math.min(...Object.values(c.f).filter(Boolean)))}</span></button>`).join(''):'';}).join('');
  $$('#cl button').forEach(b=>b.onclick=()=>{close();cb(b.dataset.c);});};
 const close=()=>sh.classList.remove('open');
 draw();sh.classList.add('open');setTimeout(()=>{if(matchMedia('(min-width:760px)').matches)$('#cq').focus();},50);
 $('#cq').oninput=e=>{q=e.target.value.toLowerCase().trim();draw();};$('#cx').onclick=close;sh.onclick=e=>{if(e.target===sh)close();};
 $$('#cr .chip').forEach(b=>b.onclick=()=>{reg=+b.dataset.r;$$('#cr .chip').forEach(x=>x.classList.toggle('on',x===b));draw();});}

/* router */
function route(){const r=parse();save();const prevI=ORDER.indexOf(cur),nI=ORDER.indexOf(r);
 document.body.classList.toggle('back-anim',prevI>=0&&nI>=0&&nI<prevI);
 const view=V[r]?r:'';cur=view;document.body.dataset.r=view;
 document.body.dataset.mode=(view===''||view==='deals'||view==='live')?'top':'flow';
 $$('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===view));
 $('#sheet').classList.remove('open');V[view]();if(view!==''||!document.body.classList.contains('scrolled'))scrollTo(0,0);
 document.title=(view?({where:'Where',when:'When',comfort:'Comfort',trips:'Trips',trip:'Trip',seat:'Seat',details:'Details',done:'Confirmed',deals:'Deals',live:'Live'}[view])+' · ':'')+'Meri Manzil';}
$('#back').onclick=()=>{if(depth>0){depth--;history.back();}else go(PARENT[cur]||'',1);};
addEventListener('hashchange',route);
addEventListener('scroll',()=>document.body.classList.toggle('scrolled',scrollY>30),{passive:true});
const st=document.body.dataset.start;if(st&&!location.hash)history.replaceState(null,'','#/'+st);
route();
window.MM={S,tripsFor,avTrips,liveList};
})();
