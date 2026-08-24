# מניין 148

אפליקציית ווב למציאת זמני תפילות ומנייני סליחות בחולון ובת ים, לפי מה
שקרוב אליך עכשיו.

**חי:** https://vhg148.github.io/minyan-app/

---

## מה יש בפנים

| | |
|---|---|
| תפילות קבע | 378 רשומות — שחרית, מנחה, ערבית |
| מנייני סליחות | 93 רשומות, חולון, עונתי (אלול → יום כיפור) |
| ערים | חולון, בת ים |
| זמנים הלכתיים | נמשכים מ-Hebcal, מתעדכנים כל יום |

מניין שמוגדר יחסית לזמן הלכתי (`sunrise −40`, `sunset −20`, `tzeit`)
מחושב מזמני היום ולא נשמר כמספר קשיח — כך הוא נשאר נכון כשהשעון זז.

## הרצה

```bash
npm install
npm run dev      # שרת פיתוח על 5173
npm run lint
npm run build
```

הפרויקט מוגדר עם `base: '/minyan-app/'`, אז בפיתוח הכתובת היא
`http://localhost:5173/minyan-app/`.

## פריסה

דחיפה ל-`main` מפעילה את `.github/workflows/deploy.yml`, שבונה ומעלה
ל-GitHub Pages. **כל push ל-main עולה חי תוך כשלוש דקות.** ה-workflow
מריץ `npm ci`, אז `package.json` ו-`package-lock.json` חייבים להיות
מסונכרנים — השתמשו ב-`npm version` ולא בעריכה ידנית.

## מבנה

```
src/
├── App.jsx              state hub + פריסה בלבד
├── PrayerMap.jsx        מפת Leaflet
├── coordinates.js       כתובת → [lat,lng]
├── data/
│   ├── prayers.json     תפילות קבע + sources + freshness
│   └── selichot.json    עונתי: season, slots, minyanim
├── lib/                 zmanim · prayers · geo · season · format
├── components/          Header · ZmanimBar · Toolbar · NowCard
│                        PrayerRow · SplitView · SelichotView · Tag
├── hooks/useTheme.js    system / light / dark
└── styles/tokens.css    מערכת הצבע + @theme של Tailwind
```

## תיעוד

- [SYSTEM-DOCS.md](SYSTEM-DOCS.md) — תיעוד מערכת מלא: ארכיטקטורה, זרימת
  נתונים, רכיבים, מקורות הנתונים, יומן שינויים ובעיות ידועות.
- [docs/design-sketch.html](docs/design-sketch.html) — סקיצת העיצוב
  שאושרה לפני המימוש. שמורה כתיעוד של ההחלטה, לא חלק מהאפליקציה.

## עדכון נתונים

זמני התפילות מגיעים מבולטינים שבועיים. לכל עיר תאריך עדכון משלה, שמור
ב-`prayers.json` תחת `sources` ומוצג בתחתית האפליקציה. מניין שלא נכלל
בעדכון האחרון של עירו מסומן `freshness: "stale"` ומקבל תגית "לא עודכן"
בממשק — עדיף לסמן זמן ישן מאשר להציג אותו כאילו הוא טרי.
