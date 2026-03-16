import { useEffect, useState } from 'react';

type TypewriterProps = {
  text: string;
  speed?: number;
  onComplete?: () => void;
};

const Typewriter = ({ text, speed = 30, onComplete }: TypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayText}</span>;
};
Typewriter.displayName = 'Typewriter';

export { Typewriter };
