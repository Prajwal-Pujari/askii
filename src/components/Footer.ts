export class Footer {
  static render(): string {
    return `
      <footer class="footer-light">
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-brand">
              <div class="brand-logo">
                <span class="footer-icon">
                  <img src="/loggg.png" alt="Askii logo" />
                </span>
                <span class="brand-name">Askii</span>
              </div>
              <p class="brand-tagline">Transform reality into stunning ASCII art with WebAssembly-powered processing.</p>
            </div>

            <div class="footer-links">
              <div class="link-column">
                <h4 class="column-title">Product</h4>
                <a href="/studio" class="link-item" data-link>Studio</a>
                <a href="/" class="link-item" data-link>Features</a>
                <a href="/about" class="link-item" data-link>About</a>
              </div>

              

              <div class="link-column">
                <h4 class="column-title">Connect</h4>
                <a href="https://github.com/Prajwal-Pujari/askii" target="_blank" rel="noopener" class="link-item">
                  <span class="link-icon">→</span>
                  GitHub
                </a>
                <a href="https://x.com/Gravity_Exists" target="_blank" rel="noopener" class="link-item">
                  <span class="link-icon">→</span>
                  Twitter
                </a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="bottom-content">
              <p class="copyright">
                <span class="copy-symbol">©</span>
                2025 Askii. Built with 
                <span class="highlight">Rust</span> & 
                <span class="highlight">WebAssembly</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}