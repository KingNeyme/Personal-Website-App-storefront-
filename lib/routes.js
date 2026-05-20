export function assetPath(value = "") {
  if (!value) return "";
  if (/^(https?:)?\/\//.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function routeHref(value = "") {
  if (!value) return "#";
  if (value.startsWith("http") || value.startsWith("mailto:") || value.startsWith("#")) return value;
  if (value === "index.html" || value === "/index.html") return "/";
  return value.startsWith("/") ? value : `/${value}`;
}
