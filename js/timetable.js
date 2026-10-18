// 時刻表データの読み込みと、条件に合う便の抽出。
import { isRouteRunning, dateKey } from "./calendar.js";

export const TO_STATION = "toStation"; // 高専 → 駅
export const TO_SCHOOL = "toSchool"; // 駅 → 高専

const NEXT_COUNT = 5;

export const loadTimetable = async () => {
  const response = await fetch(new URL("../data/timetable.json", import.meta.url));
  if (!response.ok) throw new Error(`時刻表を読み込めませんでした (${response.status})`);
  return response.json();
};

// "HH:MM" -> 0時からの分
export const toMinutes = (text) => parseInt(text.slice(0, 2), 10) * 60 + parseInt(text.slice(3), 10);

const makeTrip = (timetable, line, dep, arr) => ({
  dep: toMinutes(dep),
  arr: toMinutes(arr),
  depText: dep,
  arrText: arr,
  line,
  route: timetable.routes[line.route],
});

// 方向・曜日区分・日付（不明なら null）に合う便を、発車時刻順に返す
export const buildTrips = (timetable, direction, dayType, date) => {
  const trips = [];
  const linesById = {};
  for (const line of timetable.lines) {
    linesById[line.id] = line;
    if (line.direction !== direction) continue;
    if (!isRouteRunning(timetable.routes[line.route], dayType, date)) continue;
    for (const [dep, arr, only] of line.trips) {
      if (only && only !== dayType) continue;
      trips.push(makeTrip(timetable, line, dep, arr));
    }
  }
  if (date) {
    const today = dateKey(date);
    for (const extra of timetable.extraTrips) {
      const line = linesById[extra.line];
      if (line.direction === direction && extra.dates.includes(today)) {
        trips.push(makeTrip(timetable, line, extra.dep, extra.arr));
      }
    }
  }
  return trips.sort((a, b) => a.dep - b.dep);
};

// nowMinutes 以降の次発 NEXT_COUNT 便と、直前に出た1便を返す。
// 始発前は previous なし。最終後は finished = true。
export const pickTrips = (trips, nowMinutes) => {
  const index = trips.findIndex((trip) => trip.dep >= nowMinutes);
  if (index === -1) return { finished: true, previous: null, upcoming: [] };
  return {
    finished: false,
    previous: index > 0 ? trips[index - 1] : null,
    upcoming: trips.slice(index, index + NEXT_COUNT),
  };
};
