import { BrowserAdapter, BrowserMessage, RuntimeMessage, RuntimeSender } from '@/types/browser';

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

  async executeScript<R>(callback: () => Promise<R>): Promise<R> {
    const tab = await this.getBrowserTab();

    return chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        func: callback
      })
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
}

export default ChromeService;
