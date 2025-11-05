// 아주 작은 DOM 유틸
export const el = (tag, attrs = {}, ...children) => {
  const $e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") $e.className = v;
    else if (k.startsWith("on") && typeof v === "function") $e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== undefined && v !== null) $e.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    $e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return $e;
};
