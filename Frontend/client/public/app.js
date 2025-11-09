// app.js
// ================================
// 지원사업 플랫폼 로직 / 이벤트 모듈
// ================================

// ---------------- 기본 데이터 ----------------
const mock = [
  { id:"P001", title:"청년 월세 한시 특별지원", region:"전국", category:"주거",
    host:"국토교통부", benefit:"월 최대 20만원, 최대 12개월 지원",
    period:{start:"2025-01-01", end:"2025-12-31"}, tags:["청년","월세"] },
  { id:"P002", title:"청년 창업 시드 펀드", region:"서울", category:"금융",
    host:"서울산업진흥원", benefit:"시드투자 최대 5천만원 + 보육프로그램",
    period:{start:"2025-02-01", end:"2025-12-31"}, tags:["창업","투자"] },
];

const POPULAR_TAGS = [
  { tag: "청년", count: 156 },
  { tag: "창업", count: 89 },
  { tag: "주거", count: 77 }
];

// ---------------- 유틸 ----------------
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const inPeriod = (p)=>{
  const t=new Date(); const s=new Date(p.period.start); const e=new Date(p.period.end);
  return t>=s && t<=e;
};

// ---------------- 상태 ----------------
const state = {
  saved: new Set(),
  page: 1, pageSize: 6,
};

// ---------------- 렌더 ----------------
function applyFilters(){
  const q = $('#q').value.trim().toLowerCase();
  let list = mock.filter(p => !q || p.title.toLowerCase().includes(q));
  render(list);
}

function render(list){
  const host = $('#results');
  host.innerHTML = '';
  $('#count').textContent = `검색 결과 ${list.length}건`;

  if(!list.length){
    $('#empty').style.display='block';
    return;
  }
  $('#empty').style.display='none';
  list.forEach(p=>{
    const live=inPeriod(p);
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`
      <div class="title">${p.title}</div>
      <div class="muted">${p.host}</div>
      <div class="desc">${p.benefit}</div>
      <div class="period">기간: ${p.period.start}~${p.period.end} ${live?'✅':''}</div>
      <button class="btn small" data-id="${p.id}" data-act="detail">자세히</button>
    `;
    host.appendChild(el);
  });
}

// ---------------- 상세 ----------------
function openDetail(id){
  const p=mock.find(x=>x.id===id);
  if(!p) return;
  $('#detailTitle').textContent=p.title;
  $('#detailBody').innerHTML=`
    <p>${p.benefit}</p>
    <p>주관: ${p.host}</p>
    <p>지역: ${p.region} · 분야: ${p.category}</p>
  `;
  $('#backdrop').style.display='flex';
}
$('#closeDetail').onclick=()=>$('#backdrop').style.display='none';

// ---------------- 이벤트 ----------------
$('#btn-search').onclick=applyFilters;
$('#btn-reset').onclick=()=>{ $('#q').value=''; applyFilters(); };
$('#results').onclick=(e)=>{
  const btn=e.target.closest('button[data-act]');
  if(!btn) return;
  const id=btn.dataset.id;
  if(btn.dataset.act==='detail') openDetail(id);
};

// ---------------- 인기 태그 ----------------
function renderPopularTags(){
  const host=$('#popularTags');
  host.innerHTML=POPULAR_TAGS.map(t=>`
    <span class="popular-tag" data-tag="${t.tag}">${t.tag}<span class="count">${t.count}</span></span>
  `).join('');
}
$('#popularTags').onclick=(e)=>{
  const tag=e.target.closest('.popular-tag');
  if(tag){
    $('#q').value=tag.dataset.tag;
    applyFilters();
  }
};

// ---------------- 인증(IIFE) ----------------
(function(){
  const btn=$('#authBtn'); const menu=$('#authMenu'); const my=$('#myPageLink'); const out=$('#logoutBtn');
  function openLoginPopup(){
    const w=520,h=640,l=(screen.width-w)/2,t=(screen.height-h)/2;
    window.open('login.html','login',`width=${w},height=${h},left=${l},top=${t}`);
  }
  function renderAuth(){
    const raw=sessionStorage.getItem('currentUser');
    if(!raw){ btn.textContent='로그인'; btn.onclick=openLoginPopup; my.style.display=out.style.display='none'; return; }
    const user=JSON.parse(raw);
    btn.textContent=`${user.name||user.email} ▾`;
    btn.onclick=()=>menu.style.display=(menu.style.display==='block'?'none':'block');
    my.style.display=out.style.display='block';
  }
  window.addEventListener('message',(e)=>{
    if(e?.data?.type==='auth:login'){ sessionStorage.setItem('currentUser',JSON.stringify(e.data.user)); renderAuth(); }
  });
  out.onclick=()=>{sessionStorage.removeItem('currentUser');renderAuth();};
  document.addEventListener('click',ev=>{
    if(!menu.contains(ev.target)&&ev.target!==btn) menu.style.display='none';
  });
  renderAuth();
})();

// ---------------- 초기 실행 ----------------
renderPopularTags();
applyFilters();
