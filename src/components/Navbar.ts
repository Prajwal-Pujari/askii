export class Navbar {
  static render(): string {
    return `
      <nav class="navbar">
        <div class="nav-container">
          <a href="/" class="nav-logo" data-link>
            <span class="logo-icon">▚</span>
            <span class="logo-text">Askii</span>
          </a>
          
          <div class="nav-menu" id="navMenu">
            <a href="/" class="nav-link" data-link>Home</a>
            <a href="/studio" class="nav-link" data-link>Studio</a>
            
            <a href="/about" class="nav-link" data-link>About</a>
          </div>

          <div class="nav-actions">
            <a href="/studio" class="btn btn-primary" data-link>Launch Studio</a>
            <button class="nav-toggle" id="navToggle">
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
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    
    toggle?.addEventListener('click', () => {
      menu?.classList.toggle('active');
    });
  }
}