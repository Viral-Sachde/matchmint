export function inr(n: number) {
  if (!n) return "₹0";
  if (n >= 10_000_000) return `₹${trimZero(n / 10_000_000)} Cr`;
  if (n >= 100_000) return `₹${trimZero(n / 100_000)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function trimZero(v: number) {
  return v.toFixed(v >= 100 ? 0 : 1).replace(/\.0$/, "");
}
/** True when a post asks for or offers no money: time, skills, products or a partnership only. */
export function noMoney(min: number, max: number) {
  return !min && !max;
}
export function range(min: number, max: number) {
  if (!min && !max) return "No money involved";
  if (!min || min === max) return `Up to ${inr(max)}`;
  return `${inr(min)} to ${inr(max)}`;
}
export function count(n: number) {
  if (n >= 1_000_000) return `${trimZero(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trimZero(n / 1_000)}K`;
  return String(n);
}
export function date(iso: string | null) {
  if (!iso) return "Rolling";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function ago(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
