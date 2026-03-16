import type { MetaFunction } from '@remix-run/node';
import { hasKey } from 'is-kit';
import { Top } from '@/pages/top';

export const meta: MetaFunction = ({ matches }) => {
  const rootMeta = matches.find((m) => m.id === 'root')?.meta ?? [];
  const newTitle = { title: 'Top - Nyaomaru' };
  const hasTitle = hasKey('title');

  return [newTitle, ...rootMeta.filter((tag) => !hasTitle(tag))];
};

export default function TopRoute() {
  return (
    <div className='h-full flex items-center justify-center'>
      <Top />
    </div>
  );
}
