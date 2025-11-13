console.log('✅ app.js loaded', new Date().toISOString());

// ------------------------------
// 기본 mock 데이터
// ------------------------------
let mock = [
  {
    id: "P001",
    title: "청년 월세 한시 특별지원",
    region: "전국",
    category: "주거",
    host: "국토교통부",
    targets: "만 19~34세 무주택 청년",
    benefit: "월 최대 20만원, 최대 12개월 지원",
    period: { start: "2025-01-01", end: "2025-12-31" },
    link: "https://example.com/p1",
    contact: "국토부 콜센터 120",
    tags: ["월세", "주거", "청년"],
    minAge: 19,
    maxAge: 34,
    employment: "",
    income: "중위소득 150% 이하",
    updatedAt: "2025-02-10",
  },
  {
    id: "P002",
    title: "지역 청년 교통비 지원",
    region: "대구",
    category: "복지",
    host: "대구광역시",
    targets: "대구 청년(만 19~34세) 대중교통 이용자",
    benefit: "월 3만원 모바일 교통카드 지급",
    period: { start: "2025-03-01", end: "2025-06-30" },
    link: "https://example.com/p2",
    contact: "대구시 청년정책과",
    tags: ["교통비", "대중교통"],
    minAge: 19,
    maxAge: 34,
    updatedAt: "2025-03-05",
  },
  {
    id: "P003",
    title: "청년 취업 성공 패키지(가칭)",
    region: "경북",
    category: "일자리",
    host: "경상북도",
    targets: "구직 청년",
    benefit: "취업 역량강화 교육 + 면접비/자격증 비용 지원",
    period: { start: "2025-01-15", end: "2025-05-31" },
    link: "https://example.com/p3",
    contact: "경북일자리센터",
    tags: ["취업", "교육", "면접비"],
    employment: "구직자",
    updatedAt: "2025-01-20",
  },
  {
    id: "P004",
    title: "청년 창업 시드 펀드",
    region: "서울",
    category: "금융",
    host: "서울산업진흥원",
    targets: "예비/초기 창업자",
    benefit: "시드 투자 최대 5천만원 + 보육 프로그램",
    period: { start: "2025-02-01", end: "2025-12-31" },
    link: "https://example.com/p4",
    contact: "SBA",
    tags: ["창업", "투자"],
    employment: "프리랜서/자영업",
    updatedAt: "2025-02-12",
  },
];

// ------------------------------
// 외부 API 데이터
// ------------------------------
let welfareData = [];      // 복지로
let youthPolicyData = [];  // 청년정책포털

// ------------------------------
// 복지로 API 로드
// ------------------------------
async function loadWelfareData() {
  try {
    console.log("🔄 [복지로] 복지 서비스 API 불러오는 중...");
    const before = mock.length;

    const res = await fetch("http://localhost:8080/api/welfare?page=1&perPage=1000");
    if (!res.ok) throw new Error("서버 응답 오류: " + res.status);

    const data = await res.json();
    console.log("📥 [복지로] 원본 응답:", data);

    const items = data.data || [];
    console.log("📊 [복지로] item 개수:", items.length);

    welfareData = items.map((item, idx) => ({
      id: `W${idx + 1}`,
      title: item["서비스명"] || "제목 없음",
      host: item["소관부처명"] || "기관 미상",
      targets: item["서비스요약"] || "-",
      benefit: item["서비스상세"] || "내용 없음",
      link: item["서비스URL"] || "#",
      contact: item["대표문의"] || "-",
      category: "복지",
      region: "전국",
      period: { start: "2025-01-01", end: "2025-12-31" },
      tags: (item["소관부처명"] || "").split(" "),
      updatedAt: new Date().toISOString(),
    }));

    console.log("✅ [복지로] 매핑 후 데이터:", welfareData.length);
    mock = [...mock, ...welfareData];

    console.log(
      `📌 [복지로] merge 전 ${before}건 → 후 ${mock.length}건 (추가 ${mock.length - before}건)`
    );

    updateCategoryCounts();
    applyFilters();
  } catch (err) {
    console.error("❌ [복지로] API 불러오기 실패:", err);
  }
}

// ------------------------------
// 청년정책포털 API 로드
// ------------------------------
async function loadYouthPolicies() {
  try {
    console.log("🔎 [청년정책] API 호출 중...");

    const before = mock.length;

    const res = await fetch(
      "http://localhost:8080/api/youth-policy/list?pageNum=1&pageSize=50&pageType=1"
    );
    if (!res.ok) throw new Error("정책 API 응답 오류: " + res.status);

    const data = await res.json();
    console.log("📥 [청년정책] 원본 응답:", data);

    // ⭐ 여기서 실제 응답 구조에 맞춰 조정해야 함
    const items = data.youthPolicyList || data.data || data.list || [];
    console.log("📊 [청년정책] item 개수:", items.length);

    const toDate = (raw, fallback) => {
      if (!raw || raw.length < 8) return fallback;
      return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    };

    youthPolicyData = items.map((item, idx) => {
      const start = toDate(item.bizPrdBgngYmd, "2025-01-01");
      const end = toDate(item.bizPrdEndYmd, "2025-12-31");

      return {
        id: item.plcyNo || `Y${idx + 1}`,
        title: item.plcyNm || "제목 없음",
        host: item.sprvsnInstCdNm || item.operInstCdNm || "기관 미상",
        targets:
          item.addAplyQlfcCndCn ||
          item.ptcpPrpTrgtCn ||
          item.plcyExplnCn ||
          "-",
        benefit: item.plcySprtCn || item.plcyExplnCn || "내용 없음",
        link: item.aplyUrlAddr || item.refUrlAddr1 || "#",
        contact:
          item.operInstPicNm || item.sprvsnInstPicNm || "문의처 정보 없음",
        category: "청년정책",
        region: item.zipCd ? `코드:${item.zipCd}` : "전국",
        period: { start, end },
        tags: (item.plcyKywdNm || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        minAge: item.sprtTrgtMinAge ? Number(item.sprtTrgtMinAge) : undefined,
        maxAge: item.sprtTrgtMaxAge ? Number(item.sprtTrgtMaxAge) : undefined,
        updatedAt: item.lastMdfcnDt || new Date().toISOString(),
      };
    });

    console.log("✅ [청년정책] 매핑 후 데이터:", youthPolicyData.length);
    mock = [...mock, ...youthPolicyData];

    console.log(
      `📌 [청년정책] merge 전 ${before}건 → 후 ${mock.length}건 (추가 ${
        mock.length - before
      }건)`
    );

    updateCategoryCounts();
    applyFilters();
  } catch (err) {
    console.error("❌ [청년정책] API 로드 실패:", err);
  }
}

// ------------------------------
// 초기 로드 (윈도우 로드 뒤에 실행)
// ------------------------------
window.addEventListener("load", () => {
  console.log("🌐 window load 완료, 외부 API 로드 시작");
  loadWelfareData();
  loadYouthPolicies();
});

// ------------------------------
// 상수 및 상태
// ------------------------------
const POPULAR_TAGS = [
  { tag: "청년", count: 156 },
  { tag: "주거", count: 89 },
  { tag: "창업", count: 76 },
  { tag: "취업", count: 67 },
  { tag: "교육", count: 45 },
  { tag: "농업", count: 34 },
  { tag: "문화", count: 23 },
  { tag: "육아", count: 21 },
];

const ALL_TAGS = [
  "주거",
  "일자리",
  "교육",
  "금융",
  "복지",
  "창업",
  "취업",
  "농업",
  "문화",
  "육아",
  "청년",
  "노인",
  "장애인",
  "여성",
  "다문화",
  "저소득층",
  "중소기업",
  "소상공인",
  "현금지원",
  "대출",
  "바우처",
  "컨설팅",
  "교육지원",
  "시설지원",
];

const state = {
  page: 1,
  pageSize: 6,
  saved: new Set(),
  recentlyViewed: [],
  selectedCategory: "",
  searchHistory: [],
};

// ------------------------------
// 유틸
// ------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const inPeriod = (p) => {
  const today = new Date();
  const s = new Date(p.period.start);
  const e = new Date(p.period.end);
  return today >= s && today <= e;
};

// ------------------------------
// 필터 및 렌더링
// ------------------------------
function getFilters() {
  return {
    q: ($("#q")?.value || "").trim().toLowerCase(),
    region: $("#region")?.value || "",
    category: $("#category")?.value || "",
    ageMin: parseInt($("#ageMin")?.value || "0", 10),
    ageMax: parseInt($("#ageMax")?.value || "200", 10),
    income: $("#income")?.value || "",
    employment: $("#employment")?.value || "",
    deadline: $("#deadline")?.value || "open",
    sort: $("#sort")?.value || "relevance",
    sex: $("#sex")?.value || "",
    asset: parseInt($("#asset")?.value || "0", 10),
    interests: $("#interests")
      ? $("#interests").value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };
}

function applyFilters() {
  const f = getFilters();
  let list = mock.slice();

  if (f.q) {
    list = list.filter((p) =>
      (
        (p.title || "") +
        " " +
        (p.targets || "") +
        " " +
        (p.benefit || "") +
        " " +
        (p.tags || []).join(" ") +
        " " +
        (p.host || "")
      )
        .toLowerCase()
        .includes(f.q)
    );
  }

  if (f.region) list = list.filter((p) => p.region === f.region || p.region === "전국");
  if (f.category) list = list.filter((p) => p.category === f.category);

  list = list.filter((p) => {
    const min = p.minAge ?? 0;
    const max = p.maxAge ?? 200;
    return f.ageMax >= min && f.ageMin <= max;
  });

  if (f.income) list = list.filter((p) => !p.income || p.income === f.income);
  if (f.employment) list = list.filter((p) => (p.employment || "") === f.employment);

  if (f.interests && f.interests.length) {
    list = list.filter((p) => {
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      return f.interests.some((i) => {
        const s = i.toLowerCase();
        return (
          tags.includes(s) ||
          (p.title || "").toLowerCase().includes(s) ||
          (p.category || "").toLowerCase().includes(s)
        );
      });
    });
  }

  if (f.deadline === "open") list = list.filter(inPeriod);
  if (f.deadline === "closed") list = list.filter((p) => !inPeriod(p));

  if (f.sort === "deadline") {
    list.sort((a, b) => new Date(a.period.end) - new Date(b.period.end));
  } else if (f.sort === "latest") {
    list.sort(
      (a, b) =>
        new Date(b.updatedAt || b.period.start) - new Date(a.updatedAt || a.period.start)
    );
  }

  renderChips(f);
  render(list);
}

function renderChips(f) {
  const host = $("#activeChips");
  if (!host) return;
  host.innerHTML = "";
  const add = (label, val) => {
    if (val) {
      const el = document.createElement("span");
      el.className = "chip";
      el.textContent = `${label}: ${val}`;
      host.appendChild(el);
    }
  };
  add("지역", f.region || "전국");
  add("분야", f.category || "전체");
  if ($("#q")?.value) add("키워드", $("#q").value);
  add("마감", { open: "진행중만", all: "전체", closed: "마감만" }[f.deadline]);
}

function paginate(list) {
  const start = (state.page - 1) * state.pageSize;
  return list.slice(start, start + state.pageSize);
}

function render(list) {
  const container = $("#results");
  const countEl = $("#count");
  const emptyEl = $("#empty");
  if (!container || !countEl || !emptyEl) return;

  container.innerHTML = "";

  if (!list || list.length === 0) {
    emptyEl.style.display = "block";
    countEl.textContent = "검색 결과 0건";
    return;
  }

  emptyEl.style.display = "none";
  countEl.textContent = `검색 결과 ${list.length}건`;

  const pageList = paginate(list);

  pageList.forEach((p) => {
    const live = inPeriod(p);
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="title">${p.title}</div>
      <div class="muted">${p.region} · ${p.category}</div>
      <div class="desc">${p.benefit}</div>
      <div class="muted">대상: ${p.targets || "-"} (${p.host})</div>
      <div class="period">기간: ${p.period.start} ~ ${p.period.end} ${
        live ? '<span class="live">● 진행중</span>' : "<span>마감</span>"
      }</div>
      <div class="actions">
        <button class="btn small" onclick="openDetail('${p.id}')">자세히 보기</button>
        <a href="${p.link}" target="_blank" class="btn small ghost">공식 사이트</a>
      </div>
    `;
    container.appendChild(el);
  });
}

// ------------------------------
// 사이드바 카테고리
// ------------------------------
function updateCategoryCounts() {
  const counts = mock.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const catSection = document.querySelector(".sidebar .sidebar-section");
  if (!catSection) return;
  Array.from(catSection.querySelectorAll(".menu-item")).forEach((item) => {
    const cntEl = item.querySelector(".count");
    if (!cntEl) return;
    const text = (item.firstElementChild?.textContent || "").trim();
    if (text === "전체") cntEl.textContent = mock.length;
    else cntEl.textContent = counts[text] || 0;
  });
}

// ------------------------------
// 이벤트
// ------------------------------
$("#btn-search")?.addEventListener("click", () => {
  state.page = 1;
  applyFilters();
});

$("#btn-reset")?.addEventListener("click", () => {
  $$("#filters .input, #filters .select").forEach((el) => (el.value = ""));
  if ($("#deadline")) $("#deadline").value = "open";
  applyFilters();
});

// 엔터키 검색
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) {
      e.preventDefault();
      state.page = 1;
      applyFilters();
    }
  }
});

// 조건 저장 / 불러오기
document.getElementById("btn-save-condition")?.addEventListener("click", () => {
  const condition = {
    keyword: document.getElementById("keyword")?.value || "",
    region: document.getElementById("region")?.value || "",
    category: document.getElementById("category")?.value || "",
    deadline: document.getElementById("deadline")?.value || "",
    ageMin: document.getElementById("ageMin")?.value || "",
    ageMax: document.getElementById("ageMax")?.value || "",
    income: document.getElementById("income")?.value || "",
    employment: document.getElementById("employment")?.value || "",
    gender: document.getElementById("gender")?.value || "",
    asset: document.getElementById("asset")?.value || "",
    interests: document.getElementById("interests")?.value || "",
  };

  localStorage.setItem("savedCondition", JSON.stringify(condition));
  alert("✅ 검색 조건이 저장되었습니다.");
});

document.getElementById("btn-load-condition")?.addEventListener("click", () => {
  const saved = localStorage.getItem("savedCondition");
  if (!saved) {
    alert("❌ 저장된 조건이 없습니다.");
    return;
  }

  const c = JSON.parse(saved);
  if (document.getElementById("keyword")) document.getElementById("keyword").value = c.keyword || "";
  if (document.getElementById("region")) document.getElementById("region").value = c.region || "";
  if (document.getElementById("category")) document.getElementById("category").value = c.category || "";
  if (document.getElementById("deadline")) document.getElementById("deadline").value = c.deadline || "";
  if (document.getElementById("ageMin")) document.getElementById("ageMin").value = c.ageMin || "";
  if (document.getElementById("ageMax")) document.getElementById("ageMax").value = c.ageMax || "";
  if (document.getElementById("income")) document.getElementById("income").value = c.income || "";
  if (document.getElementById("employment")) document.getElementById("employment").value = c.employment || "";
  if (document.getElementById("gender")) document.getElementById("gender").value = c.gender || "";
  if (document.getElementById("asset")) document.getElementById("asset").value = c.asset || "";
  if (document.getElementById("interests")) document.getElementById("interests").value = c.interests || "";

  alert("🔄 저장된 조건이 불러와졌습니다.");
});

// 인기 태그 / 자동완성 / 상세보기 (필요 시 사용)
function renderPopularTags() {
  const host = $("#popularTags");
  if (!host) return;
  host.innerHTML = "";
  POPULAR_TAGS.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "chip ghost";
    btn.textContent = `${t.tag} (${t.count})`;
    btn.addEventListener("click", () => {
      const input = $("#q") || $("#keyword");
      if (input) input.value = t.tag;
      state.page = 1;
      applyFilters();
    });
    host.appendChild(btn);
  });
}

function setupAutocomplete() {
  const input = $("#interests") || $("#keyword");
  const box = $("#autocomplete");
  if (!input || !box) return;

  input.addEventListener("input", () => {
    const v = input.value.trim().toLowerCase();
    box.innerHTML = "";
    if (!v) return;
    const cand = ALL_TAGS.filter((t) => t.toLowerCase().includes(v)).slice(0, 8);
    cand.forEach((t) => {
      const li = document.createElement("div");
      li.className = "ac-item";
      li.textContent = t;
      li.addEventListener("click", () => {
        input.value = t;
        box.innerHTML = "";
        state.page = 1;
        applyFilters();
      });
      box.appendChild(li);
    });
  });

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.innerHTML = "";
    }
  });
}

function openDetail(id) {
  const p = mock.find((x) => x.id === id);
  if (!p) return;

  const modal = $("#detailModal");
  const body = $("#detailBody");

  if (modal && body) {
    body.innerHTML = `
      <h2>${p.title}</h2>
      <p><strong>지역</strong>: ${p.region}</p>
      <p><strong>분야</strong>: ${p.category}</p>
      <p><strong>주관기관</strong>: ${p.host}</p>
      <p><strong>대상</strong>: ${p.targets || "-"}</p>
      <p><strong>지원내용</strong>: ${p.benefit}</p>
      <p><strong>기간</strong>: ${p.period.start} ~ ${p.period.end}</p>
      <p><strong>문의</strong>: ${p.contact || "-"}</p>
      <p><strong>태그</strong>: ${(p.tags || []).join(", ")}</p>
      <div style="margin-top:12px;">
        <a href="${p.link}" target="_blank" class="btn small">공식 사이트 바로가기</a>
      </div>
    `;
    modal.style.display = "block";
  } else {
    if (p.link && p.link !== "#") {
      window.open(p.link, "_blank");
    } else {
      alert(`${p.title}\n\n${p.benefit}`);
    }
  }
}

$("#detailClose")?.addEventListener("click", () => {
  const modal = $("#detailModal");
  if (modal) modal.style.display = "none";
});

// ------------------------------
// 초기 렌더링
// ------------------------------
updateCategoryCounts();
applyFilters();
renderPopularTags();
setupAutocomplete();
