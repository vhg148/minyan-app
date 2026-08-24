// חלון העונה של הסליחות — נקרא מתוך selichot.json, לא מקודד כאן.
// כשהעונה נגמרת הטאב נעלם מעצמו, בלי שינוי קוד.

/** מפרק "YYYY-MM-DD" לתאריך מקומי בחצות (Date.parse על מחרוזת כזו הוא UTC) */
function parseLocalDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** תחילת היום — כדי שההשוואה תהיה ברמת תאריך ולא שעה */
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * האם התאריך נמצא בתוך עונת הסליחות (כולל יום הפתיחה ויום הסיום).
 * season = { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
export function isSelichotSeason(season, date = new Date()) {
  if (!season) return false;

  const start = parseLocalDate(season.start);
  const end = parseLocalDate(season.end);
  if (!start || !end) return false;

  const today = startOfDay(date);
  return today >= start && today <= end;
}

/** כמה ימים נותרו לעונה, לתצוגה. null אם העונה לא פעילה. */
export function daysLeftInSeason(season, date = new Date()) {
  if (!isSelichotSeason(season, date)) return null;

  const end = parseLocalDate(season.end);
  const today = startOfDay(date);
  return Math.round((end - today) / 86400000);
}
