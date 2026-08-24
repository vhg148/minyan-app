// זמני היום ההלכתיים — משיכה מ-Hebcal וחישוב שעות יחסיות

const HOLON_GEONAME_ID = 294751;

// זמני גיבוי לאלול (שעון קיץ) — משמשים רק אם ה-API לא זמין
export const FALLBACK_ZMANIM = {
  alotHaShachar: '04:44',
  sunrise: '06:10',
  sofZmanShmaGRA: '09:24',
  chatzot: '12:45',
  minchaGedola: '13:19',
  minchaKetana: '16:39',
  plagHaMincha: '18:17',
  sunset: '19:25',
  tzeit: '19:48',
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export async function fetchZmanim() {
  const res = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=${HOLON_GEONAME_ID}`);
  if (!res.ok) throw new Error(`Hebcal responded ${res.status}`);
  const { times } = await res.json();

  return {
    alotHaShachar: formatTime(times.alotHaShachar) || FALLBACK_ZMANIM.alotHaShachar,
    sunrise: formatTime(times.sunrise),
    sofZmanShmaGRA: formatTime(times.sofZmanShma) || FALLBACK_ZMANIM.sofZmanShmaGRA,
    chatzot: formatTime(times.chatzot),
    minchaGedola: formatTime(times.minchaGedola),
    minchaKetana: formatTime(times.minchaKetana) || FALLBACK_ZMANIM.minchaKetana,
    plagHaMincha: formatTime(times.plagHaMincha),
    sunset: formatTime(times.sunset),
    tzeit: formatTime(times.tzeit7083deg) || formatTime(times.tzeit),
  };
}

const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** האם המחרוזת היא שעה ממשית ולא תווית ("נץ החמה", "פלג המנחה") */
export function isClockTime(value) {
  return HHMM.test(String(value || '').trim());
}

/** "HH:MM" -> דקות מחצות. מחזירה null אם זו לא שעה. */
export function toMinutes(value) {
  const m = HHMM.exec(String(value || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** דקות מחצות -> "HH:MM", עם גלישה נכונה מעבר ליממה */
export function fromMinutes(total) {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  return `${String(h).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

/**
 * השעה בפועל של מניין. מניין שמוגדר יחסית לזמן הלכתי (zmanReference + offset)
 * מחושב מזמני היום; אחרת מוחזרת השעה כפי שהיא בנתונים.
 */
export function getCalculatedTime(prayer, zmanim) {
  if (!prayer.zmanReference || !zmanim) return prayer.time;

  const base = toMinutes(zmanim[prayer.zmanReference]);
  if (base === null) return prayer.time;

  return fromMinutes(base + (prayer.offset || 0));
}
