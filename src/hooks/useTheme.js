import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'minyan148:theme';

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * שלושה מצבים: 'system' (ברירת מחדל), 'light', 'dark'.
 * בחירה מפורשת נכתבת כ-data-theme על ה-root, ומצב מערכת פשוט לא מסמן כלום —
 * כך גיליון הסגנונות מטפל בשלושת המצבים בלי JS.
 */
export function useTheme() {
  const [preference, setPreference] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return window.localStorage.getItem(STORAGE_KEY) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (preference === 'system') {
      root.removeAttribute('data-theme');
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      root.setAttribute('data-theme', preference);
      window.localStorage.setItem(STORAGE_KEY, preference);
    }
  }, [preference]);

  const [systemDark, setSystemDark] = useState(prefersDark);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark = preference === 'system' ? systemDark : preference === 'dark';

  // לחיצה אחת קובעת את ההפך ממה שרואים עכשיו
  const toggle = useCallback(() => {
    setPreference(isDark ? 'light' : 'dark');
  }, [isDark]);

  return { preference, isDark, toggle };
}
