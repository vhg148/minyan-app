import { CATEGORIES, categoryLabel, cityOf, pairingOf } from '../lib/prayers';
import { countdownLabel, countdownTone } from '../lib/format';
import Tag, { Dot, FreshnessTag, PairingTag, Pulse } from './Tag';

/**
 * שורת ספר-חשבונות: השעה בעמודה קבועה, השם והכתובת נסוגים לאפור,
 * הסטטוס בקצה. מופרדות בקווי שיער — לא ערימת כרטיסים.
 */
export default function PrayerRow({ prayer, selected, onSelect }) {
  const category = CATEGORIES[prayer.category];
  const tone = countdownTone(prayer.minutesAway);
  const pairing = pairingOf(prayer);

  const details = [
    prayer.address || null,
    cityOf(prayer),
    prayer.walkMinutes !== null ? `${prayer.walkMinutes} דק׳ הליכה` : null,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={() => onSelect(prayer)}
      aria-current={selected ? 'true' : undefined}
      className={`flex w-full cursor-pointer border-b border-line text-start transition-colors last:border-b-0 hover:bg-surface-2 ${
        selected ? 'bg-surface-2 shadow-[inset_-2px_0_0_var(--ink)]' : ''
      } items-center gap-[14px] px-1 py-[11px] min-[960px]:items-start min-[960px]:gap-[11px] min-[960px]:px-[2px] min-[960px]:py-[10px]`}
    >
      <span
        className="num w-[64px] shrink-0 text-[19px] font-semibold tracking-[-0.01em] min-[960px]:w-[56px] min-[960px]:pt-px min-[960px]:text-[18px]"
      >
        {prayer.actualTime}
      </span>

      {/* הנקודה הצבעונית כבר מקודדת את הקטגוריה — התווית מיותרת בחלונית הצרה */}
      <span className="hidden w-[52px] shrink-0 text-[11.5px] font-medium text-faint sm:block min-[960px]:hidden">
        {categoryLabel(prayer)}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="flex min-w-0 items-center gap-[7px]">
          <Dot color={category.color} />
          <b className="truncate text-[14.5px] font-semibold tracking-[-0.005em]">
            {prayer.name}
          </b>
        </span>
        <span className="truncate text-[12.5px] text-muted">
          {details.join(' · ')}
          {prayer.notes && ` · ${prayer.notes}`}
        </span>
        {/* שורה משלה: ליד השם היא מעכה אותו, ובשורת הפרטים היא חתכה את
            הכתובת ל-49px מתוך 101 שהיא צריכה */}
        {pairing && (
          <span className="flex pt-[3px]">
            <PairingTag pairing={pairing} short />
          </span>
        )}
      </span>

      <span
        className="flex shrink-0 items-center gap-2 min-[960px]:flex-col min-[960px]:items-end min-[960px]:gap-1 min-[960px]:pt-px"
      >
        <FreshnessTag freshness={prayer.freshness} />
        <Tag tone={tone}>
          {tone === 'live' && <Pulse />}
          {countdownLabel(prayer.minutesAway)}
        </Tag>
      </span>
    </button>
  );
}
