import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, MapPin, Sun, Sunset, Moon, Info, Calendar, Map, Navigation } from 'lucide-react';
// --- נתונים (Data) ---
// הוספנו zmanReference ו-offset (בדקות) לתפילות שתלויות בזמני היום
const prayerData = [
  // שחרית - נץ החמה
  { id: 1, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'עטרת אליהו', address: 'יבנה 8', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 2, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'אור ציון', address: 'התחייה 14', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 3, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'הליכות עולם', address: 'דבורה הנביאה 5', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 4, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'דרכי נועם', address: 'חיים לנדאו 12', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 5, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'סולם יעקב', address: 'מקלף 16', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 6, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'מטה משה', address: 'החרצית 5', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 7, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'צעירי אירן', address: 'אלופי צהל 41', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 8, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'זכור לאברהם', address: 'ורבורג 7', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 9, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'מגן דוד', address: 'הופיין 17', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 10, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'הרמב"ם', address: 'הצרעה 3', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 11, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'סודאי', address: 'רוטשליד 12', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 12, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'אהבת השם', address: 'ברקת 17', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 13, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'מאיר עיניים', address: 'משעול הפז 17', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 14, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'עטרת חכמים', address: 'החיים 4', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 15, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'תורת משה חיים', address: 'אבן עזרא 3', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 16, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'בית יוסף', address: 'מבצע סיני 24', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 17, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'דברי שלום', address: 'השומר 19', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 18, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'בית כורש', address: 'המצודה 1', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 19, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'רשב"י', address: 'בית לחם 9', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 20, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'סוכת שלום', address: 'ברנר 10', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 21, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'תפארת בחורים', address: 'עין גדי 1', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 22, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'משכן אליהו', address: 'הדקל 5', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 23, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'ואהבת - בית דוד', address: 'ברקת 19', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 24, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'שערי ציון', address: 'הנביאים 5', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 25, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'גבורת יצחק', address: 'עוזי נרקיס 4', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 26, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'אהבה ואחוה', address: 'פנחס לבון 1', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  { id: 27, category: 'shacharit', time: 'נץ החמה', zmanReference: 'sunrise', offset: 0, name: 'ותתפלל חנה', address: 'מולכו 5', notes: 'קורבנות 45 דקות לפני זמן הנץ' },
  // שחרית - זמנים קבועים
  { id: 28, category: 'shacharit', time: '04:45', name: 'רבן יוחנן בן זכאי', address: 'סעדיה גאון 18', notes: '' },
  { id: 29, category: 'shacharit', time: '04:50', name: 'אוהל בן שלום', address: 'בילו 20', notes: '' },
  { id: 30, category: 'shacharit', time: '05:20', name: 'עולי בבל', address: 'אשתאול 5', notes: '' },
  { id: 31, category: 'shacharit', time: '05:20', name: 'דברי שלום ואמת', address: 'השומר 19', notes: '' },
  { id: 32, category: 'shacharit', time: '05:30', name: 'הרמב"ם', address: 'השילוח 23 קרית שרת', notes: '' },
  { id: 33, category: 'shacharit', time: '05:35', name: 'ארם נהרים', address: 'ברנר 9', notes: '' },
  { id: 34, category: 'shacharit', time: '05:40', name: 'חסדי שמים', address: 'קדשי קהיר 14', notes: 'קורבנות' },
  { id: 35, category: 'shacharit', time: '05:45', name: 'קדושי צה"ל', address: 'הפלמ"ח 4', notes: '' },
  { id: 36, category: 'shacharit', time: '05:45', name: 'היכל משה', address: 'שער ציון 25', notes: '' },
  { id: 37, category: 'shacharit', time: '05:45', name: 'עטרת ישועה', address: 'זלמן ארן 4', notes: 'במקלט' },
  { id: 38, category: 'shacharit', time: '05:45', name: 'אהבה ואחוה', address: 'פנחס לבון 1', notes: '' },
  { id: 39, category: 'shacharit', time: '05:45', name: 'אריק אנשטיין', address: 'אריק אינשטיין 7', notes: 'קרבנות' },
  { id: 40, category: 'shacharit', time: '05:50', name: 'שערי רצון', address: 'ביאליק 29', notes: '' },
  { id: 41, category: 'shacharit', time: '05:50', name: 'ישועות אליהו', address: 'העליה השניה 37', notes: '' },
  { id: 42, category: 'shacharit', time: '05:50', name: 'ביהכ"נ הגדול', address: 'הרב קוק 5', notes: '' },
  { id: 43, category: 'shacharit', time: '05:55', name: 'בית אל', address: 'שטרוק 8', notes: 'הודו' },
  { id: 44, category: 'shacharit', time: '06:00', name: 'מגן דוד', address: 'הופיין 17', notes: '' },
  { id: 45, category: 'shacharit', time: '06:00', name: 'ריב"ז', address: 'סעדיה גאון 18', notes: '' },
  { id: 46, category: 'shacharit', time: '06:00', name: 'מזמור לדוד', address: 'אריק אינשטיין 7', notes: 'הודו' },
  { id: 47, category: 'shacharit', time: '06:00', name: 'היכל אליהו', address: 'קוגל 10', notes: '' },
  { id: 48, category: 'shacharit', time: '06:00', name: 'מישרים', address: 'שמעיה 8', notes: '' },
  { id: 49, category: 'shacharit', time: '06:00', name: 'חללי צהל', address: 'חשמונאים 51', notes: '' },
  { id: 50, category: 'shacharit', time: '06:00', name: 'הרב זרוק', address: 'אילת 36', notes: 'קורבנות' },
  { id: 51, category: 'shacharit', time: '06:00', name: 'אור חדש', address: 'ראש פינה 5', notes: 'במקלט, בגינה' },
  { id: 52, category: 'shacharit', time: '06:00', name: 'עדת ישורון', address: 'סביון 7', notes: 'הודו' },
  { id: 53, category: 'shacharit', time: '06:05', name: 'שערי ציון', address: 'הנביאים 5', notes: '' },
  { id: 54, category: 'shacharit', time: '06:10', name: 'אהבת ישראל', address: 'אילת 18', notes: '' },
  { id: 55, category: 'shacharit', time: '06:10', name: 'נצח ישראל', address: 'העצמון 4', notes: '' },
  { id: 56, category: 'shacharit', time: '06:10', name: 'חפץ חיים', address: 'עין גדי 20', notes: '' },
  { id: 57, category: 'shacharit', time: '06:15', name: 'כפוסי', address: 'שמריהו לוין 7', notes: '' },
  { id: 58, category: 'shacharit', time: '06:15', name: 'עץ חיים', address: 'אברבנאל 3', notes: 'הודו' },
  { id: 59, category: 'shacharit', time: '06:15', name: 'גאולת ישראל', address: 'אלופי צה"ל 10', notes: '' },
  { id: 60, category: 'shacharit', time: '06:15', name: 'הרמב"ם', address: 'הרמב"ם תל גיבורים', notes: 'הודו' },
  { id: 61, category: 'shacharit', time: '06:15', name: 'אור התורה', address: 'יפה ירקוני 11', notes: 'קומה -1 בימים שקוראים בתורה' },
  { id: 62, category: 'shacharit', time: '06:25', name: 'ישורון', address: 'בן יהודה 12', notes: '' },
  { id: 63, category: 'shacharit', time: '06:30', name: 'סולם יעקב', address: 'מקלף 16', notes: '' },
  { id: 64, category: 'shacharit', time: '06:30', name: 'בית אל', address: 'שטרוק 8', notes: 'הודו' },
  { id: 65, category: 'shacharit', time: '06:30', name: 'חב"ד', address: 'שד\' ירושלים 156', notes: '' },
  { id: 66, category: 'shacharit', time: '06:30', name: 'חב"ד', address: 'החרצית 5', notes: 'הודו' },
  { id: 67, category: 'shacharit', time: '06:30', name: 'גן הרצל', address: 'ההסתדרות 35', notes: 'במקלט' },
  { id: 68, category: 'shacharit', time: '06:30', name: 'אור התורה', address: 'יפה ירקוני 11', notes: 'קומה -1' },
  { id: 69, category: 'shacharit', time: '06:30', name: 'חב"ד', address: 'חביבה רייך 20', notes: '' },
  { id: 70, category: 'shacharit', time: '06:45', name: 'זיכרון קדושים', address: 'הצפירה 5', notes: '' },
  { id: 71, category: 'shacharit', time: '06:45', name: 'סוכת שלום', address: 'קאפח 20', notes: '' },
  { id: 72, category: 'shacharit', time: '06:45', name: 'שער השמיים', address: 'עין גדי 18', notes: '' },
  { id: 73, category: 'shacharit', time: '06:45', name: 'משכן מאיר', address: 'זרובבל 3', notes: '' },
  { id: 74, category: 'shacharit', time: '06:50', name: 'אור ציון', address: 'התחייה 14', notes: 'הודו' },
  { id: 75, category: 'shacharit', time: '06:50', name: 'תתפלל חנה', address: 'מולכו 7', notes: 'ימים ב\' ה\'' },
  { id: 76, category: 'shacharit', time: '06:50', name: 'חסדי שמים', address: 'קדשי קהיר 14', notes: 'קורבנות' },
  { id: 77, category: 'shacharit', time: '07:00', name: 'הרמב"ם', address: 'השילוח 23 קרית שרת', notes: '' },
  { id: 78, category: 'shacharit', time: '07:00', name: 'מחנה אפריים', address: 'הסנהדרין 21', notes: '' },
  { id: 79, category: 'shacharit', time: '07:00', name: 'תתפלל חנה', address: 'מולכו 7', notes: 'א,ג,ד,ו\'' },
  { id: 80, category: 'shacharit', time: '07:00', name: 'דרכי נועם', address: 'לנדאו 12', notes: '' },
  { id: 81, category: 'shacharit', time: '07:00', name: 'שערי רצון', address: 'ביאליק 29', notes: 'הודו' },
  { id: 82, category: 'shacharit', time: '07:00', name: 'סודאי', address: 'רוטשילד 12', notes: 'הודו' },
  { id: 83, category: 'shacharit', time: '07:00', name: 'עטרת חכמים', address: 'החיים 4', notes: '' },
  { id: 84, category: 'shacharit', time: '07:00', name: 'נחלת שלום', address: 'יהודה הלוי 31', notes: '' },
  { id: 85, category: 'shacharit', time: '07:00', name: 'צעירי אירן', address: 'אלופי צהל 41', notes: '' },
  { id: 86, category: 'shacharit', time: '07:00', name: 'מעוז יעקב', address: 'הגר"א 35', notes: 'הודו' },
  { id: 87, category: 'shacharit', time: '07:00', name: 'זכרון לקדושים', address: 'הצפירה 5', notes: 'הודו' },
  { id: 88, category: 'shacharit', time: '07:10', name: 'עטרת אליהו', address: 'יבנה 8', notes: '' },
  { id: 89, category: 'shacharit', time: '07:10', name: 'אביר יעקב', address: 'נחמיה 7', notes: 'הודו' },
  { id: 90, category: 'shacharit', time: '07:15', name: 'ישיבת ההסדר', address: 'התחייה 14', notes: '' },
  { id: 91, category: 'shacharit', time: '07:15', name: 'היכל משה', address: 'שער ציון 25', notes: '' },
  { id: 92, category: 'shacharit', time: '07:15', name: 'מניין מונטיפיורי', address: 'מונטיפיורי 13', notes: 'ימים ב\',ה\' הודו בניגונים' },
  { id: 93, category: 'shacharit', time: '07:15', name: 'אהבה ואחוה', address: 'פנחס לבון 1', notes: '' },
  { id: 94, category: 'shacharit', time: '07:15', name: 'זכור לאברהם', address: 'מפרץ שלמה 100', notes: 'הודו' },
  { id: 95, category: 'shacharit', time: '07:30', name: 'כתר תורה', address: 'הסנהדרין 23', notes: '' },
  { id: 96, category: 'shacharit', time: '07:30', name: 'דברי שלום', address: 'השומר 19', notes: 'הודו' },
  { id: 97, category: 'shacharit', time: '07:30', name: 'מניין מונטיפיורי', address: 'מונטיפיורי 13', notes: 'ימים א,ג,ד,ו הודו בניגונים' },
  { id: 98, category: 'shacharit', time: '07:30', name: 'קדושי צהל', address: 'הפלמח 4', notes: '' },
  { id: 99, category: 'shacharit', time: '07:30', name: 'חב"ד', address: 'פנחס אילון 13', notes: '' },
  { id: 100, category: 'shacharit', time: '07:30', name: 'מגן דוד', address: 'הופיין 17', notes: '' },
  { id: 101, category: 'shacharit', time: '07:30', name: 'בית חולים וולפסון', address: 'הלוחמים 62', notes: 'הודו' },
  { id: 102, category: 'shacharit', time: '07:45', name: 'מטה משה', address: 'החרצית 5', notes: 'הודו' },
  { id: 103, category: 'shacharit', time: '07:50', name: 'ר\' חיים אברהם', address: 'אלופי צה"ל 10', notes: 'הודו' },
  { id: 104, category: 'shacharit', time: '08:00', name: 'אור ציון', address: 'התחייה 14', notes: '' },
  { id: 105, category: 'shacharit', time: '08:00', name: 'מאיר עיניים', address: 'משעול הפז 17', notes: 'הודו' },
  { id: 106, category: 'shacharit', time: '08:00', name: 'עטרת חכמים', address: 'החיים 4', notes: 'הודו' },
  { id: 107, category: 'shacharit', time: '08:00', name: 'באר האמונה', address: 'יוטבתה 24', notes: 'הודו' },
  { id: 108, category: 'shacharit', time: '08:00', name: 'אור דניאל', address: 'עוזי נרקיס 4', notes: 'הודו' },
  { id: 109, category: 'shacharit', time: '08:00', name: 'בית מדרש נפתלי', address: 'אילת 36', notes: 'קומה ב\'' },
  { id: 110, category: 'shacharit', time: '08:00', name: 'בית יצחק', address: 'ניסנבואים 8', notes: 'הודו' },
  { id: 111, category: 'shacharit', time: '08:00', name: 'מאיר עיניים', address: 'משאול הפז 15', notes: '' },
  { id: 112, category: 'shacharit', time: '08:00', name: 'אור התורה', address: 'יפה ירקוני 11', notes: 'קומה -1' },
  { id: 113, category: 'shacharit', time: '08:10', name: 'אורות הצחצחות', address: 'המצודה 26', notes: 'הודו' },
  { id: 114, category: 'shacharit', time: '08:15', name: 'הרמב"ם', address: 'הצרעה 3', notes: 'הודו' },
  { id: 115, category: 'shacharit', time: '08:15', name: 'עץ חיים', address: 'הרב קוק 7', notes: 'הודו' },
  { id: 116, category: 'shacharit', time: '08:15', name: 'עץ חיים', address: 'אברבנאל 3', notes: 'הודו' },
  { id: 117, category: 'shacharit', time: '08:15', name: 'זכור לאברהם', address: 'מפרץ שלמה 100', notes: 'הודו' },
  { id: 118, category: 'shacharit', time: '08:25', name: 'מניין במקלט', address: 'אהרונביץ 93', notes: 'הודו' },
  { id: 119, category: 'shacharit', time: '08:30', name: 'מגן דוד', address: 'הופיין 17', notes: 'הודו' },
  { id: 120, category: 'shacharit', time: '08:30', name: 'חב"ד', address: 'פינחס אילון 13', notes: '' },
  { id: 121, category: 'shacharit', time: '08:30', name: 'אור יוסף', address: 'צהלים 26', notes: 'הודו' },
  { id: 122, category: 'shacharit', time: '08:30', name: 'בית רבינו', address: 'אהרונוביץ\' 91', notes: 'ברוך שאמר' },
  { id: 123, category: 'shacharit', time: '08:30', name: 'בית ספר בני מנחם', address: 'צבי שץ 50', notes: 'במקלט' },
  { id: 124, category: 'shacharit', time: '08:30', name: 'חב"ד', address: 'חביבה רייך 20', notes: '' },
  { id: 125, category: 'shacharit', time: '08:45', name: 'אפיקי מים', address: 'חזית חמש 3', notes: '' },
  { id: 126, category: 'shacharit', time: '09:00', name: 'מאור ישראל', address: 'מבצע סיני 9', notes: '' },
  { id: 127, category: 'shacharit', time: '09:00', name: 'בית חב"ד', address: 'סוקולוב 130', notes: 'הודו' },
  { id: 128, category: 'shacharit', time: '09:00', name: 'נחלת שלום', address: 'יהודה הלוי 31', notes: '' },
  { id: 129, category: 'shacharit', time: '09:15', name: 'זכור לאברהם', address: 'מפרץ שלמה 100', notes: 'הודו' },
  { id: 130, category: 'shacharit', time: '09:30', name: 'ביהכ"נ הגדול', address: 'הרב קוק 5', notes: '' },
  { id: 131, category: 'shacharit', time: '10:00', name: 'ביהכ"נ הגדול', address: 'הרב קוק 5', notes: '' },
  // מנחה
  { id: 132, category: 'mincha', time: '12:10', name: 'מניין מנחה', address: 'מבצע סיני 22', notes: 'מנחה גדולה יום שישי בלבד' },
  { id: 133, category: 'mincha', time: '12:15', name: 'מעודה', address: 'הנביאים 68', notes: 'יום שישי בלבד' },
  { id: 134, category: 'mincha', time: '12:15', name: 'מגן דוד', address: 'הופיין 17', notes: 'יום שישי בלבד' },
  { id: 135, category: 'mincha', time: '12:30', name: 'רבנות חולון', address: 'הרב קוק 5', notes: 'יום שישי בלבד' },
  { id: 136, category: 'mincha', time: '13:15', name: 'זכור לאברהם', address: 'ורבורג 7', notes: 'יום שישי בלבד' },
  { id: 137, category: 'mincha', time: '12:15', name: 'הרב זרוק', address: 'אילת 36', notes: 'קומת מרתף' },
  { id: 138, category: 'mincha', time: '12:30', name: 'בניין עזריאלי A', address: 'הרוקמים 26', notes: 'קומה 0' },
  { id: 139, category: 'mincha', time: '12:45', name: 'מניין', address: 'מבצע סיני 9', notes: 'ימים א-ו' },
  { id: 140, category: 'mincha', time: '12:45', name: 'הרמב"ם', address: 'השילוח 23', notes: 'אשרי' },
  { id: 141, category: 'mincha', time: '12:45', name: 'תפארת בחורים', address: 'עין גדי 1', notes: 'אשרי' },
  { id: 142, category: 'mincha', time: '12:50', name: 'מניין', address: 'מונטיפיורי 13', notes: 'מתחילים אשרי' },
  { id: 143, category: 'mincha', time: '12:55', name: 'סודאי', address: 'רוטשילד 12', notes: '' },
  { id: 144, category: 'mincha', time: '13:00', name: 'סודאי', address: 'רוטשילד 12', notes: 'למעלה' },
  { id: 145, category: 'mincha', time: '12:55', name: 'היכל חיים', address: 'הסנהדרין 23', notes: '' },
  { id: 146, category: 'mincha', time: '13:00', name: 'מעודה', address: 'הנביאים 68', notes: '' },
  { id: 147, category: 'mincha', time: '13:00', name: 'אהבה ואחוה', address: 'פנחס לבון 1', notes: 'בכולל למעלה' },
  { id: 148, category: 'mincha', time: '13:00', name: 'גבורת יצחק', address: 'עוזי נרקיס 4', notes: '' },
  { id: 149, category: 'mincha', time: '13:00', name: 'מניין', address: 'אבן עזרא 3', notes: '' },
  { id: 150, category: 'mincha', time: '13:00', name: 'המצרים', address: 'התותחנים 8', notes: '' },
  { id: 151, category: 'mincha', time: '13:00', name: 'מאיר עיניים', address: 'משעול הפז 13', notes: '' },
  { id: 152, category: 'mincha', time: '13:00', name: 'אריק אינשטיין', address: 'אריק אינשטיין 7', notes: '' },
  { id: 153, category: 'mincha', time: '13:15', name: 'יד יצחק', address: 'לנדאו 12', notes: '' },
  { id: 154, category: 'mincha', time: '13:15', name: 'אור ציון', address: 'התחייה 14', notes: '' },
  { id: 155, category: 'mincha', time: '13:15', name: 'זכור לאברהם', address: 'ורבורג 7', notes: '' },
  { id: 156, category: 'mincha', time: '13:15', name: 'מתחם הסיירים', address: 'המרכבה 40', notes: 'צמוד לנייק' },
  { id: 157, category: 'mincha', time: '13:15', name: 'מפעל יהודה', address: 'הסתת 6', notes: '' },
  { id: 158, category: 'mincha', time: '13:15', name: 'עטרת חכמים', address: 'החיים 4', notes: '' },
  { id: 159, category: 'mincha', time: '13:15', name: 'בניין צרפתי', address: 'הלוחמים 53', notes: 'קומה 2 צמוד לדלק מיקה' },
  { id: 160, category: 'mincha', time: '13:15', name: 'אור יוסף', address: 'צאלים 26', notes: '' },
  { id: 161, category: 'mincha', time: '13:15', name: 'חב"ד', address: 'חביבה רייך 20', notes: '' },
  { id: 162, category: 'mincha', time: '13:20', name: 'פלאפל א\' א\'', address: 'חנקין 67', notes: '' },
  { id: 163, category: 'mincha', time: '13:20', name: 'בי"ח וולפסון', address: 'הלוחמים 62', notes: '' },
  { id: 164, category: 'mincha', time: '13:30', name: 'בנין A', address: 'הרוקמים 26', notes: 'קומה 0' },
  { id: 165, category: 'mincha', time: '13:30', name: 'בניין D', address: 'הרוקמים 26', notes: 'קומה 1' },
  { id: 166, category: 'mincha', time: '13:30', name: 'חב"ד', address: 'פנחס אילון 13', notes: '' },
  { id: 167, category: 'mincha', time: '13:30', name: 'אבי הספר', address: 'ששת הימים 1', notes: '' },
  { id: 168, category: 'mincha', time: '13:30', name: 'רמי לוי', address: 'תמנע 6', notes: '' },
  { id: 169, category: 'mincha', time: '13:30', name: 'עיריית חולון', address: 'ויצמן 58', notes: '' },
  { id: 170, category: 'mincha', time: '13:30', name: 'מוסך הכוכב', address: 'הפלד 19', notes: '' },
  { id: 171, category: 'mincha', time: '13:30', name: 'ליד המכולת', address: 'הצורף 2', notes: '' },
  { id: 172, category: 'mincha', time: '13:30', name: 'בניין בזק', address: 'המנור 7', notes: '' },
  { id: 173, category: 'mincha', time: '13:30', name: 'מניין', address: 'הרוקמים 23', notes: 'קומה 5' },
  { id: 174, category: 'mincha', time: '13:45', name: 'קונטריה רוני', address: 'הבנאי 40', notes: '' },
  { id: 175, category: 'mincha', time: '14:00', name: 'תבליני ידעי', address: 'דב הוז 22', notes: '' },
  { id: 176, category: 'mincha', time: '14:00', name: 'בנין C', address: 'הרוקמים 26', notes: 'קומה 12' },
  { id: 177, category: 'mincha', time: '14:00', name: 'מניין', address: 'סוקולוב 30', notes: '' },
  { id: 178, category: 'mincha', time: '14:00', name: 'מרכז סדאב', address: 'מרכז סדאב', notes: 'בכניסה ליד המוניות' },
  { id: 179, category: 'mincha', time: '14:15', name: 'תבליני ידעי', address: 'קרואזה 59', notes: '' },
  { id: 180, category: 'mincha', time: '14:30', name: 'בניין בזק', address: 'המנור 7', notes: '' },
  { id: 181, category: 'mincha', time: '15:00', name: 'חצי חינם', address: 'המרכבה 31', notes: '' },
  { id: 182, category: 'mincha', time: '15:00', name: 'מניין', address: 'שדרות ירושלים 155', notes: 'בממ"ד בלובי הכניסה' },
  { id: 183, category: 'mincha', time: '15:10', name: 'ישיבת ההסדר', address: 'רחוב הסיגלון', notes: 'אשרי, צמוד לבה"ס דביר' },
  { id: 184, category: 'mincha', time: '15:15', name: 'מניין', address: 'מפרץ שלמה 100', notes: '' },
  // ערבית
  { id: 185, category: 'arvit', time: '17:05', name: 'חצי חינם', address: 'המרכבה 31', notes: '' },
  { id: 186, category: 'arvit', time: '17:15', name: 'בניין D', address: 'הרוקמים 26', notes: 'קומה 1' },
  { id: 187, category: 'arvit', time: '17:15', name: 'היכל חיים', address: 'הסנהדרין 23', notes: '' },
  { id: 188, category: 'arvit', time: '18:05', name: 'סודאי', address: 'רוטשילד 12', notes: 'ימים א,ג,ד,ה' },
  { id: 189, category: 'arvit', time: '18:45', name: 'בית הכנסת הגדול', address: 'הרב קוק 5', notes: '' },
  { id: 190, category: 'arvit', time: '18:45', name: 'צערי אירן', address: 'אלופי צהל 41', notes: '' },
  { id: 191, category: 'arvit', time: '19:00', name: 'מניין', address: 'סוקולוב 30', notes: '' },
  { id: 192, category: 'arvit', time: '19:00', name: 'מניין', address: 'אבן עזרא 3', notes: '' },
  { id: 193, category: 'arvit', time: '19:00', name: 'גבורות יצחק', address: 'עוזי נרקיס 3', notes: '' },
  { id: 194, category: 'arvit', time: '19:00', name: 'המצרים', address: 'התותחנים 8', notes: '' },
  { id: 195, category: 'arvit', time: '19:20', name: 'סודאי', address: 'רוטשליד 12', notes: '' },
  { id: 196, category: 'arvit', time: '19:30', name: 'גן רופין במקלט', address: 'ריינס 10', notes: 'בגינה' },
  { id: 197, category: 'arvit', time: '19:30', name: 'סודאי', address: 'רוטשילד 12', notes: '' },
  { id: 198, category: 'arvit', time: '20:00', name: 'אור ציון', address: 'התחייה 14', notes: 'ימים א\' עד ד\'' },
  { id: 199, category: 'arvit', time: '20:00', name: 'בית דוד', address: 'ברקת 17', notes: '' },
  { id: 200, category: 'arvit', time: '20:00', name: 'מניין', address: 'אבן עזרא 3', notes: '' },
  { id: 201, category: 'arvit', time: '20:00', name: 'דברי שלום', address: 'השומר 19', notes: '' },
  { id: 202, category: 'arvit', time: '20:00', name: 'בית מדרש נפתלי', address: 'אילת 36', notes: 'קומה ב\'' },
  { id: 203, category: 'arvit', time: '20:00', name: 'אור התורה', address: 'יפה ירקוני 11', notes: 'קומה -1' },
  { id: 204, category: 'arvit', time: '20:10', name: 'אחים ורעים', address: 'התחייה 14', notes: '' },
  { id: 205, category: 'arvit', time: '20:30', name: 'צעירי אירן', address: 'אלופי צהל 41', notes: '' },
  { id: 206, category: 'arvit', time: '20:30', name: 'רבי נחמן', address: 'מונטיפיורי 13', notes: 'א\'+ד\'' },
  { id: 207, category: 'arvit', time: '20:30', name: 'גבורות יצחק', address: 'עוזי נרקיס', notes: '' },
  { id: 208, category: 'arvit', time: '20:30', name: 'נחלת שלום', address: 'יהודה הלוי 31', notes: '' },
  { id: 209, category: 'arvit', time: '20:30', name: 'אור יוסף', address: 'צהלים 26', notes: '' },
  { id: 210, category: 'arvit', time: '21:00', name: 'הליכות עולם', address: 'דבורה הנביאה 5', notes: '' },
  { id: 211, category: 'arvit', time: '21:00', name: 'אור ציון', address: 'התחייה 14', notes: '' },
  { id: 212, category: 'arvit', time: '21:00', name: 'סוכת שלום', address: 'ברנר 12', notes: '' },
  { id: 213, category: 'arvit', time: '21:00', name: 'סולם יעקב', address: 'מקלף 16', notes: '' },
  { id: 214, category: 'arvit', time: '21:00', name: 'בית כורש', address: 'המצודה 1', notes: '' },
  { id: 215, category: 'arvit', time: '21:05', name: 'חב"ד', address: 'חביבה רייך 20', notes: 'ימים א\' עד ד\'' },
  { id: 216, category: 'arvit', time: '21:00', name: 'בית אל', address: 'שטרוק 8', notes: '' },
  { id: 217, category: 'arvit', time: '21:15', name: 'מטה משה', address: 'החרצית 5', notes: '' },
  { id: 218, category: 'arvit', time: '21:15', name: 'רבן יוחנן בן זכאי', address: 'סעדיה גאון 21', notes: '' },
  { id: 219, category: 'arvit', time: '21:15', name: 'בית כורש', address: 'המצודה 1', notes: '' },
  { id: 220, category: 'arvit', time: '21:15', name: 'מניין', address: 'התותחנים 8', notes: 'ימים ב\'-ג\' בלבד' },
  { id: 221, category: 'arvit', time: '21:30', name: 'אחוה ורעות', address: 'הנביאים 5', notes: '' },
  { id: 222, category: 'arvit', time: '21:30', name: 'חב"ד', address: 'פנחס איילון 13', notes: '' },
  { id: 223, category: 'arvit', time: '21:45', name: 'צעירי אירן', address: 'אלופי צהל 41', notes: '' },
  { id: 224, category: 'arvit', time: '21:50', name: 'מגן דוד', address: 'הופיין 17', notes: '' },
  { id: 225, category: 'arvit', time: '22:00', name: 'המועצה הדתית', address: 'הרב קוק 7', notes: '' },
  { id: 226, category: 'arvit', time: '22:00', name: 'עטרת חכמים', address: 'החיים 4', notes: '' },
  { id: 227, category: 'arvit', time: '22:15', name: 'עטרת אליהו', address: 'יבנה 8', notes: '' },
  { id: 228, category: 'arvit', time: '22:15', name: 'מניין', address: 'אבן עזרא 3', notes: '' },
  { id: 229, category: 'arvit', time: '22:45', name: 'חיים אברהם', address: 'אלופי צהל 10', notes: 'יום א\' בלבד' },
  { id: 230, category: 'arvit', time: '23:30', name: 'זלמן שזר', address: 'פירוב ת"א (סמוך לתל גיבורים)', notes: '3 דקות מתל גיבורים' },
  { id: 231, category: 'arvit', time: '00:00', name: 'באבוב', address: 'בת ים', notes: 'מניין קרוב' },
  { id: 232, category: 'arvit', time: '01:20', name: 'ישיבת סורוצקין', address: 'נחלת יהודה ראשון', notes: 'מניין קרוב' },
  // תפילות התלויות בפלג המנחה
  { id: 233, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'מגן דוד', address: 'הופיין 17', notes: '25 דקות לפני פלג המנחה' },
  { id: 234, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'גבורות יצחק', address: 'עוזי נרקיס 4', notes: '25 דקות לפני פלג המנחה' },
  { id: 235, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'אהבה ואחוה', address: 'פנחס לבון 1', notes: 'בתוך הגינה. 25 דקות לפני פלג המנחה' },
  { id: 236, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'נחלת שלום', address: 'יהודה הלוי 31', notes: '25 דקות לפני פלג המנחה' },
  { id: 237, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'רבי מאיר בעל הנס', address: 'תותחנים 9', notes: 'קומה ג\'. 25 דקות לפני פלג המנחה' },
  { id: 238, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'אהבת שלום', address: 'אריק לביא 2', notes: '25 דקות לפני פלג המנחה' },
  { id: 239, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'אוהל בן שלום', address: 'בילו 20', notes: '25 דקות לפני פלג המנחה' },
  { id: 240, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'בית רבנו', address: 'אהרונוביץ 92', notes: '25 דקות לפני פלג המנחה' },
  { id: 241, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'מניין', address: 'קרית שרת מרכז מסחרי', notes: 'בתשמישי קדושה. 25 דקות לפני פלג המנחה' },
  { id: 242, category: 'mincha', time: 'לפני פלג המנחה', zmanReference: 'plagHaMincha', offset: -25, name: 'תתפלל חנה', address: 'מולכו 7', notes: '25 דקות לפני פלג המנחה' },
  // מנחה וערבית ברצף - תלויות בשקיעה
  { id: 243, category: 'mincha', subCategory: 'mincha_arvit', time: 'לפני השקיעה', zmanReference: 'sunset', offset: -20, name: 'מניין רצוף', address: 'רבי עקיבא 6', notes: '20 דקות לפני השקיעה' },
  { id: 244, category: 'mincha', subCategory: 'mincha_arvit', time: 'לפני השקיעה', zmanReference: 'sunset', offset: -20, name: 'נחלת שלום', address: 'יהודה הלוי 31', notes: '20 דקות לפני השקיעה' },
  { id: 245, category: 'mincha', subCategory: 'mincha_arvit', time: 'לפני השקיעה', zmanReference: 'sunset', offset: -15, name: 'מניין רצוף', address: 'אריק לביא 2', notes: '15 דקות לפני השקיעה' },
  { id: 246, category: 'mincha', subCategory: 'mincha_arvit', time: 'לפני השקיעה', zmanReference: 'sunset', offset: -20, name: 'בית יצחק', address: 'ניסנבואים 8', notes: '20 דקות לפני השקיעה' },
  { id: 247, category: 'mincha', subCategory: 'mincha_arvit', time: '17:00', name: 'באר האמונה', address: 'יוטבתה 24', notes: 'מנחה וערבית ברצף' },
  { id: 248, category: 'mincha', subCategory: 'mincha_arvit', time: 'לפני השקיעה', zmanReference: 'sunset', offset: -45, name: 'אריק אינשטיין', address: 'אריק אינשטיין 7', notes: '45 דקות לפני השקיעה מנחה' },
];
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

        // נותן "חסד" של 45 דקות לתפילות שכבר התחילו, מעבר לזה מעביר למחר
        if (diff < -45) diff += 24 * 60;

        return { ...prayer, diff, actualTime };
      })
      .filter(p => p.diff !== 9999) // להציג רק תפילות שחושבו בהצלחה
      .sort((a, b) => a.diff - b.diff);
  }, [currentTime, zmanim]);
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
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        prayer.name.toLowerCase().includes(searchLower) ||
        prayer.address.toLowerCase().includes(searchLower) ||
        prayer.actualTime.includes(searchLower) ||
        prayer.time.includes(searchLower);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, zmanim]);
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
            <h1 className="text-2xl font-bold">זמני תפילות - חולון</h1>
          </div>
          <div className="bg-blue-700 rounded-full px-4 py-1.5 text-sm flex items-center shadow-inner font-medium">
            <Clock className="w-4 h-4 ml-2" />
            שעה נוכחית: {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-5">

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
        {/* חיפוש */}
        <div className="relative z-10">
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
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[600px]">

            {/* צד ימין במסכים גדולים / למטה בנייד: רשימת התפילות */}
            <div className="w-full md:w-2/5 lg:w-1/3 overflow-y-auto bg-slate-50 p-4 hide-scrollbar border-l border-slate-200 order-2 md:order-1 relative">
              <h3 className="font-bold text-lg text-slate-800 mb-4 sticky top-0 bg-slate-50 py-2 border-b border-slate-200 z-10 flex items-center">
                <Clock className="w-5 h-5 ml-2 text-blue-600" />
                התפילות הבאות
              </h3>
              <div className="space-y-3 pb-4">
                {upcomingPrayersList.map(prayer => {
                  const isSelected = selectedMapPrayer?.id === prayer.id;
                  return (
                    <div
                      key={`up-${prayer.id}`}
                      onClick={() => setSelectedMapPrayer(prayer)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 shadow-md transform scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className={`font-black text-2xl ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {prayer.actualTime}
                          </span>
                          {prayer.zmanReference && (
                            <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {prayer.time}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-slate-600 shadow-sm border border-slate-100 flex items-center">
                          {prayer.subCategory === 'mincha_arvit' ? 'מנחה+ערבית' :
                           prayer.category === 'shacharit' ? 'שחרית' :
                           prayer.category === 'mincha' ? 'מנחה' : 'ערבית'}
                        </span>
                      </div>

                      <div className="font-bold text-slate-700 mt-2 text-[15px]">{prayer.name}</div>
                      <div className="text-sm text-slate-500 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 ml-1 text-slate-400" /> {prayer.address}
                      </div>
                      {/* תגית מצב נוכחי לפי חישוב דקות */}
                      {prayer.diff <= 0 && prayer.diff > -45 && (
                        <div className="mt-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block border border-emerald-200">
                          התחיל לפני {Math.abs(prayer.diff)} דק'
                        </div>
                      )}
                      {prayer.diff > 0 && prayer.diff < 60 && (
                        <div className="mt-2.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md inline-block border border-red-200">
                          בעוד {prayer.diff} דקות!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* צד שמאל במסכים גדולים / למעלה בנייד: מפה חיה */}
            <div className="w-full md:w-3/5 lg:w-2/3 h-[300px] md:h-full relative bg-slate-200 order-1 md:order-2">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((selectedMapPrayer?.address || "חולון") + ", חולון, ישראל")}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              ></iframe>

              {/* שכבת מידע צפה על המפה */}
              {selectedMapPrayer && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{selectedMapPrayer.name}</h4>
                      <p className="text-sm font-medium text-slate-600 flex items-center mt-1">
                        <MapPin className="w-4 h-4 ml-1 text-blue-500"/> {selectedMapPrayer.address}
                      </p>
                    </div>
                    <div className="bg-blue-600 text-white font-black text-xl px-4 py-1.5 rounded-lg shadow-inner flex flex-col items-center">
                      <span>{selectedMapPrayer.actualTime}</span>
                      {selectedMapPrayer.zmanReference && <span className="text-[10px] font-normal opacity-80">{selectedMapPrayer.time}</span>}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <a href={`https://waze.com/ul?q=${encodeURIComponent(selectedMapPrayer.address + ' חולון')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-sky-100 hover:bg-sky-200 text-sky-800 text-sm py-2 rounded-lg flex items-center justify-center font-bold transition-colors shadow-sm">
                      <Navigation className="w-4 h-4 ml-1.5" /> סע ב-Waze
                    </a>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedMapPrayer.address + ' חולון')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm py-2 rounded-lg flex items-center justify-center font-bold transition-colors shadow-sm">
                      <Map className="w-4 h-4 ml-1.5" /> גוגל מפות
                    </a>
                  </div>
                </div>
              )}
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

                      <h4 className="font-bold text-lg text-slate-700 mb-1">{prayer.name}</h4>

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
                      <a href={`https://waze.com/ul?q=${encodeURIComponent(prayer.address + ' חולון')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center transition-colors">
                        <Navigation className="w-3.5 h-3.5 ml-1" /> Waze
                      </a>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(prayer.address + ' חולון')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center transition-colors">
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
