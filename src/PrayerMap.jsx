import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Map as MapIcon, MapPin } from 'lucide-react';
import { getCoordinates, HOLON_CENTER } from './coordinates';
import 'leaflet/dist/leaflet.css';

// צבעים לפי סוג תפילה
const CATEGORY_COLORS = {
  shacharit: { bg: '#0ea5e9', border: '#0284c7', label: 'שחרית', text: 'white' },
  mincha: { bg: '#f97316', border: '#ea580c', label: 'מנחה', text: 'white' },
  arvit: { bg: '#7c3aed', border: '#6d28d9', label: 'ערבית', text: 'white' },
  mincha_arvit: { bg: '#eab308', border: '#ca8a04', label: 'מנחה+ערבית', text: '#1a1a1a' },
};

// יצירת אייקון מותאם אישית לכל marker
function createPrayerIcon(prayer) {
  const cat = prayer.subCategory === 'mincha_arvit'
    ? CATEGORY_COLORS.mincha_arvit
    : CATEGORY_COLORS[prayer.category] || CATEGORY_COLORS.shacharit;

  const label = prayer.subCategory === 'mincha_arvit' ? 'מנ+ער' :
    prayer.category === 'shacharit' ? 'שחרית' :
    prayer.category === 'mincha' ? 'מנחה' : 'ערבית';

  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <div style="
        background: ${cat.bg};
        border: 2px solid ${cat.border};
        border-radius: 12px;
        padding: 3px 8px;
        color: ${cat.text};
        font-weight: 900;
        font-size: 14px;
        font-family: system-ui, sans-serif;
        text-align: center;
        line-height: 1.2;
        white-space: nowrap;
        min-width: 48px;
      ">
        <div style="font-size: 15px; letter-spacing: 0.5px;">${prayer.actualTime}</div>
        <div style="font-size: 9px; font-weight: 600; opacity: 0.9;">${label}</div>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 8px solid ${cat.bg};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'prayer-marker',
    iconSize: [70, 52],
    iconAnchor: [35, 52],
    popupAnchor: [0, -48],
    tooltipAnchor: [0, -48],
  });
}

// התאמת המפה להציג את כל הסימונים בטעינה הראשונה
function FitAllMarkers({ prayers }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!fitted.current && prayers.length > 0) {
      const bounds = L.latLngBounds(prayers.map(p => getCoordinates(p.address)));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      fitted.current = true;
    }
  }, [prayers, map]);

  return null;
}

// קומפוננטה שמזיזה את המפה כשבוחרים מניין (רק לחיצת משתמש)
function FlyToSelected({ selectedPrayer }) {
  const map = useMap();
  const prevId = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevId.current = selectedPrayer?.id;
      return;
    }
    if (selectedPrayer && selectedPrayer.id !== prevId.current) {
      const coords = getCoordinates(selectedPrayer.address);
      map.flyTo(coords, 17, { duration: 0.8 });
      prevId.current = selectedPrayer.id;
    }
  }, [selectedPrayer, map]);

  return null;
}

// אייקון "אתה כאן"
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 2px 6px rgba(59,130,246,0.5));
    ">
      <div style="
        width: 18px;
        height: 18px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
      "></div>
    </div>
  `,
  className: 'user-location-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function PrayerMap({ prayers, selectedPrayer, onSelectPrayer, userLocation }) {
  return (
    <MapContainer
      center={userLocation || HOLON_CENTER}
      zoom={userLocation ? 15 : 14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitAllMarkers prayers={prayers} />
      <FlyToSelected selectedPrayer={selectedPrayer} />

      {/* סימון מיקום המשתמש + עיגול רדיוס */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userLocationIcon} zIndexOffset={2000}>
            <Tooltip direction="top" permanent={false}>
              <div style={{ direction: 'rtl', fontWeight: 700, fontSize: '13px' }}>📍 אתה כאן</div>
            </Tooltip>
          </Marker>
        </>
      )}

      {prayers.map((prayer) => {
        const coords = getCoordinates(prayer.address);
        const isSelected = selectedPrayer?.id === prayer.id;

        return (
          <Marker
            key={`marker-${prayer.id}`}
            position={coords}
            icon={createPrayerIcon(prayer)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectPrayer(prayer),
            }}
          >
            <Popup className="prayer-popup" maxWidth={280} minWidth={220}>
              <div style={{ direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: '8px', gap: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>
                      {prayer.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {prayer.address}
                    </div>
                  </div>
                  <div style={{
                    background: CATEGORY_COLORS[prayer.subCategory === 'mincha_arvit' ? 'mincha_arvit' : prayer.category]?.bg || '#3b82f6',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '18px',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    flexShrink: 0,
                  }}>
                    {prayer.actualTime}
                  </div>
                </div>

                {prayer.distance != null && (
                  <div style={{
                    fontSize: '12px', color: '#1d4ed8', background: '#eff6ff',
                    padding: '5px 8px', borderRadius: '6px', marginBottom: '8px',
                    fontWeight: 700, textAlign: 'center'
                  }}>
                    🚶 {Math.max(1, Math.round(prayer.distance / 80))} דק' הליכה
                  </div>
                )}

                {prayer.notes && (
                  <div style={{
                    fontSize: '12px', color: '#475569', background: '#f1f5f9',
                    padding: '5px 8px', borderRadius: '6px', marginBottom: '8px'
                  }}>
                    {prayer.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://waze.com/ul?q=${encodeURIComponent(prayer.address + ' חולון')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, background: '#e0f2fe', color: '#0369a1', padding: '7px 0',
                      borderRadius: '8px', textDecoration: 'none', fontWeight: 700,
                      fontSize: '13px', textAlign: 'center', display: 'block'
                    }}
                  >
                    Waze
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(prayer.address + ' חולון')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, background: '#d1fae5', color: '#047857', padding: '7px 0',
                      borderRadius: '8px', textDecoration: 'none', fontWeight: 700,
                      fontSize: '13px', textAlign: 'center', display: 'block'
                    }}
                  >
                    מפות
                  </a>
                </div>
              </div>
            </Popup>

            <Tooltip
              direction="top"
              offset={[0, -5]}
              permanent={false}
            >
              <div style={{ direction: 'rtl', fontWeight: 700, fontSize: '13px' }}>
                {prayer.name}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
