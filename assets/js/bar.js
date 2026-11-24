(function(){
const st={city:null,day:0,band:bandOf(nowMin()),pax:1,reg:-1};
const bar=$('#bar');if(!bar)return;
function base(){const d=pkNow();d.setHours(0,0,0,0);return d;}
function render(){
 const d=base();d.setDate(d.getDate()+st.day);
 $('#dTxt').textContent=st.day===0?'Today · '+dayLbl(d).split(' ').slice(1).join(' '):st.day===1?'Tomorrow · '+dayLbl(d).split(' ').slice(1).join(' '):dayLbl(d);
 $('#pTxt').textContent=st.pax;
 const c=st.city&&cityBy(st.city),t=$('#cityTxt');
 if(c){t.removeAttribute('data-i18n');t.textContent=label(c);$('#cityBtn').classList.remove('empty');}
 $('#bandSeg').innerHTML=BANDS.map(b=>`<button type="button" class="${b.k===st.band?'on':''}" data-b="${b.k}" data-i18n="${b.k}">${b.n}</button>`).join('');
 $$('#bandSeg button').forEach(b=>b.onclick=()=>{st.band=b.dataset.b;render();});
 $('#regions').innerHTML=REGIONS.map((r,i)=>`<button type="button" class="reg ${i===st.reg?'on':''}" data-r="${i}"><i style="background-image:url('${r.img}')"></i><span>${r.n}</span></button>`).join('');
 $$('#regions .reg').forEach(b=>b.onclick=()=>{const i=+b.dataset.r;st.reg=st.reg===i?-1:i;render();});
 const cs=$('#cities');
 if(st.reg>=0){cs.classList.add('open');cs.innerHTML=CITIES.filter(c=>c.r===st.reg).map(c=>`<button type="button" class="ccard ${c.n===st.city?'on':''}" data-c="${c.n}"><i style="background-image:url('${c.img}')"></i><b>${label(c)}</b><small>${kmTxt(c.km)} · ${hm(c.m)}</small><em>From ${pkr(fromFare(c))}</em></button>`).join('');
  $$('#cities .ccard').forEach(b=>b.onclick=()=>{st.city=b.dataset.c;render();});}
 else{cs.classList.remove('open');cs.innerHTML='';}
}
function list(q){q=(q||'').toLowerCase().trim();
 $('#cityList').innerHTML=REGIONS.map((r,i)=>{const cs=CITIES.filter(c=>c.r===i&&(!q||label(c).toLowerCase().includes(q)||c.ur.includes(q)));if(!cs.length)return'';
  return `<div class="grp">${r.n}</div>`+cs.map(c=>`<button type="button" class="opt ${c.n===st.city?'on':''}" data-c="${c.n}"><i style="background-image:url('${c.img}')"></i><span>${label(c)}</span><em>${pkr(fromFare(c))}</em></button>`).join('');}).join('')||'<div class="grp">No match</div>';
 $$('#cityList .opt').forEach(b=>b.onclick=()=>{st.city=b.dataset.c;st.reg=cityBy(st.city).r;$('#cityPop').classList.remove('open');render();});}
$('#cityBtn').onclick=e=>{e.stopPropagation();const p=$('#cityPop');p.classList.toggle('open');list('');$('#cityQ').value='';setTimeout(()=>$('#cityQ').focus(),30);};
$('#cityQ').oninput=e=>list(e.target.value);
$('#cityPop').onclick=e=>e.stopPropagation();
document.addEventListener('click',()=>$('#cityPop').classList.remove('open'));
$('#dPrev').onclick=()=>{st.day=Math.max(0,st.day-1);render();};
$('#dNext').onclick=()=>{st.day=Math.min(13,st.day+1);render();};
$('#pMinus').onclick=()=>{st.pax=Math.max(1,st.pax-1);render();};
$('#pPlus').onclick=()=>{st.pax=Math.min(9,st.pax+1);render();};
bar.onsubmit=e=>{e.preventDefault();if(!st.city){$('#cityBtn').click();return;}const d=base();d.setDate(d.getDate()+st.day);location.href=bookUrl({to:st.city,date:isoDay(d),band:st.band,pax:st.pax});};
render();
})();
