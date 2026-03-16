import { Card } from '@/shared/ui';
import { articles } from '../model';

const Articles = () => {
  return (
    <div className='min-h-screen w-full bg-background pt-24 p-8'>
      <h1 className='mb-8 flex justify-center'>
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
            <Card className='h-full p-6'>
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
