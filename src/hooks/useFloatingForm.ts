import { useState, useEffect } from 'react';

interface FormPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const useFloatingForm = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<FormPosition | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SHOW_EVALUATION_FORM') {
        setPosition(event.data.payload.position);
        console.log('Evento recibido');
        console.log(event.data.payload.position);
        setIsVisible(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const hideForm = () => setIsVisible(false);

  return { isVisible, position, hideForm };
};

export default useFloatingForm;
