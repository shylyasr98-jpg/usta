const SERVICES=[
 {name:'كهرباء',icon:'⚡',kind:'home',desc:'أعطال وتركيبات كهربائية'},
 {name:'سباكة',icon:'🚰',kind:'home',desc:'تسريبات وإصلاحات وتركيبات'},
 {name:'تكييف',icon:'❄️',kind:'home',desc:'صيانة وتنظيف وتركيب'},
 {name:'أجهزة منزلية',icon:'🧺',kind:'home',desc:'غسالات وثلاجات وأجهزة'},
 {name:'نجارة',icon:'🔨',kind:'home',desc:'أبواب وأثاث وأعمال خشب'},
 {name:'نقاشة',icon:'🎨',kind:'home',desc:'دهانات وتشطيبات'},
 {name:'أقفال ومفاتيح',icon:'🔐',kind:'home',desc:'فتح وتركيب وتغيير أقفال'},
 {name:'ميكانيكا سيارات',icon:'🚘',kind:'auto',desc:'ميكانيكا وفحص أعطال'},
 {name:'كهرباء سيارات',icon:'🔌',kind:'auto',desc:'بطاريات ودينامو وكهرباء'},
 {name:'إطارات وبطاريات',icon:'🛞',kind:'auto',desc:'تغيير إطار وتشغيل بطارية'},
 {name:'ونش وطوارئ',icon:'🚛',kind:'auto',desc:'سحب وإنقاذ ومساعدة طريق'}
];

const PROVIDERS=[
 {id:'t1',name:'أحمد محمد',service:'كهربائي',serviceKey:'كهرباء',rating:4.9,jobs:248,commit:96,city:'مدينة نصر',icon:'🧑‍🔧',price:100,lat:30.0595,lng:31.3393,online:false},
 {id:'t2',name:'محمد السيد',service:'سباك',serviceKey:'سباكة',rating:4.8,jobs:221,commit:94,city:'التجمع',icon:'🧑‍🔧',price:120,lat:30.0315,lng:31.4848,online:false},
 {id:'t3',name:'محمود إبراهيم',service:'فني تكييف',serviceKey:'تكييف',rating:4.9,jobs:184,commit:97,city:'مصر الجديدة',icon:'👨‍🔧',price:150,lat:30.0876,lng:31.3300,online:false},
 {id:'t4',name:'يوسف عمر',service:'نجار',serviceKey:'نجارة',rating:4.8,jobs:156,commit:93,city:'حلوان',icon:'🧔',price:130,lat:29.8414,lng:31.3340,online:false},
 {id:'t5',name:'علي حسن',service:'ميكانيكي سيارات',serviceKey:'ميكانيكا سيارات',rating:4.7,jobs:312,commit:91,city:'المهندسين',icon:'👨‍🔧',price:180,lat:30.0507,lng:31.2010,online:false}
];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toastEl=document.createElement('div'); toastEl.className='toast'; document.body.appendChild(toastEl);
function toast(message){toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toastEl.classList.remove('show'),2400)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function getRole(){return localStorage.getItem('ustaRole')||''}
function getUser(){return localStorage.getItem('ustaUser')||''}
function getEmail(){return localStorage.getItem('ustaEmail')||''}
function getSpecialty(){return localStorage.getItem('ustaServiceType')||''}
function hasAccount(){return !!(getUser() && getRole())}
function clearAccount(){['ustaUser','ustaRole','ustaEmail','ustaServiceType'].forEach(k=>localStorage.removeItem(k));}

function openModal(el){if(!el)return;el.classList.add('show');el.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')}
function closeModal(el){if(!el)return;el.classList.remove('show');el.setAttribute('aria-hidden','true');if(!$$('.modal.show').length)document.body.classList.remove('modal-open')}
$$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.closest('.modal'))));
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m)}));

// ---------- Public homepage ----------
const serviceGrid=$('#serviceGrid');
function renderPublicServices(query=''){
  if(!serviceGrid)return;
  const q=query.trim();
  const items=SERVICES.filter(s=>!q||s.name.includes(q)).slice(0,8);
  serviceGrid.innerHTML=(items.length?items:SERVICES.slice(0,8)).map(s=>`<button type="button" class="service-card" data-service="${esc(s.name)}"><span class="icon">${s.icon}</span><strong>${esc(s.name)}</strong><small>${esc(s.desc)}</small></button>`).join('');
  $$('.service-card').forEach(b=>b.onclick=()=>requireClientForAction(()=>openService(b.dataset.service)));
}
renderPublicServices();

$$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
$('#menuBtn')?.addEventListener('click',()=>$('#mainNav')?.classList.toggle('open'));
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav')?.classList.remove('open')));
$('#allServicesBtn')?.addEventListener('click',()=>{renderPublicServices('');document.getElementById('services')?.scrollIntoView({behavior:'smooth'})});
$('#heroSearchBtn')?.addEventListener('click',()=>{const v=$('#heroSearch')?.value.trim(); requireClientForAction(()=>openService(v||'خدمة فنية'))});
$$('#heroChips button').forEach(b=>b.addEventListener('click',()=>requireClientForAction(()=>openService(b.dataset.service))));
$('#viewTechsBtn')?.addEventListener('click',()=>document.getElementById('technicians')?.scrollIntoView({behavior:'smooth'}));

const authModal=$('#authModal'), serviceModal=$('#serviceModal'), locationModal=$('#locationModal'), emergencyModal=$('#emergencyModal');
let pendingService='';
let selectedLocation={type:null,address:'',lat:null,lng:null};
let authMode='signup';
let pendingRole='';

function requireClientForAction(fn){
  if(!hasAccount()){openAuth('signup');toast('اعمل حساب عميل الأول عشان تطلب خدمة');return}
  if(getRole()!=='client'){toast('الخدمة دي متاحة من حساب العميل');return}
  fn();
}

function openAuth(mode='signup'){
  authMode=mode;
  if(hasAccount()) {showApp('dashboard');return;}
  pendingRole='';
  $$('.role-card').forEach(x=>x.classList.remove('selected'));
  $('#authTitle').textContent=mode==='signup'?'ابدأ مع USTA':'تسجيل الدخول';
  $('#authSubtitle').textContent=mode==='signup'?'اختار نوع الحساب مرة واحدة فقط':'اكتب بيانات الحساب؛ نوع الحساب محفوظ مع حسابك';
  $('#roleGrid').classList.toggle('hidden',mode==='login');
  $('#authForm').classList.remove('hidden');
  $('#serviceTypeWrap').classList.add('hidden');
  $('#completeAuth').textContent=mode==='signup'?'إنشاء الحساب':'تسجيل الدخول';
  $('#switchAuth').textContent=mode==='signup'?'لديك حساب بالفعل؟ تسجيل الدخول':'ليس لديك حساب؟ إنشاء حساب';
  openModal(authModal);
}

$('#loginBtn')?.addEventListener('click',()=>hasAccount()?showApp('dashboard'):openAuth('login'));
$('#signupBtn')?.addEventListener('click',()=>hasAccount()?showApp('dashboard'):openAuth('signup'));
$('#joinNowBtn')?.addEventListener('click',()=>{if(hasAccount()){if(getRole()==='technician'||getRole()==='tow')showApp('dashboard');else toast('حسابك الحالي عميل. لتقديم الخدمات سجّل خروج ثم أنشئ حساب مقدم خدمة.')}else openAuth('signup')});
$('#finalServiceBtn')?.addEventListener('click',()=>requireClientForAction(()=>openService('خدمة فنية')));
$('#finalJoinBtn')?.addEventListener('click',()=>{if(!hasAccount())openAuth('signup');else showApp('dashboard')});
$('#switchAuth')?.addEventListener('click',()=>openAuth(authMode==='signup'?'login':'signup'));
$$('.role-card').forEach(card=>card.addEventListener('click',()=>{
  pendingRole=card.dataset.role;
  $$('.role-card').forEach(x=>x.classList.remove('selected'));card.classList.add('selected');
  $('#serviceTypeWrap').classList.toggle('hidden',pendingRole==='client');
}));
$('#completeAuth')?.addEventListener('click',()=>{
  const name=$('#fullName')?.value.trim(); const email=$('#email')?.value.trim(); const pass=$('#password')?.value.trim();
  if(!name||!email||!pass){toast('كمل الاسم والبريد وكلمة المرور');return}
  if(authMode==='signup'){
    if(!pendingRole){toast('اختار نوع الحساب مرة واحدة');return}
    const specialty=$('#serviceType')?.value||'';
    if(pendingRole==='technician'&&!specialty){toast('اختار تخصصك');return}
    localStorage.setItem('ustaUser',name);localStorage.setItem('ustaEmail',email);localStorage.setItem('ustaRole',pendingRole);localStorage.setItem('ustaServiceType',specialty);
  }else{
    // Demo login: keep previously created role. For a brand-new demo session, ask to create account.
    if(!hasAccount()){toast('الحساب غير موجود في هذا المتصفح — اعمل إنشاء حساب أولًا');return}
    if(email!==getEmail()){toast('البريد الإلكتروني غير مطابق للحساب المحفوظ');return}
  }
  closeModal(authModal);updateHeaderAuthState();showApp('dashboard');toast('تم الدخول بنجاح');
});

function updateHeaderAuthState(){
  const user=hasAccount();
  const login=$('#loginBtn'), signup=$('#signupBtn');
  if(login){login.textContent=user?'لوحة التحكم':'تسجيل الدخول';login.onclick=()=>user?showApp('dashboard'):openAuth('login')}
  if(signup){signup.textContent=user?'خروج':'إنشاء حساب';signup.classList.toggle('btn-primary',!user);signup.classList.toggle('btn-ghost',user);signup.onclick=()=>{if(user){clearAccount();hideApp();updateHeaderAuthState();toast('تم تسجيل الخروج')}else openAuth('signup')}}
}
updateHeaderAuthState();

// ---------- Service + location flow ----------
function openService(service){
  if(getRole()!=='client'){toast('اختار الخدمة من حساب العميل');return}
  pendingService=service;
  const found=SERVICES.find(s=>s.name===service);
  if($('#serviceModalIcon'))$('#serviceModalIcon').textContent=found?.icon||'🔧';
  if($('#serviceModalTitle'))$('#serviceModalTitle').textContent=`اطلب ${esc(service)}`;
  if($('#problemText'))$('#problemText').value='';
  if($('#serviceAddress'))$('#serviceAddress').value='';
  openModal(serviceModal);
}
$('#submitService')?.addEventListener('click',()=>{closeModal(serviceModal);openLocationModal(pendingService||'خدمة فنية')});
function openLocationModal(service){
  $('#locationTitle').textContent=`فين تحب ${service} تكون؟`;
  $('#locationSubtitle').textContent='اكتب العنوان أو استخدم GPS. هنظهر لك مقدمي الخدمة المطابقين والمتاحين فقط.';
  $('#addressPanel').classList.remove('hidden');$('#gpsPanel').classList.add('hidden');$('#mapWrap').classList.add('hidden');
  selectedLocation={type:null,address:'',lat:null,lng:null};
  openModal(locationModal); setupAddressAutocomplete();
}
$('#addressChoice')?.addEventListener('click',()=>{$('#addressChoice').classList.add('active');$('#gpsChoice').classList.remove('active');$('#addressPanel').classList.remove('hidden');$('#gpsPanel').classList.add('hidden')});
$('#gpsChoice')?.addEventListener('click',()=>{$('#gpsChoice').classList.add('active');$('#addressChoice').classList.remove('active');$('#gpsPanel').classList.remove('hidden');$('#addressPanel').classList.add('hidden')});

const CITY_SUGGESTIONS=[
 'الفيوم - مدينة الفيوم','الفيوم - سنورس','الفيوم - إبشواي','القاهرة - مدينة نصر','القاهرة - مصر الجديدة','القاهرة - التجمع الخامس','القاهرة - المعادي','القاهرة - مدينة نصر - عباس العقاد','الجيزة - المهندسين','الجيزة - الدقي','الجيزة - 6 أكتوبر','القليوبية - بنها','القليوبية - شبرا الخيمة','الإسكندرية - سموحة','الإسكندرية - العصافرة','الشرقية - الزقازيق','الغربية - طنطا','الدقهلية - المنصورة','المنوفية - شبين الكوم','البحيرة - دمنهور','كفر الشيخ - مدينة كفر الشيخ','بني سويف - مدينة بني سويف','المنيا - مدينة المنيا','أسيوط - مدينة أسيوط','سوهاج - مدينة سوهاج','قنا - مدينة قنا','الأقصر - مدينة الأقصر','أسوان - مدينة أسوان'
];
function setupAddressAutocomplete(){
  const input=$('#serviceAddress2');if(!input)return;
  const old=input.parentElement.querySelector('.address-suggestions');old?.remove();
  const box=document.createElement('div');box.className='address-suggestions';input.insertAdjacentElement('afterend',box);
  input.oninput=()=>{
    const q=input.value.trim(); if(!q){box.innerHTML='';return;}
    const list=CITY_SUGGESTIONS.filter(x=>x.includes(q)).slice(0,6);
    box.innerHTML=list.map(x=>`<button type="button" data-address="${esc(x)}">${esc(x)}</button>`).join('');
    box.querySelectorAll('button').forEach(b=>b.onclick=()=>{input.value=b.dataset.address;selectedLocation.address=b.dataset.address;box.innerHTML='';toast(`تم اختيار ${b.dataset.address}`)});
  };
}
$('#confirmAddress')?.addEventListener('click',()=>{
  const address=$('#serviceAddress2')?.value.trim();
  if(!address){toast('اكتب العنوان أو اختار اقتراح');return}
  selectedLocation={type:'address',address,lat:null,lng:null};
  showTechnicianMap();
});
$('#useGps')?.addEventListener('click',()=>{
  const status=$('#gpsStatus');
  if(!navigator.geolocation){status.textContent='المتصفح لا يدعم GPS.';return}
  status.textContent='جاري تحديد موقعك...';
  navigator.geolocation.getCurrentPosition(pos=>{
    selectedLocation={type:'gps',address:'موقعك الحالي',lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};
    status.textContent=`تم تحديد موقعك بدقة تقريبية ±${Math.round(pos.coords.accuracy)} متر.`;
    showTechnicianMap();
  },err=>{status.textContent=err.code===1?'اسمح للموقع من إعدادات المتصفح ثم جرّب مرة أخرى.':'تعذر تحديد الموقع، جرّب مرة أخرى.'});
});

function getOnlineState(){try{return JSON.parse(localStorage.getItem('ustaOnlineState')||'{}')}catch{return {}}}
function saveOnlineState(v){localStorage.setItem('ustaOnlineState',JSON.stringify(v))}
function haversine(a,b){const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lng-a.lng)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function pseudoLocation(address){
  const map={'الفيوم - مدينة الفيوم':[29.3084,30.8428],'القاهرة - مدينة نصر':[30.0511,31.3656],'القاهرة - مصر الجديدة':[30.0876,31.3300],'القاهرة - التجمع الخامس':[30.0163,31.4571],'الجيزة - المهندسين':[30.0507,31.2010],'القليوبية - بنها':[30.4667,31.1833]};
  const match=Object.keys(map).find(k=>address.includes(k.split(' - ').pop())||address.includes(k));
  const c=match?map[match]:[30.0444,31.2357]; return {lat:c[0],lng:c[1]};
}
function onlineProvidersFor(service,loc){
  const online=getOnlineState();
  return PROVIDERS.filter(p=>{
    if(online[p.id]?.online!==true)return false;
    if(p.serviceKey!==service && !(service==='خدمة فنية'))return false;
    if(!loc.lat||!loc.lng)return true;
    const pos=online[p.id]?.lat?{lat:online[p.id].lat,lng:online[p.id].lng}:{lat:p.lat,lng:p.lng};
    const radius=Number(online[p.id]?.radius||5);
    return haversine(loc,pos)<=radius+0.2;
  }).map(p=>({...p,_pos:online[p.id]?.lat?{lat:online[p.id].lat,lng:online[p.id].lng}:{lat:p.lat,lng:p.lng},_radius:Number(online[p.id]?.radius||5)}));
}

let mapObj=null;
function showTechnicianMap(){
  $('#mapWrap').classList.remove('hidden');$('#mapServiceName').textContent=pendingService; 
  let loc={lat:selectedLocation.lat,lng:selectedLocation.lng}; if(!loc.lat||!loc.lng)loc=pseudoLocation(selectedLocation.address);
  $('#mapLocationLabel').textContent=selectedLocation.type==='gps'?'موقعك الحالي':'الموقع المحدد: '+selectedLocation.address;
  const available=onlineProvidersFor(pendingService,loc);$('#onlineCount').textContent=available.length;
  const mapEl=$('#technicianMap');
  if(window.L){
    if(mapObj){mapObj.remove();mapObj=null}
    mapObj=L.map(mapEl,{zoomControl:true}).setView([loc.lat,loc.lng],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapObj);
    L.marker([loc.lat,loc.lng]).addTo(mapObj).bindPopup('<strong>أنت هنا</strong>').openPopup();
    available.forEach(p=>L.marker([p._pos.lat,p._pos.lng]).addTo(mapObj).bindPopup(`<strong>${esc(p.name)}</strong><br>⭐ ${p.rating}<br>${esc(p.service)}`));
  }else{mapEl.innerHTML=`<div class="fallback-map"><div class="map-user-pin">📍 أنت هنا</div>${available.map((p,i)=>`<button type="button" class="fake-map-tech" style="top:${22+i*20}%;left:${25+i*22}%" data-tech="${p.id}">${p.icon}<b>${p.rating}</b></button>`).join('')||'<p>لا يوجد فنيون شغالون الآن لهذا التخصص.</p>'}</div>`;mapEl.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>openProviderProfile(b.dataset.tech))}
  if(!available.length)toast('لا يوجد فني متاح حاليًا بهذا التخصص في النطاق المحدد');
  // Add provider list below map, inside modal.
  let list=$('#liveProviderList');
  if(!list){list=document.createElement('div');list.id='liveProviderList';list.className='live-provider-list';$('#mapWrap').appendChild(list)}
  list.innerHTML=available.length?available.map(p=>`<article class="live-provider"><div class="avatar">${p.icon}</div><div><strong>${esc(p.name)} ✅</strong><small>${esc(p.service)} · ⭐ ${p.rating} · ${p.city}</small></div><button class="btn btn-primary" type="button" data-order-provider="${p.id}">طلب</button></article>`).join(''):'<div class="empty">مفيش فنيين شغالين الآن في نطاقك لهذا التخصص.</div>';
  list.querySelectorAll('[data-order-provider]').forEach(b=>b.onclick=()=>createOrder(b.dataset.orderProvider));
}
function createOrder(providerId){
  const p=PROVIDERS.find(x=>x.id===providerId);if(!p)return;
  const orders=JSON.parse(localStorage.getItem('ustaClientOrders')||'[]');
  orders.unshift({id:'USTA-'+Date.now().toString().slice(-6),service:pendingService,providerId,provider:p.name,status:'جاري البحث',price:p.price,address:selectedLocation.address||'موقعك الحالي',createdAt:Date.now()});
  localStorage.setItem('ustaClientOrders',JSON.stringify(orders));
  closeModal(locationModal);toast(`تم إرسال طلبك إلى ${p.name}`);showApp('orders');
}

$$('[data-open-emergency]').forEach(b=>b.addEventListener('click',()=>openModal(emergencyModal)));
$$('.em-btn').forEach(b=>b.addEventListener('click',()=>{$$('.em-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');localStorage.setItem('ustaEmergencyType',b.dataset.em)}));
$('#locateEmergency')?.addEventListener('click',()=>{if(!hasAccount()){closeModal(emergencyModal);openAuth('signup');return}if(getRole()!=='client'){toast('الطوارئ من حساب العميل فقط');return}closeModal(emergencyModal);openService('ونش وطوارئ')});
$('#newsletterBtn')?.addEventListener('click',()=>toast($('#newsletterEmail')?.value.trim()?'تم الاشتراك بنجاح':'اكتب بريدك الإلكتروني'));

// ---------- Role-based app shell ----------
const appShell=$('#appShell');
let currentView='dashboard';
const CLIENT_NAV=[
 ['dashboard','⌂','الرئيسية'],['orders','☷','طلباتي'],['chat','💬','الشات'],['providers','👨‍🔧','الفنيين'],['favorites','♡','المفضلة'],['payments','▤','المدفوعات'],['profile','◉','حسابي'],['settings','⚙','الإعدادات']
];
const TECH_NAV=[
 ['dashboard','⌂','الرئيسية'],['orders','☷','الطلبات'],['chat','💬','الشات'],['portfolio','▣','Portfolio'],['ratings','★','التقييمات'],['earnings','◫','الأرباح'],['profile','◉','ملفي'],['settings','⚙','الإعدادات']
];
const TITLES={dashboard:'الرئيسية',orders:'الطلبات',chat:'USTA Chat',providers:'الفنيين المتاحين',favorites:'المفضلة',payments:'المدفوعات',profile:'الملف الشخصي',settings:'الإعدادات',portfolio:'Portfolio',ratings:'التقييمات',earnings:'الأرباح'};

function showApp(view='dashboard'){
  if(!hasAccount()){openAuth('signup');return}
  setupUser();currentView=view;renderNav();renderAppView(view);appShell.classList.add('show');appShell.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function hideApp(){appShell.classList.remove('show');appShell.setAttribute('aria-hidden','true');document.body.style.overflow='';closeSidebar()}
function setupUser(){
  const role=getRole(), name=getUser(), spec=getSpecialty();
  $('#sideName').textContent=name||'مستخدم USTA';
  $('#sideRole').textContent=role==='client'?'عميل':role==='technician'?`فني · ${spec||'مقدم خدمة'}`:'ونش / Auto';
  $('#sideAvatar').textContent=role==='client'?'👤':role==='technician'?'🧑‍🔧':'🚛';
  $('#appRoleKicker').textContent=role==='client'?'حساب عميل':role==='technician'?`حساب فني · ${spec||'مقدم خدمة'}`:'حساب Auto';
}
function renderNav(){
  const role=getRole(); const items=role==='client'?CLIENT_NAV:TECH_NAV;
  $('#sideNav').innerHTML=`<button type="button" class="public-home-nav" id="sidePublicHome">⌂ <span>الموقع الرئيسي</span></button>`+items.map(([id,ico,label],i)=>`<button type="button" data-view="${id}" class="${id===currentView?'active':''}">${ico} <span>${label}</span></button>`).join('');
  $('#sideNav').querySelector('#sidePublicHome').onclick=()=>{hideApp();location.hash='home';document.getElementById('home')?.scrollIntoView({behavior:'smooth'})};
  $('#sideNav').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{currentView=b.dataset.view;renderNav();renderAppView(currentView);closeSidebar()});
}
function appHeaderTitle(){const base=TITLES[currentView]||'USTA';$('#appViewTitle').textContent=base}

function renderAppView(view){
  setupUser(); appHeaderTitle();
  const role=getRole(), name=esc(getUser());
  let html='';
  if(role==='client') html=renderClientView(view,name); else html=renderProviderView(view,name,role);
  $('#appContent').innerHTML=html;
  wireAppContent(view,role);
}

function renderClientView(view,name){
  switch(view){
    case 'dashboard': return `<div class="dash-hero"><div><span class="section-kicker">حساب العميل</span><h2>أهلاً ${name} 👋</h2><p>اختار اللي محتاجه، وإحنا نجيب لك مقدم الخدمة المناسب.</p></div><button class="app-btn orange" data-app-service="خدمة فنية">+ طلب خدمة</button></div>
      <div class="dash-grid"><div class="dash-stat"><small>طلبات حالية</small><strong>${clientOrders().filter(o=>o.status!=='مكتملة').length}</strong></div><div class="dash-stat"><small>خدمات مكتملة</small><strong>14</strong></div><div class="dash-stat"><small>المفضلة</small><strong>6</strong></div><div class="dash-stat"><small>الرصيد</small><strong>850 ج</strong></div></div>
      <div class="app-panel"><div class="section-head"><div><h3>ماذا تحتاج؟</h3><small class="muted">اختار الخدمة وتابع كل شيء من نفس الحساب</small></div></div><div class="client-service-grid">${SERVICES.map(s=>`<button type="button" class="client-service-card" data-app-service="${esc(s.name)}"><span>${s.icon}</span><strong>${esc(s.name)}</strong><small>${esc(s.desc)}</small></button>`).join('')}</div></div>
      <div class="app-panel"><div class="section-head"><h3>آخر طلباتك</h3><button class="link-btn" data-view-inline="orders">عرض الكل</button></div>${orderRows(clientOrders().slice(0,3),true)}</div>`;
    case 'orders': return `<div class="section-head"><div><span class="section-kicker">حساب العميل</span><h2>كل طلباتك</h2></div><button class="app-btn orange" data-app-service="خدمة فنية">+ طلب جديد</button></div><div class="app-panel">${orderRows(clientOrders(),true)}</div>`;
    case 'chat': return clientChatHtml();
    case 'providers': return providersDirectoryHtml();
    case 'favorites': return `<div class="app-panel"><h3>الفنيين المفضلين</h3>${providerMini(PROVIDERS.slice(0,3))}</div>`;
    case 'payments': return `<div class="dash-grid"><div class="dash-stat"><small>إجمالي المدفوع</small><strong>8,450 ج</strong></div><div class="dash-stat"><small>هذا الشهر</small><strong>1,280 ج</strong></div><div class="dash-stat"><small>فواتير</small><strong>14</strong></div></div><div class="app-panel"><h3>آخر المدفوعات</h3>${['إصلاح كهرباء · 450 ج','صيانة تكييف · 600 ج','سباكة · 250 ج'].map((x,i)=>`<div class="request-row"><div class="avatar">${i===0?'⚡':i===1?'❄️':'🚰'}</div><div class="request-info"><strong>${x.split(' · ')[0]}</strong><small>${x.split(' · ')[1]} · مدفوع</small></div><span class="tag">فاتورة #${100+i}</span></div>`).join('')}</div>`;
    case 'profile': return profileHtml('client',name);
    case 'settings': return settingsHtml();
    default: return renderClientView('dashboard',name);
  }
}

function renderProviderView(view,name,role){
  const spec=getSpecialty();
  if(role==='tow') return renderTowView(view,name);
  switch(view){
    case 'dashboard': return `<div class="dash-hero"><div><span class="section-kicker">حساب الفني</span><h2>أهلاً ${name} 👋</h2><p>دي لوحة شغلك: الطلبات القريبة، التقييم، الأسعار، وحالتك الآن.</p></div>${onlineToggle(name)}</div>
      <div class="dash-grid"><div class="dash-stat"><small>طلبات جديدة</small><strong>${providerJobs().length}</strong></div><div class="dash-stat"><small>مكتملة</small><strong>48</strong></div><div class="dash-stat"><small>تقييمك</small><strong>4.9</strong></div><div class="dash-stat"><small>أرباح الشهر</small><strong>12,450 ج</strong></div></div>
      <div class="app-panel"><div class="section-head"><div><h3>طلبات ${esc(spec||'الخدمة')}</h3><small class="muted">تظهر هنا الطلبات المطابقة لتخصصك فقط</small></div><button class="link-btn" data-view-inline="orders">كل الطلبات</button></div>${providerJobs().length?providerOrderRows(providerJobs()):`<div class="empty"><strong>مفيش طلبات جديدة دلوقتي</strong><small>فعّل «شغال الآن» عشان تستقبل طلبات قريبة منك.</small></div>`}</div>`;
    case 'orders': return `<div class="section-head"><div><span class="section-kicker">${esc(spec||'الفني')}</span><h2>الطلبات المتاحة لك</h2></div>${onlineToggle(name)}</div><div class="app-panel">${providerJobs().length?providerOrderRows(providerJobs()):`<div class="empty"><strong>لا توجد طلبات مطابقة حاليًا</strong><small>هتظهر لك الطلبات التي تناسب تخصصك فقط.</small></div>`}</div>`;
    case 'chat': return providerChatHtml();
    case 'portfolio': return portfolioHtml();
    case 'ratings': return ratingsHtml();
    case 'earnings': return earningsHtml();
    case 'profile': return profileHtml('technician',name);
    case 'settings': return settingsHtml();
    default: return renderProviderView('dashboard',name,role);
  }
}
function renderTowView(view,name){
  if(view==='dashboard'||view==='orders')return `<div class="dash-hero"><div><span class="section-kicker">USTA Auto</span><h2>أهلاً ${name} 👋</h2><p>هتشوف طلبات الونش والطوارئ المتاحة لك فقط.</p></div>${onlineToggle(name)}</div><div class="dash-grid"><div class="dash-stat"><small>طلبات قريبة</small><strong>4</strong></div><div class="dash-stat"><small>طلبات مكتملة</small><strong>72</strong></div><div class="dash-stat"><small>تقييمك</small><strong>4.8</strong></div><div class="dash-stat"><small>أرباح الشهر</small><strong>18,200 ج</strong></div></div><div class="app-panel"><h3>طلبات الطريق الحالية</h3>${providerOrderRows([{id:'AUTO-1032',service:'ونش وطوارئ',address:'مدينة نصر',time:'منذ 3 دقائق',price:350},{id:'AUTO-1028',service:'بطارية',address:'التجمع الخامس',time:'منذ 12 دقيقة',price:180}])}</div>`;
  if(view==='chat')return providerChatHtml();
  if(view==='profile')return profileHtml('tow',name);
  if(view==='settings')return settingsHtml();
  return renderTowView('dashboard',name);
}

function clientOrders(){try{return JSON.parse(localStorage.getItem('ustaClientOrders')||'[]')}catch{return []}}
function providerJobs(){
  const spec=getSpecialty();
  const demo=[
   {id:'JOB-1021',service:'كهرباء',address:'مدينة نصر',time:'منذ 10 دقائق',price:450},
   {id:'JOB-1022',service:'سباكة',address:'التجمع',time:'منذ 18 دقيقة',price:380},
   {id:'JOB-1023',service:'نجارة',address:'حلوان',time:'منذ 25 دقيقة',price:600},
   {id:'JOB-1024',service:'تكييف',address:'مصر الجديدة',time:'منذ 31 دقيقة',price:500}
  ];
  if(!spec)return [];
  return demo.filter(j=>j.service===spec || (spec==='أجهزة منزلية'&&j.service==='أجهزة منزلية'));
}
function orderRows(rows,client=false){
  if(!rows.length)return `<div class="empty"><strong>لسه مفيش طلبات</strong><small>${client?'ابدأ أول طلب من زر + طلب خدمة.':'تابع هنا الطلبات الجديدة.'}</small></div>`;
  return rows.map(o=>`<div class="request-row"><div class="avatar">${SERVICES.find(s=>s.name===o.service)?.icon||'🔧'}</div><div class="request-info"><strong>${esc(o.service)}</strong><small>${esc(o.address||'موقعك الحالي')} · ${esc(o.provider||'في انتظار الفني')}</small></div><span class="tag">${esc(o.status||'جاري')}</span><button class="app-btn" data-open-order="${esc(o.id)}">تفاصيل</button></div>`).join('');
}
function providerOrderRows(rows){return rows.map(o=>`<div class="request-row"><div class="avatar">${SERVICES.find(s=>s.name===o.service)?.icon||'🔧'}</div><div class="request-info"><strong>${esc(o.service)}</strong><small>${esc(o.address)} · ${esc(o.time||'الآن')} · ${o.price?o.price+' ج':''}</small></div><button class="app-btn orange" data-accept-job="${esc(o.id)}">قبول الطلب</button><button class="app-btn" data-chat-job="${esc(o.id)}">شات</button></div>`).join('')}
function onlineToggle(name){
  const state=getOnlineState(), my=Object.values(state).find(x=>x.name===name); const isOnline=!!my?.online; return `<button type="button" class="online-toggle ${isOnline?'on':''}" id="toggleOnline"><span class="dot"></span>${isOnline?'شغال الآن':'ابدأ العمل الآن'}</button>`;
}
function providerMini(list){return list.map(p=>`<div class="request-row"><div class="avatar">${p.icon}</div><div class="request-info"><strong>${esc(p.name)} ✅</strong><small>${esc(p.service)} · ⭐ ${p.rating} · ${p.city}</small></div><button class="app-btn" data-provider="${p.id}">الملف</button></div>`).join('')}
function providersDirectoryHtml(){return `<div class="section-head"><div><span class="section-kicker">مقدمين الخدمة</span><h2>الفنيين المتاحين</h2></div></div><div class="app-panel"><div class="directory-grid">${PROVIDERS.filter(p=>p.online).map(p=>`<article class="directory-card"><div class="avatar">${p.icon}</div><h3>${esc(p.name)} ✅</h3><p>${esc(p.service)}</p><div class="rating">★★★★★ <span>${p.rating}</span></div><small>${p.city} · ${p.jobs} خدمة</small><button class="app-btn orange" data-provider="${p.id}">عرض الملف</button></article>`).join('')||'<div class="empty" style="grid-column:1/-1">لا يوجد فنيون Online الآن.</div>'}</div></div>`}
function profileHtml(role,name){const spec=getSpecialty();return `<div class="profile-layout"><div class="profile-card"><div class="profile-cover"></div><div class="profile-main"><div class="profile-big">${role==='client'?'👤':role==='technician'?'🧑‍🔧':'🚛'}</div><h3>${name}</h3><p>${role==='client'?'عميل USTA':role==='technician'?`فني ${esc(spec||'')}`:'مقدم خدمات طريق وونش'}</p><button type="button" class="btn btn-primary" id="editProfile">تعديل الملف</button></div></div><div class="profile-card"><h3>بيانات الحساب</h3><div class="request-row"><div class="request-info"><strong>الاسم</strong><small>${name}</small></div></div><div class="request-row"><div class="request-info"><strong>البريد</strong><small>${esc(getEmail())}</small></div></div><div class="request-row"><div class="request-info"><strong>نوع الحساب</strong><small>${role==='client'?'عميل':role==='technician'?'فني':'ونش / Auto'}</small></div></div>${role==='technician'?`<div class="request-row"><div class="request-info"><strong>التخصص</strong><small>${esc(spec)}</small></div></div>`:''}</div></div>`}
function portfolioHtml(){const spec=getSpecialty();return `<div class="app-panel"><div class="section-head"><div><span class="section-kicker">للـفني</span><h2>Portfolio</h2><small class="muted">اعرض شغلك لعملاء ${esc(spec||'الخدمة')}</small></div><button class="app-btn orange" id="addPortfolio">+ إضافة مشروع</button></div><div class="portfolio-grid"><article class="portfolio-card"><div class="work-image before-after"><span>قبل</span><span>بعد</span></div><div class="portfolio-body"><h3>${esc(spec||'مشروع')} — مشروع 1 ✅</h3><small>مشروع موثق · 12 تقييم</small></div></article><article class="portfolio-card"><div class="work-image ac"><span>صورة</span><span>فيديو</span></div><div class="portfolio-body"><h3>مشروع 2 ✅</h3><small>أضف صورك الحقيقية هنا</small></div></article></div></div>`}
function earningsHtml(){return `<div class="dash-grid"><div class="dash-stat"><small>هذا الشهر</small><strong>12,450 ج</strong></div><div class="dash-stat"><small>هذا الأسبوع</small><strong>3,280 ج</strong></div><div class="dash-stat"><small>عمولة USTA</small><strong>1,245 ج</strong></div><div class="dash-stat"><small>المتاح للسحب</small><strong>8,930 ج</strong></div></div><div class="app-panel"><h3>آخر العمليات</h3>${['خدمة '+(getSpecialty()||'فنية'),'طلب مكتمل','دفعة محولة'].map((x,i)=>`<div class="request-row"><div class="avatar">💳</div><div class="request-info"><strong>${x}</strong><small>USTA · ${i+1} يوم</small></div><strong style="color:var(--success)">+${450+i*200} ج</strong></div>`).join('')}</div>`}
function ratingsHtml(){return `<div class="dash-grid"><div class="dash-stat"><small>متوسط التقييم</small><strong>4.9</strong></div><div class="dash-stat"><small>5 نجوم</small><strong>182</strong></div><div class="dash-stat"><small>4 نجوم</small><strong>45</strong></div><div class="dash-stat"><small>هذا الشهر</small><strong>18</strong></div></div><div class="app-panel"><h3>آخر التقييمات</h3>${['شغل ممتاز والتزام بالميعاد','محترم وشرح المشكلة كويس','سريع ونضيف في شغله'].map(x=>`<div class="request-row"><div class="avatar">⭐</div><div class="request-info"><strong>★★★★★</strong><small>${x}</small></div><span class="tag">عميل موثق</span></div>`).join('')}</div>`}
function settingsHtml(){const dark=localStorage.getItem('ustaTheme')==='dark';return `<div class="profile-layout"><div class="profile-card"><h3>الإعدادات</h3><div class="request-row"><div class="request-info"><strong>الوضع الداكن</strong><small>يطبق على USTA بالكامل</small></div><label class="switch"><input type="checkbox" id="themeToggle" ${dark?'checked':''}/><span></span></label></div><div class="request-row"><div class="request-info"><strong>الإشعارات</strong><small>طلبات ورسائل</small></div><input type="checkbox" checked /></div></div><div class="profile-card"><h3>الأمان</h3><button class="btn btn-ghost" id="changePassword">تغيير كلمة المرور</button></div></div>`}
function clientChatHtml(){return `<div class="chat-layout"><div class="chat-list"><h3>المحادثات</h3><button class="chat-person active" data-chat-name="أحمد محمد">أحمد محمد <small>كهربائي</small></button><button class="chat-person" data-chat-name="محمد السيد">محمد السيد <small>سباك</small></button></div>${chatWindowHtml('أحمد محمد','كهربائي')}</div>`}
function providerChatHtml(){return `<div class="chat-layout"><div class="chat-list"><h3>العملاء</h3><button class="chat-person active" data-chat-name="سهل">سهل <small>طلب كهرباء</small></button><button class="chat-person" data-chat-name="سارة">سارة <small>استفسار عن موعد</small></button></div>${chatWindowHtml('سهل','طلب #USTA-1021')}</div>`}
function chatWindowHtml(name,sub){return `<div class="chat-window"><div class="chat-head"><div class="avatar">👤</div><div><strong>${esc(name)}</strong><small>${esc(sub)}</small></div><span class="status-dot"></span></div><div class="messages" id="messages"><div class="bubble in">السلام عليكم، محتاج مساعدة في الطلب.</div><div class="bubble out">وعليكم السلام 👋</div></div><div class="chat-input"><input id="chatInput" placeholder="اكتب رسالة..."/><button class="app-btn orange" id="sendChat">إرسال</button></div></div>`}

function wireAppContent(view,role){
  $$('[data-app-service]').forEach(b=>b.onclick=()=>{if(role==='client')openService(b.dataset.appService);else toast('طلبات الخدمات من حساب العميل فقط')});
  $$('[data-view-inline]').forEach(b=>b.onclick=()=>{currentView=b.dataset.viewInline;renderNav();renderAppView(currentView)});
  $$('[data-provider]').forEach(b=>b.onclick=()=>openProviderProfile(b.dataset.provider));
  $$('[data-open-order]').forEach(b=>b.onclick=()=>toast('تفاصيل الطلب: '+b.dataset.openOrder));
  $$('[data-accept-job]').forEach(b=>b.onclick=()=>{b.textContent='تم قبول الطلب ✓';toast('تم قبول الطلب، افتح الشات للتواصل مع العميل')});
  $$('[data-chat-job]').forEach(b=>b.onclick=()=>{currentView='chat';renderNav();renderAppView('chat')});
  $('#editProfile')?.addEventListener('click',()=>toast('تعديل البيانات متاح في الخطوة القادمة من الـBackend'));
  $('#addPortfolio')?.addEventListener('click',()=>toast('هنا يضيف الفني الصور، قبل/بعد، الوصف، نوع الخدمة والسعر الاختياري'));
  $('#changePassword')?.addEventListener('click',()=>toast('تغيير كلمة المرور هيكون مرتبط بالـBackend الحقيقي'));
  $('#sendChat')?.addEventListener('click',sendChat);$('#chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});
  $$('[data-chat-name]').forEach(b=>b.onclick=()=>{$$('[data-chat-name]').forEach(x=>x.classList.remove('active'));b.classList.add('active');toast('تم فتح المحادثة')});
  $('#themeToggle')?.addEventListener('change',e=>applyTheme(e.target.checked?'dark':'light'));
  if((role==='technician'||role==='tow')&&(view==='dashboard'||view==='orders'))$('#toggleOnline')?.addEventListener('click',()=>openWorkArea());
}
function sendChat(){const i=$('#chatInput');if(!i||!i.value.trim())return;const box=$('#messages');const bubble=document.createElement('div');bubble.className='bubble out';bubble.textContent=i.value.trim();box.appendChild(bubble);i.value='';box.scrollTop=box.scrollHeight;setTimeout(()=>{const r=document.createElement('div');r.className='bubble in';r.textContent='تمام، وصلتني رسالتك 👍';box.appendChild(r);box.scrollTop=box.scrollHeight},450)}
function openProviderProfile(id){
  const p=PROVIDERS.find(x=>x.id===id);if(!p)return;
  let modal=$('#providerProfileModal');
  if(!modal){
    modal=document.createElement('div');modal.id='providerProfileModal';modal.className='modal';modal.setAttribute('aria-hidden','true');
    document.body.appendChild(modal);
  }
  modal.innerHTML=`<div class="modal-card"><button class="modal-close" type="button" data-provider-close>×</button><div class="profile-main"><div class="profile-big">${p.icon}</div><h2>${esc(p.name)} ✅</h2><p>${esc(p.service)} · ${esc(p.city)}</p><div class="rating">★★★★★ <span>${p.rating}</span></div><p>${p.jobs} خدمة · ${p.commit}% التزام بالمواعيد</p><h3>Portfolio</h3><div class="portfolio-grid"><div class="portfolio-card"><div class="work-image before-after"><span>قبل</span><span>بعد</span></div><div class="portfolio-body"><strong>مشروع موثق عبر USTA</strong></div></div></div><button class="btn btn-primary full" id="modalOrderProvider">اطلب الفني</button></div></div>`;
  openModal(modal);
  modal.querySelector('[data-provider-close]').onclick=()=>closeModal(modal);
  modal.querySelector('#modalOrderProvider').onclick=()=>{closeModal(modal);pendingService=p.serviceKey;openService(p.serviceKey);};
}
function openWorkArea(){
  const role=getRole(), name=getUser(); if(role!=='technician'&&role!=='tow')return;
  const modal=$('#workAreaModal'); if(!modal)return;
  let selectedRadius=5,selectedArea=''; let workPos=null;
  $('#workGpsBadge').textContent='غير محدد';$('#workAreaGpsStatus').textContent='حدد موقعك ثم اختر نصف قطر العمل.';$('#workGpsBadge').classList.remove('ok');
  $$('#workRadiusGrid button').forEach(b=>b.classList.toggle('selected',b.dataset.radius==='5'));
  $$('#areaPresets button').forEach(b=>b.classList.remove('selected'));
  openModal(modal);
  $$('#workRadiusGrid button').forEach(b=>b.onclick=()=>{selectedRadius=Number(b.dataset.radius);$$('#workRadiusGrid button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#zoneSummary').textContent=`📍 هيتم عرضك داخل نطاق ${selectedRadius} كم${selectedArea?' حول '+selectedArea:''}`});
  $$('#areaPresets button').forEach(b=>b.onclick=()=>{selectedArea=b.dataset.area;$$('#areaPresets button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#zoneSummary').textContent=`📍 هيتم عرضك داخل نطاق ${selectedRadius} كم حول ${selectedArea}`});
  $('#workAreaUseGps').onclick=()=>{if(!navigator.geolocation){toast('GPS غير مدعوم');return}$('#workAreaGpsStatus').textContent='جاري تحديد موقعك...';navigator.geolocation.getCurrentPosition(pos=>{workPos={lat:pos.coords.latitude,lng:pos.coords.longitude};$('#workGpsBadge').textContent='GPS فعال ✓';$('#workGpsBadge').classList.add('ok');$('#workAreaGpsStatus').textContent=`تم تحديد موقعك بدقة ±${Math.round(pos.coords.accuracy)} متر.`},()=>$('#workAreaGpsStatus').textContent='اسمح بالموقع من المتصفح ثم أعد المحاولة.')};
  $('#confirmWorkArea').onclick=()=>{if(!workPos){toast('حدد موقعك أولًا باستخدام GPS');return}const state=getOnlineState();const service=role==='technician'?getSpecialty():'ونش وطوارئ';const demo=PROVIDERS.find(x=>x.serviceKey===service);const key=demo?demo.id:'self';state[key]={name:demo?.name||name,online:true,lat:workPos.lat,lng:workPos.lng,radius:selectedRadius,area:selectedArea,service,updatedAt:Date.now()};state.self=state[key];saveOnlineState(state);closeModal(modal);toast(`تم تشغيل حالتك داخل نطاق ${selectedRadius} كم`);renderAppView(currentView);};
}

function applyTheme(theme){document.body.classList.toggle('dark-mode',theme==='dark');localStorage.setItem('ustaTheme',theme);const t=$('#themeToggle');if(t)t.checked=theme==='dark'}
applyTheme(localStorage.getItem('ustaTheme')||'light');

// Close / open app controls
$('#appBrandHome')?.addEventListener('click',()=>{hideApp();document.getElementById('home')?.scrollIntoView({behavior:'smooth'})});
$('#appHeaderHome')?.addEventListener('click',()=>{hideApp();document.getElementById('home')?.scrollIntoView({behavior:'smooth'})});
$('#openChatTop')?.addEventListener('click',()=>{if(hasAccount()){currentView='chat';renderNav();renderAppView('chat')}});
$('#openNotifications')?.addEventListener('click',()=>toast('لا توجد إشعارات جديدة'));
$('#logoutBtn')?.addEventListener('click',()=>{const state=getOnlineState();if(getRole()==='technician'||getRole()==='tow'){Object.keys(state).forEach(k=>{if(state[k]?.name===getUser()||k==='self')delete state[k]});saveOnlineState(state)}clearAccount();hideApp();updateHeaderAuthState();toast('تم تسجيل الخروج')});
$('#appMenu')?.addEventListener('click',()=>{$('.sidebar')?.classList.add('open');appShell.classList.add('sidebar-open')});
$('#sidebarClose')?.addEventListener('click',closeSidebar);$('#appOverlay')?.addEventListener('click',closeSidebar);
function closeSidebar(){$('.sidebar')?.classList.remove('open');appShell.classList.remove('sidebar-open')}

// Make public header account buttons work even if another script changed them.
window.addEventListener('hashchange',()=>{if(location.hash==='#home')hideApp()});
