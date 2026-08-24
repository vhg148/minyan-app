// מרחקים והערכת זמן הליכה

const EARTH_RADIUS_M = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

/** מרחק אווירי בין שתי נקודות, במטרים */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ~80 מ' לדקה — קצב הליכה עירוני, כולל עיקוף רחובות
const METERS_PER_MINUTE = 80;

/** דקות הליכה משוערות ממרחק במטרים */
export function walkingMinutes(meters) {
  if (meters == null) return null;
  return Math.max(1, Math.round(meters / METERS_PER_MINUTE));
}

/** "310 מ׳" / "1.4 ק״מ" */
export function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000
    ? `${Math.round(meters / 10) * 10} מ׳`
    : `${(meters / 1000).toFixed(1)} ק״מ`;
}
