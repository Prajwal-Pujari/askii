export class Navbar {
  static render(): string {
    return `
      <nav class="navbar-light">
        <div class="navbar-container">
          <a href="/" class="navbar-brand" data-link>
            <span class="navbar-icon">
              <img src="/loggg.png" alt="Askii logo" />
            </span>
            <span class="brand-name">Askii</span>
          </a>
          
          <div class="navbar-menu" id="navbarMenu">
            <a href="/" class="menu-link" data-link>Home</a>
            <a href="/studio" class="menu-link" data-link>Studio</a>
            <a href="/about" class="menu-link" data-link>About</a>
          </div>

          <div class="navbar-actions">
            <a href="/studio" class="navbar-btn" data-link>
              <span class="btn-text">Launch Studio</span>
              <span class="btn-icon">→</span>
            </a>
            <button class="navbar-toggle" id="navbarToggle" aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  static mount() {
    const toggle = document.getElementById('navbarToggle');
    const menu = document.getElementById('navbarMenu');
    
    toggle?.addEventListener('click', () => {
      menu?.classList.toggle('active');
      toggle?.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.navbar-light')) {
        menu?.classList.remove('active');
        toggle?.classList.remove('active');
      }
    });

    // Close menu on link click (mobile)
    const links = menu?.querySelectorAll('.menu-link');
    links?.forEach(link => {
      link.addEventListener('click', () => {
        menu?.classList.remove('active');
        toggle?.classList.remove('active');
      });
    });
  }
}