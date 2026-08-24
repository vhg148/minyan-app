import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCoordinates, HOLON_CENTER } from './coordinates';
import { CATEGORIES, categoryLabel, cityOf } from './lib/prayers';
import { countdownLabel } from './lib/format';
import 'leaflet/dist/leaflet.css';

// הסימונים הם הדבר היחיד על המפה שנושא צבע — האריחים מסוננים ב-index.css.
// הצבע נלקח מהטוקנים ולא מקודד כאן, כדי שגם הוא יתחלף במצב כהה.
function prayerIcon(prayer, selected) {
  const color = (CATEGORIES[prayer.category] || CATEGORIES.shacharit).color;
  const size = selected ? 20 : 13;
  const border = selected ? 3 : 2;
  const ring = selected ? 'box-shadow:0 0 0 1px rgb(0 0 0/.2),0 0 0 7px color-mix(in srgb,var(--ink) 12%,transparent);' : 'box-shadow:0 0 0 1px rgb(0 0 0/.16);';

  return L.divIcon({
    className: 'prayer-marker',
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid var(--surface);${ring}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 6],
    tooltipAnchor: [0, -(size / 2) - 4],
  });
}

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:var(--accent);border:2.5px solid var(--surface);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 55%,transparent),0 0 0 16px color-mix(in srgb,var(--accent) 10%,transparent);"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** מסגור ראשוני לכל הסימונים — פעם אחת, לא בכל שינוי ברשימה */
function FitAllMarkers({ points }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    fitted.current = true;
  }, [points, map]);

  return null;
}

/** מעוף אל המניין הנבחר ופתיחת ה-popup שלו */
function FlyToSelected({ selectedPrayer, markerRefs }) {
  const map = useMap();
  const prevId = useRef(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!selectedPrayer || selectedPrayer.id === prevId.current) return;
    prevId.current = selectedPrayer.id;

    // בטעינה כבר יש מניין נבחר (הראשון ברשימה) — לא עפים אליו ולא פותחים
    // עליו popup שיחסום חצי מפה לפני שהמשתמש ביקש משהו.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const marker = markerRefs.current.get(selectedPrayer.id);
    if (!marker) return;

    // פותחים קודם ואז עפים: הפופאפ נשאר מחובר לסימון לאורך התנועה, ו-keepInView
    // דואג שיישאר בתוך המפה בסופה. תלייה ב-moveend לא אמינה — הוא לא נורה
    // כשהמפה כבר נמצאת ביעד.
    marker.openPopup();
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.7 });
  }, [selectedPrayer, map, markerRefs]);

  return null;
}

export default function PrayerMap({ prayers, selectedPrayer, onSelectPrayer, userLocation }) {
  const markerRefs = useRef(new Map());

  // רק מניינים עם כתובת ממופה מגיעים למפה
  const mapped = prayers.filter((p) => p.onMap);
  const points = mapped.map((p) => getCoordinates(p.address, p.city));

  return (
    <MapContainer
      center={userLocation || HOLON_CENTER}
      zoom={userLocation ? 15 : 14}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitAllMarkers points={points} />
      <FlyToSelected selectedPrayer={selectedPrayer} markerRefs={markerRefs} />

      {userLocation && (
        <Marker position={userLocation} icon={userIcon} zIndexOffset={2000}>
          <Tooltip direction="top">אתה כאן</Tooltip>
        </Marker>
      )}

      {mapped.map((prayer) => {
        const selected = selectedPrayer?.id === prayer.id;
        return (
          <Marker
            key={prayer.id}
            position={getCoordinates(prayer.address, prayer.city)}
            icon={prayerIcon(prayer, selected)}
            zIndexOffset={selected ? 1000 : 0}
            ref={(instance) => {
              if (instance) markerRefs.current.set(prayer.id, instance);
              else markerRefs.current.delete(prayer.id);
            }}
            eventHandlers={{ click: () => onSelectPrayer(prayer) }}
          >
            <Popup closeButton={false} keepInView autoPanPadding={[20, 28]}>
              <PopupBody prayer={prayer} />
            </Popup>
            <Tooltip direction="top">{prayer.name}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function PopupBody({ prayer }) {
  const target = encodeURIComponent(`${prayer.address} ${cityOf(prayer)}`);
  const countdown = countdownLabel(prayer.minutesAway);
  const live = prayer.minutesAway !== null && prayer.minutesAway <= 0;

  return (
    <div dir="rtl" className="text-ink">
      <div className="flex items-baseline gap-2 px-[13px] pt-[11px] pb-[9px]">
        <span className="num text-[21px] leading-none font-bold tracking-[-0.02em]">
          {prayer.actualTime}
        </span>
        {countdown && (
          <span
            className={`ms-auto rounded-full border px-2 py-[2px] text-[11.5px] font-semibold ${
              live
                ? 'border-live-line bg-live-soft text-live'
                : 'border-accent-line bg-accent-soft text-accent-ink'
            }`}
          >
            {countdown}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-[2px] px-[13px] pb-[11px]">
        <b className="text-[14.5px] font-semibold">{prayer.name}</b>
        <span className="text-[12.5px] text-muted">
          {prayer.address}, {cityOf(prayer)} · {categoryLabel(prayer)}
        </span>
        {prayer.walkMinutes !== null && (
          <span className="text-[12.5px] font-medium text-ink-2">
            {prayer.walkMinutes} דקות הליכה
          </span>
        )}
        {prayer.notes && <span className="text-[12px] text-faint">{prayer.notes}</span>}
      </div>

      <div className="flex border-t border-line">
        <a
          href={`https://waze.com/ul?q=${target}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center py-2 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
        >
          Waze
        </a>
        <a
          href={`https://maps.google.com/?q=${target}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center border-s border-line py-2 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
        >
          מפות
        </a>
      </div>
    </div>
  );
}
