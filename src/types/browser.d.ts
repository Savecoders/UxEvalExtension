export type browsersName = 'chrome' | 'firefox' | 'other';
export type browserTab = chrome.tabs.Tab | browser.tabs.Tab;

export interface RuntimeSender {
  tab?: browserTab;
  frameId?: number;
  id?: string;
  url?: string;
}

// Base message payload type
export interface ElementSelectedPayload {
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
}

export interface ElementSelectedMessage {
  type: 'ELEMENT_SELECTED';
  payload: ElementSelectedPayload;
}

export interface RuntimeMessage<T> {
  type: T extends ElementSelectedMessage ? 'ELEMENT_SELECTED' : string;
  payload: T extends ElementSelectedMessage ? ElementSelectedPayload : T;
}

export type BrowserMessage = ElementSelectedMessage;

export interface InjectionTarget {
  allFrames?: boolean | undefined;
  documentIds?: string[] | undefined;
  frameIds?: number[] | undefined;
  tabId: number;
}
// /MessageEvent
export interface ScriptInjection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[] | undefined;
  files?: string[] | undefined;
  func: () => void | undefined;
  target: InjectionTarget;
  world?: ExecutionWorld | undefined;
  injectImmediately?: boolean | undefined;
}

export interface BrowserPort {
  name: string;
  onMessage: {
    addListener: (callback: (message: RuntimeMessage) => void) => void;
    removeListener: (callback: (message: RuntimeMessage) => void) => void;
  };
  disconnect: () => void;
}

export interface BrowserAdapter<T> {
  getBrowserTab(): Promise<T>;
  executeScript<R>(script: ScriptInjection): Promise<R>;
  sendMessage<T>(message: RuntimeMessage<T>): Promise<T>;
  onMessage(
    callback: (
      message: BrowserMessage,
      sender: RuntimeSender,
    ) => void | Promise<void>,
  ): void;
  removeMessageListener(
    callback: (
      message: BrowserMessage,
      sender: RuntimeSender,
    ) => void | Promise<void>,
  ): void;
  connectToBackground(portName: string): BrowserPort;
}
