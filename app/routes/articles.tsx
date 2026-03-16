import type { MetaFunction } from '@remix-run/node';
import { hasKey } from 'is-kit';
import { Articles } from '@/pages/articles';

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((m) => m.id === 'root')?.meta ?? [];
  const newTitle = { title: 'Articles - Nyaomaru' };
  const hasTitle = hasKey('title');

  return [newTitle, ...rootMeta.filter((tag) => !hasTitle(tag))];
};

export default function ArticlesRoute() {
  return <Articles />;
}
