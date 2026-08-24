// גזירת רשימות התפילות: פתרון שעות, סינון, מרחקים ומיון לפי קרבה בזמן.

import { getCalculatedTime, toMinutes } from './zmanim';
import { haversineDistance, walkingMinutes } from './geo';
import { getCoordinates, hasCoordinates } from '../coordinates';

export const CATEGORIES = {
  shacharit: { id: 'shacharit', label: 'שחרית', color: 'var(--c-shacharit)' },
  mincha: { id: 'mincha', label: 'מנחה', color: 'var(--c-mincha)' },
  arvit: { id: 'arvit', label: 'ערבית', color: 'var(--c-arvit)' },
  selichot: { id: 'selichot', label: 'סליחות', color: 'var(--c-selichot)' },
};

export const DEFAULT_CITY = 'חולון';

/** תווית הקטגוריה לתצוגה */
export function categoryLabel(prayer) {
  return CATEGORIES[prayer.category]?.label || '';
}

/**
 * מניין שמצמיד מנחה וערבית. שני מצבים שונים באמת:
 * consecutive — תפילה אחת רצופה, בלי הפסקה.
 * adjacent    — ערבית מיד אחרי, בהפרש קצר.
 * המידע הזה קובע אם אפשר לתפוס את שתיהן בנסיעה אחת, אז הוא תגית ולא הערה.
 */
export const PAIRING = {
  consecutive: { id: 'consecutive', label: 'מנחה וערבית ברצף', short: 'מנחה+ערבית' },
  adjacent: { id: 'adjacent', label: 'ערבית בסמוך', short: 'ערבית בסמוך' },
};

export function pairingOf(prayer) {
  return PAIRING[prayer.pairing] || null;
}

/** מניינים עונתיים מקבלים את אותה צורה כמו תפילות הקבע, כדי שכל שאר
 *  הלוגיקה — מיון, מרחק, מפה, חיפוש — תעבוד עליהם בלי הסתעפויות. */
export function normalizeSelichot(minyanim) {
  return minyanim.map((m) => ({
    ...m,
    category: 'selichot',
    notes: m.timeLabel && m.timeLabel !== m.time ? m.timeLabel : '',
    freshness: 'current',
  }));
}

// חסד של 15 דקות: מניין שהתחיל לפני פחות מזה עדיין רלוונטי להצגה
const GRACE_MINUTES = 15;

/**
 * משלים לכל מניין את השעה בפועל, המרחק מהמשתמש והפער בדקות מעכשיו.
 * minutesAway שלילי = כבר התחיל. null = אין שעה שניתן לחשב.
 */
export function resolvePrayer(prayer, { zmanim, now, userLocation }) {
  const actualTime = getCalculatedTime(prayer, zmanim);
  const at = toMinutes(actualTime);

  let minutesAway = null;
  if (at !== null) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    minutesAway = at - nowMinutes;
    if (minutesAway < -GRACE_MINUTES) minutesAway += 1440; // מחר
  }

  let distance = null;
  if (userLocation && hasCoordinates(prayer.address)) {
    const [lat, lon] = getCoordinates(prayer.address, prayer.city);
    distance = haversineDistance(userLocation[0], userLocation[1], lat, lon);
  }

  return {
    ...prayer,
    actualTime,
    minutesAway,
    distance,
    walkMinutes: walkingMinutes(distance),
    isLive: minutesAway !== null && minutesAway <= 0,
    onMap: hasCoordinates(prayer.address),
  };
}

/** מניין שמתקיים רק בימים מסוימים (0 = ראשון) */
export function runsToday(prayer, now) {
  return !Array.isArray(prayer.days) || prayer.days.includes(now.getDay());
}

export function cityOf(prayer) {
  return prayer.city || DEFAULT_CITY;
}

export function matchesCity(prayer, cityFilter) {
  return cityFilter === 'all' || cityOf(prayer) === cityFilter;
}

export function matchesSearch(prayer, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [prayer.name, prayer.address, prayer.actualTime, prayer.time, cityOf(prayer)]
    .some((field) => String(field || '').toLowerCase().includes(q));
}

/**
 * הרשימה שמזינה את המסך הראשי ואת המפה: כל מה שיש לו שעה ניתנת לחישוב,
 * שמתקיים היום ועובר את הסינון — ממוין מהקרוב ביותר בזמן.
 */
export function buildUpcoming(records, { zmanim, now, userLocation, cityFilter, nearbyOnly }) {
  return records
    .filter((p) => runsToday(p, now))
    .map((p) => resolvePrayer(p, { zmanim, now, userLocation }))
    .filter((p) => p.minutesAway !== null)
    .filter((p) => matchesCity(p, cityFilter))
    .filter((p) => !nearbyOnly || (p.walkMinutes !== null && p.walkMinutes <= 10))
    .sort((a, b) => a.minutesAway - b.minutesAway);
}

/**
 * הכרטיס העליון: לא בהכרח המניין הראשון בזמן, אלא הקרוב ביותר שעוד אפשר
 * להגיע אליו ברגל בזמן. בלי מיקום — פשוט הבא בתור.
 */
export function pickHighlight(upcoming) {
  const future = upcoming.filter((p) => p.minutesAway >= 0);
  if (!future.length) return upcoming[0] || null;

  const reachable = future.filter(
    (p) => p.walkMinutes !== null && p.walkMinutes <= p.minutesAway,
  );
  if (!reachable.length) return future[0];

  // מבין אלה שאפשר להספיק — הקרוב ביותר ברגליים
  return reachable.reduce((best, p) => (p.walkMinutes < best.walkMinutes ? p : best));
}
