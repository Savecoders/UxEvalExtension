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
//ElementSelectedMessage
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

export interface BrowserAdapter<T> {
  getBrowserTab(): Promise<T>;
  executeScript<R>(script: ScriptInjection): Promise<R>;
  sendMessage<T>(message: RuntimeMessage<T>): Promise<T>;
  onMessage(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void;
  removeMessageListener(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void;
}
