import { Footprints, Map as MapIcon, MapPin, Navigation } from 'lucide-react';
import { CATEGORIES, categoryLabel, cityOf, pairingOf } from '../lib/prayers';
import { formatDistance } from '../lib/geo';
import { countdownLabel } from '../lib/format';
import { Dot, PairingTag } from './Tag';

const wazeUrl = (p) => `https://waze.com/ul?q=${encodeURIComponent(`${p.address} ${cityOf(p)}`)}`;
const mapsUrl = (p) => `https://maps.google.com/?q=${encodeURIComponent(`${p.address} ${cityOf(p)}`)}`;

/**
 * הכרטיס העליון. כשהמיקום ידוע הוא לא מציג את המניין הבא בזמן אלא את
 * הקרוב ביותר שאפשר להגיע אליו ברגל — זו השאלה שבאמת נשאלת ב-4:30.
 */
export default function NowCard({ prayer, reachable }) {
  if (!prayer) return null;

  const category = CATEGORIES[prayer.category];
  const pairing = pairingOf(prayer);

  return (
    <div className="flex flex-wrap overflow-hidden rounded-[12px] border border-accent-line bg-surface shadow-[var(--shadow)] sm:flex-nowrap">
      <div className="flex w-full shrink-0 items-baseline gap-[10px] border-b border-accent-line bg-accent-soft px-4 py-[14px] sm:w-[150px] sm:flex-col sm:justify-center sm:gap-[2px] sm:border-b-0 sm:border-e sm:px-[18px] sm:py-5">
        <span className="num text-[38px] leading-none font-bold tracking-[-0.03em] text-accent-ink">
          {prayer.actualTime}
        </span>
        <span className="text-[12.5px] font-medium text-accent">
          {countdownLabel(prayer.minutesAway)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[5px] px-[18px] py-4">
        <span className="text-[10.5px] font-semibold tracking-[0.1em] text-accent">
          {reachable ? 'הכי קרוב שתספיק' : 'המניין הבא'}
        </span>
        <h2 className="m-0 truncate text-[19px] font-semibold tracking-[-0.015em]">
          {prayer.name}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-[5px]">
            <MapPin className="size-[14px] shrink-0 text-faint" />
            {prayer.address ? `${prayer.address}, ${cityOf(prayer)}` : cityOf(prayer)}
          </span>
          {prayer.walkMinutes !== null && (
            <span className="inline-flex items-center gap-[5px] font-medium text-ink-2">
              <Footprints className="size-[14px] shrink-0 text-faint" />
              {prayer.walkMinutes} דקות הליכה · {formatDistance(prayer.distance)}
            </span>
          )}
          <span className="inline-flex items-center gap-[5px]">
            <Dot color={category.color} />
            {categoryLabel(prayer)}
          </span>
          <PairingTag pairing={pairing} />
        </div>
        {prayer.notes && (
          <p className="m-0 truncate text-[12.5px] text-faint">{prayer.notes}</p>
        )}
      </div>

      {prayer.address && (
        <div className="flex w-full shrink-0 border-t border-line sm:w-auto sm:flex-col sm:border-t-0 sm:border-s">
          <a
            href={wazeUrl(prayer)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-[6px] px-[18px] py-[11px] text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 sm:justify-start"
          >
            <Navigation className="size-[15px] text-faint" />
            Waze
          </a>
          <a
            href={mapsUrl(prayer)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-[6px] border-s border-line px-[18px] py-[11px] text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 sm:justify-start sm:border-s-0 sm:border-t"
          >
            <MapIcon className="size-[15px] text-faint" />
            מפות
          </a>
        </div>
      )}
    </div>
  );
}
