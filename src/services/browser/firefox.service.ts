import { BrowserAdapter, BrowserMessage, RuntimeMessage, RuntimeSender, ScriptInjection } from '@/types/browser';

class FirefoxService implements BrowserAdapter<browser.tabs.Tab> {
  private currentTab?: browser.tabs.Tab;

  constructor() {}

  private async getActiveTab(): Promise<browser.tabs.Tab> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      return tabs[0];
    } else {
      throw new Error('No active tab found');
    }
  }

  async getBrowserTab(): Promise<browser.tabs.Tab> {
    if (!this.currentTab) {
      this.currentTab = await this.getActiveTab();
    }
    return this.currentTab;
  }

  async executeScript<R>(script: ScriptInjection): Promise<R> {
    return browser.scripting
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
    return browser.runtime.sendMessage(message);
  }
  onMessage(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void {
    browser.runtime.onMessage.addListener(callback);
  }
  removeMessageListener(
    callback: (message: BrowserMessage, sender: RuntimeSender) => void | Promise<void>
  ): void {
    browser.runtime.onMessage.addListener(callback);
  }
}

export default FirefoxService;
