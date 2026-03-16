import type { MetaFunction } from '@remix-run/node';
import { hasKey } from 'is-kit';
import { Game } from '@/pages/game';

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((m) => m.id === 'root')?.meta ?? [];
  const newTitle = { title: 'Game - Nyaomaru' };
  const hasTitle = hasKey('title');

  return [newTitle, ...rootMeta.filter((tag) => !hasTitle(tag))];
};

export default function GameRoute() {
  return <Game />;
}
