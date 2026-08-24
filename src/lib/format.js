// ניסוח ספירה לאחור לתצוגה

/** "בעוד 12 דק׳" / "מתחיל עכשיו" / "התחיל לפני 3 דק׳" */
export function countdownLabel(minutesAway) {
  if (minutesAway === null || minutesAway === undefined) return null;
  if (minutesAway === 0) return 'מתחיל עכשיו';
  if (minutesAway < 0) return `התחיל לפני ${Math.abs(minutesAway)} דק׳`;
  if (minutesAway < 60) return `בעוד ${minutesAway} דק׳`;

  const h = Math.floor(minutesAway / 60);
  const m = minutesAway % 60;
  return m ? `בעוד ${h} שע׳ ${m} דק׳` : `בעוד ${h} שע׳`;
}

/** live עד 15 דק' אחורה, accent בשעה הקרובה, אחרת שקט */
export function countdownTone(minutesAway) {
  if (minutesAway === null || minutesAway === undefined) return 'quiet';
  if (minutesAway <= 0) return 'live';
  return minutesAway < 60 ? 'next' : 'quiet';
}
