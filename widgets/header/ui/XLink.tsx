type XLinkProps = {
  /** Header and mobile menu icon asset path for the X link. */
  iconSrc?: string;
};

/** Renders an external link to the X profile using the provided icon. */
export const XLink = ({ iconSrc = '/assets/icons/nyaomaru_web_icon_x.svg' }: XLinkProps) => (
  <a
    href='https://x.com/nyaomaru_dev'
    target='_blank'
    rel='noopener noreferrer'
    className='text-foreground hover:text-primary/80 transition-colors w-10 h-10 text-center justify-center items-center flex'
    aria-label='X'
  >
    <img src={iconSrc} alt='X icon' className='h-7 w-7' />
  </a>
);
