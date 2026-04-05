type TerminalHeaderProps = {
  /** Callback function triggered when the red button is clicked (reset terminal) */
  onRedButtonClick: () => void;
  /** Callback function triggered when the green button is clicked (show ASCII art) */
  onGreenButtonClick: () => void;
};

const TerminalHeader = ({ onRedButtonClick, onGreenButtonClick }: TerminalHeaderProps) => (
  <div className='bg-background px-5 py-3 grid grid-cols-3 items-center border-b border-primary/30 shrink-0'>
    <div />
    <div className='flex items-center justify-center mt-2 mb-2'>
      <img
        src='/assets/text/nyaomaru_web_text_nyaomaru_is.svg'
        alt='nyaomaru is'
        className='h-3.5 w-auto max-w-none sm:h-5 sm:max-w-full'
      />
    </div>
    <div className='flex items-center sm:gap-3 justify-end'>
      <button
        type='button'
        onClick={onGreenButtonClick}
        className='inline-flex items-center justify-center p-1 rounded-md transition-opacity opacity-80 hover:opacity-100'
        title='Show ASCII art'
        aria-label='Show ASCII art'
      >
        <img src='/assets/nyaomaru_icon.svg' alt='secret nyaomaru icon' className='h-5 w-5' />
      </button>
      <button
        type='button'
        onClick={onRedButtonClick}
        className='inline-flex items-center justify-center p-1 rounded-md transition-opacity opacity-80 hover:opacity-100'
        title='Reset terminal'
        aria-label='Reset terminal'
      >
        <img
          src='/assets/icons/nyaomaru_web_icon_reload.svg'
          alt='reload icon'
          className='h-5 w-5'
        />
      </button>
    </div>
  </div>
);
TerminalHeader.displayName = 'TerminalHeader';

export { TerminalHeader };
