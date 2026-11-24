const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const pad2=n=>String(n).padStart(2,'0');
const toMin=s=>{const p=s.split(':');return +p[0]*60+ +p[1];};
const t12=m=>{m=((m%1440)+1440)%1440;let h=Math.floor(m/60),mm=m%60,ap=h<12?'AM':'PM';h=h%12||12;return h+':'+pad2(mm)+' '+ap;};
const h12=h=>{h=((h%24)+24)%24;return (h%12||12)+' '+(h<12?'AM':'PM');};
const kmTxt=n=>n.toLocaleString('en-US')+' km';
const pkr=n=>'PKR '+n.toLocaleString('en-US');
const hm=m=>[Math.floor(m/60)?Math.floor(m/60)+'h':'',m%60?m%60+'m':''].filter(Boolean).join(' ');
const fromFare=c=>Math.min(...Object.values(c.f).filter(Boolean));
const cityBy=n=>CITIES.find(c=>c.n===n);
const label=c=>c.lab||c.n;
const bandOf=m=>{m=((m%1440)+1440)%1440;if(m>=240&&m<480)return 'dawn';if(m>=480&&m<960)return 'day';if(m>=960&&m<1200)return 'dusk';return 'night';};
const bandHours=b=>h12(b.a/60)+' – '+h12(b.b/60);
function pkNow(){const s=new Date().toLocaleString('en-US',{timeZone:'Asia/Karachi',hour12:false});const d=new Date(s);return d;}
const nowMin=()=>{const d=pkNow();return d.getHours()*60+d.getMinutes();};
const isoDay=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const dayLbl=d=>d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}).replace(',','');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function upcoming(n){const now=nowMin(),out=[];for(let day=0;day<2;day++)PLAN.forEach(p=>{const m=toMin(p[0])+day*1440;if(m>=now-5)out.push({m,t:p[0],c:cityBy(p[1]),op:p[2],k:p[3],bay:p[4]});});out.sort((a,b)=>a.m-b.m);return out.slice(0,n);}
function status(d){const diff=d.m-nowMin();if(diff<=0)return['Departing','boarding'];if(diff<=30)return['Boarding','boarding'];return['On time','ontime'];}
const comfortBy=k=>COMFORT.find(c=>c.k===k);
function bookUrl(o){const q=new URLSearchParams();Object.entries(o).forEach(([k,v])=>{if(v!=null&&v!=='')q.set(k,v);});return 'book/'+(q.toString()?'?'+q:'');}

/* Urdu toggle */
const UR={home:'ہوم',deals:'ڈیلز',live:'لائیو',book:'ٹکٹ بک کریں',h1a:'جب چاہو،',h1b:'جدھر بھی۔',going:'کہاں جانا ہے',any:'کوئی بھی شہر',date:'تاریخ',leaving:'روانگی',trav:'مسافر',dawn:'فجر',day:'دن',dusk:'شام',night:'رات',next:'اگلی روانگیاں',routes:'کے بی ٹی سے روٹس',comfort:'آرام',how:'طریقہ',kbt:'آپ کا سفر کے بی ٹی سے',tag:'سیٹ سچی، منزل پکی',brand:'میری منزل'};
function applyLang(l){document.documentElement.lang=l;document.documentElement.dir=l==='ur'?'rtl':'ltr';document.body.classList.toggle('ur',l==='ur');
 $$('[data-i18n]').forEach(e=>{if(!e.dataset.en)e.dataset.en=e.textContent;e.textContent=l==='ur'?(UR[e.dataset.i18n]||e.dataset.en):e.dataset.en;});
 $$('.lang-btn').forEach(b=>b.textContent=l==='ur'?'EN':'اردو');try{localStorage.setItem('mm-lang',l);}catch(e){}}
document.addEventListener('DOMContentLoaded',()=>{
 let l='en';try{l=localStorage.getItem('mm-lang')||'en';}catch(e){}
 if(l==='ur')applyLang('ur');
 $$('.lang-btn').forEach(b=>b.onclick=()=>applyLang(document.documentElement.lang==='ur'?'en':'ur'));
 const hdr=$('.hdr');const onS=()=>hdr&&hdr.classList.toggle('solid',scrollY>40);onS();addEventListener('scroll',onS,{passive:true});
 const mb=$('.menu-btn'),sheet=$('.menu-sheet');if(mb)mb.onclick=()=>sheet.classList.add('open');
 $$('.menu-sheet [data-close]').forEach(b=>b.onclick=()=>sheet.classList.remove('open'));
 $$('.acct-btn').forEach(b=>b.onclick=()=>$('.acct-sheet').classList.add('open'));
 $$('.acct-sheet [data-close]').forEach(b=>b.onclick=()=>$('.acct-sheet').classList.remove('open'));
});
