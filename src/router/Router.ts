export type PageConstructor = new () => Page;

export interface Page {
  render(): string;
  mount?(): void;
  unmount?(): void;
}

export class Router {
  private routes: Map<string, PageConstructor> = new Map();
  private currentPage: Page | null = null;

  register(path: string, page: PageConstructor) {
    this.routes.set(path, page);
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-link]')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) this.navigate(href);
      }
    });
    this.handleRoute();
  }

  navigate(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  private handleRoute() {
    const path = window.location.pathname;
    const PageClass = this.routes.get(path) || this.routes.get('/');
    
    if (this.currentPage?.unmount) {
      this.currentPage.unmount();
    }

    if (PageClass) {
      this.currentPage = new PageClass();
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = this.currentPage.render();
        if (this.currentPage.mount) {
          this.currentPage.mount();
        }
      }
    }
  }
}