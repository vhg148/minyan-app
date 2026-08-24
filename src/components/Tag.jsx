const TONES = {
  live: 'bg-live-soft text-live border-live-line',
  next: 'bg-accent-soft text-accent-ink border-accent-line',
  quiet: 'bg-surface-2 text-muted border-line',
  warn: 'bg-warn-soft text-warn border-warn-line',
};

export default function Tag({ tone = 'quiet', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-[2px] text-[11.5px] font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** נקודת סטטוס בתוך תגית — יורשת את צבע הטקסט */
export function Pulse() {
  return <span className="size-[5px] shrink-0 rounded-full bg-current" />;
}

/** נקודת קטגוריה */
export function Dot({ color, size = 6 }) {
  return (
    <span
      className="shrink-0 rounded-full"
      style={{ background: color, width: size, height: size }}
    />
  );
}

/** התגית שמופיעה על מניין שלא נכלל בעדכון האחרון של העיר שלו */
export function FreshnessTag({ freshness }) {
  if (freshness === 'stale') return <Tag tone="warn">לא עודכן</Tag>;
  if (freshness === 'previous') return <Tag tone="warn">זמן קודם</Tag>;
  return null;
}

/** תגית הצמדת מנחה+ערבית — שקטה בצבע, אבל תמיד נראית */
export function PairingTag({ pairing, short = false }) {
  if (!pairing) return null;
  return (
    <span
      title={pairing.label}
      className="inline-flex shrink-0 items-center rounded-[5px] border border-line-strong bg-surface-2 px-[5px] py-[1px] text-[10.5px] font-medium whitespace-nowrap text-ink-2"
    >
      {short ? pairing.short : pairing.label}
    </span>
  );
}
