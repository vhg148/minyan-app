import { Moon, Sun } from 'lucide-react';

export default function Header({ currentTime, isDark, onToggleTheme }) {
  const clock = currentTime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-4 py-[10px]">
      <div className="flex min-w-0 flex-col gap-[3px]">
        <div className="flex items-baseline gap-2">
          <h1 className="m-0 text-[17px] font-bold tracking-tight">מניין 148</h1>
          <span className="text-xs text-muted">חולון · בת ים</span>
        </div>
        {/* הקדשה — נקראת במלואה, בלי חיתוך ובלי קישוט */}
        <p className="m-0 text-[11px] leading-[1.4] tracking-[0.02em] text-faint">
          לעילוי נשמת נתן מסיקה נטושו יום טוב בן ג׳מילה
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-[7px] rounded-[8px] border border-line bg-surface-2 px-[11px] py-[5px]">
          <span className="text-[11px] text-muted">עכשיו</span>
          <span className="num text-[15px] font-semibold">{clock}</span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          className="grid size-[34px] cursor-pointer place-items-center rounded-[8px] border border-line bg-surface text-ink-2 transition-colors hover:border-line-strong hover:bg-surface-2"
        >
          {isDark ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
        </button>
      </div>
    </div>
  );
}
