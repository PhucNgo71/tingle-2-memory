export const DAY = 86_400_000;
export const reviewDays = [1, 3, 7];
export type LevelProgress = { version: 1; completedAt: number | null; reviewPassed: number; nextReviewAt: number | null; mastered: boolean };
export const emptyProgress = (): LevelProgress => ({ version: 1, completedAt: null, reviewPassed: 0, nextReviewAt: null, mastered: false });
export function qualifies(correct: number, total: number) { return total > 0 && correct / total >= 0.9; }
export function completeLevel(now: number): LevelProgress { return { version: 1, completedAt: now, reviewPassed: 0, nextReviewAt: now + DAY, mastered: false }; }
export function finishReview(progress: LevelProgress, correct: number, total: number, now: number): LevelProgress {
  if (!progress.completedAt || progress.mastered || !progress.nextReviewAt || now < progress.nextReviewAt) return progress;
  if (!qualifies(correct, total)) return { ...progress, nextReviewAt: now + DAY };
  const passed = progress.reviewPassed + 1;
  if (passed >= reviewDays.length) return { ...progress, reviewPassed: passed, mastered: true, nextReviewAt: null };
  // Review dates are at least 1, 3 and 7 days after completion, and never on the same day as the last review.
  return { ...progress, reviewPassed: passed, nextReviewAt: Math.max(progress.completedAt + reviewDays[passed] * DAY, now + DAY) };
}
export function parseProgress(raw: string | null): LevelProgress {
  try {
    const p = JSON.parse(raw || "null");
    if (!p || p.version !== 1 || !Number.isInteger(p.reviewPassed) || p.reviewPassed < 0 || p.reviewPassed > 3 || typeof p.mastered !== "boolean") return emptyProgress();
    if (p.completedAt === null) return emptyProgress();
    if (!Number.isFinite(p.completedAt) || p.completedAt <= 0 || (p.nextReviewAt !== null && (!Number.isFinite(p.nextReviewAt) || p.nextReviewAt <= p.completedAt))) return emptyProgress();
    if (p.mastered !== (p.reviewPassed === 3) || (p.mastered ? p.nextReviewAt !== null : p.nextReviewAt === null)) return emptyProgress();
    return p as LevelProgress;
  } catch { return emptyProgress(); }
}
