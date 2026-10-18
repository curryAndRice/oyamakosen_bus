// 画面への描画だけを担当する。状態は持たない。
const $ = (id) => document.getElementById(id);

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const formatRemaining = (minutes) => {
  if (minutes <= 0) return "まもなく発車";
  if (minutes < 60) return `あと${minutes}分`;
  const rest = minutes % 60;
  return `あと${Math.floor(minutes / 60)}時間${rest ? `${rest}分` : ""}`;
};

const LOCATE_ICON = new URL("../img/locate.png", import.meta.url).href;

const formatElapsed = (minutes) => (minutes <= 0 ? "出発済み" : `出発済み・${minutes}分前`);

const tripItem = (trip, nowMinutes, isPrevious) => {
  const item = element("li", isPrevious ? "trip-item trip-item--past" : "trip-item");

  const link = element("a", "trip");
  link.href = trip.line.link;
  link.style.setProperty("--route-color", trip.route.color);
  link.style.setProperty("--route-tag-color", trip.route.tagColor);

  const times = element("span", "trip__times");
  times.append(
    element("span", "trip__dep", trip.depText),
    element("span", "trip__arrow", "→"),
    element("span", "trip__arr", trip.arrText),
  );

  // 「発」と「着」を別々の塊にして、折り返しはその間だけで起こるようにする
  const stop = element("span", "trip__stop");
  stop.append(
    element("span", "trip__stop-part", `${trip.line.from}発`),
    element("span", "trip__stop-part", `→${trip.line.to}着`),
  );
  const meta = element("span", "trip__meta");
  // 回り方向は別タグにして、折り返しはタグの間だけで起こるようにする
  meta.append(element("span", "route-tag", trip.route.name));
  if (trip.line.label) meta.append(element("span", "route-tag route-tag--label", trip.line.label));
  meta.append(stop);

  const remaining = isPrevious
    ? formatElapsed(nowMinutes - trip.dep)
    : formatRemaining(trip.dep - nowMinutes);
  // 次発の便には、現在地が見られることに気づけるよう地図アイコンを添える
  const cta = element("span", "trip__cta");
  if (!isPrevious) {
    const icon = element("img", "icon");
    icon.src = LOCATE_ICON;
    icon.alt = "";
    icon.width = icon.height = 24;
    cta.append(icon);
  }
  cta.append("バスの現在地を見る ›");

  const side = element("span", "trip__side");
  side.append(element("span", "trip__remaining", remaining), cta);

  link.append(times, meta, side);
  item.append(link);
  return item;
};

export const renderTrips = ({ finished, previous, upcoming }, nowMinutes) => {
  const list = $("trip-list");
  const empty = $("finished");
  list.replaceChildren();
  empty.hidden = !finished;
  list.hidden = finished;
  if (finished) return;

  if (previous) list.append(tripItem(previous, nowMinutes, true));
  for (const trip of upcoming) list.append(tripItem(trip, nowMinutes, false));
};

// 時刻を指定しているときだけ「（指定時刻）」を出す
export const renderCustomTimeNote = (isCustomTime) => {
  $("custom-time-note").hidden = !isCustomTime;
};

// aria-pressed を持つボタン群の選択状態を更新する
export const renderPressed = (buttons, isPressed) => {
  for (const button of buttons) button.setAttribute("aria-pressed", String(isPressed(button)));
};

export const renderTimeInput = (value) => {
  $("time-input").value = value;
};
