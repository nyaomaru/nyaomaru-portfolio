type LinkedInLinkProps = {
  /** Header and mobile menu icon asset path for the LinkedIn link. */
  iconSrc?: string;
};

/** Renders an external link to the LinkedIn profile using the provided icon. */
export const LinkedInLink = ({
  iconSrc = '/assets/icons/nyaomaru_web_icon_linkedin.svg',
}: LinkedInLinkProps) => (
  <a
    href='https://www.linkedin.com/in/daiki-fukushima-b683813b1/'
    target='_blank'
    rel='noopener noreferrer'
    className='text-foreground hover:text-primary/80 transition-colors w-10 h-10 text-center justify-center items-center flex'
    aria-label='LinkedIn'
  >
    <img src={iconSrc} alt='LinkedIn icon' className='h-7 w-7' />
  </a>
);
