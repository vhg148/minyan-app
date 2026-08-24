import { toMinutes } from '../lib/zmanim';

const ENTRIES = [
  { key: 'alotHaShachar', label: 'עלות השחר' },
  { key: 'sunrise', label: 'הנץ החמה' },
  { key: 'sofZmanShmaGRA', label: 'סוף ק״ש גר״א' },
  { key: 'chatzot', label: 'חצות היום' },
  { key: 'minchaGedola', label: 'מנחה גדולה' },
  { key: 'minchaKetana', label: 'מנחה קטנה' },
  { key: 'plagHaMincha', label: 'פלג המנחה' },
  { key: 'sunset', label: 'שקיעה' },
  { key: 'tzeit', label: 'צאת הכוכבים' },
];

/** הזמן ההלכתי הבא שעוד לא עבר — מסומן באקסנט */
function nextKey(zmanim, now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = ENTRIES.map((e) => ({ ...e, at: toMinutes(zmanim[e.key]) }))
    .filter((e) => e.at !== null && e.at > nowMinutes)
    .sort((a, b) => a.at - b.at);
  return upcoming[0]?.key ?? null;
}

export default function ZmanimBar({ zmanim, currentTime }) {
  if (!zmanim) {
    return (
      <div className="flex animate-pulse border-b border-line bg-surface">
        {ENTRIES.map((e) => (
          <div key={e.key} className="min-w-[96px] flex-1 border-s border-line px-[14px] py-[11px] text-center first:border-s-0">
            <span className="mb-[3px] block text-[10.5px] font-medium whitespace-nowrap tracking-[0.06em] text-muted">
              {e.label}
            </span>
            <span className="mx-auto block h-4 w-10 rounded bg-surface-3" />
          </div>
        ))}
      </div>
    );
  }

  const next = nextKey(zmanim, currentTime);

  return (
    <div className="hide-scrollbar flex overflow-x-auto border-b border-line bg-surface">
      {ENTRIES.map((e) => (
        <div
          key={e.key}
          className="min-w-[96px] flex-1 shrink-0 border-s border-line px-[14px] py-[11px] text-center first:border-s-0"
        >
          <span className="mb-[3px] block text-[10.5px] font-medium whitespace-nowrap tracking-[0.06em] text-muted">
            {e.label}
          </span>
          <span
            className={`num block text-[16px] font-semibold ${e.key === next ? 'text-accent' : ''}`}
          >
            {zmanim[e.key] || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}
