import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import '../styles/landing.css';

export class LandingPage implements Page {
  private gsap: any;
  private scrollTrigger: any;
  private resizeObserver: ResizeObserver | null = null;

  render(): string {
    return `
      ${Navbar.render()}
      
      <main class="landing-light">
        <!-- Hero Section -->
        <section class="hero-light">
          <div class="ascii-bg" id="asciiBg"></div>
          
          <div class="hero-content-light">
            
            
            <h1 class="hero-title-light">
              <span class="title-top">Transform Reality Into</span>
              <span class="title-main">ASCII Art</span>
              <span class="title-accent">████▓▓▓▒▒▒░░░</span>
            </h1>
            
            <p class="hero-desc-light">
              Real-time image & camera processing with blazing-fast WebAssembly.
              <br>Create stunning pixel art masterpieces in your browser.
            </p>
            
            <div class="hero-cta-light">
              <a href="/studio" class="btn-primary-light" data-link>
                <span class="btn-content">
                  <span class="btn-icon">▶</span>
                  Launch Studio
                </span>
                <span class="btn-shine"></span>
              </a>
              <a href="#features" class="btn-secondary-light">
                <span class="btn-content">
                  <span class="btn-icon">↓</span>
                  Explore Features
                </span>
              </a>
            </div>
            
            <div class="hero-metrics-light">
              <div class="metric-item">
                <div class="metric-value">30fps</div>
                <div class="metric-label">Real-time</div>
              </div>
              <div class="metric-sep">░▒▓</div>
              <div class="metric-item">
                <div class="metric-value">0ms</div>
                <div class="metric-label">Lag-free</div>
              </div>
              <div class="metric-sep">░▒▓</div>
              <div class="metric-item">
                <div class="metric-value">65+</div>
                <div class="metric-label">Characters</div>
              </div>
            </div>
          </div>
          
          <div class="hero-visual-light">
            <div class="preview-card">
              <div class="card-header">
                <div class="dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="card-title">ascii_art.wasm</span>
              </div>
              <div class="card-body">
                <div class="image-showcase" id="imageShowcase">
                  <img src="/eern.jpg" alt="Original" class="showcase-img base">
                  <img src="/askii4.jpeg" alt="ASCII" class="showcase-img overlay">
                  <div class="reveal-indicator">
                    <span>━━━</span>
                    <span class="pulse">●</span>
                    <span>━━━</span>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <span class="footer-label">INPUT</span>
                <span class="footer-arrow">→</span>
                <span class="footer-label accent">OUTPUT</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section class="features-light" id="features">
          <div class="container-light">
            <div class="section-head">
              <div class="head-label">
                <span class="label-icon">▓▓▒▒░░</span>
                FEATURES
              </div>
              <h2 class="head-title">Powerful ASCII Tools</h2>
              <p class="head-desc">Everything you need to create pixel-perfect art</p>
            </div>
            
            <div class="features-grid-light">
              <div class="feature-box" data-index="1">
                <div class="box-number">01</div>
                <div class="box-icon">📷</div>
                <h3 class="box-title">Live Camera</h3>
                <p class="box-desc">Real-time webcam conversion at smooth 30fps with zero latency.</p>
                <div class="box-tags">
                  <span>WebRTC</span>
                  <span>Canvas</span>
                </div>
              </div>

              <div class="feature-box" data-index="2">
                <div class="box-number">02</div>
                <div class="box-icon">⚡</div>
                <h3 class="box-title">Lightning Fast</h3>
                <p class="box-desc">Rust-powered WebAssembly for native-level performance.</p>
                <div class="box-tags">
                  <span>Rust</span>
                  <span>WASM</span>
                </div>
              </div>

              <div class="feature-box" data-index="3">
                <div class="box-number">03</div>
                <div class="box-icon">🎨</div>
                <h3 class="box-title">Color Modes</h3>
                <p class="box-desc">Choose from grayscale, RGB, or authentic ANSI palettes.</p>
                <div class="box-tags">
                  <span>RGB</span>
                  <span>ANSI</span>
                </div>
              </div>

              <div class="feature-box" data-index="4">
                <div class="box-number">04</div>
                <div class="box-icon">🔍</div>
                <h3 class="box-title">Edge Detection</h3>
                <p class="box-desc">Advanced Sobel algorithms for stunning outline effects.</p>
                <div class="box-tags">
                  <span>Sobel</span>
                  <span>CV</span>
                </div>
              </div>

              <div class="feature-box" data-index="5">
                <div class="box-number">05</div>
                <div class="box-icon">✨</div>
                <h3 class="box-title">Detail Control</h3>
                <p class="box-desc">Switch between 10 or 65 character sets for precision.</p>
                <div class="box-tags">
                  <span>10-char</span>
                  <span>65-char</span>
                </div>
              </div>

              <div class="feature-box" data-index="6">
                <div class="box-number">06</div>
                <div class="box-icon">💾</div>
                <h3 class="box-title">Export & Share</h3>
                <p class="box-desc">Download as .txt or share your creations instantly.</p>
                <div class="box-tags">
                  <span>Export</span>
                  <span>Share</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Tech Stack -->
        <section class="tech-light">
          <div class="container-light">
            <div class="tech-grid">
              <div class="tech-code">
                <div class="code-window">
                  <div class="window-bar">
                    <div class="bar-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span class="bar-title">cargo.toml</span>
                  </div>
                  <pre class="code-pre" id="codeContent"><code>[dependencies]
wasm-bindgen = "0.2"
image = "0.24"

[lib]
crate-type = ["cdylib"]</code></pre>
                </div>
              </div>
              
              <div class="tech-info">
                <div class="info-label">
                  <span class="label-icon">▓▓▒▒░░</span>
                  TECHNOLOGY
                </div>
                <h2 class="info-title">Built with Modern Web Tech</h2>
                <div class="tech-items">
                  <div class="tech-row">
                    <span class="row-icon">▓</span>
                    <div class="row-content">
                      <strong>Rust + WebAssembly</strong>
                      <p>Native performance directly in your browser</p>
                    </div>
                  </div>
                  <div class="tech-row">
                    <span class="row-icon">▓</span>
                    <div class="row-content">
                      <strong>TypeScript</strong>
                      <p>Type-safe and maintainable architecture</p>
                    </div>
                  </div>
                  <div class="tech-row">
                    <span class="row-icon">▓</span>
                    <div class="row-content">
                      <strong>Canvas API</strong>
                      <p>Hardware-accelerated rendering pipeline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Final CTA -->
        <section class="cta-light">
          <div class="cta-box">
            <div class="cta-glow"></div>
            <div class="cta-content">
             
              <h2 class="cta-title">Start Creating Today</h2>
              <p class="cta-desc">Transform your photos into ASCII masterpieces</p>
              <a href="/studio" class="btn-cta-light" data-link>
                <span class="btn-content">
                  <span class="btn-icon">▶</span>
                  Launch Studio Now
                </span>
                <span class="btn-shine"></span>
              </a>
            </div>
          </div>
        </section>
      </main>

      ${Footer.render()}
    `;
  }

  async mount() {
    Navbar.mount();
    await this.loadGSAP();
    this.initAnimations();
    this.initImageReveal();
    this.initASCIIBackground();
    this.setupResizeHandler();
  }

  unmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
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
    this.gsap.from('.hero-badge-light', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2)'
    });

    this.gsap.from('.title-top', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.2
    });

    this.gsap.from('.title-main', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.4
    });

    this.gsap.from('.title-accent', {
      scaleX: 0,
      opacity: 0,
      duration: 0.8,
      delay: 0.6,
      transformOrigin: 'left'
    });

    this.gsap.from('.hero-desc-light', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.8
    });

    this.gsap.from('.hero-cta-light', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 1
    });

    this.gsap.from('.metric-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 1.2
    });

    this.gsap.from('.preview-card', {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out'
    });

    // Feature boxes
    this.gsap.utils.toArray('.feature-box').forEach((box: any, i: number) => {
      this.gsap.from(box, {
        scrollTrigger: {
          trigger: box,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.08,
        ease: 'power2.out'
      });
    });

    // Tech section
    this.gsap.from('.tech-code', {
      scrollTrigger: {
        trigger: '.tech-light',
        start: 'top 75%'
      },
      x: -60,
      opacity: 0,
      duration: 0.8
    });

    this.gsap.from('.tech-info', {
      scrollTrigger: {
        trigger: '.tech-light',
        start: 'top 75%'
      },
      x: 60,
      opacity: 0,
      duration: 0.8
    });

    // CTA
    this.gsap.from('.cta-content', {
      scrollTrigger: {
        trigger: '.cta-light',
        start: 'top 80%'
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.8
    });

    // Code typewriter effect
    const codeContent = document.getElementById('codeContent');
    if (codeContent) {
      const text = codeContent.textContent || '';
      codeContent.textContent = '';
      
      this.gsap.to(codeContent, {
        scrollTrigger: {
          trigger: '.tech-light',
          start: 'top 70%',
          onEnter: () => {
            let i = 0;
            const type = setInterval(() => {
              if (i < text.length) {
                codeContent.textContent += text.charAt(i);
                i++;
              } else {
                clearInterval(type);
              }
            }, 15);
          }
        }
      });
    }
  }

  private initImageReveal() {
    const showcase = document.getElementById('imageShowcase');
    const overlay = showcase?.querySelector('.overlay') as HTMLImageElement;
    
    if (!showcase || !overlay) return;

    let rafId: number | null = null;
    let currentX = 0;
    let currentY = 0;
    const radius = window.innerWidth < 768 ? 60 : 100;

    const updateClip = () => {
      overlay.style.clipPath = `circle(${radius}px at ${currentX}px ${currentY}px)`;
      rafId = null;
    };

    showcase.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = showcase.getBoundingClientRect();
      currentX = e.clientX - rect.left;
      currentY = e.clientY - rect.top;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(updateClip);
      }
    });

    showcase.addEventListener('touchmove', (e: TouchEvent) => {
      const rect = showcase.getBoundingClientRect();
      const touch = e.touches[0];
      currentX = touch.clientX - rect.left;
      currentY = touch.clientY - rect.top;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(updateClip);
      }
    });

    const resetClip = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      overlay.style.clipPath = 'circle(0px at 0px 0px)';
    };

    showcase.addEventListener('mouseleave', resetClip);
    showcase.addEventListener('touchend', resetClip);
  }

  private initASCIIBackground() {
    const bg = document.getElementById('asciiBg');
    if (!bg) return;

    const chars = '.·:░▒▓█';
    const count = window.innerWidth < 768 ? 50 : 100;

    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ascii-char';
      span.textContent = chars[Math.floor(Math.random() * chars.length)];
      span.style.left = `${Math.random() * 100}%`;
      span.style.top = `${Math.random() * 100}%`;
      span.style.animationDelay = `${Math.random() * 5}s`;
      span.style.fontSize = `${Math.random() * 20 + 10}px`;
      bg.appendChild(span);
    }
  }

  private setupResizeHandler() {
    let timeout: number;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        // Reinitialize ASCII background on resize
        const bg = document.getElementById('asciiBg');
        if (bg) {
          bg.innerHTML = '';
          this.initASCIIBackground();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
  }
}