/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom';

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  disconnect() {}
  observe(target: Element) {}
  unobserve(target: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
