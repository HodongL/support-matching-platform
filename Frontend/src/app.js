import { PROGRAMS } from "./data.js";
import { el } from "./ui.js";

/* ---------------------- LocalStorage (저장함) ---------------------- */
const SAVED_KEY = "smp_saved_ids";
const loadSaved = () => new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"));
const saveSaved = (set) => localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));

/* --------------------------- 전역 상태 ----------------------------- */
const state = {
  q: "",
  region: "전체",
  ageMin: "",
  ageMax: "",
  income: "전체",
  employment: "전체",
  onlyOngoing: true,         // 진행중만
  domain: "전체",
  sortBy: "정확도순",        // 정확도순/마감임박/최신등록/이름순
  saved: loadSaved(),
};

/* ---------------------------- 유틸 ------------------------------- */
const inRange = (x, min, max) => {
  if (!x) return true;
  if (min && x < +min) return false;
  if (max && x > +max) return false;
  return true;
};
const normalize = (s) => (s || "").toLowerCase();

/* ---------------------- 필터링 + 정렬 로직 ----------------------- */
function applyFilters() {
  const q = normalize(state.q);
  const r = state.region;
  const i = state.income;
  const e = state.employment;
  const d = state.domain;

  let list = PROGRAMS.filter((p) => {
    const qHit =
      !q ||
      normalize(p.name).includes(q) ||
      (p.tags || []).some((t) => normalize(t).includes(q)) ||
      normalize(p.desc).includes(q);

    const regionOk = r === "전체" || p.region === r || (r === "전국" && p.region === "전국");
    const ageOk = inRange(+state.ageMin, p.ageMin, p.ageMax) && inRange(+state.ageMax, p.ageMin, p.ageMax);
    const incomeOk = i === "전체" || p.incomeTier === i || p.incomeTier === "무관";
    const empOk = e === "전체" || p.employment === e || e === "무관";
    const domainOk = d === "전체" || p.domain === d;
    const statusOk = !state.onlyOngoing || p.status === "진행중";

    return qHit && regionOk && ageOk && incomeOk && empOk && domainOk && statusOk;
  });

  const today = new Date();
  const score = (p) => {
    const nameHit = normalize(p.name).includes(normalize(state.q)) ? 1 : 0;
    const tagHit = (p.tags || []).some((t) => normalize(t).includes(normalize(state.q))) ? 1 : 0;
    return nameHit * 2 + tagHit;
  };

  switch (state.sortBy) {
    case "마감임박":
      list.sort((a, b) => {
        const ad = new Date(a.period?.end || "2099-12-31") - today;
        const bd = new Date(b.period?.end || "2099-12-31") - today;
        return ad - bd;
      });
      break;
    case "최신등록":
      list.sort(
        (a, b) =>
          new Date(b.period?.start || "1970-01-01") -
          new Date(a.period?.start || "1970-01-01")
      );
      break;
    case "이름순":
      list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    default:
      list.sort((a, b) => score(b) - score(a));
  }
  return list;
}

/* ---------------------- 결과 영역 렌더링 ------------------------- */
/* 그리드(카드)만 렌더. 상단 컨트롤은 App()에서 배치 */
function renderResults($results, list, refresh) {
  $results.innerHTML = "";

  const $grid = el(
    "div",
    { class: "grid" },
    list.map((p) => {
      const saved = state.saved.has(p.id);
      return el(
        "div",
        { class: "card" },
        el("h4", {}, p.name),
        el(
          "div",
          { class: "badges" },
          el("span", { class: "badge" }, p.region),
          el("span", { class: "badge" }, `${p.ageMin}~${p.ageMax}세`),
          el("span", { class: "badge" }, p.incomeTier),
          el("span", { class: "badge" }, p.domain),
          el("span", { class: `badge ${p.status === "진행중" ? "green" : "gray"}` }, p.status)
        ),
        p.period
          ? el("div", { class: "muted", style: "margin-top:6px" }, `신청기간: ${p.period.start} ~ ${p.period.end}`)
          : null,
        el("div", { class: "muted", style: "margin-top:6px" }, p.desc || ""),
        el(
          "div",
          { class: "row" },
          el("a", { class: "btn ghost", href: p.url, target: "_blank", rel: "noreferrer" }, "바로 가기"),
          el(
            "button",
            {
              class: "btn secondary",
              onclick: () => {
                if (saved) state.saved.delete(p.id);
                else state.saved.add(p.id);
                saveSaved(state.saved);
                refresh(); // 안전하게 다시 그리기
              },
            },
            saved ? "저장 취소" : "저장"
          )
        )
      );
    })
  );

  $results.append($grid);
}

/* --------------------------- 앱 UI ------------------------------- */
function App() {
  const regions = ["전체", "전국", "경상북도", "김천시", "서울특별시"];
  const incomes = ["전체", "중위 150% 이하", "무관"];
  const employments = ["전체", "무관", "재직", "미취업", "자영업"];
  const domains = ["전체", "현금성", "주거", "세제"];

  const opts = (arr, cur) => arr.map(v => el("option", { value: v, ...(v === cur ? { selected: true } : {}) }, v));

  // 입력 요소
  const $q          = el("input", { placeholder: "예: 월세, 취업, 서울...", value: state.q });
  const $region     = el("select", {}, ...opts(regions, state.region));
  const $domain     = el("select", {}, ...opts(domains, state.domain));
  const $ageMin     = el("input", { type: "number", placeholder: "최소", value: state.ageMin });
  const $ageMax     = el("input", { type: "number", placeholder: "최대", value: state.ageMax });
  const $income     = el("select", {}, ...opts(incomes, state.income));
  const $employment = el("select", {}, ...opts(employments, state.employment));
  const $onlyOngoing = el("select", {},
    el("option", { value: "진행중만", ...(state.onlyOngoing ? { selected: true } : {}) }, "진행중만"),
    el("option", { value: "전체", ...(!state.onlyOngoing ? { selected: true } : {}) }, "전체")
  );

  const $btnSearch = el("button", { class: "btn primary" }, "검색");
  const $btnReset  = el("button", { class: "btn secondary" }, "초기화");

  // 라벨 래퍼
  const field = (label, element) => el("div", { class: "field" }, el("label", {}, label), element);

  // 1행 / 2행
  const $filterTop = el("div", { class: "filter-row" },
    field("키워드", $q),
    field("지역", $region),
    field("분야", $domain)
  );
  const $filterBottom = el("div", { class: "filter-row" },
    field("나이(최소)", $ageMin),
    field("나이(최대)", $ageMax),
    field("소득구간", $income),
    field("고용상태", $employment),
    field("마감여부", $onlyOngoing),
    el("div", { class: "actions" }, $btnReset, $btnSearch)
  );
  const $filters = el("div", { class: "search-card" }, $filterTop, $filterBottom);

  // 상단 컨트롤 줄(필터 아래): 검색결과/저장함/정렬
  const $countEl     = el("div",  { class: "count" }, "검색 결과 0건");
  const $savedPillEl = el("span", { class: "saved-pill" }, `저장함 ${state.saved.size}건`);
  const $sortSelect  = el("select",
    { onchange: (e)=>{ state.sortBy = e.target.value; rerender(); } },
    ...["정확도순","마감임박","최신등록","이름순"].map(v =>
      el("option", { value:v, ...(v===state.sortBy?{selected:true}:{}) }, v)
    )
  );
  const $controlsRow = el("div", { class: "toolbar" },
    $countEl,
    el("div", { class: "sort" }, $savedPillEl, $sortSelect)
  );

  // 제목/설명 + 패널
  const $title = el("h1", { class: "title" }, "당신에게 맞는 지원사업을 한눈에");
  const $desc  = el("div", { class: "desc"  }, "키워드와 조건을 선택해 보세요. (디자인/동작은 샘플이며 실제 API 연동 예정)");

  const $results = el("div");
  const $panel = el("div", { class: "panel" }, $filters, $controlsRow, $results);

  const $container = el("div", { class: "container" },
    el("div", { class: "brand" }, "맞춤형 지원사업 플랫폼"),
    $title, $desc, $panel
  );

  const root = document.getElementById("app");
  root.innerHTML = "";
  root.append($container);

  // 상태 동기화 + 검색
  const syncAndSearch = () => {
    state.q = $q.value;
    state.region = $region.value;
    state.domain = $domain.value;
    state.ageMin = $ageMin.value;
    state.ageMax = $ageMax.value;
    state.income = $income.value;
    state.employment = $employment.value;
    state.onlyOngoing = $onlyOngoing.value === "진행중만";
    rerender();
  };
  [$q,$region,$domain,$ageMin,$ageMax,$income,$employment,$onlyOngoing]
    .forEach(($el)=>$el.addEventListener("change", syncAndSearch));
  $btnSearch.addEventListener("click", syncAndSearch);

  $btnReset.addEventListener("click",()=>{
    Object.assign(state,{
      q:"", region:"전체", domain:"전체",
      ageMin:"", ageMax:"",
      income:"전체", employment:"전체",
      onlyOngoing:true, sortBy:"정확도순"
    });
    // UI 리셋
    $q.value=""; $region.value="전체"; $domain.value="전체";
    $ageMin.value=""; $ageMax.value="";
    $income.value="전체"; $employment.value="전체";
    $onlyOngoing.value="진행중만";
    $sortSelect.value="정확도순";
    rerender();
  });

  // 이 App() 스코프 안에서 rerender 정의(상단 카운트까지 갱신)
  function rerender() {
    const list = applyFilters();
    $countEl.textContent     = `검색 결과 ${list.length}건`;
    $savedPillEl.textContent = `저장함 ${state.saved.size}건`;
    $sortSelect.value        = state.sortBy;
    renderResults($results, list, rerender); // refresh 콜백 전달
  }

  // 최초 렌더
  rerender();
}

App();
