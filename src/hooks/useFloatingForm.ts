import { useState, useEffect } from 'react';
import { BrowserMessage, browserTab } from '@/types/browser';
import { BrowserAdapter } from '../types/browser';

interface FormPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const useFloatingForm = (browserAdapter: BrowserAdapter<browserTab>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<FormPosition | null>(null);

  useEffect(() => {
    const port = browserAdapter.connectToBackground('popup');

    const handleMessage = (message: BrowserMessage) => {
      if (message.type === 'ELEMENT_SELECTED') {
        setPosition(message.payload.position);
        console.log('Element selected:', message.payload);
        setIsVisible(true);
      }
    };

    port.onMessage.addListener(handleMessage);
    browserAdapter.onMessage(handleMessage);

    return () => {
      port.disconnect();
      browserAdapter.removeMessageListener(handleMessage);
    };
  }, [browserAdapter]);

  const hideForm = () => setIsVisible(false);

  return { isVisible, position, hideForm };
};

export default useFloatingForm;
