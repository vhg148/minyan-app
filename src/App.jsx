import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Info, Search } from 'lucide-react';

import prayerFile from './data/prayers.json';
import selichotFile from './data/selichot.json';

import { fetchZmanim, FALLBACK_ZMANIM } from './lib/zmanim';
import { isSelichotSeason } from './lib/season';
import {
  buildUpcoming,
  matchesCity,
  matchesSearch,
  normalizeSelichot,
  pickHighlight,
  resolvePrayer,
  runsToday,
} from './lib/prayers';

import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import ZmanimBar from './components/ZmanimBar';
import { Chips, SearchRow, Tabs } from './components/Toolbar';
import NowCard from './components/NowCard';
import SplitView from './components/SplitView';
import SelichotView from './components/SelichotView';


const SELICHOT = normalizeSelichot(selichotFile.minyanim);
const CLOCK_TICK_MS = 30000;

const TAB_TITLE = { shacharit: 'שחרית', mincha: 'מנחה', arvit: 'ערבית' };

export default function App() {
  const { isDark, toggle } = useTheme();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [query, setQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [zmanim, setZmanim] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [cityFilter, setCityFilter] = useState('all');
  const [includeSelichot, setIncludeSelichot] = useState(true);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const inSeason = isSelichotSeason(selichotFile.season, currentTime);

  useEffect(() => {
    let cancelled = false;
    fetchZmanim()
      .then((z) => !cancelled && setZmanim(z))
      .catch((err) => {
        console.error('Failed to fetch zmanim, using fallback:', err);
        if (!cancelled) setZmanim(FALLBACK_ZMANIM);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  // גובה הכותרת הדביקה משתנה לפי רוחב המסך וגלישת שורות. כותרות דביקות
  // אחרות חייבות לשבת מתחתיה, אז מפרסמים את הגובה האמיתי כמשתנה CSS
  // במקום לנחש מספר קבוע.
  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty('--app-header-h', `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return setLocationStatus('denied');
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // בעונה, הסליחות משתתפות ברשימת "הקרובות" ובמפה כמו כל מניין אחר
  const allRecords = useMemo(
    () => (inSeason && includeSelichot ? [...prayerFile.prayers, ...SELICHOT] : prayerFile.prayers),
    [inSeason, includeSelichot],
  );

  const upcoming = useMemo(
    () =>
      buildUpcoming(allRecords, {
        zmanim,
        now: currentTime,
        userLocation,
        cityFilter,
        nearbyOnly,
      }),
    [allRecords, zmanim, currentTime, userLocation, cityFilter, nearbyOnly],
  );

  const searchedUpcoming = useMemo(
    () => upcoming.filter((p) => matchesSearch(p, query)),
    [upcoming, query],
  );

  const highlight = useMemo(() => pickHighlight(upcoming), [upcoming]);
  const highlightReachable =
    highlight?.walkMinutes !== null &&
    highlight?.walkMinutes !== undefined &&
    highlight.walkMinutes <= highlight.minutesAway;

  const categoryList = useMemo(() => {
    if (activeTab === 'upcoming' || activeTab === 'selichot') return [];
    return prayerFile.prayers
      .filter((p) => p.category === activeTab)
      .filter((p) => runsToday(p, currentTime))
      .map((p) => resolvePrayer(p, { zmanim, now: currentTime, userLocation }))
      .filter((p) => matchesCity(p, cityFilter) && matchesSearch(p, query))
      .sort((a, b) => (a.minutesAway ?? 1e9) - (b.minutesAway ?? 1e9));
  }, [activeTab, zmanim, currentTime, userLocation, cityFilter, query]);

  // הרשימה שמוצגת כרגע — היא שמזינה גם את השורות וגם את המפה
  const visibleList = activeTab === 'upcoming' ? searchedUpcoming : categoryList;

  // הבחירה נגזרת ולא מסונכרנת דרך אפקט: כשהמניין הנבחר יוצא מהרשימה —
  // סינון, חיפוש, מעבר טאב או פשוט מעבר הזמן — היא נופלת חזרה לראשון מעצמה.
  const selectedPrayer = useMemo(
    () => visibleList.find((p) => p.id === selectedId) ?? visibleList[0] ?? null,
    [visibleList, selectedId],
  );
  const selectPrayer = useCallback((prayer) => setSelectedId(prayer.id), []);


  const selichotList = useMemo(() => {
    if (!inSeason) return [];
    return SELICHOT.map((m) => resolvePrayer(m, { zmanim, now: currentTime, userLocation }))
      .filter((m) => matchesSearch(m, query));
  }, [inSeason, zmanim, currentTime, userLocation, query]);

  // בעונה הסליחות עולות למקום השני — הן העניין של החודש, ובמסך צר
  // הטאב האחרון הוא זה שנחתך.
  const tabs = [
    { id: 'upcoming', label: 'קרובות' },
    ...(inSeason
      ? [{ id: 'selichot', label: 'סליחות', category: 'selichot', badge: 'אלול' }]
      : []),
    { id: 'shacharit', label: 'שחרית', category: 'shacharit' },
    { id: 'mincha', label: 'מנחה', category: 'mincha' },
    { id: 'arvit', label: 'ערבית', category: 'arvit' },
  ];

  return (
    <div className="min-h-screen bg-paper pb-12 text-ink">
      <header ref={headerRef} className="sticky top-0 z-30 border-b border-line bg-surface">
        <Header currentTime={currentTime} isDark={isDark} onToggleTheme={toggle} />
        <ZmanimBar zmanim={zmanim} currentTime={currentTime} />
      </header>

      <main className="mx-auto flex max-w-[1080px] flex-col gap-[14px] px-4 pt-[18px]">
        <SearchRow
          query={query}
          onQuery={setQuery}
          locationStatus={locationStatus}
          onRequestLocation={requestLocation}
        />

        <Tabs
          tabs={tabs}
          active={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            setQuery('');
          }}
        />

        {/* הסליחות הן בחולון בלבד ולא מסוננות לפי מרחק — אין טעם להציג
            פקדים שלא עושים כלום במסך הזה */}
        {activeTab !== 'selichot' && (
        <Chips
          cityFilter={cityFilter}
          onCity={setCityFilter}
          showSelichot={inSeason && activeTab === 'upcoming'}
          includeSelichot={includeSelichot}
          onIncludeSelichot={setIncludeSelichot}
          nearbyOnly={nearbyOnly}
          onNearbyOnly={setNearbyOnly}
          locationKnown={userLocation !== null}
        />
        )}

        {activeTab !== 'selichot' && (
          <>
            {activeTab === 'upcoming' && (
              <NowCard prayer={highlight} reachable={highlightReachable} />
            )}

            <SplitView
              title={activeTab === 'upcoming' ? 'התפילות הבאות' : TAB_TITLE[activeTab]}
              prayers={visibleList}
              selectedPrayer={selectedPrayer}
              onSelect={selectPrayer}
              userLocation={userLocation}
              fitKey={activeTab}
              empty={<EmptyState query={query} onClear={() => setQuery('')} />}
            />

            <FreshnessNote prayers={visibleList} sources={prayerFile.sources} />
          </>
        )}

        {activeTab === 'selichot' && inSeason && (
          <SelichotView
            season={selichotFile.season}
            slots={selichotFile.slots}
            minyanim={selichotList}
            query={query}
          />
        )}

        <Footer sources={prayerFile.sources} />
      </main>
    </div>
  );
}

function EmptyState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-line py-12 text-center">
      <Search className="size-8 text-faint" />
      <p className="m-0 text-muted">
        {query ? `לא נמצאו מניינים עבור "${query}".` : 'אין מניינים שתואמים את הסינון.'}
      </p>
      {query && (
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-[13px] font-medium text-accent underline underline-offset-2"
        >
          ניקוי חיפוש
        </button>
      )}
    </div>
  );
}

/** מחליף את באנר האזהרה הגורף — סופר בפועל כמה מניינים לא נכללו בעדכון האחרון */
function FreshnessNote({ prayers, sources }) {
  const stale = prayers.filter((p) => p.freshness === 'stale' || p.freshness === 'previous').length;
  if (!stale) return null;

  return (
    <p className="m-0 flex items-start gap-[11px] rounded-[8px] border border-line bg-surface px-[15px] py-[13px] text-[13px] leading-relaxed text-muted">
      <Info className="mt-[3px] size-4 shrink-0 text-faint" />
      <span>
        <b className="font-semibold text-ink-2">{stale} מניינים ברשימה לא נכללו בעדכון האחרון</b>{' '}
        של בת ים ({sources?.['בת ים']?.label}). הם מסומנים בתגית, והזמנים שלהם עשויים להיות לא מדויקים.
      </span>
    </p>
  );
}

function Footer({ sources }) {
  const format = (iso) =>
    iso ? new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return (
    <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-5 text-[12px] text-faint">
      <span className="inline-flex items-center gap-[5px]">
        <Clock className="size-[13px]" />
        חולון · עודכן {format(sources?.['חולון']?.updated)}
      </span>
      <span>
        בת ים · עודכן {format(sources?.['בת ים']?.updated)} ({sources?.['בת ים']?.label})
      </span>
      <span>זמני היום מ-Hebcal · מפה מ-OpenStreetMap</span>
    </footer>
  );
}
