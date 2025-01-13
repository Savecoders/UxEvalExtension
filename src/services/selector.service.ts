import { BrowserAdapter, browserTab } from '@/types/browser';

class SelectorService {
  private readonly browser: BrowserAdapter<browserTab>;
  private messageListener: ((event: MessageEvent) => void) | null = null;

  constructor(browserAdapter: BrowserAdapter<browserTab>) {
    this.browser = browserAdapter;
  }

  async startSelection(): Promise<void> {
    // Configurar el listener antes de inyectar el script
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }

    this.messageListener = async (event) => {
      if (event.data?.type === 'ELEMENT_SELECTED') {
        await this.browser.sendMessage(event.data);
      }
    };
    window.addEventListener('message', this.messageListener);

    // Inyectar el script en la página activa
    const tab = await this.browser.getBrowserTab();
    await this.browser.executeScript({
      target: { tabId: tab.id! },
      func: this.injectSelectionMode,
    });
  }

  private injectSelectionMode = () => {
    // Crear un div para el portal en la página del navegador
    const portalContainer = document.createElement('div');
    portalContainer.id = 'ux-evaluation-portal';
    document.body.appendChild(portalContainer);

    // Crear overlay para resaltar elementos
    const overlay = document.createElement('div');
    overlay.id = 'ux-selector-overlay';
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;  
      z-index: 10000;
      background: rgba(130, 130, 255, 0.3);
      border: 2px solid rgb(130, 130, 255);
      display: none;
    `;
    document.body.appendChild(overlay);

    // Agregar estilos para elementos hover
    const style = document.createElement('style');
    style.id = 'ux-selector-styles';
    style.textContent = `
      .ux-hoverable {
        cursor: pointer !important;
      }
      .ux-hoverable:hover {
        outline: 2px dashed rgb(130, 130, 255) !important;
        outline-offset: -2px !important;
      }
    `;
    document.head.appendChild(style);

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target as HTMLElement;
      if (!target || target.id === 'ux-selector-overlay') return;

      const selector = target.id
        ? `#${target.id}`
        : target.tagName.toLowerCase();
      const rect = target.getBoundingClientRect();

      // Handle both SVG and HTML elements
      const className =
        target instanceof SVGElement
          ? (target.className as SVGAnimatedString).baseVal
          : target.className.toString();

      window.postMessage(
        {
          type: 'ELEMENT_SELECTED',
          payload: {
            selector,
            tagName: target.tagName,
            className,
            id: target.id,
            text: target.textContent || undefined,
            position: {
              top: rect.bottom + window.scrollY + 10,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height,
            },
          },
        },
        '*',
      );
    };

    function handleMouseOver(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target || target.id === 'ux-selector-overlay') return;

      // Agregar clase para estilo hover
      target.classList.add('ux-hoverable');

      // Actualizar posición del overlay
      const overlay = document.getElementById('ux-selector-overlay');
      if (overlay) {
        const rect = target.getBoundingClientRect();
        overlay.style.display = 'block';
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
      }
    }

    function handleMouseOut(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target || target.id === 'ux-selector-overlay') return;

      // Remover clase hover
      target.classList.remove('ux-hoverable');

      // Ocultar overlay
      const overlay = document.getElementById('ux-selector-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }

    // Agregar eventos
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);
    document.body.addEventListener('click', handleClick, true);

    // Cambiar cursor
    document.body.style.cursor = 'crosshair';

    // Guardar referencias para limpieza
    window._uxSelectorHandlers = {
      handleMouseOver,
      handleMouseOut,
      handleClick,
    };
  };

  async stopSelection(): Promise<void> {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    const tab = await this.browser.getBrowserTab();
    await this.browser.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        document.getElementById('ux-evaluation-portal')?.remove();
        document.getElementById('ux-selector-overlay')?.remove();
        document.getElementById('ux-selector-styles')?.remove();
        document.body.style.cursor = 'default';
        document.querySelectorAll('.ux-hoverable').forEach((el) => {
          el.classList.remove('ux-hoverable');
        });
      },
    });
  }
}

// Agregar la declaración del tipo global para TypeScript
declare global {
  interface Window {
    _uxSelectorHandlers?: {
      handleMouseOver: (event: MouseEvent) => void;
      handleMouseOut: (event: MouseEvent) => void;
      handleClick: (event: MouseEvent) => void;
    };
  }
}

export default SelectorService;
