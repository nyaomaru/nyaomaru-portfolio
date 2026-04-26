import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import { equals } from 'is-kit';
import { Button } from '@/shared/ui';
import { GitHubLink } from './GitHubLink';
import { LinkedInLink } from './LinkedInLink';
import { MailTo } from './MailTo';
import { NavigationLinks } from './NavigationLinks';
import { XLink } from './XLink';

const HEADER_ROOT_CLASS_NAME =
  'fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm shadow-sm z-50 px-4 sm:px-6 lg:px-8';
const HEADER_ROW_CLASS_NAME = 'flex items-center justify-between h-16 mt-4';
const HEADER_LEFT_GROUP_CLASS_NAME = 'flex items-center space-x-8';
const LOGO_LINK_CLASS_NAME = 'flex items-center group space-x-2';
const LOGO_BOX_CLASS_NAME = 'relative w-[9rem] h-10';
const LOGO_IMAGE_CLASS_NAME = 'absolute top-0 left-0 w-[9rem] h-9 block object-contain';
const MOBILE_MENU_BUTTON_CLASS_NAME =
  'text-main hover:text-main active:text-main focus-visible:text-main shadow-none [background-image:none] hover:[background-image:none] [&_svg]:!h-6 [&_svg]:!w-6';
const MOBILE_MENU_CONTAINER_CLASS_NAME =
  'sm:hidden fixed top-0 right-0 h-[100dvh] w-screen z-40 pointer-events-none transform-gpu transition-[transform,opacity] duration-500 ease-in-out';
const MOBILE_MENU_OPEN_CLASS_NAME = 'translate-x-0 opacity-100';
const MOBILE_MENU_CLOSED_CLASS_NAME = 'translate-x-[110%] opacity-0';
const MOBILE_MENU_BACKGROUND_IMAGE_CLASS_NAME =
  'absolute left-1/2 top-1/2 w-screen h-auto -translate-x-1/2 -translate-y-1/2 max-h-none object-contain';
const MOBILE_MENU_LINKS_GROUP_CLASS_NAME =
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6 pointer-events-auto';
const MOBILE_MENU_LINK_CLASS_NAME = 'relative inline-flex items-center pb-1';
const MOBILE_MENU_LINK_ICON_CLASS_NAME = 'h-4 w-auto';
const MOBILE_MENU_LINK_ACTIVE_LINE_CLASS_NAME = 'absolute -bottom-1 left-0 h-0.5 w-full bg-main';
const MOBILE_MENU_SOCIALS_CLASS_NAME =
  'absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 flex items-center pointer-events-auto';
const MOBILE_MENU_SOCIAL_ICON_SCALE_CLASS_NAME = 'scale-110';
const HAMBURGER_ICON_SIZE = 24;
const HAMBURGER_ICON_STROKE_WIDTH = 2;
const HAMBURGER_ICON_VIEW_BOX = '0 0 24 24';

const Header = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const showSvg = equals('true')(searchParams.get('showSvg'));
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isProfileActive = equals('/profile')(location.pathname);
  const isArticlesActive = equals('/articles')(location.pathname);
  const isGameActive = equals('/game')(location.pathname);

  return (
    <header className={HEADER_ROOT_CLASS_NAME}>
      <div className='w-full relative z-50'>
        <div className={HEADER_ROW_CLASS_NAME}>
          {/* Left: Logo + Links */}
          <div className={HEADER_LEFT_GROUP_CLASS_NAME}>
            <Link to='/' aria-label='Home' className={LOGO_LINK_CLASS_NAME}>
              {/* Logo container */}
              <div className={LOGO_BOX_CLASS_NAME}>
                {showSvg ? (
                  <img
                    src='/assets/nyaomaru.gif'
                    alt=''
                    aria-hidden
                    className={LOGO_IMAGE_CLASS_NAME}
                  />
                ) : (
                  <>
                    <img
                      src='/assets/nyaomaru_logo2.svg'
                      alt=''
                      aria-hidden
                      className={`${LOGO_IMAGE_CLASS_NAME} dark:hidden`}
                    />
                    <img
                      src='/assets/nyaomaru_logo2.svg'
                      alt=''
                      aria-hidden
                      className={`${LOGO_IMAGE_CLASS_NAME} hidden dark:block`}
                    />
                  </>
                )}
              </div>
            </Link>
            <NavigationLinks className='hidden sm:flex' />
          </div>
          {/* Hamburger for mobile */}
          <div className='flex items-center space-x-4 sm:hidden'>
            <Button
              variant='ghost'
              size='icon'
              className={MOBILE_MENU_BUTTON_CLASS_NAME}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <img
                  src='/assets/icons/nyaomaru_web_icon_close.svg'
                  alt='menu close icon'
                  className='h-6 w-6'
                />
              ) : (
                <svg
                  width={HAMBURGER_ICON_SIZE}
                  height={HAMBURGER_ICON_SIZE}
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={HAMBURGER_ICON_STROKE_WIDTH}
                  viewBox={HAMBURGER_ICON_VIEW_BOX}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              )}
            </Button>
          </div>
          {/* Right: GitHub */}
          <div className='hidden sm:flex items-center gap-1'>
            <MailTo />
            <GitHubLink />
            <LinkedInLink />
            <XLink />
          </div>
        </div>
      </div>
      {/* Mobile full-screen menu */}
      <div
        className={`${MOBILE_MENU_CONTAINER_CLASS_NAME} ${
          menuOpen ? MOBILE_MENU_OPEN_CLASS_NAME : MOBILE_MENU_CLOSED_CLASS_NAME
        }`}
        aria-hidden={!menuOpen}
      >
        <div className='absolute inset-0'>
          <img
            src='/assets/nyaomaru_icon.svg'
            alt='nyaomaru icon background'
            className={MOBILE_MENU_BACKGROUND_IMAGE_CLASS_NAME}
          />
        </div>

        <div className='relative h-full w-full pointer-events-none'>
          <div className={MOBILE_MENU_SOCIALS_CLASS_NAME}>
            <div className={MOBILE_MENU_SOCIAL_ICON_SCALE_CLASS_NAME}>
              <MailTo iconSrc='/assets/icons/nyaomaru_web_icon_mail_mobile.svg' />
            </div>
            <div className={MOBILE_MENU_SOCIAL_ICON_SCALE_CLASS_NAME}>
              <GitHubLink iconSrc='/assets/icons/nyaomaru_web_icon_github_mobile.svg' />
            </div>
            <div className={MOBILE_MENU_SOCIAL_ICON_SCALE_CLASS_NAME}>
              <LinkedInLink iconSrc='/assets/icons/nyaomaru_web_icon_linkedin_mobile.svg' />
            </div>
            <div className={MOBILE_MENU_SOCIAL_ICON_SCALE_CLASS_NAME}>
              <XLink iconSrc='/assets/icons/nyaomaru_web_icon_x_mobile.svg' />
            </div>
          </div>

          <div className={MOBILE_MENU_LINKS_GROUP_CLASS_NAME}>
            <Link
              to='/profile'
              aria-label='Profile'
              className={MOBILE_MENU_LINK_CLASS_NAME}
              onClick={() => setMenuOpen(false)}
            >
              <img
                src='/assets/text/nyaomaru_web_text_profile_mobile.svg'
                alt=''
                aria-hidden
                className={MOBILE_MENU_LINK_ICON_CLASS_NAME}
              />
              {isProfileActive && <span className={MOBILE_MENU_LINK_ACTIVE_LINE_CLASS_NAME} />}
            </Link>
            <Link
              to='/articles'
              aria-label='Articles'
              className={MOBILE_MENU_LINK_CLASS_NAME}
              onClick={() => setMenuOpen(false)}
            >
              <img
                src='/assets/text/nyaomaru_web_text_article_mobile.svg'
                alt=''
                aria-hidden
                className={MOBILE_MENU_LINK_ICON_CLASS_NAME}
              />
              {isArticlesActive && <span className={MOBILE_MENU_LINK_ACTIVE_LINE_CLASS_NAME} />}
            </Link>
            <Link
              to='/game'
              aria-label='Game'
              className={MOBILE_MENU_LINK_CLASS_NAME}
              onClick={() => setMenuOpen(false)}
            >
              <img
                src='/assets/text/nyaomaru_web_icon_text_text_game_mobile.svg'
                alt=''
                aria-hidden
                className={MOBILE_MENU_LINK_ICON_CLASS_NAME}
              />
              {isGameActive && <span className={MOBILE_MENU_LINK_ACTIVE_LINE_CLASS_NAME} />}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';

export { Header };
