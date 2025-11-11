console.log('✅ app.js loaded', new Date().toISOString());

// ------------------------------
    // 데이터 (mock)
    // ------------------------------
    const mock = [
    { id:"P001", title:"청년 월세 한시 특별지원", region:"전국", category:"주거", host:"국토교통부",
        targets:"만 19~34세 무주택 청년", benefit:"월 최대 20만원, 최대 12개월 지원",
        period:{ start:"2025-01-01", end:"2025-12-31" }, link:"https://example.com/p1", contact:"국토부 콜센터 120",
        tags:["월세","주거","청년"], minAge:19, maxAge:34, employment:"", income:"중위소득 150% 이하", updatedAt:"2025-02-10" },
    { id:"P002", title:"지역 청년 교통비 지원", region:"대구", category:"복지", host:"대구광역시",
        targets:"대구 청년(만 19~34세) 대중교통 이용자", benefit:"월 3만원 모바일 교통카드 지급",
        period:{ start:"2025-03-01", end:"2025-06-30" }, link:"https://example.com/p2", contact:"대구시 청년정책과",
        tags:["교통비","대중교통"], minAge:19, maxAge:34, updatedAt:"2025-03-05" },
    { id:"P003", title:"청년 취업 성공 패키지(가칭)", region:"경북", category:"일자리", host:"경상북도",
        targets:"구직 청년", benefit:"취업 역량강화 교육 + 면접비/자격증 비용 지원",
        period:{ start:"2025-01-15", end:"2025-05-31" }, link:"https://example.com/p3", contact:"경북일자리센터",
        tags:["취업","교육","면접비"], employment:"구직자", updatedAt:"2025-01-20" },
    { id:"P004", title:"청년 창업 시드 펀드", region:"서울", category:"금융", host:"서울산업진흥원",
        targets:"예비/초기 창업자", benefit:"시드 투자 최대 5천만원 + 보육 프로그램",
        period:{ start:"2025-02-01", end:"2025-12-31" }, link:"https://example.com/p4", contact:"SBA",
        tags:["창업","투자"], employment:"프리랜서/자영업", updatedAt:"2025-02-12" },
    ];

    // ✅ 복지로 API에서 받아올 데이터
let welfareData = []; // 새로운 외부 API 데이터 저장용

// ✅ 백엔드(Spring Boot)에서 복지로 API 데이터 불러오기
async function loadWelfareData() {
  try {
    const res = await fetch("http://localhost:8080/api/welfare?pageNo=1&numOfRows=10");
    if (!res.ok) throw new Error("서버 응답 오류: " + res.status);
    const data = await res.json();

    // 응답 구조가 data.response.body.items 형태일 경우 처리
    const items = data?.response?.body?.items || [];

    welfareData = items.map((item, idx) => ({
      id: `W${idx + 1}`,
      title: item.srvNm || "지원사업명 없음",
      region: item.jurMnofNm || "전국",
      category: "복지",
      host: item.jurOrgNm || "기관 미상",
      targets: item.tgtrDtlCn || "-",
      benefit: item.alwServCn || "내용 없음",
      period: { start: "2025-01-01", end: "2025-12-31" },
      link: item.aplyUrl || "#",
      contact: item.cnsgNmor || "-",
      tags: (item.lifeArray || "").split(","),
      updatedAt: new Date().toISOString(),
    }));

    console.log("✅ 복지로 API 불러오기 성공:", welfareData.length, "건");

    // 기존 mock 데이터와 합치기
    mock = [...mock, ...welfareData];

    // 렌더링 갱신
    applyFilters();

  } catch (err) {
    console.error("❌ 복지로 API 불러오기 실패:", err);
  }
}


    // 인기 태그/자동완성 데이터
    const POPULAR_TAGS = [
    { tag:"청년", count:156 },{ tag:"주거", count:89 },{ tag:"창업", count:76 },{ tag:"취업", count:67 },
    { tag:"교육", count:45 },{ tag:"농업", count:34 },{ tag:"문화", count:23 },{ tag:"육아", count:21 },
    ];
    const ALL_TAGS = [
    "주거","일자리","교육","금융","복지","창업","취업","농업","문화","육아",
    "청년","노인","장애인","여성","다문화","저소득층","중소기업","소상공인",
    "현금지원","대출","바우처","컨설팅","교육지원","시설지원"
    ];

    // 상태
    const state = {
    page:1, pageSize:6, saved:new Set(), recentlyViewed:[], selectedCategory:'', searchHistory:[]
    };

    // 유틸
    const $  = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
    const inPeriod = (p) => {
    const today = new Date();
    const s = new Date(p.period.start);
    const e = new Date(p.period.end);
    return today >= s && today <= e;
    };

    // 필터 수집
    function getFilters(){
    return {
        q: ($('#q').value || '').trim().toLowerCase(),
        region: $('#region').value,
        category: $('#category').value,
        ageMin: parseInt($('#ageMin').value || '0', 10),
        ageMax: parseInt($('#ageMax').value || '200', 10),
        income: $('#income').value,
        employment: $('#employment').value,
        deadline: $('#deadline').value,
        sort: $('#sort').value,
        sex: $('#sex') ? $('#sex').value : '',
        asset: $('#asset') ? parseInt($('#asset').value || '0', 10) : 0,
        interests: ($('#interests') ? $('#interests').value.split(',').map(s=>s.trim()).filter(Boolean) : [])
    };
    }

    // 필터 적용 + 정렬
    function applyFilters(){
    const f = getFilters();
    let list = mock.slice();

    if (f.q){
        list = list.filter(p => (
        (p.title||'')+" "+(p.targets||'')+" "+(p.benefit||'')+" "+(p.tags||[]).join(' ')+" "+(p.host||'')
        ).toLowerCase().includes(f.q));
    }
    if (f.region)   list = list.filter(p => p.region === f.region || p.region === '전국');
    if (f.category) list = list.filter(p => p.category === f.category);

    list = list.filter(p => {
        const min = p.minAge ?? 0, max = p.maxAge ?? 200;
        return f.ageMax >= min && f.ageMin <= max;
    });

    if (f.income)     list = list.filter(p => !p.income || p.income === f.income);
    if (f.employment) list = list.filter(p => (p.employment || '') === f.employment);

    if (f.interests && f.interests.length){
        list = list.filter(p => {
        const tags = (p.tags || []).map(t=>t.toLowerCase());
        return f.interests.some(i=>{
            const s = i.toLowerCase();
            return tags.includes(s) || (p.title||'').toLowerCase().includes(s) || (p.category||'').toLowerCase().includes(s);
        });
        });
    }

    if (f.deadline === 'open')   list = list.filter(inPeriod);
    if (f.deadline === 'closed') list = list.filter(p => !inPeriod(p));

    if (f.sort === 'deadline'){
        list.sort((a,b)=> new Date(a.period.end) - new Date(b.period.end));
    }else if (f.sort === 'latest'){
        list.sort((a,b)=> new Date(b.updatedAt || b.period.start) - new Date(a.updatedAt || a.period.start));
    }

    renderChips(f);
    render(list);
    }

    function renderChips(f){
    const host = $('#activeChips');
    host.innerHTML = '';
    const add = (label,val) => {
        if (val){
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = `${label}: ${val}`;
        host.appendChild(el);
        }
    };
    add('지역', f.region || '전국');
    add('분야', f.category || '전체');
    if ($('#q').value) add('키워드', $('#q').value);
    if ($('#ageMin').value || $('#ageMax').value) add('나이', `${$('#ageMin').value || '0'}~${$('#ageMax').value || '무한'}`);
    if (f.income) add('소득', f.income);
    if (f.employment) add('고용', f.employment);
    if (f.sex) add('성별', f.sex === 'male' ? '남' : f.sex === 'female' ? '여' : f.sex);
    if (f.asset) add('재산(원)', f.asset.toLocaleString());
    if (f.interests && f.interests.length) add('관심', f.interests.join(', '));
    add('마감', { open:'진행중만', all:'전체', closed:'마감만' }[f.deadline]);
    }

    function paginate(list){
    const start = (state.page - 1) * state.pageSize;
    return list.slice(start, start + state.pageSize);
    }

    function render(list){
    $('#count').textContent = `검색 결과 ${list.length}건`;
    const pageList = paginate(list);
    const host = $('#results');
    host.innerHTML = '';

    if (!pageList.length){
        $('#empty').style.display = 'block';
        $('#pager').innerHTML = '';
        return;
    }
    $('#empty').style.display = 'none';

    pageList.forEach(p=>{
        const live = inPeriod(p);
        const el = document.createElement('article');
        el.className = 'card';
        el.innerHTML = `
        <div class="row">
            <div class="badge clickable" data-search="${p.region}">${p.region}</div>
            <div class="badge clickable" data-search="${p.category}">${p.category}</div>
        </div>
        <div class="title">${p.title}</div>
        <div class="muted">${p.host||''}</div>
        <div class="desc">${p.benefit||''}</div>
        <div class="muted">대상: ${p.targets||'-'}${p.income ? ' · '+p.income : ''}</div>
        <div class="period">신청기간: ${p.period.start} ~ ${p.period.end} ${live ? '<span class="live">● 진행중</span>' : '<span style="color:#9aa8bb">마감</span>'}</div>
        <div class="badges">
            ${(p.tags||[]).map(t=>`<span class="badge clickable" data-search="${t}">#${t}</span>`).join('')}
            ${p.income ? `<span class="badge clickable" data-search="${p.income}">${p.income}</span>` : ''}
            ${p.employment ? `<span class="badge clickable" data-search="${p.employment}">${p.employment}</span>` : ''}
        </div>
        <div class="row">
            <div style="display:flex;gap:8px">
            <button class="btn small" data-act="detail" data-id="${p.id}">자세히</button>
            <a class="btn small ghost" href="${p.link}" target="_blank" rel="noopener">공식 사이트</a>
            </div>
            <button class="btn small ${state.saved.has(p.id) ? 'acc' : ''}" data-act="save" data-id="${p.id}">
            ${state.saved.has(p.id) ? '저장됨★' : '저장'}
            </button>
        </div>
        `;
        host.appendChild(el);
    });

    // 페이지네이션
    const pages = Math.ceil(list.length / state.pageSize) || 1;
    const pager = $('#pager');
    pager.innerHTML = '';
    for (let i=1;i<=pages;i++){
        const a = document.createElement('button');
        a.className = 'page' + (i === state.page ? ' active' : '');
        a.textContent = i;
        a.addEventListener('click', ()=>{
        state.page = i;
        render(list);
        window.scrollTo({ top:0, behavior:'smooth' });
        });
        pager.appendChild(a);
    }
    }

    // 카테고리 카운트
    function updateCategoryCounts(){
  // 카테고리별 개수 집계
  const counts = mock.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // 사이드바의 "첫 번째 섹션(카테고리)"만 대상으로 삼기
  const catSection = document.querySelector('.sidebar .sidebar-section');
  if (!catSection) return;

  // 각 항목 업데이트 (count 없으면 건너뛰기)
  Array.from(catSection.querySelectorAll('.menu-item')).forEach(item => {
    const cntEl = item.querySelector('.count');
    if (!cntEl) return; // 유용한 링크 같은 항목은 패스

    const categoryText = (item.firstElementChild?.textContent || '').trim();
    if (categoryText === '전체') {
      cntEl.textContent = String(mock.length);
    } else {
      cntEl.textContent = String(counts[categoryText] || 0);
    }
  });
}


    // 최근 본 항목
    function updateRecentlyViewed(program){
    state.recentlyViewed = state.recentlyViewed.filter(p=>p.id!==program.id);
    state.recentlyViewed.unshift(program);
    state.recentlyViewed = state.recentlyViewed.slice(0,5);

    const container = $('.sidebar-section:nth-child(2)');
    const recentItems = state.recentlyViewed.map(p=>`
        <div class="recent-item" data-id="${p.id}">
        <div class="title">${p.title}</div>
        <div class="meta">${p.region} · ${p.category} · ${inPeriod(p) ? '<span class="live">진행중</span>' : '마감'}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3>최근 본 지원사업</h3>
        ${recentItems || '<div class="muted" style="text-align:center">최근 본 항목이 없습니다</div>'}
    `;
    }

    function openDetail(id){
    const p = mock.find(x=>x.id===id);
    if (!p) return;
    updateRecentlyViewed(p);

    $('#detailTitle').textContent = p.title;
    $('#detailBody').innerHTML = `
        <div class="grid">
        <div>
            <h3>개요</h3>
            <p class="muted">주관: ${p.host || '-'}</p>
            <p>대상: ${p.targets || '-'}</p>
            <p>분야/지역: ${p.category} · ${p.region}</p>
            <p>신청기간: ${p.period.start} ~ ${p.period.end} ${inPeriod(p) ? '<span class="live">진행중</span>' : '<span style="color:#9aa8bb">마감</span>'}</p>
        </div>
        <div>
            <h3>지원 내용</h3>
            <p>${p.benefit || '-'}</p>
            <div class="chiprow" style="margin-top:8px">${(p.tags||[]).map(t=>`<span class='chip'>#${t}</span>`).join('')}</div>
        </div>
        </div>
        <hr style="border-color:#203045;opacity:.4;margin:16px 0">
        <p><strong>신청/안내:</strong> <a href="${p.link}" target="_blank" rel="noopener">공식 페이지</a></p>
        <p><strong>문의:</strong> ${p.contact || '-'}</p>
        <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn acc" data-act="save" data-id="${p.id}">${state.saved.has(p.id) ? '저장됨★' : '저장'}</button>
        <button class="btn ghost" onclick="navigator.clipboard.writeText('${p.link}').then(()=>alert('링크 복사됨'))">링크 복사</button>
        </div>
    `;
    $('#backdrop').style.display = 'flex';
    $('#backdrop').setAttribute('aria-hidden','false');
    }

    // 태그 클릭 → 필터 주입
    function handleTagClick(searchTerm){
    const isRegion = ['전국','서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'].includes(searchTerm);
    const isCategory = ['주거','일자리','교육','금융','복지','기타'].includes(searchTerm);
    const isIncome = searchTerm.includes('중위소득');
    const isEmployment = ['재직자','구직자','프리랜서/자영업'].includes(searchTerm);

    $$('#filters .input, #filters .select').forEach(el=> el.value='');
    $('#deadline').value = 'open';

    if (isRegion) $('#region').value = searchTerm;
    else if (isCategory) $('#category').value = searchTerm;
    else if (isIncome) $('#income').value = searchTerm;
    else if (isEmployment) $('#employment').value = searchTerm;
    else $('#q').value = searchTerm.replace('#','');

    executeSearch();
    }

    // 이벤트 바인딩
    const executeSearch = () => { state.page = 1; applyFilters(); };
    $('#btn-search').addEventListener('click', executeSearch);
    $('#q').addEventListener('keypress', (e)=>{ if (e.key==='Enter'){ e.preventDefault(); executeSearch(); }});
    $('#btn-reset').addEventListener('click', ()=>{
    $$('#filters .input, #filters .select').forEach(el=> el.value='');
    $('#deadline').value='open';
    state.page=1; applyFilters();
    });

    $('#results').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if (btn){
        const id = btn.getAttribute('data-id');
        const act = btn.getAttribute('data-act');
        if (act==='detail') openDetail(id);
        if (act==='save') toggleSave(id);
        return;
    }
    const tag = e.target.closest('.badge.clickable');
    if (tag){
        const searchTerm = tag.getAttribute('data-search');
        if (searchTerm) handleTagClick(searchTerm);
    }
    });

    $('#closeDetail').addEventListener('click', ()=>{
    $('#backdrop').style.display='none';
    $('#backdrop').setAttribute('aria-hidden','true');
    });
    $('#backdrop').addEventListener('click', (e)=>{ if (e.target.id==='backdrop') $('#closeDetail').click(); });

    function toggleSave(id){
    if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
    $('#btn-saved').textContent = `저장함(${state.saved.size})`;
    applyFilters();
    }
    $('#btn-saved').addEventListener('click', ()=>{
    const saved = mock.filter(m=> state.saved.has(m.id));
    render(saved);
    $('#count').textContent = `저장한 항목 ${saved.length}건`;
    $('#pager').innerHTML = '';
    });

    // 사이드바 카테고리 클릭
    $$('.sidebar .menu-item').forEach(item=>{
    item.addEventListener('click', ()=>{
        if (item.closest('.sidebar-section') === $('.sidebar-section:first-child')){
        const category = item.firstElementChild.textContent;
        $$('.sidebar .menu-item').forEach(i=> i.classList.remove('active'));
        item.classList.add('active');
        $('#category').value = category === '전체' ? '' : category;
        state.page = 1; applyFilters();
        }
    });
    });

    // 최근 본 항목 클릭
    $('.sidebar').addEventListener('click', e=>{
    const recentItem = e.target.closest('.recent-item');
    if (recentItem){ openDetail(recentItem.dataset.id); }
    });

    // 저장 조건 (localStorage)
    const STORAGE_KEY = 'smp_saved_conditions_v2';
    function updateSavedLabel(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw){ $('#savedLabel').textContent='없음'; return; }
    try{
        const conditions = JSON.parse(raw);
        $('#savedLabel').textContent = `${conditions.length}개 저장됨`;
    }catch{ $('#savedLabel').textContent='없음'; }
    }
    function openConditionManager(){
    const conditions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const noConditions = conditions.length === 0;

    $('#detailTitle').textContent = '저장된 조건 관리';
    $('#detailBody').innerHTML = `
        <div style="margin-bottom:16px">
        <div class="f">
            <label for="condition-name">조건 이름</label>
            <input class="input" id="condition-name" placeholder="예: 내 기본 조건" />
        </div>
        <div class="f" style="margin-top:12px">
            <label><input type="checkbox" id="notify-enabled" style="margin-right:8px">변경사항 알림 받기</label>
        </div>
        </div>
        <div style="display:flex;gap:8px">
        <button class="btn acc" id="saveNewCondition">현재 조건 저장</button>
        </div>
        <hr style="margin:20px 0">
        <h3 style="margin:0 0 12px">저장된 조건 목록</h3>
        ${ noConditions
            ? '<div class="empty" style="padding:16px">저장된 조건이 없습니다.</div>'
            : '<div class="saved-conditions">' +
            conditions.map((c,i)=>`
                <div class="recent-item" style="margin-bottom:8px;position:relative">
                <div class="title">${c.name || '저장된 조건 ' + (i+1)}</div>
                <div class="meta">${new Date(c.savedAt).toLocaleString()} · ${c.notifyEnabled ? '알림 켜짐 ● ' : '알림 꺼짐'}</div>
                <div style="position:absolute;right:12px;top:12px;display:flex;gap:6px">
                    <button class="btn small ghost" onclick="loadCondition(${i})">불러오기</button>
                    <button class="btn small ghost" onclick="deleteCondition(${i})">삭제</button>
                </div>
                </div>
            `).join('') + '</div>'
        }
    `;
    const $sheet = $('#backdrop');
    $sheet.style.display='flex';
    $sheet.setAttribute('aria-hidden','false');

    $('#saveNewCondition').onclick = ()=>{
        const name = $('#condition-name').value.trim();
        const notifyEnabled = $('#notify-enabled').checked;
        saveCondition(name, notifyEnabled);
    };
    }
    function saveCondition(name, notifyEnabled){
    try{
        const conditions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        conditions.push({ name: name || `저장된 조건 ${conditions.length+1}`, filters:getFilters(), savedAt:Date.now(), notifyEnabled });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
        updateSavedLabel();
        openConditionManager();
        if (notifyEnabled){ setupNotification(conditions.length - 1); }
    }catch(e){ console.error(e); alert('조건 저장 중 오류가 발생했습니다.'); }
    }
    window.loadCondition = function(index){
    try{
        const conditions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const c = conditions[index]; if (!c) return;
        const f = c.filters || {};
        if ($('#q')) $('#q').value = f.q || '';
        if ($('#region')) $('#region').value = f.region || '';
        if ($('#category')) $('#category').value = f.category || '';
        if ($('#ageMin')) $('#ageMin').value = f.ageMin || '';
        if ($('#ageMax')) $('#ageMax').value = f.ageMax || '';
        if ($('#income')) $('#income').value = f.income || '';
        if ($('#employment')) $('#employment').value = f.employment || '';
        if ($('#deadline')) $('#deadline').value = f.deadline || 'open';
        if ($('#sort')) $('#sort').value = f.sort || 'relevance';
        if ($('#sex')) $('#sex').value = f.sex || '';
        if ($('#asset')) $('#asset').value = f.asset || '';
        if ($('#interests')) $('#interests').value = (f.interests || []).join(', ');
        $('#closeDetail').click();
        state.page = 1; applyFilters();
    }catch(e){ console.error(e); alert('저장된 조건을 불러오는 중 오류가 발생했습니다.'); }
    };
    window.deleteCondition = function(index){
    try{
        const conditions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        conditions.splice(index,1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
        updateSavedLabel();
        openConditionManager();
    }catch(e){ console.error(e); alert('조건 삭제 중 오류가 발생했습니다.'); }
    };
    function setupNotification(conditionIndex){
    const conditions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const condition = conditions[conditionIndex];
    if (!condition || !condition.notifyEnabled) return;
    console.log(`[알림] "${condition.name}" 조건에 대한 알림이 설정되었습니다.`);
    setInterval(()=>{
        const matches = mock.filter(p=>{
        const f = condition.filters;
        return p.title.toLowerCase().includes((f.q||'').toLowerCase()) || (f.region ? p.region===f.region : true);
        });
        if (matches.length > 0){
        console.log(`[알림] "${condition.name}" 조건에 맞는 ${matches.length}개의 새로운 지원사업이 있습니다!`);
        }
    }, 10000);
    }
    function clearConditions(){
    if (!confirm('모든 저장된 조건을 삭제하시겠습니까?')) return;
    localStorage.removeItem(STORAGE_KEY);
    updateSavedLabel();
    openConditionManager();
    }
    $('#btn-save-condition').addEventListener('click', ()=> openConditionManager());
    $('#btn-load-condition').addEventListener('click', ()=> openConditionManager());
    $('#btn-clear-condition').addEventListener('click', clearConditions);

    // 인기 태그 렌더링
    function renderPopularTags(){
    const container = $('#popularTags');
    container.innerHTML = POPULAR_TAGS.map(({tag,count})=>`
        <span class="popular-tag" data-tag="${tag}">
        ${tag}<span class="count">${count}</span>
        </span>
    `).join('');
    }
    $('#popularTags').addEventListener('click', e=>{
    const tag = e.target.closest('.popular-tag');
    if (tag){ $('#q').value = tag.dataset.tag; executeSearch(); }
    });

    // 자동완성
    function setupAutocomplete(){
    const input = $('#q');
    const autocomplete = $('#autocomplete');
    let selectedIndex = -1;

    function showSuggestions(value){
        const query = value.toLowerCase();
        if (!query){ autocomplete.style.display='none'; return; }
        const matches = ALL_TAGS.filter(tag => tag.toLowerCase().includes(query)).slice(0,8);
        if (!matches.length){ autocomplete.style.display='none'; return; }
        const html = matches.map((tag,index)=>{
        const highlighted = tag.replace(new RegExp(query,'gi'), m=>`<mark>${m}</mark>`);
        return `<div class="autocomplete-item" data-index="${index}">${highlighted}</div>`;
        }).join('');
        autocomplete.innerHTML = html;
        autocomplete.style.display = 'block';
        selectedIndex = -1;
    }
    function selectItem(index){
        const items = $$('.autocomplete-item', autocomplete);
        if (index >= items.length) index = items.length - 1;
        if (index < 0) index = -1;
        items.forEach(i=> i.classList.remove('selected'));
        if (index !== -1){
        items[index].classList.add('selected');
        items[index].scrollIntoView({ block:'nearest' });
        }
        selectedIndex = index;
    }

    input.addEventListener('input', e=> showSuggestions(e.target.value));
    input.addEventListener('keydown', e=>{
        if (autocomplete.style.display === 'none') return;
        switch(e.key){
        case 'ArrowDown': e.preventDefault(); selectItem(selectedIndex+1); break;
        case 'ArrowUp':   e.preventDefault(); selectItem(selectedIndex-1); break;
        case 'Enter':
            e.preventDefault();
            const sel = $('.autocomplete-item.selected', autocomplete);
            if (sel){ input.value = sel.textContent; autocomplete.style.display='none'; executeSearch(); }
            break;
        case 'Escape': autocomplete.style.display='none'; break;
        }
    });
    autocomplete.addEventListener('click', e=>{
        const item = e.target.closest('.autocomplete-item');
        if (item){ input.value = item.textContent; autocomplete.style.display='none'; executeSearch(); }
    });
    document.addEventListener('click', e=>{
        if (!e.target.closest('#q') && !e.target.closest('#autocomplete')) autocomplete.style.display='none';
    });
    }

    // 인증(IIFE) — login.html은 public 루트에 있으므로 ../login.html 사용
    (function(){
    const btn  = document.getElementById('authBtn');
    const menu = document.getElementById('authMenu');
    const my   = document.getElementById('myPageLink');
    const out  = document.getElementById('logoutBtn');

    function openLoginPopup(){
        const w = 520, h = 640;
        const left = (screen.width - w)/2;
        const top  = (screen.height - h)/2;
        window.open('../login.html','login',`width=${w},height=${h},left=${left},top=${top},resizable=no`);
    }

    function renderAuth(){
        const raw = sessionStorage.getItem('currentUser');
        if(!raw){
        btn.textContent = '로그인';
        btn.onclick = openLoginPopup;
        my.style.display = 'none';
        out.style.display = 'none';
        return;
        }
        const user = JSON.parse(raw);
        btn.textContent = `${user.name || user.email} ▾`;
        btn.onclick = () => { menu.style.display = (menu.style.display === 'block') ? 'none' : 'block'; };
        my.style.display = 'block';
        out.style.display = 'block';
    }

    window.addEventListener('message', (e)=>{
        if(e?.data?.type === 'auth:login'){
        sessionStorage.setItem('currentUser', JSON.stringify(e.data.user));
        menu.style.display = 'none';
        renderAuth();
        }
    });

    out?.addEventListener('click', ()=>{
        sessionStorage.removeItem('currentUser');
        menu.style.display = 'none';
        renderAuth();
    });

    document.addEventListener('click', (ev)=>{
        if(!menu.contains(ev.target) && ev.target !== btn) menu.style.display = 'none';
    });

    renderAuth();
    })();

    // ===== 반응형 사이드바 토글 =====
const sidebar = document.querySelector(".sidebar");
const menuToggle = document.getElementById("menuToggle");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isMenuButton = e.target.id === "menuToggle";
    if (!isClickInsideSidebar && !isMenuButton) {
      sidebar.classList.remove("active");
    }
  });
}


    // 초기 렌더링
    updateCategoryCounts();
    updateSavedLabel();
    renderPopularTags();
    setupAutocomplete();
    applyFilters();
