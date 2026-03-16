type ImageRef = {
  /** Discriminator for image entries. */
  type: 'image';
  /** Image URL or path. */
  src: string;
  /** Optional accessible text for the image. */
  alt?: string;
  /** Optional CSS class name for sizing/styling. */
  className?: string;
};

type ProfileSection = {
  /** Section title (plain text). */
  title: string;
  /** Optional title image when using branded text assets. */
  titleImage?: ImageRef;
  /** Section body copy. */
  content: string;
  /** Icon string or image reference. */
  icon: string | ImageRef;
  /** Optional external link for the section. */
  link?: string;
};

export const profileSections: ProfileSection[] = [
  {
    title: 'is-kit',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_iskit.svg',
      alt: 'is-kit',
    },
    content: 'Lightweight, zero-dependency toolkit for building `isFoo` style type guards.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_iskit.svg',
      alt: 'is-kit',
    },
    link: 'https://github.com/nyaomaru/is-kit',
  },
  {
    title: 'changelog-bot',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_changelogbot.svg',
      alt: 'changelog-bot',
    },
    content: 'Automatic create changelog with AI. It provides CLI and github actions.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_changelogbot.svg',
      alt: 'changelog-bot',
    },
    link: 'https://github.com/nyaomaru/changelog-bot',
  },
  {
    title: 'Divider',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_divider.svg',
      alt: 'Divider',
    },
    content:
      'A simple utility to divide a string or string[] based on given indexes or delimiters.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_divider.svg',
      alt: 'Divider',
    },
    link: 'https://github.com/nyaomaru/divider',
  },
  {
    title: 'Divider Docs',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_divider_docs.svg',
      alt: 'Divider Docs',
    },
    content: 'Documentation page for divider library. It includes playground.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_divider.svg',
      alt: 'Divider Docs',
    },
    link: 'https://github.com/nyaomaru/divider-docs',
  },
  {
    title: 'Favorite Languages',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_favorite_languages.svg',
      alt: 'Favorite Languages',
    },
    content: 'TypeScript using both React and Vue. Functional patterns make me purr.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_heart.svg',
      alt: 'Favorite Languages',
    },
  },
  {
    title: 'Weaknesses',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_weaknesses.svg',
      alt: 'Weaknesses',
    },
    content: 'I respect jQuery, but I tend to knock it off the table like a true cat.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_alien.svg',
      alt: 'Weaknesses',
    },
  },
  {
    title: 'Server-side Experience',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_server_side_experience.svg',
      alt: 'Server-side Experience',
    },
    content: 'Worked with Java (Spring Boot), PHP (Drupal) Python, Swift and Kotlin',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_rocket.svg',
      alt: 'Server-side Experience',
    },
  },
  {
    title: 'Creative Outlet',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_creative_outlet_24.svg',
      alt: 'Creative Outlet',
    },
    content: 'I express myself through storytelling and illustrations, with a hint of poo.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_poop.svg',
      alt: 'Creative Outlet',
    },
  },
  {
    title: 'Work Style',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_work_style.svg',
      alt: 'Work Style',
    },
    content: 'Remote-first, async-friendly, and powered by curiosity.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_home.svg',
      alt: 'Work Style',
    },
  },
  {
    title: 'Learning Focus',
    titleImage: {
      type: 'image',
      src: '/assets/text/nyaomaru_web_text_lesning_focus.svg',
      alt: 'Learning Focus',
    },
    content: 'Design patterns, architecture, and cognitive science-based dev practices.',
    icon: {
      type: 'image',
      src: '/assets/icons/nyaomaru_web_icon_book.svg',
      alt: 'Learning Focus',
    },
    link: 'https://github.com/nyaomaru/technical-debt-sample',
  },
];
