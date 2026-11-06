/* Star-chart computations. Astronomy Engine © 2019–2025 Don Cross (MIT). */
(function(root){
'use strict';
const norm=x=>(x%360+360)%360;
const rad=x=>x*Math.PI/180;
const deg=x=>x*180/Math.PI;
const diff=(a,b)=>Math.abs(((a-b+540)%360)-180);
const signed=(a,b)=>((a-b+540)%360)-180;
const SIGNS=[
{id:'aries',name:'牡羊座',glyph:'♈',element:'火',quality:'開創',keyword:'勇氣・啟程',trait:'直接、主動，傾向在行動中認識世界；當你有空間嘗試，就容易找回熱情。',growth:'在衝刺前留一點時間聆聽，也為自己保留調整方向的餘裕。'},
{id:'taurus',name:'金牛座',glyph:'♉',element:'土',quality:'固定',keyword:'安定・感官',trait:'重視可靠與實際價值，擅長耐心累積，並從感官經驗中找到安定。',growth:'珍惜自己的節奏，同時練習為新的可能保留一點彈性。'},
{id:'gemini',name:'雙子座',glyph:'♊',element:'風',quality:'變動',keyword:'好奇・交流',trait:'善於提問、連結資訊與交換觀點；多元刺激能點亮你的好奇心。',growth:'當選項太多，試著選一件值得投入的事，讓想法走向完成。'},
{id:'cancer',name:'巨蟹座',glyph:'♋',element:'水',quality:'開創',keyword:'感受・守護',trait:'感受細膩，重視歸屬與照顧，善於察覺關係中尚未說出口的需要。',growth:'照顧他人之前，也請辨認自己的界線與情緒需求。'},
{id:'leo',name:'獅子座',glyph:'♌',element:'火',quality:'固定',keyword:'創造・光芒',trait:'渴望真誠表達與創造，樂於用熱情鼓舞身邊的人。',growth:'讓掌聲之外的自己也被看見，並為他人的光芒保留舞台。'},
{id:'virgo',name:'處女座',glyph:'♍',element:'土',quality:'變動',keyword:'洞察・精進',trait:'擅長觀察細節與整理秩序，能把抽象想法轉化為可執行的步驟。',growth:'把完美的標準放柔一些，記得進步本身就值得肯定。'},
{id:'libra',name:'天秤座',glyph:'♎',element:'風',quality:'開創',keyword:'平衡・連結',trait:'擅長看見不同立場，重視公平、美感與和諧的互動。',growth:'在理解所有人之餘，也練習清楚說出自己的選擇。'},
{id:'scorpio',name:'天蠍座',glyph:'♏',element:'水',quality:'固定',keyword:'深度・蛻變',trait:'具有敏銳的洞察力，傾向深入探索情感、信任與事物的核心。',growth:'允許信任逐步建立，也讓自己在適當時候放下過度防備。'},
{id:'sagittarius',name:'射手座',glyph:'♐',element:'火',quality:'變動',keyword:'探索・遠方',trait:'被自由、學習與更大的視野吸引，喜歡從經驗中尋找意義。',growth:'在追逐遠方的同時，留意腳下的細節與已經開始的承諾。'},
{id:'capricorn',name:'摩羯座',glyph:'♑',element:'土',quality:'開創',keyword:'築夢・實踐',trait:'重視責任與長期成果，擅長建立結構，讓理想一步步落地。',growth:'成就不必全靠獨自承擔；休息與求助也是穩定前進的一部分。'},
{id:'aquarius',name:'水瓶座',glyph:'♒',element:'風',quality:'固定',keyword:'創新・願景',trait:'擅長獨立思考，關心未來與群體，容易從不同角度看見新可能。',growth:'在保持獨特的同時，也為情緒交流與親近留一扇門。'},
{id:'pisces',name:'雙魚座',glyph:'♓',element:'水',quality:'變動',keyword:'共感・想像',trait:'富有想像與同理心，能感受到氛圍與故事背後微妙的情感。',growth:'以溫柔而清楚的界線保護能量，讓靈感有機會成為作品。'}];
const BODIES=[
['Sun','太陽','☉','自我核心','你如何展現生命力與意志'],['Moon','月亮','☽','情緒需求','你如何感受與尋找安全感'],['Mercury','水星','☿','思考溝通','你如何學習、表達與交換想法'],['Venus','金星','♀','關係價值','你如何靠近喜愛的人事物'],['Mars','火星','♂','行動能量','你如何行動、爭取與面對挑戰'],['Jupiter','木星','♃','成長探索','你如何拓展視野與尋找機會'],['Saturn','土星','♄','責任界線','你如何面對課題、責任與時間'],['Uranus','天王星','♅','改變創新','你如何看待突破與獨立'],['Neptune','海王星','♆','想像感受','你如何感受理想、直覺與想像'],['Pluto','冥王星','♇','深層轉化','你如何面對深刻改變與更新']
].map(([id,name,glyph,theme,meaning])=>({id,name,glyph,theme,meaning}));
const HOUSES=['自我與外在形象','資源與價值感','學習與溝通','家庭與內在根基','創造與自我表達','日常、工作與照顧','親密與合作關係','共享資源與深層轉化','遠方、知識與信念','事業方向與社會角色','社群、理想與友誼','內在世界與休息'];
const ASPECTS=[{angle:0,name:'合相',symbol:'☌',tone:'交會',orb:6},{angle:60,name:'六合',symbol:'⚹',tone:'協作',orb:4},{angle:90,name:'刑相',symbol:'□',tone:'磨合',orb:5},{angle:120,name:'拱相',symbol:'△',tone:'流動',orb:5},{angle:180,name:'對分',symbol:'☍',tone:'平衡',orb:6}];
const signOf=lon=>SIGNS[Math.floor(norm(lon)/30)];
function signPosition(lon){let n=norm(lon);return `${signOf(n).name} ${Math.floor(n%30)}°${String(Math.floor((n%1)*60)).padStart(2,'0')}′`;}
function formatter(zone){try{return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}catch(e){throw new Error('無法辨識此時區，請輸入有效的 IANA 時區，例如 Asia/Taipei。');}}
function partsAt(fmt,ms){let p={};fmt.formatToParts(new Date(ms)).forEach(x=>{if(x.type!=='literal')p[x.type]=Number(x.value);});return p;}
function localToUTC(date,time,zone,choice='earlier'){
 const dm=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||''),tm=/^(\d{2}):(\d{2})$/.exec(time||'');
 if(!dm||!tm)throw new Error('請完整輸入出生日期與時間。');
 const [y,m,d,h,mi]=[+dm[1],+dm[2],+dm[3],+tm[1],+tm[2]];
 if(y<1900||y>2050)throw new Error('目前提供 1900 至 2050 年的星盤計算。');
 const stamp=Date.UTC(y,m-1,d,h,mi);let check=new Date(stamp);
 if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d||h>23||mi>59)throw new Error('出生日期或時間不正確。');
 const fmt=formatter(zone), offsets=new Set();
 for(let delta=-48;delta<=48;delta+=6){let t=stamp+delta*3600000,p=partsAt(fmt,t);offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-t);}
 const candidates=[...offsets].map(offset=>({ms:stamp-offset,offset})).filter(({ms})=>{let p=partsAt(fmt,ms);return p.year===y&&p.month===m&&p.day===d&&p.hour===h&&p.minute===mi&&p.second===0;}).sort((a,b)=>a.ms-b.ms);
 if(!candidates.length)throw new Error('當地時間可能因夏令時間調整而不存在，請核對出生時間或時區。');
 const selected=choice==='later'?candidates[candidates.length-1]:candidates[0];
 return {date:new Date(selected.ms),offsetMinutes:selected.offset/60000,ambiguous:candidates.length>1,choice};
}
function formatOffset(minutes){const s=minutes>=0?'+':'−',a=Math.abs(minutes),h=Math.floor(a/60),m=Math.floor(a%60),sec=Math.round((a%1)*60);return `UTC${s}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}${sec?':'+String(sec).padStart(2,'0'):''}`;}
function position(body,date){return norm(Astronomy.Ecliptic(Astronomy.GeoVector(body,date,true)).elon);}
function ascendant(date,lat,lon){
 const lst=norm(Astronomy.SiderealTime(date)*15+lon),T=(date.getTime()/86400000+2440587.5-2451545)/36525;
 const eps=rad(23.43929111-0.013004167*T-0.000000164*T*T+0.000000504*T*T*T),t=rad(lst),phi=rad(lat);
 const asc=norm(deg(Math.atan2(Math.cos(t),-(Math.sin(t)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps)))));
 const mc=norm(deg(Math.atan2(Math.sin(t),Math.cos(t)*Math.cos(eps))));
 return {asc,mc,lst};
}
function calculate(input){
 const lat=Number(input.lat),lon=Number(input.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>=66||Math.abs(lon)>180)throw new Error('請輸入有效座標；目前支援緯度 −66° 至 66° 之間、經度 −180° 至 180°。');
 const local=localToUTC(input.date,input.time,input.zone,input.dstChoice),angles=ascendant(local.date,lat,lon);
 const start=input.houseSystem==='whole'?Math.floor(angles.asc/30)*30:angles.asc;
 const houses=HOUSES.map((name,i)=>({number:i+1,name,longitude:norm(start+i*30),sign:signOf(start+i*30)}));
 const planets=BODIES.map(body=>{const longitude=position(body.id,local.date);let prev=position(body.id,new Date(local.date.getTime()-43200000)),next=position(body.id,new Date(local.date.getTime()+43200000));return {...body,longitude,sign:signOf(longitude),house:Math.floor(norm(longitude-start)/30)+1,retro:signed(next,prev)<0};});
 const aspects=[];for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){const distance=diff(planets[i].longitude,planets[j].longitude);for(const asp of ASPECTS){let orb=Math.abs(distance-asp.angle);if(orb<=asp.orb){aspects.push({...asp,a:planets[i],b:planets[j],orb});break;}}}
 aspects.sort((a,b)=>a.orb-b.orb);
 return {input:{...input,lat,lon},utc:local.date.toISOString(),offsetMinutes:local.offsetMinutes,ambiguous:local.ambiguous,asc:angles.asc,mc:angles.mc,houses,planets,aspects};
}
function yearly(chart,year){
 year=Number(year);if(!Number.isInteger(year)||year<1900||year>2050)throw new Error('流年年份請輸入 1900 至 2050。');
 const transits=[{id:'Jupiter',name:'木星',theme:'擴展與學習',tip:'留意學習與拓展的契機，先評估資源，再選擇值得投入的方向。'}, {id:'Saturn',name:'土星',theme:'結構與承諾',tip:'檢視責任與界線，把長期目標拆解成能持續的步驟。'}, {id:'Uranus',name:'天王星',theme:'變化與突破',tip:'觀察想改變的地方，保留彈性，讓新的做法從小實驗開始。'}];
 const targets=[chart.planets[0],chart.planets[1],{id:'Asc',name:'上升點',longitude:chart.asc}];
 const aspectTypes=ASPECTS.map(a=>({...a,orb:2}));
 const start=Date.UTC(year,0,1),end=Date.UTC(year+1,0,1),day=86400000,active=new Map(),completed=[];
 for(let stamp=start;stamp<end+day;stamp+=day){
   for(const t of transits){let l=stamp<end?position(t.id,new Date(stamp)):NaN;
    for(const target of targets){let separation=diff(l,target.longitude);
     for(const a of aspectTypes){let k=`${t.id}-${target.id}-${a.angle}`,distance=Math.abs(separation-a.angle),match=stamp<end&&distance<=2;
      if(match){let event=active.get(k);if(!event){event={transit:t,target,aspect:a,start:stamp,end:stamp,peak:stamp,orb:distance};active.set(k,event);}else{event.end=stamp;if(distance<event.orb){event.orb=distance;event.peak=stamp;}}}
      else if(active.has(k)){completed.push(active.get(k));active.delete(k);}
     }
    }
   }
 }
 completed.sort((a,b)=>a.peak-b.peak||a.orb-b.orb);return completed;
}
root.AstroCore={SIGNS,BODIES,HOUSES,ASPECTS,norm,diff,signed,signOf,signPosition,localToUTC,formatOffset,position,ascendant,calculate,yearly};
})(typeof window==='undefined'?globalThis:window);
