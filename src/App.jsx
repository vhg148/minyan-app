import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Search, Clock, MapPin, Sun, Sunset, Moon, Info, Calendar, Map, Navigation, LocateFixed } from 'lucide-react';
import { getCoordinates, BAT_YAM_CENTER } from './coordinates';
import prayerDataFile from './data/prayers.json';
const PrayerMap = lazy(() => import('./PrayerMap'));

// חישוב מרחק בין שתי נקודות (Haversine) - מחזיר מטרים
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// --- נתונים (Data) ---
const prayerData = prayerDataFile.prayers;
const dataLastUpdated = prayerDataFile.lastUpdated;
// Old data removed - now loaded from prayers.json
// --- פונקציית עזר לחישוב שעה דינמית ---
const getCalculatedTime = (prayer, zmanim) => {
  if (!prayer.zmanReference || !zmanim) return prayer.time;

  const refTimeStr = zmanim[prayer.zmanReference];
  if (!refTimeStr) return prayer.time;
  const [h, m] = refTimeStr.split(':').map(Number);
  let totalMins = h * 60 + m + (prayer.offset || 0);
  // טיפול במקרים שעוברים את שעות היממה
  if (totalMins < 0) totalMins += 24 * 60;

  const outH = Math.floor(totalMins / 60) % 24;
  const outM = totalMins % 60;
  return `${outH.toString().padStart(2, '0')}:${outM.toString().padStart(2, '0')}`;
};
// --- רכיבים (Components) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMapPrayer, setSelectedMapPrayer] = useState(null);
  const [zmanim, setZmanim] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
  const [cityFilter, setCityFilter] = useState('all'); // 'all' | 'חולון' | 'בת ים'
  // משיכת זמני היום ההלכתיים (API Hebcal לחולון)
  useEffect(() => {
    const fetchZmanim = async () => {
      try {
        // geonameid 294751 = Holon
        const res = await fetch('https://www.hebcal.com/zmanim?cfg=json&geonameid=294751');
        const data = await res.json();

        const formatTime = (isoString) => {
          if (!isoString) return '';
          const d = new Date(isoString);
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        };
        setZmanim({
          sunrise: formatTime(data.times.sunrise),
          chatzot: formatTime(data.times.chatzot),
          minchaGedola: formatTime(data.times.minchaGedola),
          plagHaMincha: formatTime(data.times.plagHaMincha),
          sunset: formatTime(data.times.sunset),
          tzeit: formatTime(data.times.tzeit7083deg) || formatTime(data.times.tzeit)
        });
      } catch (err) {
        console.error('Failed to fetch zmanim:', err);
        // זמני גיבוי למקרה שהאינטרנט או ה-API לא זמינים
        setZmanim({
          sunrise: '06:15', chatzot: '11:55', minchaGedola: '12:25',
          plagHaMincha: '16:45', sunset: '17:40', tzeit: '18:15'
        });
      }
    };
    fetchZmanim();
  }, []);
  // עדכון שעון פנימי
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // בקשת מיקום מהמשתמש
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // חישוב רשימת התפילות עם השעות המעודכנות והמרחק מהעכשיו
  const upcomingPrayersList = useMemo(() => {
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    return prayerData
      .map(prayer => {
        const actualTime = getCalculatedTime(prayer, zmanim);

        // אם עדיין לא נטען זמן וזה טקסט, נתעלם זמנית במיון
        if (actualTime.includes('נץ') || actualTime.includes('פלג') || actualTime.includes('שקיעה')) {
          return { ...prayer, diff: 9999, actualTime };
        }
        const [ph, pm] = actualTime.split(':').map(Number);
        if (isNaN(ph) || isNaN(pm)) return { ...prayer, diff: 9999, actualTime };
        let mins = ph * 60 + pm;
        let diff = mins - currentTotalMinutes;

        // נותן "חסד" של 15 דקות לתפילות שכבר התחילו, מעבר לזה מעביר למחר
        if (diff < -15) diff += 24 * 60;

        // חישוב מרחק מהמשתמש
        let distance = null;
        if (userLocation) {
          const coords = getCoordinates(prayer.address, prayer.city);
          distance = haversineDistance(userLocation[0], userLocation[1], coords[0], coords[1]);
        }

        return { ...prayer, diff, actualTime, distance };
      })
      .filter(p => p.diff !== 9999) // להציג רק תפילות שחושבו בהצלחה
      .filter(p => cityFilter === 'all' || (p.city || 'חולון') === cityFilter)
      .sort((a, b) => a.diff - b.diff);
  }, [currentTime, zmanim, userLocation, cityFilter]);
  // בחירת ברירת מחדל למפה (התפילה הקרובה ביותר) מופעלת פעם אחת
  useEffect(() => {
    if (!selectedMapPrayer && upcomingPrayersList.length > 0) {
      setSelectedMapPrayer(upcomingPrayersList[0]);
    }
  }, [upcomingPrayersList, selectedMapPrayer]);
  // רשימת תפילות מסוננת עבור שאר הלשוניות
  const filteredPrayers = useMemo(() => {
    return prayerData.map(prayer => ({
      ...prayer, actualTime: getCalculatedTime(prayer, zmanim)
    })).filter(prayer => {
      const matchesTab = prayer.category === activeTab;
      const prayerCity = prayer.city || 'חולון';
      const matchesCity = cityFilter === 'all' || prayerCity === cityFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        prayer.name.toLowerCase().includes(searchLower) ||
        prayer.address.toLowerCase().includes(searchLower) ||
        prayer.actualTime.includes(searchLower) ||
        prayer.time.includes(searchLower) ||
        prayerCity.includes(searchLower);

      return matchesTab && matchesCity && matchesSearch;
    });
  }, [activeTab, searchQuery, zmanim, cityFilter]);
  const tabs = [
    { id: 'upcoming', label: 'קרובות ומפה', icon: <Map className="w-5 h-5 ml-2" /> },
    { id: 'shacharit', label: 'שחרית', icon: <Sun className="w-5 h-5 ml-2" /> },
    { id: 'mincha', label: 'מנחה', icon: <Sunset className="w-5 h-5 ml-2" /> },
    { id: 'arvit', label: 'ערבית', icon: <Moon className="w-5 h-5 ml-2" /> }
  ];
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 ml-3" />
            <h1 className="text-2xl font-bold">זמני תפילות - חולון ובת ים</h1>
          </div>
          <div className="bg-blue-700 rounded-full px-4 py-1.5 text-sm flex items-center shadow-inner font-medium">
            <Clock className="w-4 h-4 ml-2" />
            שעה נוכחית: {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-5">

        {/* התראה: זמני בת ים לא מעודכנים */}
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl p-3 text-center text-sm font-medium">
          ⚠️ זמני בת ים טרם עודכנו לשעון קיץ — יתכנו אי-דיוקים
        </div>

        {/* תאריך עדכון אחרון */}
        {dataLastUpdated && (
          <div className="text-center text-xs text-slate-400">
            זמנים עודכנו: {new Date(dataLastUpdated).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* סרגל זמני היום (Zmanim) */}
        {zmanim ? (
          <div className="bg-gradient-to-r from-blue-900 to-sky-800 text-white p-3 rounded-xl shadow-md flex justify-between items-center overflow-x-auto hide-scrollbar gap-5 border border-sky-900">
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">נץ החמה</span>
              <span className="font-bold text-lg">{zmanim.sunrise}</span>
            </div>
            <div className="w-px h-8 bg-sky-700/50"></div>
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">חצות היום</span>
              <span className="font-bold text-lg">{zmanim.chatzot}</span>
            </div>
            <div className="w-px h-8 bg-sky-700/50"></div>
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">מנחה גדולה</span>
              <span className="font-bold text-lg">{zmanim.minchaGedola}</span>
            </div>
            <div className="w-px h-8 bg-sky-700/50"></div>
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">פלג המנחה</span>
              <span className="font-bold text-lg">{zmanim.plagHaMincha}</span>
            </div>
            <div className="w-px h-8 bg-sky-700/50"></div>
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">שקיעה</span>
              <span className="font-bold text-lg">{zmanim.sunset}</span>
            </div>
            <div className="w-px h-8 bg-sky-700/50"></div>
            <div className="flex flex-col items-center min-w-max text-center">
              <span className="text-xs text-sky-200 font-medium tracking-wide">צאת כוכבים</span>
              <span className="font-bold text-lg">{zmanim.tzeit}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm text-center text-sm text-slate-500 border border-slate-200 animate-pulse">
            טוען את זמני היום (הלכה)...
          </div>
        )}
        {/* חיפוש + מיקום */}
        <div className="flex gap-2 z-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
              placeholder="חיפוש לפי שעה, כתובת, או שם מניין..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={requestLocation}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all border whitespace-nowrap ${
              locationStatus === 'granted'
                ? 'bg-blue-600 text-white border-blue-700'
                : locationStatus === 'loading'
                ? 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse'
                : locationStatus === 'denied'
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <LocateFixed className="w-5 h-5" />
            {locationStatus === 'granted' ? 'מיקום פעיל' :
             locationStatus === 'loading' ? 'מאתר...' :
             locationStatus === 'denied' ? 'נדחה' : 'מיקום'}
          </button>
        </div>

        {/* סינון עיר */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'הכל' },
            { id: 'חולון', label: 'חולון' },
            { id: 'בת ים', label: 'בת ים' }
          ].map(city => (
            <button
              key={city.id}
              onClick={() => setCityFilter(city.id)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all border ${
                cityFilter === city.id
                  ? city.id === 'בת ים'
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                    : city.id === 'חולון'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                    : 'bg-slate-800 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>

        {/* טאבים (לשוניות ניווט) */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-reverse space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex-shrink-0 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* --- תצוגת מפה וקרובים (המסך הראשי) --- */}
        {activeTab === 'upcoming' && searchQuery === '' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200">
            {/* מפה — למעלה במובייל, בצד שמאל בדסקטופ */}
            <div className="flex flex-col md:flex-row md:h-[600px]">

            {/* רשימת תפילות — למטה במובייל, בצד ימין בדסקטופ */}
            <div className="w-full md:w-2/5 lg:w-1/3 overflow-y-auto bg-slate-50 p-3 md:p-4 hide-scrollbar border-l border-slate-200 order-2 md:order-none relative md:max-h-full">
              <h3 className="font-bold text-base md:text-lg text-slate-800 mb-2 md:mb-4 sticky top-0 bg-slate-50 py-2 border-b border-slate-200 z-10 flex items-center md:block">
                <Clock className="w-5 h-5 ml-2 text-blue-600 inline" />
                התפילות הבאות
              </h3>
              <div className="space-y-2 md:space-y-3 pb-4">
                {upcomingPrayersList.map(prayer => {
                  const isSelected = selectedMapPrayer?.id === prayer.id;
                  return (
                    <div
                      key={`up-${prayer.id}`}
                      onClick={() => setSelectedMapPrayer(prayer)}
                      className={`p-2.5 md:p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 shadow-md'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-xl md:text-2xl ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {prayer.actualTime}
                          </span>
                          <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded-md text-slate-600 shadow-sm border border-slate-100">
                            {prayer.subCategory === 'mincha_arvit' ? 'מנחה+ערבית' :
                             prayer.category === 'shacharit' ? 'שחרית' :
                             prayer.category === 'mincha' ? 'מנחה' : 'ערבית'}
                          </span>
                          {prayer.diff <= 0 && prayer.diff > -15 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                              לפני {Math.abs(prayer.diff)} דק'
                            </span>
                          )}
                          {prayer.diff > 0 && prayer.diff < 60 && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
                              בעוד {prayer.diff} דק'
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-bold text-slate-700 text-sm">{prayer.name}</span>
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                          prayer.city === 'בת ים'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {prayer.city || 'חולון'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 ml-1 text-slate-400 flex-shrink-0" /> {prayer.address}
                        {prayer.distance != null && (
                          <span className="text-blue-600 font-bold mr-2">· {Math.max(1, Math.round(prayer.distance / 80))} דק' הליכה</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* מפה — למעלה במובייל, בצד שמאל בדסקטופ */}
            <div className="w-full md:w-3/5 lg:w-2/3 h-[200px] md:h-full relative bg-slate-200 order-1 md:order-none">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500">טוען מפה...</div>}>
                <PrayerMap
                  prayers={upcomingPrayersList.slice(0, 30)}
                  selectedPrayer={selectedMapPrayer}
                  onSelectPrayer={setSelectedMapPrayer}
                  userLocation={userLocation}
                />
              </Suspense>
            </div>

            </div>
          </div>
        )}
        {/* --- תצוגת רשימה קלאסית לשאר הלשוניות (או בזמן חיפוש) --- */}
        {(activeTab !== 'upcoming' || searchQuery !== '') && (
          <>
            <div className="text-sm text-slate-500 flex items-center">
              <Info className="w-4 h-4 ml-1" />
              מציג {activeTab === 'upcoming' ? upcomingPrayersList.filter(p => p.name.includes(searchQuery) || p.address.includes(searchQuery)).length : filteredPrayers.length} מניינים
            </div>
            {filteredPrayers.length > 0 || (activeTab === 'upcoming' && searchQuery) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'upcoming' ? upcomingPrayersList.filter(p => p.name.includes(searchQuery) || p.address.includes(searchQuery)) : filteredPrayers).map((prayer) => (
                  <div
                    key={prayer.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between"
                  >
                    <div className={`absolute top-0 right-0 w-2 h-full ${
                      prayer.category === 'shacharit' ? 'bg-sky-400' :
                      prayer.category === 'mincha' ? 'bg-orange-400' :
                      prayer.category === 'arvit' ? 'bg-indigo-600' : 'bg-teal-500'
                    }`}></div>

                    <div className="pr-3 mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">{prayer.actualTime}</h3>
                          {prayer.zmanReference && (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                              {prayer.time}
                            </span>
                          )}
                        </div>
                        {prayer.subCategory === 'mincha_arvit' && (
                          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                            מנחה וערבית רצוף
                          </span>
                        )}
                        {activeTab === 'upcoming' && !prayer.subCategory && (
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                            {prayer.category === 'shacharit' ? 'שחרית' : prayer.category === 'mincha' ? 'מנחה' : 'ערבית'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-slate-700">{prayer.name}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                          prayer.city === 'בת ים'
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {prayer.city || 'חולון'}
                        </span>
                      </div>

                      <div className="flex items-center text-slate-500 text-sm mb-3 font-medium">
                        <MapPin className="w-4 h-4 ml-1 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{prayer.address}</span>
                      </div>
                      {prayer.notes && (
                        <div className="bg-slate-50 text-slate-600 text-xs p-2 rounded-md border border-slate-100 inline-block w-full">
                          {prayer.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 pr-3">
                      <a href={`https://waze.com/ul?q=${encodeURIComponent(prayer.address + ' ' + (prayer.city || 'חולון'))}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center transition-colors">
                        <Navigation className="w-3.5 h-3.5 ml-1" /> Waze
                      </a>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(prayer.address + ' ' + (prayer.city || 'חולון'))}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center transition-colors">
                        <Map className="w-3.5 h-3.5 ml-1" /> מפות
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-lg">לא נמצאו מניינים התואמים את החיפוש שלך.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                >
                  נקה חיפוש
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* CSS להסתרת פסי גלילה בסרגל העליון */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
