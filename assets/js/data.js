const I=p=>'assets/img/'+p+'.svg';
const REGIONS=[
 {id:'sindh',n:'Sindh',ur:'سندھ',img:I('scenes-sindh')},
 {id:'punjab',n:'Punjab',ur:'پنجاب',img:I('lahore')},
 {id:'kpk',n:'Khyber Pakhtunkhwa',s:'KPK',ur:'خیبر پختونخوا',img:I('mansehra-kaghan')},
 {id:'bal',n:'Balochistan',ur:'بلوچستان',img:I('scenes-bal')},
 {id:'gb',n:'Kashmir & GB',ur:'کشمیر اور گلگت بلتستان',img:I('gilgit-nanga')}];
// f = fares by comfort: s sleeper, b massage seat (Business), e recliner (Executive), t standard
const F=(s,b,e,t)=>({s,b,e,t});
const CITIES=[
{n:'Hyderabad',ur:'حیدرآباد',r:0,km:135,m:160,w:[['15:00','19:00']],f:F(0,2100,1550,750),img:I('places-hyderabad'),ops:['Daewoo','Faisal Movers','Skyways','Bilal Travels'],ll:[68.37,25.4]},
{n:'Mirpur Khas',ur:'میرپور خاص',r:0,km:220,m:250,w:[['15:00','19:00']],f:F(0,1600,1250,925),img:I('places-mirpur-khas'),ops:['Manthar','Adil Shah','Faisal Movers','Karachi Coach'],ll:[69.0,25.53]},
{n:'Moro',ur:'مورو',r:0,km:310,m:345,w:[['17:00','21:00']],f:F(0,2090,0,1700),img:I('places-moro'),ops:['Bilal Travels','Daewoo Express'],ll:[68.0,26.66]},
{n:'Larkana',ur:'لاڑکانہ',r:0,km:455,m:480,w:[['06:00','09:00'],['15:00','19:00']],f:F(0,2800,2225,1700),img:I('scenes-larkana'),ops:['Manthar','Faisal Movers','DMC','Karachi Coach','Kainat Travels'],ll:[68.21,27.56]},
{n:'Sukkur',ur:'سکھر',r:0,km:470,m:495,w:[['06:00','08:00'],['16:00','20:00'],['21:00','02:00']],f:F(0,3300,2625,2250),img:I('scenes-sukkur'),ops:['Adil Shah','DMC','Waraich Express','Pakistan Express','Faisal Movers','Daewoo'],ll:[68.86,27.7]},
{n:'Sadiqabad',ur:'صادق آباد',r:1,km:575,m:600,w:[['10:00','12:00'],['20:00','01:00']],f:F(4750,3400,2800,0),img:I('places-sadiqabad'),ops:['Faisal Movers','Waraich Express'],ll:[70.13,28.3]},
{n:'Bahawalpur',ur:'بہاولپور',r:1,km:705,m:725,w:[['17:00','19:00'],['22:00','00:00']],f:F(6430,0,4850,0),img:I('scenes-bahawalpur'),ops:['Faisal Movers'],ll:[71.68,29.4]},
{n:'Dera Ghazi Khan',ur:'ڈیرہ غازی خان',r:1,km:790,m:805,w:[['10:00','12:00'],['19:00','21:00']],f:F(0,5670,0,3300),img:I('places-dera-ghazi-khan'),ops:['Adil Shah','Faisal Movers'],ll:[70.64,30.05]},
{n:'Multan',ur:'ملتان',r:1,km:820,m:835,w:[['18:00','21:00'],['22:00','00:00']],f:F(8875,5375,4120,3900),img:I('scenes-multan'),ops:['Faisal Movers','Daewoo Express','Kainat Travels'],ll:[71.47,30.2]},
{n:'Lahore',ur:'لاہور',r:1,km:1165,m:1135,w:[['09:00','12:00'],['14:00','00:00']],f:F(10105,7235,6120,5820),img:I('lahore'),ops:['Faisal Movers','Daewoo','Kainat Travels','Moonways','Waraich Express','Pakistan Express'],ll:[74.35,31.55]},
{n:'Rawalpindi',lab:'Rawalpindi – Islamabad',ur:'راولپنڈی – اسلام آباد',r:1,km:1425,m:1375,w:[['10:00','12:00'],['15:00','17:00'],['18:00','21:00'],['22:00','00:00']],f:F(11150,7000,6185,5050),img:I('islamabad-faisal'),ops:['Faisal Movers','Daewoo','Skyways','Pakistan Express'],ll:[73.05,33.6]},
{n:'Peshawar',ur:'پشاور',r:2,km:1525,m:1470,w:[['08:00','11:00'],['12:00','19:00'],['21:00','23:00']],f:F(12000,0,6490,5750),img:I('scenes-peshawar'),ops:['Faisal Movers','Daewoo Express','Madina Express','Shaheen Express'],ll:[71.58,34.0]},
{n:'Mardan',ur:'مردان',r:2,km:1535,m:1475,w:[['10:00','12:00'],['21:00','23:00']],f:F(0,0,0,5750),img:I('places-mardan'),ops:['Nosheen Coach','Mujahid Khan Coaches'],ll:[72.04,34.2]},
{n:'Abbottabad',ur:'ایبٹ آباد',r:2,km:1535,m:1475,w:[['09:00','11:00'],['19:00','22:00']],f:F(9500,8125,7100,6150),img:I('places-abbottabad'),ops:['Niazi','Kainat Travels','Hazara Movers','Daewoo'],ll:[73.22,34.15]},
{n:'Mansehra',ur:'مانسہرہ',r:2,km:1560,m:1500,w:[['09:00','11:00'],['12:00','18:00'],['19:00','21:00'],['22:00','00:00']],f:F(10000,8650,7000,7000),img:I('mansehra-kaghan'),ops:['Shahzada Bus','Hazara Movers','Mansehra Express'],ll:[73.2,34.33]},
{n:'Swat',ur:'سوات',r:2,km:1660,m:1590,w:[['12:00','14:00'],['15:00','17:00']],f:F(12000,7460,5575,3500),img:I('swat'),ops:['Swat Express','Geo Swat Express','Swat Coach','Faisal Movers'],ll:[72.36,34.77]},
{n:'Khuzdar',ur:'خضدار',r:3,km:435,m:475,w:[['20:00','23:00']],f:F(2200,3200,2600,1800),img:I('places-khuzdar'),ops:['Al-Saif','AK Movers'],ll:[66.6,27.8]},
{n:'Gwadar',ur:'گوادر',r:3,km:635,m:655,w:[['17:00','21:00']],f:F(0,4200,3700,2600),img:I('scenes-gwadar'),ops:['Al-Mumtaz','Ali Express','New Shandaar','Al-Saif'],ll:[62.33,25.12]},
{n:'Quetta',ur:'کوئٹہ',r:3,km:690,m:710,w:[['15:00','19:00'],['22:00','00:00']],f:F(0,0,0,2200),img:I('scenes-quetta'),ops:['AK Movers','Al-Munir'],ll:[67.0,30.18]},
{n:'Turbat',ur:'تربت',r:3,km:705,m:725,w:[['17:00','21:00']],f:F(0,4800,4100,2950),img:I('places-turbat'),ops:['Al-Mumtaz','Ali Express','Baloch Transport'],ll:[63.05,26.0]},
{n:'Mirpur',ur:'میرپور',r:4,km:1325,m:1095,w:[['14:00','20:00']],f:F(0,0,8000,0),img:I('places-mirpur'),ops:['Waryam Travels'],ll:[73.75,33.15]},
{n:'Muzaffarabad',ur:'مظفرآباد',r:4,km:1535,m:1475,w:[['04:00','08:00']],f:F(0,0,6500,0),img:I('scenes-muzaffarabad'),ops:['Gul-e-Kashmir'],ll:[73.47,34.37]},
{n:'Gilgit',ur:'گلگت',r:4,km:1955,m:1865,w:[['08:00','10:00'],['13:00','15:00']],f:F(0,13600,9500,0),img:I('gilgit-nanga'),ops:['NATCO','Faisal Movers'],ll:[74.3,35.92]},
{n:'Skardu',ur:'سکردو',r:4,km:2075,m:1975,w:[['08:00','10:00'],['16:00','18:00']],f:F(0,0,12035,10150),img:I('scenes-skardu'),ops:['K2 Movers','Mashabrum Tours','Faisal Movers'],ll:[75.63,35.3]}];
const KBT_LL=[67.13,24.95];
// Comfort levels, top seated level is Business (massage seat) above Executive (recliner)
const COMFORT=[
 {k:'t',n:'Standard',svc:'Standard',ur:'اسٹینڈرڈ',img:I('immersive-standard-seat')},
 {k:'e',n:'Recliner',svc:'Executive',ur:'ریکلائنر',img:I('immersive-recliner')},
 {k:'b',n:'Massage seat',svc:'Business',ur:'مساج سیٹ',img:I('immersive-massage-seat')},
 {k:'s',n:'Sleeper',svc:'Sleeper',ur:'سلیپر',img:I('immersive-sleeper')}];
// Dawn 4-8, Day 8-16, Dusk 16-20, Night 20-4
const BANDS=[
 {k:'dawn',n:'Dawn',ur:'فجر',a:240,b:480,img:I('immersive-dawn')},
 {k:'day',n:'Day',ur:'دن',a:480,b:960,img:I('immersive-day')},
 {k:'dusk',n:'Dusk',ur:'شام',a:960,b:1200,img:I('immersive-dusk')},
 {k:'night',n:'Night',ur:'رات',a:1200,b:1680,img:I('immersive-night')}];
const PLAN=[['05:30','Muzaffarabad','Gul-e-Kashmir','e',11],['06:15','Sukkur','Daewoo Express','b',4],['07:30','Larkana','Faisal Movers','b',5],['08:30','Peshawar','Faisal Movers','e',8],['09:15','Mansehra','Shahzada Bus','s',10],['10:00','Rawalpindi','Skyways','e',9],['11:00','Dera Ghazi Khan','Adil Shah','t',6],['12:30','Swat','Swat Express','b',12],['13:30','Gilgit','NATCO','e',11],['14:30','Lahore','Kainat Travels','e',2],['15:15','Hyderabad','Daewoo','b',1],['16:00','Mirpur Khas','Karachi Coach','t',3],['16:45','Quetta','AK Movers','t',7],['17:30','Multan','Faisal Movers','b',2],['18:15','Bahawalpur','Faisal Movers','s',4],['19:00','Lahore','Waraich Express','s',3],['19:45','Rawalpindi','Daewoo','s',9],['20:30','Sukkur','Pakistan Express','e',5],['21:15','Peshawar','Madina Express','t',8],['22:00','Mansehra','Hazara Movers','e',10],['22:45','Multan','Kainat Travels','e',6],['23:30','Rawalpindi','Faisal Movers','b',9],['00:30','Quetta','Al-Munir','t',7],['01:15','Sukkur','DMC','t',5],['02:00','Larkana','Manthar','t',6],['03:00','Hyderabad','Skyways','e',1],['04:30','Gwadar','Al-Saif','e',11],['04:45','Khuzdar','AK Movers','t',12]];
