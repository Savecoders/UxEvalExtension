export type browsersName = 'chrome' | 'firefox' | 'other';
export type browserTab = chrome.tabs.Tab | browser.tabs.Tab;

export interface RuntimeSender {
  tab?: browserTab;
  frameId?: number;
  id?: string;
  url?: string;
}

export interface RuntimeMessage<T> {
  type: string;
  payload: T;
}

export interface ElementSelectedMessage {
  type: 'ELEMENT_SELECTED';
  payload: {
    selector: string;
    tagName: string;
    className: string;
    id: string;
    text?: string;
    position: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  };
}

export type BrowserMessage = ElementSelectedMessage;
// Agregar aquí otros tipos de mensajes...

export interface BrowserAdapter<T> {
  getBrowserTab(): Promise<T>;
  executeScript<R>(callback: () => void | Promise<R>): Promise<R>;
  sendMessage<T>(message: RuntimeMessage<T>): Promise<T>;
  onMessage(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void;
  removeMessageListener(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void;
}
