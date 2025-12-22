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
                Powered by WebAssembly for blazing-fast performance.
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
                <pre class="ascii-art">
         
                </pre>
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
  }
}