import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isString } from 'is-kit';
import { Button, Card } from '@/shared/ui';
import { profileSections } from '../model';

const PROFILE_PAGE_CLASS_NAME = 'min-h-screen flex flex-col items-center justify-center p-4';
const PROFILE_CONTAINER_CLASS_NAME = 'w-full max-w-2xl';
const PROFILE_CARD_CLASS_NAME = 'p-8 text-center min-h-[20rem] flex flex-col';
const PROFILE_ICON_WRAP_CLASS_NAME = 'text-4xl mt-6 h-14 flex items-center justify-center';
const PROFILE_TITLE_WRAP_CLASS_NAME =
  'text-2xl font-bold mb-2 h-12 flex items-center justify-center';
const PROFILE_CONTENT_CLASS_NAME = 'mt-4 text-lg leading-relaxed';
const PROFILE_LINK_WRAP_CLASS_NAME = 'min-h-[2.5rem] flex items-end justify-center';
const PROFILE_NAVIGATION_CLASS_NAME = 'flex justify-center mt-8 gap-4';
const DEFAULT_ICON_CLASS_NAME = 'h-12';
const DEFAULT_TITLE_IMAGE_CLASS_NAME = 'h-6';

const PROFILE_SLIDE_OFFSET_X = 100;
const PROFILE_SLIDE_DURATION_SECONDS = 0.5;

const Profile = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % profileSections.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + profileSections.length) % profileSections.length);
  };

  const currentSection = profileSections[currentIndex];
  const icon = currentSection.icon;
  const titleImage = currentSection.titleImage;

  return (
    <div className={PROFILE_PAGE_CLASS_NAME}>
      <div className={PROFILE_CONTAINER_CLASS_NAME}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: PROFILE_SLIDE_OFFSET_X }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -PROFILE_SLIDE_OFFSET_X }}
            transition={{ duration: PROFILE_SLIDE_DURATION_SECONDS }}
          >
            <Card className={PROFILE_CARD_CLASS_NAME}>
              <div className='flex-1 flex flex-col justify-start'>
                <div className={PROFILE_ICON_WRAP_CLASS_NAME}>
                  {isString(icon) ? (
                    icon
                  ) : (
                    <img
                      src={icon.src}
                      alt={icon.alt ?? ''}
                      className={`mx-auto w-auto ${icon.className ?? DEFAULT_ICON_CLASS_NAME}`}
                    />
                  )}
                </div>
                <h2 className={PROFILE_TITLE_WRAP_CLASS_NAME}>
                  {titleImage ? (
                    <img
                      src={titleImage.src}
                      alt={titleImage.alt ?? currentSection.title}
                      className={`mx-auto w-auto ${titleImage.className ?? DEFAULT_TITLE_IMAGE_CLASS_NAME}`}
                    />
                  ) : (
                    currentSection.title
                  )}
                </h2>
                <p className={PROFILE_CONTENT_CLASS_NAME}>{currentSection.content}</p>
              </div>

              <div className={PROFILE_LINK_WRAP_CLASS_NAME}>
                {currentSection.link && (
                  <motion.a
                    href={currentSection.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    whileHover='hover'
                    className='group inline-flex items-center gap-1 font-semibold
                   text-primary hover:text-primary/80 focus:outline-none'
                  >
                    <span className='relative'>
                      View&nbsp;More
                      <span
                        className='absolute left-0 -bottom-0.5 h-0.5 w-full scale-x-0
                       bg-gradient-to-r from-primary to-primary/60
                       transition-transform duration-300 ease-out
                       group-hover:scale-x-100'
                      />
                    </span>
                  </motion.a>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className={PROFILE_NAVIGATION_CLASS_NAME}>
          <Button onClick={prevSlide} variant={'profile'}>
            Back
          </Button>
          <Button onClick={nextSlide} variant={'profile'}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
Profile.displayName = 'Profile';

export { Profile };
