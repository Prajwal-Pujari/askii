import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export class AboutPage implements Page {
  render(): string {
    return `
      ${Navbar.render()}
      
      <main class="about-page">
        <div class="container">
          <h1 class="page-title">About Askii</h1>
          
          <div class="about-content">
            <section class="about-section">
              <h2>What is Askii?</h2>
              <p>Askii is a cutting-edge web application that transforms images and live camera feeds into stunning ASCII art in real-time. Built with performance in mind, it leverages WebAssembly and Rust to deliver smooth, responsive processing.</p>
            </section>

            <section class="about-section">
              <h2>Technology Stack</h2>
              <ul>
                <li><strong>Rust</strong> - Core image processing logic</li>
                <li><strong>WebAssembly</strong> - Near-native performance in the browser</li>
                <li><strong>TypeScript</strong> - Type-safe application logic</li>
                <li><strong>HTML5 Canvas</strong> - High-performance rendering</li>
              </ul>
            </section>

            <section class="about-section">
              <h2>Open Source</h2>
              <p>Askii is open source and available on GitHub. Contributions are welcome!</p>
              <a href="https://github.com/yourusername/askii" class="btn btn-primary" target="_blank">View on GitHub</a>
            </section>
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