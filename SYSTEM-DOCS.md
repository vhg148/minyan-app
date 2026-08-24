# מערכת מניין 148 - תיעוד מערכת מלא

> תאריך עדכון אחרון: 2026-08-24

---

## תוכן עניינים

1. [סקירה כללית](#1-סקירה-כללית)
2. [ארכיטקטורת המערכת](#2-ארכיטקטורת-המערכת)
3. [מבנה הקבצים](#3-מבנה-הקבצים)
4. [תהליך הבנייה (Build Pipeline)](#4-תהליך-הבנייה-build-pipeline)
5. [זרימת נתונים (Data Flow)](#5-זרימת-נתונים-data-flow)
6. [רכיבי המערכת (Components)](#6-רכיבי-המערכת-components)
7. [ממשקי API חיצוניים](#7-ממשקי-api-חיצוניים)
8. [ניהול State](#8-ניהול-state)
9. [יומן שינויים (Changelog Template)](#9-יומן-שינויים-changelog-template)
10. [אפשרויות סקיילביליות](#10-אפשרויות-סקיילביליות)
11. [בעיות ידועות ושיפורים עתידיים](#11-בעיות-ידועות-ושיפורים-עתידיים)

---

## 1. סקירה כללית

**שם הפרויקט:** מניין 148 (minyan-app)
**מטרה:** אפליקציית ווב למציאת זמני תפילות במניינים בעיר חולון, כולל מפה אינטראקטיבית, חיפוש, מיקום GPS, וזמנים הלכתיים דינמיים.
**קהל יעד:** תושבי חולון המחפשים מניינים קרובים
**כתובת פרודקשן:** `https://<username>.github.io/minyan-app/`

### מספרים עיקריים
| נתון | ערך |
|------|-----|
| תפילות קבע (`prayers.json`) | **378 רשומות** — 244 חולון, 134 בת ים |
| שחרית / מנחה / ערבית | 178 / 111 / 89 |
| מנייני סליחות (`selichot.json`) | **93 רשומות** — חולון בלבד, עונתי |
| משבצות זמן לסליחות | 22 שעות, מקובצות ל-6 חלקי יום |
| מניינים ללא כתובת | 17 רשומות ב-7 בתי כנסת (בת ים) |
| כתובות ייחודיות (coordinates) | **177 כתובות** |
| קבצי קוד | 16 (App + 7 components + 5 lib + hook + map + coordinates) |

**מקורות הנתונים:** לכל עיר תאריך עדכון משלה, נשמר ב-`prayers.json` תחת `sources`.
חולון — 29/03/2026. בת ים — 16/08/2026 (בולטין פרשת כי תצא, שעון קיץ).

---

## 2. ארכיטקטורת המערכת

### Technology Stack

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
├──────────────────────────────────────────────────────┤
│  React 19.2        │  UI Framework                   │
│  Vite 8.0          │  Build Tool & Dev Server         │
│  Tailwind CSS 4.2  │  Utility-First CSS               │
│  Leaflet 1.9       │  Interactive Maps                │
│  react-leaflet 5.0 │  React Bindings for Leaflet      │
│  Lucide React 1.6  │  Icon Library                    │
├──────────────────────────────────────────────────────┤
│                   EXTERNAL APIs                      │
├──────────────────────────────────────────────────────┤
│  Hebcal Zmanim API │  זמני היום ההלכתיים (sunrise,   │
│                    │  sunset, plag, tzeit, etc.)      │
│  OpenStreetMap     │  Map Tiles                       │
│  Browser Geolocation│ User Location (GPS)             │
│  Waze / Google Maps│  Navigation Links                │
├──────────────────────────────────────────────────────┤
│                   DEPLOYMENT                         │
├──────────────────────────────────────────────────────┤
│  GitHub Actions    │  CI/CD Pipeline                  │
│  GitHub Pages      │  Static Hosting                  │
└──────────────────────────────────────────────────────┘
```

### תרשים ארכיטקטורה

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼──┐  ┌─────▼─────┐  ┌──▼──────────┐
      │ Geoloc.  │  │  Hebcal   │  │ OpenStreet   │
      │   API    │  │  Zmanim   │  │   Map Tiles  │
      └───────┬──┘  └─────┬─────┘  └──┬──────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │   App.jsx   │
                    │  (State Hub)│
                    └──┬──────┬──┘
                       │      │
              ┌────────▼┐  ┌──▼─────────┐
              │PrayerMap │  │ Prayer Cards│
              │ (Leaflet)│  │  (Grid/List)│
              └─────────┘  └────────────┘
```

---

## 3. מבנה הקבצים

```
מניין148/
├── .claude/
│   └── launch.json              # הגדרות dev server ל-Claude
├── minyan-app/                  # ← שורש הרפו
│   ├── README.md
│   ├── SYSTEM-DOCS.md           # ← אתה כאן
│   ├── docs/design-sketch.html  # סקיצת העיצוב שאושרה לפני המימוש
│   ├── .github/workflows/deploy.yml
│   ├── public/
│   ├── src/
│   │   ├── App.jsx              # ★ state hub + פריסה בלבד (~290 שורות)
│   │   ├── PrayerMap.jsx        # ★ מפת Leaflet — סימונים, popup, מעוף לנבחר
│   │   ├── coordinates.js       # ★ כתובת → [lat,lng] + hasCoordinates()
│   │   ├── data/
│   │   │   ├── prayers.json     # תפילות קבע + sources + freshness
│   │   │   └── selichot.json    # ★ עונתי: season, slots, minyanim
│   │   ├── lib/
│   │   │   ├── zmanim.js        # Hebcal fetch + חישוב שעה יחסית לזמן הלכתי
│   │   │   ├── prayers.js       # ★ כל הגזירה: resolve, סינון, מיון, pickHighlight
│   │   │   ├── geo.js           # haversine + דקות הליכה
│   │   │   ├── season.js        # isSelichotSeason — קורא את החלון מה-JSON
│   │   │   └── format.js        # ניסוח ספירה לאחור
│   │   ├── components/
│   │   │   ├── Header.jsx       # מותג, שעון, מתג ערכת נושא
│   │   │   ├── ZmanimBar.jsx    # 9 זמני היום, הבא מסומן באקסנט
│   │   │   ├── Toolbar.jsx      # SearchRow + Tabs + Chips
│   │   │   ├── NowCard.jsx      # הכרטיס העליון — הקרוב שאפשר להספיק
│   │   │   ├── PrayerRow.jsx    # שורת ספר-חשבונות (רשימת הקרובות)
│   │   │   ├── PrayerCard.jsx   # כרטיס לרשת של טאב קטגוריה
│   │   │   ├── SelichotView.jsx # ★ מסך הסליחות, מקובץ לפי חלק יום
│   │   │   └── Tag.jsx          # תגיות סטטוס + נקודת קטגוריה
│   │   ├── hooks/useTheme.js    # system / light / dark + localStorage
│   │   ├── styles/tokens.css    # ★ מערכת הטוקנים + @theme של Tailwind
│   │   ├── main.jsx
│   │   └── index.css            # בסיס + עקיפות Leaflet
│   ├── index.html               # כולל טעינת פונט וסקריפט מניעת הבזק
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
└── SYSTEM-DOCS.md               # ← אתה כאן
```

---

### לינט — למה `react/jsx-no-undef` חייב להיות שם

ESLint לא יוצר reference לרכיב בתוך JSX, ולכן `no-undef` **לא רואה**
`<Foo />` בכלל. רכיב שלא יובא עובר גם לינט וגם build ומתפוצץ רק בדפדפן —
זה קרה בפועל בסבב 15 (`Info` הוסר מהיבוא ונשאר בשימוש). `eslint-plugin-react`
נוסף עם שני כללים בלבד: `jsx-no-undef` תופס את המקרה, ו-`jsx-uses-vars`
מונע מ-`no-unused-vars` לסמן כל רכיב מיובא כמיותר.

---

## 4. תהליך הבנייה (Build Pipeline)

### פיתוח מקומי (Local Dev)

```
npm run dev
    │
    ▼
Vite Dev Server (port 5173)
    │
    ├── Hot Module Replacement (HMR)
    ├── React Fast Refresh
    ├── Tailwind CSS JIT compilation
    └── ES Module imports (no bundling)
```

**פקודות:**
| פקודה | תיאור |
|-------|--------|
| `npm run dev` | שרת פיתוח עם HMR על פורט 5173 |
| `npm run build` | בנייה לפרודקשן → תיקיית `dist/` |
| `npm run preview` | תצוגה מקדימה של הבילד |
| `npm run lint` | בדיקת ESLint |

### תהליך CI/CD (Production Build)

```
┌──────────────────┐
│   Push to main   │──── או ──── Manual Trigger
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│              GitHub Actions Workflow               │
│                                                    │
│  Job 1: BUILD                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Checkout repo                             │  │
│  │ 2. Setup Node.js 20                          │  │
│  │ 3. npm ci (install from lockfile)            │  │
│  │ 4. npm run build                             │  │
│  │    ├── Vite bundles React + Tailwind         │  │
│  │    ├── Tree-shaking unused code              │  │
│  │    ├── CSS minification                      │  │
│  │    ├── JS minification + code splitting      │  │
│  │    └── Output → dist/                        │  │
│  │ 5. Upload dist/ as artifact                  │  │
│  └──────────────────────────────────────────────┘  │
│                      │                              │
│                      ▼                              │
│  Job 2: DEPLOY (needs: build)                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Download artifact                         │  │
│  │ 2. Deploy to GitHub Pages                    │  │
│  │    └── URL: <user>.github.io/minyan-app/     │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Vite Build Configuration

```js
// vite.config.js
{
  base: '/minyan-app/',     // נתיב בסיס ב-GitHub Pages
  plugins: [
    react(),                // React + Oxc parser
    tailwindcss()           // Tailwind CSS v4 JIT
  ]
}
```

**מה קורה ב-Build:**
1. **JSX → JS**: Vite + React plugin מתרגמים JSX ל-JS רגיל
2. **Tailwind CSS**: סורק את כל הקבצים, מייצר רק CSS שבשימוש
3. **Code Splitting**: `PrayerMap.jsx` נטען ב-lazy loading (`React.lazy`)
4. **Tree Shaking**: קוד לא בשימוש מ-lucide-react ו-leaflet מוסר
5. **Minification**: JS ו-CSS דחוסים לגודל מינימלי
6. **Asset Hashing**: קבצים מקבלים hash לניהול cache

---

## 5. זרימת נתונים (Data Flow)

### אתחול האפליקציה (App Boot)

```
1. main.jsx renders <App />
         │
2. App מפעיל useEffect:
         ├── fetchZmanim() → Hebcal API
         │     │
         │     ├── הצלחה → setZmanim({sunrise, chatzot, ...})
         │     └── כישלון → setZmanim(fallback values)
         │
         └── setInterval → עדכון currentTime כל 60 שניות

3. useMemo: upcomingPrayersList מחושב מ:
         ├── prayerData (248 רשומות סטטיות)
         ├── zmanim (זמנים מ-API)
         ├── currentTime (שעה נוכחית)
         └── userLocation (GPS, אם ניתן)

4. ברירת מחדל: selectedMapPrayer = התפילה הקרובה ביותר
```

### זרימת נתוני מניין בודד

```
prayerData[i]
    │
    ├── time: "06:00"       ← שעה קבועה
    │   או
    ├── zmanReference: "sunrise" + offset: 0  ← שעה דינמית
    │
    ▼
getCalculatedTime(prayer, zmanim)
    │
    ├── אם time קבוע → מחזיר כמו שזה
    └── אם zmanReference → מחשב: zmanim[ref] + offset (דקות)
         │
         ▼
    actualTime = "05:47" (לדוגמה)
         │
         ├── diff = actualTime - currentTime (בדקות)
         │   └── אם diff < -45 → מוסיף 24*60 (למחר)
         │
         ├── distance = haversine(userLocation, prayerCoords) (מטרים)
         │
         └── מוצג בכרטיס + על המפה
```

### סוגי זמנים

| סוג | דוגמה | חישוב |
|-----|--------|-------|
| קבוע | `time: "06:00"` | מוצג ישירות |
| נץ החמה | `zmanReference: "sunrise", offset: 0` | `zmanim.sunrise + 0` |
| פלג המנחה | `zmanReference: "plagHaMincha", offset: -25` | `zmanim.plagHaMincha - 25 דקות` |
| שקיעה | `zmanReference: "sunset", offset: -20` | `zmanim.sunset - 20 דקות` |

---

## 6. רכיבי המערכת (Components)

### App.jsx — state hub

מחזיק state ופריסה בלבד. כל חישוב יושב ב-`lib/`, כל תצוגה ב-`components/`.

**State:**
| State | Type | תיאור |
|-------|------|--------|
| `activeTab` | `string` | upcoming / selichot / shacharit / mincha / arvit |
| `query` | `string` | טקסט חיפוש |
| `currentTime` | `Date` | שעון פנימי, מתעדכן כל 30 שניות |
| `zmanim` | `object\|null` | 9 זמני היום מ-Hebcal (או FALLBACK_ZMANIM) |
| `selectedId` | `id\|null` | **מזהה** המניין הנבחר — לא האובייקט |
| `userLocation` | `[lat,lng]\|null` | מיקום GPS |
| `locationStatus` | `string` | idle / loading / granted / denied |
| `cityFilter` | `string` | all / חולון / בת ים |
| `includeSelichot` | `boolean` | האם הסליחות משתתפות ברשימת הקרובות |
| `nearbyOnly` | `boolean` | סינון לעד 10 דק' הליכה |

> **למה `selectedId` ולא אובייקט:** הבחירה נגזרת ב-`useMemo` מתוך הרשימה
> המסוננת. כשהמניין הנבחר יוצא מהרשימה — סינון, חיפוש או פשוט מעבר הזמן —
> הבחירה נופלת חזרה לראשון מעצמה, בלי אפקט סנכרון ובלי רינדור מדורג.

### Header.jsx — כותרת

מותג, שעון, מתג ערכת נושא, ושורת ההקדשה: *לעילוי נשמת נתן מסיקה נטושו יום
טוב בן ג׳מילה*. השורה מוגדרת ב-`text-faint` (4.81:1 בבהיר, 4.92:1 בכהה),
נקראת במלואה ולא נחתכת בשום רוחב.

**`--app-header-h`:** `App.jsx` מודד את הכותרת הדביקה ב-`ResizeObserver`
ומפרסם את גובהה כמשתנה CSS. כותרות המשבצות ב-`SelichotView` נדבקות לפיו
במקום למספר קבוע — קודם הן היו מוגדרות ל-60px ונחבאו מאחורי כותרת של 131px.

### שדה `pairing` — הצמדת מנחה וערבית

מניין שמצמיד מנחה וערבית הוא מידע שקובע החלטה: אפשר לתפוס את שתיהן
בנסיעה אחת. לכן הוא תגית נראית ולא הערה.

| ערך | משמעות | תווית |
|-----|---------|--------|
| `consecutive` | תפילה אחת רצופה, בלי הפסקה | מנחה וערבית ברצף |
| `adjacent` | ערבית מיד אחרי, בהפרש קצר | ערבית בסמוך |

> **קודם זה היה מיוצג בשלוש דרכים:** `subCategory: 'mincha_arvit'` על 6
> רשומות, הערה "מנחה וערבית ברצף" על אחת, והערה "ערבית בסמוך" על חמש.
> שלושתן אוחדו לשדה אחד. `subCategory` הוסר לגמרי.
>
> **והתגית לא נראתה בפועל:** ב-`PrayerRow` היא רונדרה בתוך
> `hidden sm:block min-[960px]:hidden` — כלומר רק בחלון 640–959px, ונעלמה
> גם במובייל וגם בתצוגת הפיצול. עכשיו היא יושבת בשורה משלה בתוך השורה,
> כי ליד השם היא מעכה אותו וּבשורת הפרטים היא חתכה את הכתובת.

### lib/prayers.js — הגזירה

| פונקציה | תפקיד |
|----------|--------|
| `resolvePrayer` | משלים actualTime, minutesAway, distance, walkMinutes, onMap |
| `buildUpcoming` | מסנן לפי יום/עיר/מרחק וממיין לפי קרבה בזמן |
| `pickHighlight` | בוחר לכרטיס העליון את הקרוב ביותר שעוד **אפשר להספיק** ברגל |
| `normalizeSelichot` | נותן למניין סליחות את אותה צורה כמו לתפילת קבע |
| `runsToday` | מכבד את השדה `days` (מניין שמתקיים רק בימים מסוימים) |

**חסד של 15 דקות:** מניין שהתחיל לפני פחות מזה עדיין מוצג, מסומן "התחיל לפני N דק׳".
מעבר לזה הוא נדחף למחר.

### SelichotView.jsx — המסך העונתי

93 מניינים ב-22 שעות, מקובצים ל-6 חלקי יום (`night`, `dawn`, `morning`,
`midday`, `afternoon`, `evening`) עם כותרות דביקות. הטאב נוצר רק כאשר
`isSelichotSeason()` מחזירה true — החלון עצמו יושב ב-`selichot.json`,
כך שהעונה נסגרת בלי שינוי קוד.

### SplitView.jsx — התצוגה היחידה

רשימה מימין, מפה משמאל. משמשת את **כל** הטאבים שמציגים מניינים —
קרובות, שחרית, מנחה וערבית. קודם רק "קרובות" קיבלה אותה ושאר הטאבים
הציגו רשת כרטיסים (`PrayerCard`) שלא אפשרה לראות איפה המניינים יושבים;
הרכיב הזה הוסר. הסליחות שומרות על התצוגה המקובצת שלהן, כי שם השאלה
היא "מה יש לפנות בוקר" ולא "מה קרוב אליי".

**קיבוע במובייל:** המפה דביקה מתחת לכותרת האפליקציה והרשימה נגללת
מתחתיה, אחרת היא נגללת החוצה בדיוק כשמשווים בין מניינים. בדסקטופ היא
ממילא תמיד בתצוגה ונשארת רגילה.

> `overflow-hidden` על מכולת הפיצול הופך אותה למכל גלילה ומנטרל sticky
> בתוכה — הוא מוגבל ל-`min-[960px]`, והפינות העליונות נחתכות על חלונית
> המפה עצמה. הכותרת הדביקה של הרשימה בוטלה במובייל: מתחת לכותרת
> האפליקציה ולמפה אין מקום לרהיט דביק שלישי.

**חיפוש במובייל:** כשיש טקסט בחיפוש, הרשימה עולה מעל המפה והמפה
מוותרת על הקיבוע. הכרטיס העליון נעלם לגמרי — הוא עונה על "מה הכי קרוב
עכשיו", לא על מה שחיפשת.

> **הבאג שזה תיקן:** במובייל התוצאה הראשונה ישבה ב-y=908 על מסך בגובה
> 812 — 161px מתחת לקיפול. הסינון עבד מושלם, אבל המשתמש הקליד ולא ראה
> שום שינוי, כי הכרטיס העליון (~200px) והמפה (280px) דחפו את התוצאות
> מהמסך. בדסקטופ הרשימה יושבת לצד המפה ולכן שם זה נראה תקין —
> מה שהוביל לאבחון שגוי של "בעיית cache". אחרי התיקון: y=397.

### PrayerMap.jsx — מפה

| רכיב | תפקיד |
|-------|--------|
| `prayerIcon` | נקודה צבעונית לפי קטגוריה, מוגדלת כשנבחרה |
| `ViewController` | מאחד מסגור ומעוף — הם מזיזים את אותה מפה ויכולים להילחם |
| `PopupBody` | popup בשפה העיצובית — שעה, ספירה לאחור, מרחק, ניווט |

**אריחים מסוננים** (`.leaflet-tile-pane { filter: var(--tile-filter) }`):
`saturate(.18)` ביום, `invert(1) hue-rotate(180deg)` בלילה — מפה כהה אמיתית
מאותם אריחי OpenStreetMap חינמיים. הסימונים הם היחידים שנושאים צבע.

**שני באגים שתוקנו כשהמפה הפכה משותפת לכל הטאבים:**
> המפה נשארת מותקנת בין טאבים, ו-`fitBounds` רץ פעם אחת בלבד — התצוגה
> נתקעה על הטאב הקודם. עכשיו `fitKey` (הטאב הפעיל) מפעיל מסגור מחדש,
> ומאפס את מזהה הבחירה כדי שהמסגור לא ייבלע מיד במעוף אל מניין בודד.
>
> Leaflet מודד את המכולה פעם אחת. כאן היא נולדת לפעמים ברוחב 0 (המפה
> נטענת ב-Suspense לפני שהפריסה התייצבה), ואז `fitBounds` מול גודל 0
> מחזיר זום אינסופי שנחתך ל-`maxZoom` — בפועל חצי מהסימונים יצאו מהמסך.
> `ResizeObserver` קורא ל-`invalidateSize`, והמסגור ממתין למידות אמיתיות
> לפני שהוא רץ. הזום ירד מ-15 (חתוך) ל-14 (מחושב), ו-37 מתוך 40 סימונים
> נכנסים לתצוגה במקום 17.

> **אל תסתמכו על `ResizeObserver` לבדו.** הוא לא נורה בכל סביבה (בפריוויו
> של Claude Code, למשל, גם לא הקריאה הראשונית שהתקן מחייב). המסגור מנסה
> שוב בכל פריים עד שלמכולה יש מידות, ו-RO משמש רק לרענון מאוחר.

**תקרה:** עד 40 סימונים על המפה (Leaflet מאט עם מאות). הרשימה מציגה הכל,
והמספר מוצג למשתמש כדי שהחיתוך לא ייראה כמו כיסוי מלא.

### styles/tokens.css — מערכת הצבע

שלושה מצבים: `:root` (בהיר), `@media (prefers-color-scheme: dark)` מוגן
ב-`:root:not([data-theme='light'])`, ו-`:root[data-theme='dark']` לבחירה
מפורשת. הטוקנים נחשפים כ-utilities של Tailwind דרך `@theme inline`, כך
שאין ערך צבע ישיר באף קומפוננטה.

**רצפת ניגודיות:** כל טוקן טקסט עובר 4.5:1 מול `--paper` ומול `--surface`
בשתי הערכות. הנמוך ביותר הוא `--faint` — 4.81 בבהיר, 4.92 בכהה.

### coordinates.js

| פונקציה | תפקיד |
|----------|--------|
| `findCoordinates(address)` | התאמה מדויקת → חלקית → `null` |
| `hasCoordinates(address)` | קובע אם המניין מגיע למפה |
| `getCoordinates(address, city)` | מיקום לתצוגה; ללא התאמה — מרכז העיר עם פיזור דטרמיניסטי |

> **באג שתוקן:** כתובת ריקה החזירה את הרשומה הראשונה בטבלה, כי
> `key.includes('')` תמיד אמת. `findCoordinates` חוסמת מחרוזת ריקה מראש.
> הפיזור גם הפך מ-`Math.random()` ל-hash של הכתובת, כדי שסימונים לא יקפצו
> בכל רינדור.

---

## 7. ממשקי API חיצוניים

### Hebcal Zmanim API

```
GET https://www.hebcal.com/zmanim?cfg=json&geonameid=294751
```

- **geonameid 294751** = חולון, ישראל
- **Response:** ISO timestamp עבור כל זמן הלכתי
- **שדות בשימוש:** sunrise, chatzot, minchaGedola, plagHaMincha, sunset, tzeit7083deg/tzeit
- **Fallback values:** sunrise=06:15, chatzot=11:55, minchaGedola=12:25, plagHaMincha=16:45, sunset=17:40, tzeit=18:15

### OpenStreetMap Tiles

```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Browser Geolocation API

```js
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  { enableHighAccuracy: true, timeout: 10000 }
)
```

### ניווט חיצוני

```
Waze:  https://waze.com/ul?q={address חולון}
Maps:  https://maps.google.com/?q={address חולון}
```

---

## 8. ניהול State

### תרשים State Flow

```
                  ┌─────────────┐
   User Click ──▶│  activeTab   │──▶ filteredPrayers (useMemo)
                  └─────────────┘

   User Input ──▶┌─────────────┐──▶ filteredPrayers (useMemo)
                  │ searchQuery  │    upcomingPrayersList filter
                  └─────────────┘

  setInterval ──▶┌─────────────┐──▶ upcomingPrayersList (useMemo)
   (60 sec)      │ currentTime  │    → diff calculation
                  └─────────────┘

  API Fetch ────▶┌─────────────┐──▶ upcomingPrayersList (useMemo)
   (once)        │   zmanim     │    → getCalculatedTime()
                  └─────────────┘

  GPS Button ──▶┌─────────────┐──▶ upcomingPrayersList (useMemo)
                  │ userLocation │    → distance calculation
                  └─────────────┘

  Card Click ──▶┌──────────────────┐──▶ PrayerMap flyTo
                  │ selectedMapPrayer │
                  └──────────────────┘
```

---

## 9. יומן שינויים (Changelog Template)

### פורמט לתיעוד שינויים

```
### [תאריך] - [גרסה/תיאור קצר]

**שינויים:**
- [ ] מה שונה (קובץ, שורות)
- [ ] למה שונה (סיבה)
- [ ] מה הושפע (side effects)

**בדיקות:**
- [ ] נבדק מקומית (npm run dev)
- [ ] נבדק build (npm run build)
- [ ] נבדק על מובייל
```

### שינויים מתועדים עד כה

| # | תיאור | קבצים | סטטוס |
|---|--------|-------|--------|
| 1 | הקמת הפרויקט | הכל | ✅ |
| 2 | 248 מניינים + כתובות | App.jsx, coordinates.js | ✅ |
| 3 | מפה אינטראקטיבית | PrayerMap.jsx | ✅ |
| 4 | זמנים הלכתיים דינמיים | App.jsx (Hebcal API) | ✅ |
| 5 | GPS + חישוב מרחק | App.jsx | ✅ |
| 6 | CI/CD GitHub Pages | deploy.yml | ✅ |
| 7 | הוספת בת ים + מעבר ל-prayers.json | App.jsx, prayers.json | ✅ |
| 8 | **עדכון בת ים לבולטין כי תצא** (16/08/2026) | prayers.json | ✅ |
| 9 | **מנייני סליחות אלול תשפ"ו** — 93 מניינים, טאב עונתי | selichot.json, SelichotView.jsx, season.js | ✅ |
| 10 | **ריענון עיצובי** — טוקנים, מצב כהה, IBM Plex Sans Hebrew | tokens.css, index.css, כל הקומפוננטות | ✅ |
| 11 | **פיצול App.jsx** מ-497 שורות ל-16 מודולים | lib/, components/, hooks/ | ✅ |
| 12 | הקדשה בכותרת + `--app-header-h` לכותרות דביקות | Header.jsx, App.jsx, SelichotView.jsx | ✅ |
| 13 | שדה `pairing` + תגית נראית להצמדת מנחה/ערבית | prayers.json, Tag.jsx, lib/prayers.js | ✅ |
| 14 | בית רבינו (חולון) ל-18:00 רצוף + איחוד כתיב וכתובת | prayers.json | ✅ |
| 15 | **מפה ורשימה בכל הטאבים** — `SplitView`, `PrayerCard` הוסר | SplitView.jsx, App.jsx | ✅ |
| 16 | תיקוני מפה: מסגור לפי טאב + `invalidateSize` | PrayerMap.jsx | ✅ |
| 17 | `h1` לדף (המותג היה `span` — לא הייתה כותרת ראשית) | Header.jsx | ✅ |
| 18 | `react/jsx-no-undef` בלינט — רכיב שלא יובא נתפס לפני הדפדפן | eslint.config.js | ✅ |
| 19 | גרסה 1.1.0 + תגית `v1.1.0` | package.json | ✅ |
| 20 | **מפה מקובעת במובייל** בזמן גלילה ברשימה | SplitView.jsx | ✅ |
| 21 | `--app-header-h` נמדד גם אחרי טעינת הפונט ובכל resize | App.jsx | ✅ |
| 22 | שלד סרגל הזמנים שומר את גובה הערך הסופי (היה קופץ 8px) | ZmanimBar.jsx | ✅ |
| 23 | גרסה 1.2.0 + תגית `v1.2.0` | package.json | ✅ |
| 24 | **תוצאות החיפוש נראות במובייל** — רשימה מעל המפה, ללא כרטיס עליון | SplitView.jsx, App.jsx | ✅ |
| 25 | גרסה 1.2.1 + תגית `v1.2.1` | package.json | ✅ |

---

## 10. אפשרויות סקיילביליות

### שלב 1: שיפורים מיידיים (Low Effort, High Impact)

#### 1.1 הפרדת נתונים מהקוד
**בעיה:** 248 רשומות מניינים כתובות hardcoded בתוך App.jsx (שורות 17-272)
**פתרון:**
```
src/
├── data/
│   ├── prayers.json          # כל המניינים כ-JSON
│   └── coordinates.json      # כל הכתובות כ-JSON
├── App.jsx                   # import מהקבצים
```
**יתרונות:**
- עדכון נתונים ללא נגיעה בקוד
- אפשרות לטעון דינמית מ-API
- ניהול קל יותר דרך CMS או ממשק אדמין

#### 1.2 הפרדת רכיבים
**בעיה:** App.jsx = 698 שורות עם הכל בפנים
**פתרון:**
```
src/
├── components/
│   ├── Header.jsx
│   ├── ZmanimBar.jsx
│   ├── SearchBar.jsx
│   ├── TabNavigation.jsx
│   ├── PrayerCard.jsx
│   ├── UpcomingView.jsx
│   └── CategoryView.jsx
├── hooks/
│   ├── useZmanim.js
│   ├── useLocation.js
│   └── usePrayers.js
├── utils/
│   ├── timeCalculations.js
│   └── distance.js
```

#### 1.3 Environment Variables
```env
VITE_HEBCAL_GEONAME_ID=294751
VITE_MAP_CENTER_LAT=32.0114
VITE_MAP_CENTER_LNG=34.7748
VITE_CITY_NAME=חולון
```

### שלב 2: Backend & Database (Medium Effort)

#### 2.1 ארכיטקטורה עם Backend

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  React   │────▶│   Backend    │────▶│ Database │
│  Client  │◀────│  (API Server)│◀────│          │
└──────────┘     └──────────────┘     └──────────┘
```

**אפשרויות טכנולוגיות:**

| אפשרות | Stack | יתרונות | חסרונות |
|---------|-------|---------|---------|
| **A: Supabase** | PostgreSQL + REST API | חינם ל-10K שורות, Auth מובנה, Realtime | vendor lock-in |
| **B: Firebase** | Firestore + Cloud Functions | Realtime, Auth, Hosting | מחיר בסקייל |
| **C: Node.js + MongoDB** | Express + Mongoose | שליטה מלאה, חינם ב-Atlas | דורש תחזוקת שרת |
| **D: Cloudflare Workers + D1** | Edge + SQLite | מהיר, זול, global | מגבלות DB |

#### 2.2 סכמת Database מוצעת

```sql
-- מניינים
CREATE TABLE prayers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  lat         DECIMAL(10, 7),
  lng         DECIMAL(10, 7),
  category    ENUM('shacharit', 'mincha', 'arvit'),
  sub_category TEXT,
  time_type   ENUM('fixed', 'dynamic'),
  fixed_time  TIME,
  zman_ref    TEXT,
  offset_min  INTEGER DEFAULT 0,
  notes       TEXT,
  active      BOOLEAN DEFAULT TRUE,
  city        TEXT DEFAULT 'חולון',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- יומן שינויים
CREATE TABLE changelog (
  id          SERIAL PRIMARY KEY,
  prayer_id   INTEGER REFERENCES prayers(id),
  change_type ENUM('create', 'update', 'delete'),
  old_data    JSONB,
  new_data    JSONB,
  changed_by  TEXT,
  changed_at  TIMESTAMP DEFAULT NOW()
);

-- עדכוני זמנים עונתיים
CREATE TABLE seasonal_overrides (
  id          SERIAL PRIMARY KEY,
  prayer_id   INTEGER REFERENCES prayers(id),
  start_date  DATE,
  end_date    DATE,
  override_time TIME,
  notes       TEXT
);
```

#### 2.3 Admin Panel
ממשק ניהול לעדכון מניינים ללא צורך בקוד:
- הוספה/עריכה/מחיקה של מניינים
- עדכון שעות עונתיות (חורף/קיץ)
- ניהול כתובות וקואורדינטות
- צפייה ביומן שינויים
- ייבוא/ייצוא CSV

### שלב 3: ריבוי ערים (Multi-City)

#### 3.1 ארכיטקטורה Multi-Tenant

```
┌─────────────────────────────────────────┐
│              minyan-app                  │
├─────────────────────────────────────────┤
│  /holon    → נתוני חולון               │
│  /bat-yam  → נתוני בת ים              │
│  /rishon   → נתוני ראשון לציון         │
│  /tel-aviv → נתוני תל אביב            │
└─────────────────────────────────────────┘
```

**שינויים נדרשים:**
- Routing (React Router)
- נתונים per-city ב-DB
- Hebcal API עם geonameid דינמי לכל עיר
- מפה עם מרכז דינמי לפי עיר

#### 3.2 תמיכה בקהילות

```
prayers → belongs_to → synagogue → belongs_to → city
                           │
                    has_many → admins (users)
```

### שלב 4: פיצ'רים מתקדמים

| פיצ'ר | תיאור | עדיפות |
|--------|--------|--------|
| **PWA** | התקנה כאפליקציה + עבודה Offline | גבוהה |
| **Push Notifications** | התראה X דקות לפני התפילה הקרובה | גבוהה |
| **Crowdsourcing** | משתמשים מדווחים על שינויי זמנים | בינונית |
| **Favorites** | שמירת מניינים מועדפים (localStorage/auth) | בינונית |
| **Shabbat Mode** | מצב שבת: הצגת זמני כניסה/יציאה, ללא מפה | בינונית |
| **Analytics** | מעקב אחר שימוש: מניינים פופולריים, זמני שיא | נמוכה |
| **WhatsApp Bot** | "מה המניין הקרוב?" דרך WhatsApp | נמוכה |
| **i18n** | תמיכה באנגלית/צרפתית/רוסית | נמוכה |

### שלב 5: Infrastructure Scale

```
┌────────────────────────────────────────────────┐
│                  CDN (Cloudflare)                │
│              Static assets + caching             │
├────────────────────────────────────────────────┤
│           API Gateway (rate limiting)            │
├──────────┬──────────┬──────────┬───────────────┤
│ Auth     │ Prayer   │ Zmanim   │ Admin          │
│ Service  │ Service  │ Cache    │ Service         │
├──────────┴──────────┴──────────┴───────────────┤
│              Database (PostgreSQL)                │
│              + Redis Cache                        │
└────────────────────────────────────────────────┘
```

---

## 11. בעיות ידועות ושיפורים עתידיים

### בעיות ארכיטקטוניות

| # | בעיה | חומרה | קובץ |
|---|-------|--------|------|
| 1 | נתונים hardcoded בקוד (248 רשומות ב-App.jsx) | גבוהה | App.jsx:17-272 |
| 2 | App.jsx מונוליטי (698 שורות) | בינונית | App.jsx |
| 3 | אין ניהול שגיאות מרכזי (error boundary) | בינונית | - |
| 4 | קואורדינטות עם fallback אקראי | נמוכה | coordinates.js:154 |
| 5 | אין בדיקות (tests) | בינונית | - |
| 6 | אין TypeScript | נמוכה | - |
| 7 | Inline styles ב-PrayerMap.jsx | נמוכה | PrayerMap.jsx |

### שיפורי ביצועים

| # | שיפור | השפעה |
|---|--------|--------|
| 1 | Virtualized list (react-window) לרשימת 248 מניינים | בינונית |
| 2 | Marker clustering במפה (leaflet.markercluster) | גבוהה |
| 3 | Service Worker + offline cache (PWA) | גבוהה |
| 4 | Preload zmanim data | נמוכה |

---

## נספח: מפתח מונחים

| מונח | הסבר |
|------|-------|
| **נץ החמה** (sunrise) | זמן הזריחה - תפילות שחרית בנץ |
| **חצות** (chatzot) | אמצע היום ההלכתי |
| **מנחה גדולה** (minchaGedola) | הזמן המוקדם ביותר למנחה |
| **פלג המנחה** (plagHaMincha) | 1.25 שעות הלכתיות לפני שקיעה |
| **שקיעה** (sunset) | שקיעת החמה |
| **צאת הכוכבים** (tzeit) | יציאת 3 כוכבים - סוף היום ההלכתי |
| **zmanReference** | שדה שמציין לאיזה זמן הלכתי התפילה צמודה |
| **offset** | הסטה בדקות מהזמן ההלכתי (+ או -) |
| **subCategory** | מנחה+ערבית רצוף = `mincha_arvit` |
| **haversine** | נוסחה לחישוב מרחק בין 2 נקודות על כדור הארץ |
