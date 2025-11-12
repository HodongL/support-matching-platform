console.log('✅ app.js loaded', new Date().toISOString());

// ------------------------------
// 데이터 (mock)
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

// ✅ 복지로 API 데이터
let welfareData = [];

// ✅ 복지 API 로드
async function loadWelfareData() {
  try {
    console.log("🔄 복지 서비스 API 불러오는 중...");
    const res = await fetch("http://localhost:8080/api/welfare?page=1&perPage=1000");
    if (!res.ok) throw new Error("서버 응답 오류: " + res.status);s
    const data = await res.json();
    const items = data.data || [];

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

    console.log("✅ 복지 데이터 수신 완료:", welfareData.length);
    mock = [...mock, ...welfareData];
    updateCategoryCounts();
    applyFilters();
  } catch (err) {
    console.error("❌ 복지 API 불러오기 실패:", err);
  }
}

// ✅ 청년정책 API 로드
async function loadPolicies() {
  try {
    console.log("🔎 청년정책 API 호출 중...");
    const response = await fetch("http://localhost:8080/api/youth?keyword=취업");
    if (!response.ok) throw new Error("정책 API 응답 오류");
    const data = await response.json();
    console.log("✅ 청년정책 API 응답:", data);
  } catch (err) {
    console.error("❌ 청년정책 API 로드 실패:", err);
  }
}

loadWelfareData();
loadPolicies();

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
    q: ($("#q").value || "").trim().toLowerCase(),
    region: $("#region").value,
    category: $("#category").value,
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
    const min = p.minAge ?? 0,
      max = p.maxAge ?? 200;
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
  if ($("#q").value) add("키워드", $("#q").value);
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
$("#btn-search").addEventListener("click", () => {
  state.page = 1;
  applyFilters();
});

$("#btn-reset").addEventListener("click", () => {
  $$("#filters .input, #filters .select").forEach((el) => (el.value = ""));
  $("#deadline").value = "open";
  applyFilters();
});

// ✅ [추가] 엔터키로 검색 실행 기능
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const active = document.activeElement;
    // 입력창 내부에서 Enter 누를 때만 작동
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) {
      e.preventDefault(); // 폼 제출 방지
      state.page = 1;
      applyFilters();
    }
  }
});

// ======================
// 🎯 조건 저장 / 불러오기 기능
// ======================
document.getElementById("btn-save-condition").addEventListener("click", () => {
  const condition = {
    keyword: document.getElementById("keyword").value,
    region: document.getElementById("region").value,
    category: document.getElementById("category").value,
    deadline: document.getElementById("deadline").value,
    ageMin: document.getElementById("ageMin")?.value || "",
    ageMax: document.getElementById("ageMax")?.value || "",
    income: document.getElementById("income")?.value || "",
    employment: document.getElementById("employment")?.value || "",
    gender: document.getElementById("gender")?.value || "",
    asset: document.getElementById("asset")?.value || "",
    interests: document.getElementById("interests")?.value || ""
  };

  localStorage.setItem("savedCondition", JSON.stringify(condition));
  alert("✅ 검색 조건이 저장되었습니다.");
});

document.getElementById("btn-load-condition").addEventListener("click", () => {
  const saved = localStorage.getItem("savedCondition");
  if (!saved) {
    alert("❌ 저장된 조건이 없습니다.");
    return;
  }

  const c = JSON.parse(saved);
  document.getElementById("keyword").value = c.keyword || "";
  document.getElementById("region").value = c.region || "";
  document.getElementById("category").value = c.category || "";
  document.getElementById("deadline").value = c.deadline || "";
  if (document.getElementById("ageMin")) document.getElementById("ageMin").value = c.ageMin || "";
  if (document.getElementById("ageMax")) document.getElementById("ageMax").value = c.ageMax || "";
  if (document.getElementById("income")) document.getElementById("income").value = c.income || "";
  if (document.getElementById("employment")) document.getElementById("employment").value = c.employment || "";
  if (document.getElementById("gender")) document.getElementById("gender").value = c.gender || "";
  if (document.getElementById("asset")) document.getElementById("asset").value = c.asset || "";
  if (document.getElementById("interests")) document.getElementById("interests").value = c.interests || "";

  alert("🔄 저장된 조건이 불러와졌습니다.");
});



updateCategoryCounts();
applyFilters();
renderPopularTags();
setupAutocomplete();
