(function(){
let reg=-1;
function render(){
 $('#dTabs').innerHTML=[{n:'All'},...REGIONS].map((r,i)=>`<button class="chip ${i-1===reg?'on':''}" data-r="${i-1}">${r.s||r.n}</button>`).join('');
 $$('#dTabs .chip').forEach(b=>b.onclick=()=>{reg=+b.dataset.r;render();});
 const list=CITIES.filter(c=>reg<0||c.r===reg).sort((a,b)=>fromFare(a)-fromFare(b));
 $('#dest').innerHTML=list.map(c=>`<div class="dcard"><div class="ph" style="background-image:url('${c.img}')"><span class="tag">${REGIONS[c.r].s||REGIONS[c.r].n}</span></div><div class="bd"><div class="t"><b>${label(c)}</b><span>${c.ur}</span></div><small style="color:var(--mut);font-size:12px">${kmTxt(c.km)} · ${hm(c.m)}</small><div class="r"><div class="fr"><small>From</small><b>${pkr(fromFare(c))}</b></div><a class="bk" href="${bookUrl({to:c.n})}">Book</a></div></div></div>`).join('');
}
render();
const R=[['Sukkur',2250],['Lahore',5820],['Rawalpindi',5050],['Quetta',2200],['Gilgit',9500]];let ri=1;
function est(){const t=+$('#eR').value;$('#eTrips').textContent=t;
 $('#eRoute').innerHTML=R.map((r,i)=>`<button class="chip ${i===ri?'on':''}" data-i="${i}">${label(cityBy(r[0]))}</button>`).join('');
 $$('#eRoute .chip').forEach(b=>b.onclick=()=>{ri=+b.dataset.i;est();});
 const fare=R[ri][1],cash=Math.min(250,Math.round(fare*0.04/10)*10),yr=t*12;
 $('#eCash').textContent='Rs. '+(cash*yr).toLocaleString('en-US');$('#eMiles').textContent=(Math.round(fare/10)*yr).toLocaleString('en-US');}
$('#eR').oninput=est;est();
})();
