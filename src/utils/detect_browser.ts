import { browsersName } from '../types/browser.types';

export const detectBrowser = (): browsersName => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) {
    return 'chrome';
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else {
    return 'other';
  }
};
