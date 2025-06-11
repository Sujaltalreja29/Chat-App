import { useEffect, useRef, useState } from 'react';

export const useIntersection = (targetRef, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const observer = useRef(null);

  useEffect(() => {
    if (!targetRef?.current) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    );

    observer.current.observe(targetRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [targetRef, options.threshold, options.rootMargin]);

  return [isIntersecting, entry];
};