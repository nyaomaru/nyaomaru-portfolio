import { Terminal } from '@/widgets/terminal';

const TOP_PAGE_CLASS_NAME =
  'min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 pt-52';
const TERMINAL_WRAPPER_CLASS_NAME =
  'w-full flex justify-center max-w-[calc(75dvh-10.5rem)] sm:max-w-[calc(177.7778dvh-24.8889rem)]';

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
