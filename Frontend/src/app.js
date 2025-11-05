import { PROGRAMS } from "./data.js";
import { el } from "./ui.js";

// ---- 저장함(LocalStorage)
const SAVED_KEY = "smp_saved_ids";
const loadSaved = () => new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"));
const saveSaved = (set) => localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));

// ---- 상태
const state = {
  q: "",
  region: "전체",
  ageMin: "", ageMax: "",
  income: "전체",
  employment: "전체",    // 무관/재직/미취업/자영업/전체
  onlyOngoing: true,     // 진행중만
  domain: "전체",        // 현금성/주거/세제/전체
  sortBy: "정확도순",     // 정확도순/마감임박/최신등록/이름순
  saved: loadSaved(),
};

// ---- 유틸
const inRange = (x, min, max) => {
  if (!x) return true;
  if (min && x < +min) return false;
  if (max && x > +max) return false;
  return true;
};
const normalize = (s) => (s || "").toLowerCase();

// ---- 필터 + 정렬
function applyFilters() {
  const q = normalize(state.q);
  const r = state.region;
  const i = state.income;
  const e = state.employment;
  const d = state.domain;

  let list = PROGRAMS.filter(p => {
    const qHit = !q ||
      normalize(p.name).includes(q) ||
      (p.tags || []).some(t => normalize(t).includes(q)) ||
      normalize(p.desc).includes(q);

    const regionOk = r === "전체" || p.region === r || (r === "전국" && p.region === "전국");
    const ageOk = inRange(+state.ageMin, p.ageMin, p.ageMax) && inRange(+state.ageMax, p.ageMin, p.ageMax);
    const incomeOk = i === "전체" || p.incomeTier === i || p.incomeTier === "무관";
    const empOk = e === "전체" || p.employment === e || e === "무관";
    const domainOk = d === "전체" || p.domain === d;
    const statusOk = !state.onlyOngoing || p.status === "진행중";

    return qHit && regionOk && ageOk && incomeOk && empOk && domainOk && statusOk;
  });

  // 간단한 정렬
  const today = new Date();
  const score = (p) => {
    const nameHit = normalize(p.name).includes(normalize(state.q)) ? 1 : 0;
    const tagHit = (p.tags||[]).some(t => normalize(t).includes(normalize(state.q))) ? 1 : 0;
    return nameHit*2 + tagHit;
  };

  switch (state.sortBy) {
    case "마감임박":
      list.sort((a,b)=>{
        const ad = new Date(a.period?.end || "2099-12-31") - today;
        const bd = new Date(b.period?.end || "2099-12-31") - today;
        return ad - bd;
      });
      break;
    case "최신등록":
      list.sort((a,b)=> new Date(b.period?.start||"1970-01-01") - new Date(a.period?.start||"1970-01-01"));
      break;
    case "이름순":
      list.sort((a,b)=> a.name.localeCompare(b.name,'ko'));
      break;
    default: // 정확도순
      list.sort((a,b)=> score(b) - score(a));
  }
  return list;
}

// ---- 렌더링
function renderResults($mount, list) {
  $mount.innerHTML = "";

  const $toolbar = el("div", { class: "toolbar" },
    el("div", { class: "count" }, `검색 결과 ${list.length}건`),
    el("div", { class: "sort" },
      el("span", { class: "saved-pill" }, `저장함 ${state.saved.size}건`),
      el("select", { onchange: (e)=>{state.sortBy=e.target.value; rerender();} },
        ...["정확도순","마감임박","최신등록","이름순"].map(v =>
          el("option", { value:v, ...(v===state.sortBy?{selected:true}:{}) }, v)
        )
      )
    )
  );

  const $grid = el("div", { class: "grid" },
    list.map(p => {
      const saved = state.saved.has(p.id);
      return el("div", { class: "card" },
        el("h4", {}, p.name),
        el("div", { class: "badges" },
          el("span", { class:"badge" }, p.region),
          el("span", { class:"badge" }, `${p.ageMin}~${p.ageMax}세`),
          el("span", { class:"badge" }, p.incomeTier),
          el("span", { class:"badge" }, p.domain),
          el("span", { class:`badge ${p.status==="진행중"?"green":"gray"}` }, p.status),
        ),
        p.period ? el("div", { class:"muted", style:"margin-top:6px" },
          `신청기간: ${p.period.start} ~ ${p.period.end}`
        ) : null,
        el("div", { class:"muted", style:"margin-top:6px" }, p.desc || ""),
        el("div", { class:"row" },
          el("a", { class:"btn ghost", href:p.url, target:"_blank", rel:"noreferrer" }, "공식 사이트"),
          el("button", {
              class: `btn secondary`,
              onclick: ()=>{
                if (saved) state.saved.delete(p.id);
                else state.saved.add(p.id);
                saveSaved(state.saved);
                rerender();
              }
            },
            saved ? "저장 취소" : "저장"
          )
        )
      );
    })
  );

  $mount.append($toolbar, $grid);
}

function rerender() {
  const list = applyFilters();
  renderResults($panel, list);
}

// ---- 앱 UI
let $panel;
function App() {
  const regions = ["전체","전국","경상북도","김천시","서울특별시"];
  const incomes = ["전체","중위 150% 이하","무관"];
  const employments = ["전체","무관","재직","미취업","자영업"];
  const domains = ["전체","현금성","주거","세제"];

  const $q = el("input", { placeholder: "키워드 (예: 월세, 취업, 서울...)", value: state.q, class:"span-2" });
  const $region = el("select", {}, ...regions.map(r => el("option", { value:r, ...(r===state.region?{selected:true}:{}) }, r)));
  const $ageMin = el("input", { type:"number", placeholder:"나이 최소", value: state.ageMin });
  const $ageMax = el("input", { type:"number", placeholder:"나이 최대", value: state.ageMax });
  const $income = el("select", {}, ...incomes.map(i => el("option", { value:i, ...(i===state.income?{selected:true}:{}) }, i)));
  const $employment = el("select", {}, ...employments.map(v => el("option", { value:v, ...(v===state.employment?{selected:true}:{}) }, v)));
  const $domain = el("select", {}, ...domains.map(v => el("option", { value:v, ...(v===state.domain?{selected:true}:{}) }, v)));
  const $onlyOngoing = el("select", {},
    el("option", { value:"진행중만", ...(state.onlyOngoing?{selected:true}:{}) }, "진행중만"),
    el("option", { value:"전체" , ...(!state.onlyOngoing?{selected:true}:{}) }, "전체")
  );

  const $btnSearch = el("button", { class:"btn" }, "검색");
  const $btnReset  = el("button", { class:"btn secondary" }, "초기화");

  const $filters = el("div", { class:"search" },
    $q,
    $region,
    $ageMin, $ageMax,
    $income,
    $employment,
    $domain,
    $onlyOngoing,
    el("div", { class:"actions", style:"grid-column: span 2; justify-self:end" }, $btnReset, $btnSearch)
  );

  const $header = el("div", { class:"header" },
    el("div", { class:"brand" }, "맞춤형 지원사업"),
    null
  );

  $panel = el("div", { class:"panel" }, $filters);
  const $container = el("div", { class:"container" }, $header, $panel);
  document.getElementById("app").append($container);

  function syncAndSearch() {
    state.q = $q.value;
    state.region = $region.value;
    state.ageMin = $ageMin.value;
    state.ageMax = $ageMax.value;
    state.income = $income.value;
    state.employment = $employment.value;
    state.domain = $domain.value;
    state.onlyOngoing = $onlyOngoing.value === "진행중만";
    rerender();
  }

  // 이벤트 바인딩
  [$q,$region,$ageMin,$ageMax,$income,$employment,$domain,$onlyOngoing].forEach($el =>
    $el.addEventListener("change", syncAndSearch)
  );
  $btnSearch.addEventListener("click", syncAndSearch);

  $btnReset.addEventListener("click", ()=>{
    state.q=""; state.region="전체"; state.ageMin=""; state.ageMax="";
    state.income="전체"; state.employment="전체"; state.domain="전체";
    state.onlyOngoing=true; state.sortBy="정확도순";
    $q.value=""; $region.value="전체"; $ageMin.value=""; $ageMax.value="";
    $income.value="전체"; $employment.value="전체"; $domain.value="전체";
    $onlyOngoing.value="진행중만";
    rerender();
  });

  // 초기 렌더
  rerender();
}

App();
