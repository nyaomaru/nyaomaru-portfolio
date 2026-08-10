import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from '@remix-run/react';
import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { CursorNyaomaru } from '@/widgets/cursor-nyaomaru';
import { Header } from '@/widgets/header';
import { Toaster } from '@/shared/ui';
import '@fontsource-variable/source-sans-3';
import tailwindStyles from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'icon', href: '/favicon.png', type: 'image/png' },
];

export const meta: MetaFunction = () => {
  const title = 'Nyaomaru Portfolio';
  const description =
    'Portfolio of Nyaomaru – A frontend engineer specializing in Vue, React, and TypeScript.';
  const image = 'https://nyaomaru-portfolio.vercel.app/assets/nyaomaru_ogp.png';
  const url = 'https://nyaomaru-portfolio.vercel.app';

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];
};

export default function App() {
  const location = useLocation();
  const hideCursorNyaomaru = location.pathname.startsWith('/game');

  return (
    <html lang='en' className='dark'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='min-h-[100dvh] m-0 p-0 overflow-x-clip'>
        {!hideCursorNyaomaru && <CursorNyaomaru />}
        <Header />
        <main className='min-h-[100dvh]'>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}
