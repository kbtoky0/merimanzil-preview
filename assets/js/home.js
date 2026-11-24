(function(){
function boardRows(list,head){return (head?`<div class="brow head"><span>Time</span><span>Destination</span><span>Operator</span><span>Comfort</span><span>Bay</span><span>Status</span><span>Fare</span><span></span></div>`:'')+list.map(d=>{const s=status(d),cf=comfortBy(d.k),fare=d.c.f[d.k]||fromFare(d.c);
 return `<div class="brow"><span class="tm">${t12(d.m)}</span><span class="ds"><b>${label(d.c)}</b><small>${kmTxt(d.c.km)} · ${hm(d.c.m)}</small><span class="meta">${d.op} · ${cf.n} · Bay ${d.bay}</span></span><span class="op">${d.op}</span><span class="cf">${cf.n}</span><span class="bay num">${pad2(d.bay)}</span><span class="stc"><span class="st ${s[1]}">${s[0]}</span></span><span class="fare">${pkr(fare)}</span><span class="bkc"><a class="bk" href="${bookUrl({to:d.c.n,band:bandOf(d.m),comfort:d.k,dep:d.t})}">Book</a></span></div>`;}).join('');}
window.boardRows=boardRows;
const tick=()=>{$('#clock').textContent=t12(nowMin());};tick();setInterval(tick,15000);
$('#board').innerHTML=boardRows(upcoming(6),true);
// routes map
let reg=1,sel='Rawalpindi';
function draw(){
 const box=$('#map').getBoundingClientRect(),small=box.width<600,W=small?600:1000,H=small?600:800,fs=small?1.45:1;
 $('#map').setAttribute('viewBox',`0 0 ${W} ${H}`);
 $('#rTabs').innerHTML=REGIONS.map((r,i)=>`<button class="chip ${i===reg?'on':''}" data-r="${i}">${r.s||r.n}</button>`).join('');
 $$('#rTabs .chip').forEach(b=>b.onclick=()=>{reg=+b.dataset.r;const cs=CITIES.filter(c=>c.r===reg);sel=cs.sort((a,b)=>a.km-b.km)[cs.length-1].n;draw();});
 const cs=CITIES.filter(c=>c.r===reg).sort((a,b)=>a.km-b.km);
 const pts=[KBT_LL,...cs.map(c=>c.ll)];
 let x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
 const padL=small?70:140,padR=small?70:200,padY=small?70:90;
 let sx=(W-padL-padR)/Math.max(.5,x1-x0),sy=(H-2*padY)/Math.max(.5,y1-y0),sc=Math.min(sx,sy);
 const ox=padL+((W-padL-padR)-(x1-x0)*sc)/2,oy=padY+((H-2*padY)-(y1-y0)*sc)/2;
 const P=ll=>[ox+(ll[0]-x0)*sc,H-(oy+(ll[1]-y0)*sc)];
 const k=P(KBT_LL);
 let path=`M${k[0]},${k[1]}`;cs.forEach(c=>{const p=P(c.ll);path+=` L${p[0]},${p[1]}`;});
 let s=CITIES.filter(c=>c.r!==reg).map(c=>{const p=P(c.ll);return (p[0]>0&&p[0]<W&&p[1]>0&&p[1]<H)?`<circle cx="${p[0]}" cy="${p[1]}" r="${4*fs}" fill="rgba(234,240,250,.2)"/>`:'';}).join('');
 s+=`<path d="${path}" fill="none" stroke="#fc1e1e" stroke-width="${3*fs}" stroke-linejoin="round"/>`;
 s+=cs.map(c=>{const p=P(c.ll),on=c.n===sel,LS={'Dera Ghazi Khan':'l','Peshawar':'l','Mardan':'l','Moro':'l','Larkana':'l','Muzaffarabad':'l'},DY={'Abbottabad':26,'Mansehra':-10,'Mirpur Khas':22,'Hyderabad':-6,'Sukkur':10,'Larkana':-10},right=LS[c.n]?false:p[0]<W*0.62,dy=(DY[c.n]||0)*fs;return `<g class="node" data-c="${c.n}"><circle cx="${p[0]}" cy="${p[1]}" r="${24*fs}" fill="transparent"/><circle cx="${p[0]}" cy="${p[1]}" r="${(on?11:8)*fs}" fill="${on?'#fc1e1e':'#fff'}" stroke="${on?'#fff':'#fc1e1e'}" stroke-width="${3*fs}"/><text x="${p[0]+(right?18:-18)*fs}" y="${p[1]+6*fs+dy}" text-anchor="${right?'start':'end'}" fill="#fff" font-family="Poppins" font-weight="${on?700:500}" font-size="${(on?22:18)*fs}">${c.n}</text></g>`;}).join('');
 s+=`<circle cx="${k[0]}" cy="${k[1]}" r="${26*fs}" fill="rgba(252,30,30,.25)"/><circle cx="${k[0]}" cy="${k[1]}" r="${12*fs}" fill="#fc1e1e" stroke="#fff" stroke-width="${3*fs}"/><text x="${k[0]+22*fs}" y="${k[1]+8*fs}" fill="#fff" font-family="Montserrat" font-weight="800" font-size="${20*fs}">KBT</text>`;
 $('#map').innerHTML=s;
 $$('#map .node').forEach(g=>g.onclick=()=>{sel=g.dataset.c;draw();});
 const c=cityBy(sel);
 $('#stop').innerHTML=`<div class="stop-img" style="background-image:url('${c.img}')"></div><div class="stop-b"><h3>${label(c)}</h3><div class="facts"><div><small>Distance</small><b>${kmTxt(c.km)}</b></div><div><small>Journey</small><b>${hm(c.m)}</b></div><div><small>From</small><b>${pkr(fromFare(c))}</b></div></div><div class="ops">${c.ops.map(o=>`<span>${o}</span>`).join('')}</div><a class="btn btn-red" href="${bookUrl({to:c.n})}" style="height:50px">Book ${label(c)}{A}</a></div>`.replace('{A}','<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>');
}
draw();addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(draw,200);});
$('#comfortTiles').innerHTML=COMFORT.map(c=>{const fs=CITIES.map(x=>x.f[c.k]).filter(Boolean);return `<a class="ptile" href="${bookUrl({comfort:c.k})}"><i style="background-image:url('${c.img}')"></i>${c.svc!==c.n?`<span class="tag">${c.svc}</span>`:""}<h3>${c.n}</h3><small>From ${pkr(Math.min(...fs))}</small></a>`;}).join('');
})();
