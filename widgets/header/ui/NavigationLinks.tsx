import { Link, useLocation } from '@remix-run/react';
import { equals, oneOfValues } from 'is-kit';
import { navigationItems } from '../model/navigation';

/**
 * Props for the NavigationLinks component
 */
type NavigationLinksProps = {
  /** Optional callback function triggered when a navigation link is clicked */
  onNavigate?: () => void;
  /** Optional CSS class name to apply to the navigation container */
  className?: string;
};

const NavigationLinks = ({ onNavigate, className = '' }: NavigationLinksProps) => {
  const location = useLocation();
  const isPrimaryNavPath = oneOfValues('/profile', '/articles', '/game');

  return (
    <div className={`space-x-6 ${className}`.trim()}>
      {navigationItems.map((item) => {
        const isActive = equals(item.to)(location.pathname);
        const isPrimaryNavItem = isPrimaryNavPath(item.to);
        const disableActiveUnderline = isActive && isPrimaryNavItem;
        const underlineColorClass = isPrimaryNavItem ? 'bg-main' : 'bg-current';

        return (
          <Link
            key={item.to}
            to={item.to}
            className='group relative inline-flex items-center text-sm font-medium text-foreground'
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left ${underlineColorClass} transition-transform duration-200 ${
                disableActiveUnderline
                  ? 'scale-x-0'
                  : isActive
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
            {item.to === '/profile' ? (
              <>
                <img
                  src='/assets/text/nyaomaru_web_text_profile.svg'
                  alt='profile text icon'
                  className={`hidden h-3 w-auto transition sm:block ${
                    isActive ? 'brightness-75' : ''
                  }`}
                />
                <img
                  src='/assets/text/nyaomaru_web_text_profile_mobile.svg'
                  alt='profile text icon for mobile'
                  className={`h-3 w-auto transition sm:hidden ${isActive ? 'brightness-75' : ''}`}
                />
                <span className='sr-only'>Profile</span>
              </>
            ) : item.to === '/articles' ? (
              <>
                <img
                  src='/assets/text/nyaomaru_web_text_article.svg'
                  alt='article text icon'
                  className={`hidden h-3 w-auto transition sm:block ${
                    isActive ? 'brightness-75' : ''
                  }`}
                />
                <img
                  src='/assets/text/nyaomaru_web_text_article_mobile.svg'
                  alt='article text icon for mobile'
                  className={`h-3 w-auto transition sm:hidden ${isActive ? 'brightness-75' : ''}`}
                />
                <span className='sr-only'>Articles</span>
              </>
            ) : item.to === '/game' ? (
              <>
                <img
                  src='/assets/text/nyaomaru_web_icon_text_text_game.svg'
                  alt='game text icon'
                  className={`h-3 w-auto transition ${isActive ? 'brightness-75' : ''}`}
                />
                <span className='sr-only'>Game</span>
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </div>
  );
};
NavigationLinks.displayName = 'NavigationLinks';

export { NavigationLinks };
