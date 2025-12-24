import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import '../styles/landing.css';

export class LandingPage implements Page {
  render(): string {
    return `
      ${Navbar.render()}
      
      <main class="landing">
        <!-- Hero Section -->
        <section class="hero">
          <div class="hero-container">
            <div class="hero-content">
              <h1 class="hero-title">
                Transform Reality into
                <span class="gradient-text">ASCII Art</span>
              </h1>
              <p class="hero-description">
                Convert images and live webcam feeds into stunning ASCII art in real-time. 
                Powered by WebAssembly and Rust.
              </p>
              <div class="hero-actions">
                <a href="/studio" class="btn btn-primary btn-large" data-link>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Launch Studio
                </a>
              </div>
            </div>

            <div class="hero-visual">
              <div class="ascii-preview">
                <div class="image-comparison-container">
                  <div class="image-wrapper" id="imageWrapper">
                    <img id="baseImage" class="base-image" src="/eern.jpg" alt="Original Image">
                    <img id="overlayImage" class="overlay-image" src="/askii4.jpeg" alt="ASCII Version">
                    
                  </div>
                  <div class="comparison-label">
                    <span class="label-left">Original</span>
                    <span class="label-right">ASCII Art</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features" id="features">
          <div class="container">
            <h2 class="section-title">Powerful Features</h2>
            <p class="section-subtitle">Everything you need to create amazing ASCII art</p>

            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">📷</div>
                <h3>Live Camera</h3>
                <p>Convert webcam feed to ASCII art in real-time with smooth 30fps performance.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">🎨</div>
                <h3>Multiple Color Modes</h3>
                <p>Choose from grayscale, full color, or ANSI terminal palette rendering.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>WebAssembly Powered</h3>
                <p>Lightning-fast processing using Rust compiled to WebAssembly.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <h3>Edge Detection</h3>
                <p>Apply Sobel edge detection for artistic outline effects.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>Detail Modes</h3>
                <p>Switch between 10 or 65 character sets for different detail levels.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">💾</div>
                <h3>Export & Share</h3>
                <p>Download your ASCII art as text files or share online instantly.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta">
          <div class="cta-container">
            <h2>Ready to Create?</h2>
            <p>Start transforming images into ASCII art right now</p>
            <a href="/studio" class="btn btn-primary btn-large" data-link>
              Get Started Free
            </a>
          </div>
        </section>
      </main>

      ${Footer.render()}
    `;
  }

  mount() {
    Navbar.mount();
    this.initImageComparison();
  }

  private initImageComparison() {
    const imageWrapper = document.getElementById('imageWrapper');
    const overlayImage = document.getElementById('overlayImage') as HTMLImageElement;
    const revealRadius = 60;
    const trailDuration = 600;
    let trailCircles: HTMLDivElement[] = [];

    if (!imageWrapper || !overlayImage) return;

    const createTrailCircle = (x: number, y: number) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      imageWrapper.appendChild(trail);
      trailCircles.push(trail);

      setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }, 10);

      setTimeout(() => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
        trailCircles = trailCircles.filter(t => t !== trail);
      }, trailDuration);
    };

    let lastTrailTime = 0;
    const trailInterval = 80;

    imageWrapper.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = imageWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      overlayImage.style.clipPath = `circle(${revealRadius}px at ${x}px ${y}px)`;

      const now = Date.now();
      if (now - lastTrailTime > trailInterval) {
        createTrailCircle(x, y);
        lastTrailTime = now;
      }
    });

    imageWrapper.addEventListener('mouseleave', () => {
      overlayImage.style.clipPath = 'circle(0px at 0px 0px)';
      
      trailCircles.forEach(trail => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
      trailCircles = [];
    });
  }
}