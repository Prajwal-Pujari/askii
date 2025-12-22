import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export class GalleryPage implements Page {
  render(): string {
    return `
      ${Navbar.render()}
      
      <main class="gallery-page">
        <div class="container">
          <h1 class="page-title">Gallery</h1>
          <p class="page-subtitle">Explore ASCII art created by our community</p>
          
          <div class="gallery-grid">
            <div class="gallery-item">
              <div class="gallery-placeholder">Coming Soon</div>
              <p>Community Gallery</p>
            </div>
          </div>
        </div>
      </main>

      ${Footer.render()}
    `;
  }

  mount() {
    Navbar.mount();
  }
}