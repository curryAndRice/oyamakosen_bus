// 状態管理と、イベント・時計の結線。
import { dayTypeOf } from "./calendar.js";
import { loadTimetable, buildTrips, pickTrips, toMinutes, TO_STATION, TO_SCHOOL } from "./timetable.js";
import { renderTrips, renderCustomTimeNote, renderPressed, renderTimeInput } from "./view.js";

const pad = (n) => String(n).padStart(2, "0");
const clockText = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const directionButtons = document.querySelectorAll("[data-direction]");
const dayTypeButtons = document.querySelectorAll("[data-day-type]");
const timeInput = document.getElementById("time-input");
const resetButton = document.getElementById("time-reset");

const opened = new Date();
const state = {
  timetable: null,
  // 午前は 駅→高専、午後は 高専→駅
  direction: opened.getHours() < 12 ? TO_SCHOOL : TO_STATION,
  dayType: dayTypeOf(opened),
  customTime: null, // null のとき現在時刻に追従
};

const render = () => {
  if (!state.timetable) return;
  const now = new Date();
  const timeText = state.customTime ?? clockText(now);
  // 今日と同じ曜日区分のときだけ、今日の日付で運休期間・臨時便を判定する
  const date = state.dayType === dayTypeOf(now) ? now : null;

  const trips = buildTrips(state.timetable, state.direction, state.dayType, date);
  const nowMinutes = toMinutes(timeText);

  renderTrips(pickTrips(trips, nowMinutes), nowMinutes);
  renderCustomTimeNote(state.customTime !== null);
  renderPressed(directionButtons, (b) => b.dataset.direction === state.direction);
  renderPressed(dayTypeButtons, (b) => b.dataset.dayType === state.dayType);
  renderTimeInput(timeText);
};

for (const button of directionButtons) {
  button.addEventListener("click", () => {
    state.direction = button.dataset.direction;
    render();
  });
}

for (const button of dayTypeButtons) {
  button.addEventListener("click", () => {
    state.dayType = button.dataset.dayType;
    render();
  });
}

timeInput.addEventListener("input", () => {
  // 入力途中（値が空）は、入力欄を上書きしないよう何もしない
  if (!timeInput.value) return;
  state.customTime = timeInput.value;
  render();
});

resetButton.addEventListener("click", () => {
  state.customTime = null;
  state.dayType = dayTypeOf(new Date());
  render();
});

// 現在時刻に追従している間だけ、分が変わるたびに更新する
let lastMinute = "";
const tick = () => {
  const text = clockText(new Date());
  if (state.customTime === null && text !== lastMinute) {
    lastMinute = text;
    render();
  }
};
setInterval(tick, 5000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    lastMinute = "";
    tick();
  }
});

// 時刻表の取得は index_v3.html の <link rel="preload"> で先行開始されている
loadTimetable()
  .then((timetable) => {
    state.timetable = timetable;
    render();
  })
  .catch((error) => {
    const status = document.getElementById("status");
    status.textContent = error.message;
    status.hidden = false;
  });
