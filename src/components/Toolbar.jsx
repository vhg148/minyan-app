import { LocateFixed, Search } from 'lucide-react';
import { CATEGORIES } from '../lib/prayers';
import { Dot } from './Tag';

const LOCATION_LABEL = {
  idle: 'מיקום',
  loading: 'מאתר…',
  granted: 'מיקום פעיל',
  denied: 'המיקום נדחה',
};

export function SearchRow({ query, onQuery, locationStatus, onRequestLocation }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute inset-y-0 my-auto size-4 text-faint" style={{ insetInlineStart: 12 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="שם מניין, רחוב או שעה"
          aria-label="חיפוש מניין"
          className="h-10 w-full rounded-[8px] border border-line bg-surface text-[14px] text-ink transition-colors outline-none placeholder:text-faint focus:border-accent"
          style={{ paddingInlineStart: 36, paddingInlineEnd: 12 }}
        />
      </div>

      <button
        type="button"
        onClick={onRequestLocation}
        disabled={locationStatus === 'loading'}
        className={`inline-flex h-10 cursor-pointer items-center gap-[6px] rounded-[8px] border px-[14px] text-[13.5px] font-medium whitespace-nowrap transition-colors ${
          locationStatus === 'granted'
            ? 'border-ink bg-ink text-paper hover:bg-ink-2'
            : locationStatus === 'denied'
              ? 'border-warn-line bg-warn-soft text-warn'
              : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:bg-surface-2'
        } ${locationStatus === 'loading' ? 'animate-pulse' : ''}`}
      >
        <LocateFixed className="size-[15px]" />
        {LOCATION_LABEL[locationStatus]}
      </button>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="hide-scrollbar flex gap-[2px] overflow-x-auto rounded-[12px] border border-line bg-surface-2 p-[3px]">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-[6px] rounded-[7px] px-[11px] py-[7px] text-[13.5px] sm:px-[15px] whitespace-nowrap transition-colors ${
              selected
                ? 'bg-surface font-semibold text-ink shadow-[var(--shadow)]'
                : 'font-medium text-muted hover:text-ink-2'
            }`}
          >
            {tab.category && <Dot color={CATEGORIES[tab.category].color} />}
            {tab.label}
            {tab.badge && (
              <span
                className="rounded-full px-[6px] py-[1px] text-[10.5px] font-semibold text-white"
                style={{ background: CATEGORIES.selichot.color }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Chips({ cityFilter, onCity, showSelichot, includeSelichot, onIncludeSelichot, nearbyOnly, onNearbyOnly, locationKnown }) {
  const chip = (pressed) =>
    `inline-flex cursor-pointer items-center gap-[6px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-medium transition-colors ${
      pressed
        ? 'border-ink bg-ink text-paper'
        : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink-2'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-[6px]">
      {[
        { id: 'all', label: 'הכל' },
        { id: 'חולון', label: 'חולון' },
        { id: 'בת ים', label: 'בת ים' },
      ].map((c) => (
        <button key={c.id} type="button" aria-pressed={cityFilter === c.id} onClick={() => onCity(c.id)} className={chip(cityFilter === c.id)}>
          {c.label}
        </button>
      ))}

      <span className="mx-1 h-[18px] w-px bg-line" />

      {showSelichot && (
        <button type="button" aria-pressed={includeSelichot} onClick={() => onIncludeSelichot(!includeSelichot)} className={chip(includeSelichot)}>
          <Dot color={CATEGORIES.selichot.color} />
          כולל סליחות
        </button>
      )}

      <button
        type="button"
        aria-pressed={nearbyOnly}
        onClick={() => onNearbyOnly(!nearbyOnly)}
        disabled={!locationKnown}
        title={locationKnown ? undefined : 'צריך מיקום כדי לסנן לפי מרחק הליכה'}
        className={`${chip(nearbyOnly)} ${locationKnown ? '' : 'cursor-not-allowed opacity-45'}`}
      >
        עד 10 דק׳ הליכה
      </button>
    </div>
  );
}
