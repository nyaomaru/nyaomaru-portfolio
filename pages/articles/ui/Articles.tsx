import { Card } from '@/shared/ui';
import { articles } from '../model';

const Articles = () => {
  return (
    <div className='min-h-[100dvh] w-full bg-background p-4 pt-36 sm:p-8 sm:pt-32'>
      <h1 className='mb-24 flex justify-center'>
        <img
          src='/assets/text/nyaomaru_web_text_article.svg'
          alt='Articles'
          className='h-6 w-auto'
        />
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block transition-transform hover:scale-105'
          >
            <Card className='h-full p-8 pt-12'>
              <h2 className='text-xl font-semibold mb-3'>{article.title}</h2>
              <p className='text-sub'>{article.summary}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};
Articles.displayName = 'Articles';

export { Articles };
