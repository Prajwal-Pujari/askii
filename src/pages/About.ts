import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import '../styles/about.css';

export class AboutPage implements Page {
  private gsap: any;
  private scrollTrigger: any;

  render(): string {
    return `
      ${Navbar.render()}
      
      <main class="about-light">
        <div class="ascii-background" id="asciiBackground"></div>
        
        <div class="about-container">
          <!-- Hero Header -->
          <div class="about-hero">
            <div class="hero-label">
              <span class="label-pixel">▓▓▒▒░░</span>
              ABOUT PROJECT
            </div>
            <h1 class="hero-heading">
              <span class="heading-top">Built for</span>
              <span class="heading-main">Creators & Developers</span>
              <span class="heading-accent">████▓▓▓▒▒▒░░░</span>
            </h1>
            <p class="hero-text">
              Transforming reality into stunning ASCII art with blazing-fast
              <br class="hide-mobile">WebAssembly performance and modern web technologies.
            </p>
          </div>
          
          <!-- Main Content -->
          <div class="about-sections">
            <!-- Section 01: What is Askii -->
            <section class="content-section" data-aos="1">
              <div class="section-meta">
                <span class="section-num">01</span>
                <span class="section-emoji">🎨</span>
              </div>
              <div class="section-body">
                <h2 class="section-heading">What is Askii?</h2>
                <p class="section-text">
                  Askii is a high-performance web application that transforms images and live camera feeds into stunning ASCII art in real-time. Built with cutting-edge technology, it delivers smooth 30fps processing directly in your browser.
                </p>
                <p class="section-text">
                  Whether you're creating digital art, learning about image processing, or just exploring creative tools, Askii provides a powerful and accessible platform for ASCII art generation.
                </p>
                
                <div class="metrics-grid">
                  <div class="metric-card">
                    <div class="metric-number">30fps</div>
                    <div class="metric-text">Real-time</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-number">65+</div>
                    <div class="metric-text">Characters</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-number">0ms</div>
                    <div class="metric-text">Latency</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 02: Technology Stack -->
            <section class="content-section" data-aos="2">
              <div class="section-meta">
                <span class="section-num">02</span>
                <span class="section-emoji">⚡</span>
              </div>
              <div class="section-body">
                <h2 class="section-heading">Technology Stack</h2>
                <p class="section-text">
                  Askii leverages modern web technologies to deliver native-like performance without sacrificing accessibility or ease of use.
                </p>
                
                <div class="tech-stack">
                  <div class="tech-item">
                    <div class="tech-icon">🦀</div>
                    <h3 class="tech-name">Rust</h3>
                    <p class="tech-desc">
                      Core image processing algorithms written in Rust for maximum performance and memory safety.
                    </p>
                    <span class="tech-tag">Systems Language</span>
                  </div>
                  
                  <div class="tech-item">
                    <div class="tech-icon">⚙️</div>
                    <h3 class="tech-name">WebAssembly</h3>
                    <p class="tech-desc">
                      Compiled to WASM for near-native speed in the browser with zero installation required.
                    </p>
                    <span class="tech-tag">Binary Format</span>
                  </div>
                  
                  <div class="tech-item">
                    <div class="tech-icon">📘</div>
                    <h3 class="tech-name">TypeScript</h3>
                    <p class="tech-desc">
                      Type-safe application architecture ensuring reliability and maintainable code.
                    </p>
                    <span class="tech-tag">Frontend Logic</span>
                  </div>
                  
                  <div class="tech-item">
                    <div class="tech-icon">🎬</div>
                    <h3 class="tech-name">Canvas API</h3>
                    <p class="tech-desc">
                      Hardware-accelerated 2D rendering for smooth, responsive visual output.
                    </p>
                    <span class="tech-tag">Rendering Engine</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 03: Key Features -->
            <section class="content-section" data-aos="3">
              <div class="section-meta">
                <span class="section-num">03</span>
                <span class="section-emoji">✨</span>
              </div>
              <div class="section-body">
                <h2 class="section-heading">Key Features</h2>
                
                <div class="features-list">
                  <div class="feature-row">
                    <span class="feature-icon">▸</span>
                    <div class="feature-content">
                      <strong class="feature-title">Real-time Camera Processing</strong>
                      <p class="feature-text">Convert your webcam feed to ASCII art at smooth 30fps with zero lag</p>
                    </div>
                  </div>
                  
                  <div class="feature-row">
                    <span class="feature-icon">▸</span>
                    <div class="feature-content">
                      <strong class="feature-title">Multiple Color Modes</strong>
                      <p class="feature-text">Choose from grayscale, full RGB color, or authentic ANSI terminal palettes</p>
                    </div>
                  </div>
                  
                  <div class="feature-row">
                    <span class="feature-icon">▸</span>
                    <div class="feature-content">
                      <strong class="feature-title">Edge Detection</strong>
                      <p class="feature-text">Apply Sobel edge detection algorithms for stunning artistic outline effects</p>
                    </div>
                  </div>
                  
                  <div class="feature-row">
                    <span class="feature-icon">▸</span>
                    <div class="feature-content">
                      <strong class="feature-title">Adjustable Detail Levels</strong>
                      <p class="feature-text">Switch between 10 or 65 character sets for precise control over detail</p>
                    </div>
                  </div>
                  
                  <div class="feature-row">
                    <span class="feature-icon">▸</span>
                    <div class="feature-content">
                      <strong class="feature-title">Export & Share</strong>
                      <p class="feature-text">Download your creations as text files or share them instantly online</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 04: Open Source -->
            <section class="content-section" data-aos="4">
              <div class="section-meta">
                <span class="section-num">04</span>
                <span class="section-emoji">🔓</span>
              </div>
              <div class="section-body">
                <h2 class="section-heading">Open Source</h2>
                <p class="section-text">
                  Askii is open source and available on GitHub. Contributions are welcome!
                </p>
                <p class="section-text">
                  Whether you're fixing bugs, adding features, or improving documentation, your contributions help make Askii better for everyone.
                </p>
                
                <div class="github-section">
                  <a href="https://github.com/Prajwal-Pujari/askii" class="github-btn" target="_blank" rel="noopener noreferrer">
                    <span class="btn-content">
                      <span class="btn-icon-left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </span>
                      View on GitHub
                      <span class="btn-icon-right">→</span>
                    </span>
                    <span class="btn-shine"></span>
                  </a>
                  
                  
                </div>
              </div>
            </section>

            <!-- Section 05: CTA -->
            <section class="content-section cta-section" data-aos="5">
              <div class="cta-wrapper">
                <h2 class="cta-heading">Ready to Create?</h2>
                <p class="cta-text">Start transforming your images into ASCII art masterpieces</p>
                <a href="/studio" class="cta-button" data-link>
                  <span class="btn-content">
                    <span class="btn-icon">▶</span>
                    Launch Studio
                  </span>
                  <span class="btn-shine"></span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      ${Footer.render()}
    `;
  }

  async mount() {
    Navbar.mount();
    await this.loadGSAP();
    this.initAnimations();
    this.initASCIIBackground();
  }

  private async loadGSAP() {
    if (typeof window !== 'undefined' && !(window as any).gsap) {
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      document.head.appendChild(gsapScript);

      const scrollTriggerScript = document.createElement('script');
      scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
      document.head.appendChild(scrollTriggerScript);

      await new Promise((resolve) => {
        scrollTriggerScript.onload = resolve;
      });
    }

    this.gsap = (window as any).gsap;
    this.scrollTrigger = (window as any).ScrollTrigger;
    this.gsap.registerPlugin(this.scrollTrigger);
  }

  private initAnimations() {
    if (!this.gsap) return;

    // Hero animations
    this.gsap.from('.hero-label', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2)'
    });

    this.gsap.from('.heading-top', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.2
    });

    this.gsap.from('.heading-main', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.4
    });

    this.gsap.from('.heading-accent', {
      scaleX: 0,
      opacity: 0,
      duration: 0.8,
      delay: 0.6,
      transformOrigin: 'left'
    });

    this.gsap.from('.hero-text', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.8
    });

    // Section animations
    this.gsap.utils.toArray('.content-section').forEach((section: any) => {
      this.gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // Metric cards
    this.gsap.utils.toArray('.metric-card').forEach((card: any, i: number) => {
      this.gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%'
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.1,
        ease: 'back.out(2)'
      });
    });

    // Tech items
    this.gsap.utils.toArray('.tech-item').forEach((item: any, i: number) => {
      this.gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 90%'
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out'
      });
    });

    // Feature rows
    this.gsap.utils.toArray('.feature-row').forEach((row: any, i: number) => {
      this.gsap.from(row, {
        scrollTrigger: {
          trigger: row,
          start: 'top 92%'
        },
        x: -30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out'
      });
    });

    // GitHub section
    this.gsap.from('.github-section', {
      scrollTrigger: {
        trigger: '.github-section',
        start: 'top 90%'
      },
      y: 40,
      opacity: 0,
      duration: 0.8
    });

    // CTA
    this.gsap.from('.cta-wrapper', {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 85%'
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  private initASCIIBackground() {
    const bg = document.getElementById('asciiBackground');
    if (!bg) return;

    const chars = '.·:░▒▓█';
    const count = window.innerWidth < 768 ? 40 : 80;

    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ascii-float';
      span.textContent = chars[Math.floor(Math.random() * chars.length)];
      span.style.left = `${Math.random() * 100}%`;
      span.style.top = `${Math.random() * 100}%`;
      span.style.animationDelay = `${Math.random() * 5}s`;
      span.style.fontSize = `${Math.random() * 16 + 12}px`;
      span.style.opacity = `${Math.random() * 0.1 + 0.02}`;
      bg.appendChild(span);
    }
  }
}