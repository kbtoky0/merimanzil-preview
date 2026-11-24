(function(){
const q=new URLSearchParams(location.search);
const base=()=>{const d=pkNow();d.setHours(0,0,0,0);return d;};
const st={city:cityBy(q.get('to'))?q.get('to'):null,date:q.get('date')||isoDay(base()),band:q.get('band')||null,comfort:q.get('comfort')||null,dep:null,depT:q.get('dep'),pax:+q.get('pax')||1,g:'m',seats:{},reg:0};
if(st.city)st.reg=cityBy(st.city).r;
if(st.band&&!BANDS.find(b=>b.k===st.band))st.band=null;
function trips(){const c=st.city&&cityBy(st.city);if(!c)return[];const out=[];
 c.w.forEach(([a,b],wi)=>{let s=toMin(a),e=toMin(b);if(e<=s)e+=1440;c.ops.forEach((op,i)=>{const m=s+((i*95+wi*40)%Math.max(30,e-s));const t=Math.round(m/15)*15;
  const ks=['t','e','b','s'].filter(k=>c.f[k]);const k=ks[(i+wi)%ks.length];out.push({m:t,op,k,fare:c.f[k],bay:(i*3+wi)%12+1});});});
 PLAN.filter(p=>p[1]===c.n).forEach(p=>{if(!out.find(o=>o.m%1440===toMin(p[0])&&o.op===p[2]))out.push({m:toMin(p[0]),op:p[2],k:p[3],fare:c.f[p[3]]||fromFare(c),bay:p[4]});});
 return out.map(o=>({...o,m:o.m%1440})).sort((a,b)=>a.m-b.m);}
function seed(n){let h=5381;for(const ch of n)h=((h<<5)+h+ch.charCodeAt(0))|0;return ()=>{h=(h*1103515245+12345)&0x7fffffff;return h/0x7fffffff;};}
function layout(k){if(k==='s')return{cols:[1,0,2],rows:6,berth:true};if(k==='b')return{cols:[1,0,2],rows:9};return{cols:[2,0,2],rows:k==='e'?10:11};}
function render(){
 const c=st.city&&cityBy(st.city);
 $('#bHero').src=c?c.img:'assets/img/hero.svg';$('#bTitle').textContent=c?'Karachi → '+label(c):'Book tickets';
 $('#regTabs').innerHTML=REGIONS.map((r,i)=>`<button class="chip ${i===st.reg?'on':''}" data-r="${i}">${r.s||r.n}</button>`).join('');
 $$('#regTabs .chip').forEach(b=>b.onclick=()=>{st.reg=+b.dataset.r;render();});
 $('#cGrid').innerHTML=CITIES.filter(x=>x.r===st.reg).map(x=>`<button class="ctile ${x.n===st.city?'on':''}" data-c="${x.n}"><i style="background-image:url('${x.img}')"></i><b>${label(x)}</b><small>From ${pkr(fromFare(x))}</small></button>`).join('');
 $$('#cGrid .ctile').forEach(b=>b.onclick=()=>{st.city=b.dataset.c;st.dep=null;st.seats={};if(st.comfort&&!cityBy(st.city).f[st.comfort])st.comfort=null;render();});
 const d0=base();$('#days').innerHTML=[...Array(7)].map((_,i)=>{const d=new Date(d0);d.setDate(d.getDate()+i);const v=isoDay(d);return `<button class="dayb ${v===st.date?'on':''}" data-d="${v}"><small>${i===0?'Today':i===1?'Tomorrow':d.toLocaleDateString('en-GB',{weekday:'short'})}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-GB',{month:'short'})}</small></button>`;}).join('');
 $$('#days .dayb').forEach(b=>b.onclick=()=>{st.date=b.dataset.d;st.dep=null;render();});
 $('#bands').innerHTML=BANDS.map(b=>`<button class="ctile btile ${b.k===st.band?'on':''}" data-b="${b.k}"><i style="background-image:url('${b.img}')"></i><b data-i18n="${b.k}">${b.n}</b><small>${bandHours(b)}</small></button>`).join('');
 $$('#bands .ctile').forEach(b=>b.onclick=()=>{st.band=st.band===b.dataset.b?null:b.dataset.b;st.dep=null;render();});
 $('#comforts').innerHTML=COMFORT.map(x=>{const f=c?c.f[x.k]:Math.min(...CITIES.map(y=>y.f[x.k]).filter(Boolean));return `<button class="ctile btile ${x.k===st.comfort?'on':''} ${c&&!f?'off':''}" data-k="${x.k}"><i style="background-image:url('${x.img}')"></i><b>${x.n}</b><small>${f?(c?'':'From ')+pkr(f):'—'}</small></button>`;}).join('');
 $$('#comforts .ctile').forEach(b=>b.onclick=()=>{st.comfort=st.comfort===b.dataset.k?null:b.dataset.k;st.dep=null;st.seats={};render();});
 // trips
 const today=st.date===isoDay(base()),now=nowMin();
 let ts=trips().filter(t=>(!st.band||bandOf(t.m)===st.band)&&(!st.comfort||t.k===st.comfort)&&(!today||t.m>now));
 if(st.depT&&!st.dep){const f=ts.find(t=>t.m===toMin(st.depT));if(f)st.dep=f;st.depT=null;}
 if(st.dep&&!ts.find(t=>t.m===st.dep.m&&t.op===st.dep.op))st.dep=null;
 $('#trips').innerHTML=!c?'<div class="empty">—</div>':ts.length?ts.map((t,i)=>`<button class="trip ${st.dep&&st.dep.m===t.m&&st.dep.op===t.op?'on':''}" data-i="${i}"><span class="tm">${t12(t.m)}</span><span><b>${t.op}</b><small>${comfortBy(t.k).n} · Bay ${t.bay} · ${hm(c.m)}</small></span><span class="tf" style="font-weight:600">${pkr(t.fare)}</span><span class="bk">Select</span></button>`).join(''):'<div class="empty">—</div>';
 $$('#trips .trip').forEach(b=>b.onclick=()=>{st.dep=ts[+b.dataset.i];st.seats={};render();});
 // seats
 const k=st.dep?st.dep.k:(st.comfort||'t'),L=layout(k),rnd=seed((st.city||'x')+(st.dep?st.dep.m+st.dep.op:'')+st.date);
 let html='',no=1;const per=L.cols[0]+L.cols[2];
 html=`<div style="display:grid;grid-template-columns:repeat(${L.cols[0]},auto) 26px repeat(${L.cols[2]},auto);gap:8px">`;
 for(let r=0;r<L.rows;r++){for(let ci=0;ci<per+1;ci++){if(ci===L.cols[0]){html+='<span></span>';continue;}const n=no++;const rv=rnd();const booked=rv<.32?(rv<.17?'bm':'bf'):'';const sel=st.seats[n];
  html+=`<button class="seat ${L.berth?'berth':''} ${booked||(sel?'s'+sel:'')}" data-n="${n}" ${booked?'disabled':''}>${n}</button>`;}}
 html+='</div>';$('#seats').innerHTML=html;
 $$('#seats .seat:not([disabled])').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(st.seats[n])delete st.seats[n];else{if(!st.dep){$('#trips').scrollIntoView({behavior:'smooth',block:'center'});return;}st.seats[n]=st.g;}render();});
 // summary
 $('#sPh').style.backgroundImage=`url('${c?c.img:'assets/img/hero-m.svg'}')`;
 $('#sTitle').textContent=c?'Karachi → '+label(c):'Karachi (KBT)';
 const dd=new Date(st.date+'T00:00');$('#sDate').textContent=dayLbl(dd);
 $('#sDep').textContent=st.dep?t12(st.dep.m)+' · '+st.dep.op:'—';
 $('#sCf').textContent=st.dep?comfortBy(st.dep.k).n:(st.comfort?comfortBy(st.comfort).n:'—');
 const ns=Object.keys(st.seats);$('#sSeats').innerHTML=ns.length?ns.map(n=>`<span style="display:inline-block;padding:2px 8px;border-radius:6px;margin:2px;background:${st.seats[n]==='m'?'var(--male)':'var(--female)'}">${n}</span>`).join(''):'—';
 $('#sTot').textContent=pkr(st.dep?st.dep.fare*ns.length:0);
 $('#hold').disabled=!(st.dep&&ns.length);
}
$$('#gsel button').forEach(b=>b.onclick=()=>{st.g=b.dataset.g;$$('#gsel button').forEach(x=>x.classList.toggle('on',x===b));});
$('#hold').onclick=()=>{const c=cityBy(st.city),ns=Object.keys(st.seats);const code=c.n.replace(/[^A-Z]/gi,'').slice(0,3).toUpperCase();
 $('#ref').textContent='KBT-G'+st.dep.bay+'-'+st.dep.op.replace(/[^A-Z]/g,'').slice(0,3)+'-KHI'+code;
 $('#dSum').innerHTML=`<dt>Departure</dt><dd>${dayLbl(new Date(st.date+'T00:00'))} · ${t12(st.dep.m)}</dd><dt>Seats</dt><dd>${ns.join(', ')}</dd><dt>Total</dt><dd>${pkr(st.dep.fare*ns.length)}</dd>`;
 $('#sForm').style.display='none';$('#done').classList.add('show');};
render();
})();
