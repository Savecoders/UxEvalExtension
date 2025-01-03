import { BrowserAdapter, browserTab } from '@/types/browser';

class PageService {
  private readonly browser: BrowserAdapter<browserTab>;
  private tab: browserTab;

  constructor(browserAdapter: BrowserAdapter<browserTab>) {
    this.browser = browserAdapter;
    this.tab = {} as browserTab;
  }

  async setCurrentMainTab(): Promise<void> {
    this.tab = await this.browser.getBrowserTab();
  }

  getUrlBrowserTab(): string | undefined {
    return this.tab.url;
  }

  async getCurrentTab(): Promise<browserTab> {
    if (!this.tab.url) {
      await this.setCurrentMainTab();
    }
    return this.tab;
  }

  getPageTitle(): string | undefined {
    return this.tab.title;
  }

  getPageMetadata(): PageMetadata {
    const url = this.getUrlBrowserTab();
    const hostname = this.getNamePage();
    const title = this.getPageTitle();

    return {
      url,
      hostname,
      title,
      timestamp: new Date(),
      path: url ? new URL(url).pathname : undefined
    };
  }

  getNamePage(): string | undefined {
    const url = this.getUrlBrowserTab();
    if (!url) return undefined;

    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return undefined;
    }
  }

  isValidUrl(): boolean {
    const url = this.getUrlBrowserTab();
    if (!url) return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export interface PageMetadata {
  url?: string;
  hostname?: string;
  title?: string;
  timestamp: Date;
  path?: string;
}

export default PageService;
