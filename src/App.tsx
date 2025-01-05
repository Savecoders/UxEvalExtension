import { useState, useEffect } from 'react';
import FirefoxService from '@/services/browser/firefox.service';
import ChromeService from '@/services/browser/chrome.service';
import { detectBrowser } from '@/utils/detect_browser';
import FloatingForm from '@/components/FloatingForm';
import SelectorService from '@/services/selector.service';

function App() {
  const [isActive, setIsActive] = useState(false);
  const [browser, setBrowser] = useState<FirefoxService | ChromeService | null>(null);
  const [selectorServices, setSelectorServices] = useState<SelectorService | null>(null);

  // Detectar el navegador al cargar el componente
  useEffect(() => {
    const browserName = detectBrowser();
    if (browserName === 'chrome') {
      setBrowser(new ChromeService());
    } else if (browserName === 'firefox') {
      setBrowser(new FirefoxService());
    }
  }, []);

  // Inicializar el servicio de selección cuando el navegador esté listo
  useEffect(() => {
    if (browser) {
      const service = new SelectorService(browser);
      setSelectorServices(service);

      return () => {
        service.stopSelection();
      };
    }
  }, [browser]);

  if (!browser || !selectorServices) return null;

  // Manejar el inicio del modo de selección
  const handleClick = async () => {
    setIsActive(true);
    await selectorServices.startSelection();
  };

  return (
    <>
      <h2>Euristic Evaluation Extension</h2>
      <p>Este es un ejemplo de cómo se puede integrar una extensión de Chrome o Firefox</p>
      {isActive ? (
        <p>
          <strong>Estás en modo de selección</strong>
        </p>
      ) : (
        <button onClick={handleClick}>Let's go Evaluation</button>
      )}
      <FloatingForm />
    </>
  );
}

export default App;
