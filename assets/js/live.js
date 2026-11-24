(function(){
let band='all',reg=-1;
function rows(list){return `<div class="brow head"><span>Time</span><span>Destination</span><span>Operator</span><span>Comfort</span><span>Bay</span><span>Status</span><span>Fare</span><span></span></div>`+(list.length?list.map(d=>{const s=status(d),cf=comfortBy(d.k),fare=d.c.f[d.k]||fromFare(d.c);
 return `<div class="brow"><span class="tm">${t12(d.m)}</span><span class="ds"><b>${label(d.c)}</b><small>${kmTxt(d.c.km)} · ${hm(d.c.m)}</small><span class="meta">${d.op} · ${cf.n} · Bay ${d.bay}</span></span><span class="op">${d.op}</span><span class="cf">${cf.n}</span><span class="bay num">${pad2(d.bay)}</span><span class="stc"><span class="st ${s[1]}">${s[0]}</span></span><span class="fare">${pkr(fare)}</span><span class="bkc"><a class="bk" href="${bookUrl({to:d.c.n,band:bandOf(d.m),comfort:d.k,dep:d.t})}">Book</a></span></div>`;}).join(''):'<div class="brow" style="display:block;color:var(--mut)">—</div>');}
function render(){
 $('#clock').textContent=t12(nowMin());$('#today').textContent=dayLbl(pkNow());
 $('#bTabs').innerHTML=[{k:'all',n:'All'},...BANDS].map(b=>`<button class="chip ${b.k===band?'on':''}" data-b="${b.k}">${b.n}</button>`).join('');
 $$('#bTabs .chip').forEach(b=>b.onclick=()=>{band=b.dataset.b;render();});
 $('#rTabs').innerHTML=[{n:'All regions'},...REGIONS].map((r,i)=>`<button class="chip ${i-1===reg?'on':''}" data-r="${i-1}">${r.s||r.n}</button>`).join('');
 $$('#rTabs .chip').forEach(b=>b.onclick=()=>{reg=+b.dataset.r;render();});
 const list=upcoming(PLAN.length).filter(d=>(band==='all'||bandOf(d.m)===band)&&(reg<0||d.c.r===reg));
 $('#board').innerHTML=rows(list);
}
render();setInterval(render,30000);
})();
