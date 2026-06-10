import { ArticleReaction } from '../types';

export type ReactionGroup = { emoji: string; userIds: string[] };

export function groupReactionsByEmoji(reactions: ArticleReaction[] | undefined): ReactionGroup[] {
  if (!reactions?.length) return [];
  const map = new Map<string, string[]>();
  for (const r of reactions) {
    if (!map.has(r.emoji)) map.set(r.emoji, []);
    map.get(r.emoji)!.push(r.userId);
  }
  return Array.from(map.entries()).map(([emoji, userIds]) => ({ emoji, userIds }));
}

export function userHasReaction(reactions: ArticleReaction[] | undefined, userId: string, emoji: string): boolean {
  return !!reactions?.some((r) => r.userId === userId && r.emoji === emoji);
}
