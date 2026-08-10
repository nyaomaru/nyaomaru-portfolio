import { Terminal } from '@/widgets/terminal';

const TOP_PAGE_CLASS_NAME =
  'h-[100dvh] w-full grid grid-rows-[minmax(1rem,1fr)_auto_minmax(1rem,1fr)] items-center justify-items-center px-4 sm:grid-rows-[minmax(13rem,1fr)_auto_minmax(1rem,1fr)]';
const TERMINAL_WRAPPER_CLASS_NAME =
  'row-start-2 w-full flex justify-center max-w-[calc(75dvh-10.5rem)] sm:max-w-[calc(177.7778dvh-24.8889rem)]';

const Top = () => {
  return (
    <div className={TOP_PAGE_CLASS_NAME}>
      <div className={TERMINAL_WRAPPER_CLASS_NAME}>
        <Terminal />
      </div>
    </div>
  );
};
Top.displayName = 'Top';

export { Top };
