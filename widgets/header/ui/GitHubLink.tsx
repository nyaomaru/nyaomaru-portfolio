type GitHubLinkProps = {
  iconSrc?: string;
};

export const GitHubLink = ({
  iconSrc = '/assets/icons/nyaomaru_web_icon_github.svg',
}: GitHubLinkProps) => (
  <a
    href='https://github.com/nyaomaru'
    target='_blank'
    rel='noopener noreferrer'
    className='text-foreground hover:text-primary/80 transition-colors w-10 h-10 text-center justify-center items-center flex'
    aria-label='GitHub'
  >
    <img src={iconSrc} alt='' className='h-7 w-7' />
  </a>
);
