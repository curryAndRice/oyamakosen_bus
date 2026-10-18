// 曜日区分と運行日の判定。祝日は区別しない（月〜金は平日、土日は休日扱い）。
export const WEEKDAY = "weekday";
export const WEEKEND = "weekend";

export const dayTypeOf = (date) =>
  date.getDay() === 0 || date.getDay() === 6 ? WEEKEND : WEEKDAY;

// "MM-DD" -> 数値 (1229 など)
const mdNumber = (text) => parseInt(text.slice(0, 2), 10) * 100 + parseInt(text.slice(3), 10);

// 年またぎ（12-29 〜 01-03）にも対応
const inPeriod = (date, { from, to }) => {
  const d = (date.getMonth() + 1) * 100 + date.getDate();
  const f = mdNumber(from);
  const t = mdNumber(to);
  return f <= t ? f <= d && d <= t : d >= f || d <= t;
};

// date が null のとき（今日と違う曜日区分を手動で選んだ場合）は、運休期間を判定しない
export const isRouteRunning = (route, dayType, date) => {
  if (!route.runs.includes(dayType)) return false;
  if (date && route.suspend.some((period) => inPeriod(date, period))) return false;
  return true;
};

export const dateKey = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
