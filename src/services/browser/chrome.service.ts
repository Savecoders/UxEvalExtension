import {
  BrowserAdapter,
  BrowserMessage,
  BrowserPort,
  RuntimeMessage,
  RuntimeSender,
  ScriptInjection
} from '@/types/browser';

class ChromeService implements BrowserAdapter<chrome.tabs.Tab> {
  private currentTab?: chrome.tabs.Tab;

  constructor() {}

  private async getActiveTab(): Promise<chrome.tabs.Tab> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getBrowserTab(): Promise<chrome.tabs.Tab> {
    if (!this.currentTab) {
      this.currentTab = await this.getActiveTab();
    }
    return this.currentTab;
  }

  async executeScript<R>(script: ScriptInjection): Promise<R> {
    return chrome.scripting
      .executeScript(script)
      .then((injectionResults) =>
        injectionResults.length ? (injectionResults[0].result as R) : <R>null
      )
      .catch((error) => {
        console.error(error);
        return <R>null;
      });
  }

  sendMessage<T>(message: RuntimeMessage<T>): Promise<T> {
    return chrome.runtime.sendMessage(message);
  }
  onMessage(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void {
    chrome.runtime.onMessage.addListener(callback);
  }

  removeMessageListener(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void {
    chrome.runtime.onMessage.removeListener(callback);
  }

  connectToBackground(portName: string): BrowserPort {
    return chrome.runtime.connect({ name: portName });
  }
}

export default ChromeService;
