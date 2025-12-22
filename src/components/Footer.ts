export class Footer {
  static render(): string {
    return `
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-icon">▚</span>
              <span class="logo-text">Askii</span>
            </div>
            <p class="footer-tagline">Transform reality into ASCII art</p>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Product</h4>
              <a href="/studio" data-link>Studio</a>
              <a href="/gallery" data-link>Gallery</a>
              <a href="#features">Features</a>
            </div>

            <div class="footer-column">
              <h4>Resources</h4>
              <a href="/about" data-link>About</a>
              <a href="#docs">Documentation</a>
              <a href="#api">API</a>
            </div>

            <div class="footer-column">
              <h4>Connect</h4>
              <a href="https://github.com" target="_blank">GitHub</a>
              <a href="https://twitter.com" target="_blank">Twitter</a>
              <a href="mailto:hello@askii.art">Contact</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 Askii. Built with Rust & WebAssembly.</p>
        </div>
      </footer>
    `;
  }
}