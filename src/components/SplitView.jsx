import { lazy, Suspense } from 'react';
import PrayerRow from './PrayerRow';

const PrayerMap = lazy(() => import('../PrayerMap'));

// כמה סימונים מגיעים למפה. הרשימה מציגה הכל; Leaflet לא אוהב מאות סימונים,
// והמספר מוצג למשתמש כדי שהחיתוך לא ייראה כמו כיסוי מלא.
export const MAP_MARKER_LIMIT = 40;

/**
 * רשימה מימין, מפה משמאל — התצוגה היחידה לכל הטאבים שמציגים מניינים.
 * קודם רק "קרובות" קיבלה אותה, ושאר הטאבים הציגו רשת כרטיסים שלא אפשרה
 * לראות איפה המניינים יושבים.
 */
export default function SplitView({
  title,
  prayers,
  selectedPrayer,
  onSelect,
  userLocation,
  empty,
  fitKey,
}) {
  return (
    <div className="flex h-auto flex-col rounded-[12px] border border-line bg-surface min-[960px]:h-[min(560px,70vh)] min-[960px]:flex-row min-[960px]:overflow-hidden">
      <div className="order-2 shrink-0 overflow-y-auto px-[14px] pb-2 min-[960px]:order-1 min-[960px]:basis-[38%] min-[960px]:border-e min-[960px]:border-line min-[960px]:px-3">
        <div className="z-5 flex items-baseline justify-between gap-3 border-b border-line bg-surface pt-3 pb-[9px] min-[960px]:sticky min-[960px]:top-0">
          <h2 className="m-0 text-[12px] font-semibold tracking-[0.08em] text-muted">{title}</h2>
          <span className="text-[12px] text-faint">
            {prayers.length} מניינים
            {prayers.length > MAP_MARKER_LIMIT && ` · ${MAP_MARKER_LIMIT} הראשונים על המפה`}
          </span>
        </div>

        {prayers.length
          ? prayers.map((prayer) => (
              <PrayerRow
                key={prayer.id}
                prayer={prayer}
                selected={selectedPrayer?.id === prayer.id}
                onSelect={onSelect}
              />
            ))
          : empty}
      </div>

      {/* במובייל המפה מקובעת מתחת לכותרת האפליקציה והרשימה נגללת מתחתיה —
          אחרת היא נעלמת בדיוק כשמשווים בין מניינים. בדסקטופ היא ממילא
          תמיד בתצוגה, אז שם היא נשארת רגילה. */}
      <div
        className="sticky z-20 order-1 h-[280px] shrink-0 overflow-hidden rounded-t-[11px] border-b border-line bg-surface-2 min-[960px]:static min-[960px]:order-2 min-[960px]:h-auto min-[960px]:flex-1 min-[960px]:rounded-none min-[960px]:border-b-0"
        style={{ top: 'var(--app-header-h, 131px)' }}
      >
        <Suspense
          fallback={
            <div className="flex size-full items-center justify-center text-[13px] text-muted">
              טוען מפה…
            </div>
          }
        >
          <PrayerMap
            prayers={prayers.slice(0, MAP_MARKER_LIMIT)}
            selectedPrayer={selectedPrayer}
            onSelectPrayer={onSelect}
            userLocation={userLocation}
            fitKey={fitKey}
          />
        </Suspense>
      </div>
    </div>
  );
}
