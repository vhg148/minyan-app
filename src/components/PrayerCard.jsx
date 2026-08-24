import { Map as MapIcon, MapPin, Navigation } from 'lucide-react';
import { CATEGORIES, categoryLabel, cityOf, pairingOf } from '../lib/prayers';
import { countdownLabel, countdownTone } from '../lib/format';
import { isClockTime } from '../lib/zmanim';
import Tag, { Dot, FreshnessTag, PairingTag, Pulse } from './Tag';

const wazeUrl = (p) => `https://waze.com/ul?q=${encodeURIComponent(`${p.address} ${cityOf(p)}`)}`;
const mapsUrl = (p) => `https://maps.google.com/?q=${encodeURIComponent(`${p.address} ${cityOf(p)}`)}`;

/** כרטיס לתצוגת הרשת בטאבים של קטגוריה בודדת */
export default function PrayerCard({ prayer }) {
  const category = CATEGORIES[prayer.category];
  const tone = countdownTone(prayer.minutesAway);
  const pairing = pairingOf(prayer);

  return (
    <article className="flex flex-col justify-between rounded-[12px] border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="num text-[28px] leading-none font-bold tracking-[-0.025em]">
              {prayer.actualTime}
            </span>
            {/* התווית המשנית קיימת בשביל "נץ החמה" / "פלג המנחה". כשהמקור הוא
                כבר שעה מספרית היא רק סותרת את השעה המחושבת שמעליה. */}
            {prayer.zmanReference && !isClockTime(prayer.time) && (
              <span className="text-[11.5px] font-medium text-faint">{prayer.time}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {prayer.minutesAway !== null && (
              <Tag tone={tone}>
                {tone === 'live' && <Pulse />}
                {countdownLabel(prayer.minutesAway)}
              </Tag>
            )}
            <FreshnessTag freshness={prayer.freshness} />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-[7px]">
          <Dot color={category.color} />
          <h3 className="m-0 truncate text-[16px] font-semibold">{prayer.name}</h3>
          <span className="shrink-0 text-[11.5px] text-faint">{categoryLabel(prayer)}</span>
        </div>

        {pairing && (
          <div className="flex">
            <PairingTag pairing={pairing} />
          </div>
        )}

        <div className="flex items-center gap-[6px] text-[13px] text-muted">
          <MapPin className="size-[14px] shrink-0 text-faint" />
          <span className="truncate">
            {prayer.address || 'כתובת חסרה'}
            <span className="text-faint"> · {cityOf(prayer)}</span>
          </span>
        </div>

        {prayer.notes && (
          <p className="m-0 rounded-[6px] bg-surface-2 px-[9px] py-[6px] text-[12px] text-muted">
            {prayer.notes}
          </p>
        )}
      </div>

      {prayer.address ? (
        <div className="flex border-t border-line">
          <a
            href={wazeUrl(prayer)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-[6px] py-[9px] text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
          >
            <Navigation className="size-[13px] text-faint" />
            Waze
          </a>
          <a
            href={mapsUrl(prayer)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-[6px] border-s border-line py-[9px] text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
          >
            <MapIcon className="size-[13px] text-faint" />
            מפות
          </a>
        </div>
      ) : (
        <div className="border-t border-line px-4 py-[9px] text-[12px] text-faint">
          אין כתובת — לא מופיע על המפה
        </div>
      )}
    </article>
  );
}
