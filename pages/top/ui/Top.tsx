import { Terminal } from '@/widgets/terminal';

const Top = () => {
  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center p-4 pt-24'>
      <div className='w-full flex justify-center'>
        <Terminal />
      </div>
    </div>
  );
};
Top.displayName = 'Top';

export { Top };
