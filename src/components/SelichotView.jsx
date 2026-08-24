import { Map as MapIcon, Navigation } from 'lucide-react';
import { CATEGORIES } from '../lib/prayers';
import { daysLeftInSeason } from '../lib/season';
import { countdownLabel, countdownTone } from '../lib/format';
import { Dot } from './Tag';

const wazeUrl = (m) => `https://waze.com/ul?q=${encodeURIComponent(`${m.address} ${m.city}`)}`;
const mapsUrl = (m) => `https://maps.google.com/?q=${encodeURIComponent(`${m.address} ${m.city}`)}`;

/**
 * 93 מניינים ב-22 משבצות זמן. הקיבוץ הוא לפי חלק היום — אף אחד לא סורק
 * רשימה שטוחה של 93; מחפשים "מה יש לפנות בוקר" או "מה יש בערב".
 */
export default function SelichotView({ season, slots, minyanim, query }) {
  const daysLeft = daysLeftInSeason(season);

  const bySlot = slots
    .map((slot) => ({
      ...slot,
      items: minyanim
        .filter((m) => m.slot === slot.id)
        .sort((a, b) => a.time.localeCompare(b.time) || a.name.localeCompare(b.name, 'he')),
    }))
    .filter((slot) => slot.items.length > 0);

  if (!bySlot.length) {
    return (
      <p className="rounded-[12px] border border-dashed border-line py-12 text-center text-muted">
        לא נמצאו מנייני סליחות שתואמים את החיפוש{query ? ` "${query}"` : ''}.
      </p>
    );
  }

  return (
    <section className="flex flex-col">
      <header className="flex items-baseline justify-between gap-3 border-b border-line pb-[9px]">
        <h2 className="m-0 text-[12px] font-semibold tracking-[0.08em] text-muted">
          סליחות · {season.label}
        </h2>
        <span className="text-[12px] text-faint">
          {minyanim.length} מניינים בחולון
          {daysLeft !== null && ` · נותרו ${daysLeft} ימים לעונה`}
        </span>
      </header>

      {bySlot.map((slot) => (
        <div key={slot.id}>
          <div
            className="sticky z-10 flex items-center gap-3 bg-paper px-1 pt-4 pb-2"
            style={{ top: 'var(--app-header-h, 127px)' }}
          >
            <span
              className="rounded-full border border-line bg-surface px-[9px] py-[3px] text-[11px] font-semibold tracking-[0.08em]"
              style={{ color: CATEGORIES.selichot.color }}
            >
              {slot.label}
            </span>
            <span className="num text-[12.5px] text-muted">
              {slot.range} · {slot.items.length} מניינים
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-x-[22px] [grid-template-columns:repeat(auto-fill,minmax(255px,1fr))]">
            {slot.items.map((m) => (
              <SelichotRow key={m.id} minyan={m} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function SelichotRow({ minyan }) {
  const tone = countdownTone(minyan.minutesAway);
  const live = tone === 'live' || (minyan.minutesAway !== null && minyan.minutesAway < 60);

  return (
    <div className="group flex items-baseline gap-[11px] border-b border-line px-1 py-2 transition-colors hover:bg-surface-2">
      <span className="num w-[46px] shrink-0 text-[14px] font-semibold text-ink-2">
        {minyan.time}
      </span>

      <span className="flex min-w-0 flex-1 items-baseline gap-[7px]">
        {live && <Dot color={CATEGORIES.selichot.color} />}
        <span className="truncate text-[14px] font-medium">{minyan.name}</span>
      </span>

      <span className="shrink-0 text-[12px] text-muted">{minyan.address}</span>

      <span className="flex shrink-0 items-center gap-[6px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <a
          href={wazeUrl(minyan)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`ניווט ב-Waze אל ${minyan.name}`}
          className="text-faint transition-colors hover:text-ink-2"
        >
          <Navigation className="size-[13px]" />
        </a>
        <a
          href={mapsUrl(minyan)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`פתיחה במפות אל ${minyan.name}`}
          className="text-faint transition-colors hover:text-ink-2"
        >
          <MapIcon className="size-[13px]" />
        </a>
      </span>

      {live && minyan.minutesAway !== null && (
        <span
          className={`num shrink-0 text-[11.5px] font-semibold ${tone === 'live' ? 'text-live' : 'text-accent'}`}
        >
          {countdownLabel(minyan.minutesAway)}
        </span>
      )}
    </div>
  );
}
