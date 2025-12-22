import type { Page } from '../router/Router';
import { Navbar } from '../components/Navbar';
import init, { process_frame_with_color, apply_edge_detection, apply_contrast } from '../../public/wasm/askii_wasm.js';
import { CameraController } from '../camera/CameraController';
import { AsciiRenderer } from '../ascii/AsciiRenderer';
import '../styles/studio.css';

export class StudioPage implements Page {
  private camera: CameraController | null = null;
  private renderer: AsciiRenderer | null = null;
  private animationId: number | null = null;
  private currentColorMode: 'grayscale' | 'color' | 'ansi' = 'grayscale';
  private currentFrameData: { data: Uint8ClampedArray; width: number; height: number } | null = null;
  private currentFilter: 'none' | 'edge' | 'contrast' = 'none';
  private useDetailedChars: boolean = false;
  private readonly BLOCK_SIZE = 8;
  private targetWidth: number = 0;
  private targetHeight: number = 0;

  render(): string {
    return `
     
      
      <div class="studio">
        <div class="canvas-container">
          <canvas id="canvas"></canvas>
        </div>
        
        <div class="controls">
          <div class="control-group">
            <button id="cameraBtn" class="btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Camera
            </button>
            
            <button id="switchCameraBtn" class="btn" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              Flip
            </button>
            
            <button id="uploadBtn" class="btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload
            </button>
            <input type="file" id="fileInput" accept="image/*" style="display:none;">
          </div>

          <div class="divider"></div>

          <div class="control-group">
            <button id="grayscaleBtn" class="mode-btn active">Grayscale</button>
            <button id="colorBtn" class="mode-btn">Color</button>
            <button id="ansiBtn" class="mode-btn">ANSI</button>
          </div>

          <div class="divider"></div>

          <div class="control-group">
            <button id="noneFilterBtn" class="filter-btn active">Normal</button>
            <button id="edgeFilterBtn" class="filter-btn">Edge</button>
            <button id="contrastFilterBtn" class="filter-btn">Contrast</button>
          </div>

          <div class="divider"></div>

          <div class="control-group">
            <button id="detailBtn" class="toggle-btn">Detail</button>
            <button id="exportBtn" class="btn">Export</button>
          </div>
        </div>

        <div class="info">
          <span class="hint">Scroll: zoom • Drag: pan</span>
        </div>
      </div>
    `;
  }

  async mount() {
    Navbar.mount();
    await this.initStudio();
    this.setupResizeHandler();
  }

  unmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.camera) {
      this.camera.stop();
      this.camera.destroy();
    }
    window.removeEventListener('resize', this.handleResize);
  }

  private setupResizeHandler() {
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (this.currentFrameData) {
      this.calculateTargetDimensions(this.currentFrameData.width, this.currentFrameData.height);
      this.processFrameData(this.currentFrameData.data, this.currentFrameData.width, this.currentFrameData.height);
    }
  }

  private calculateTargetDimensions(imageWidth: number, imageHeight: number) {
    const container = document.querySelector('.canvas-container') as HTMLElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate aspect ratio
    const imageAspect = imageWidth / imageHeight;
    const containerAspect = containerWidth / containerHeight;

    if (imageAspect > containerAspect) {
      // Image is wider than container
      this.targetWidth = containerWidth;
      this.targetHeight = containerWidth / imageAspect;
    } else {
      // Image is taller than container
      this.targetHeight = containerHeight;
      this.targetWidth = containerHeight * imageAspect;
    }
  }

  private async initStudio() {
    try {
      await init();

      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.renderer = new AsciiRenderer(canvas);

      document.getElementById('cameraBtn')!.addEventListener('click', () => this.startCamera());
      document.getElementById('switchCameraBtn')!.addEventListener('click', () => this.switchCamera());
      document.getElementById('uploadBtn')!.addEventListener('click', () => {
        document.getElementById('fileInput')!.click();
      });
      document.getElementById('fileInput')!.addEventListener('change', (e) => this.handleFileUpload(e));

      document.getElementById('grayscaleBtn')!.addEventListener('click', () => this.setColorMode('grayscale'));
      document.getElementById('colorBtn')!.addEventListener('click', () => this.setColorMode('color'));
      document.getElementById('ansiBtn')!.addEventListener('click', () => this.setColorMode('ansi'));

      document.getElementById('noneFilterBtn')!.addEventListener('click', () => this.setFilter('none'));
      document.getElementById('edgeFilterBtn')!.addEventListener('click', () => this.setFilter('edge'));
      document.getElementById('contrastFilterBtn')!.addEventListener('click', () => this.setFilter('contrast'));

      document.getElementById('detailBtn')!.addEventListener('click', () => this.toggleDetail());
      document.getElementById('exportBtn')!.addEventListener('click', () => this.exportAsText());

      this.renderer.onZoomChange(() => {
        if (this.currentFrameData) {
          this.processFrameData(this.currentFrameData.data, this.currentFrameData.width, this.currentFrameData.height);
        }
      });
    } catch (error) {
      console.error('Failed to initialize studio:', error);
      this.showErrorMessage('Failed to initialize. Please refresh the page.');
    }
  }

  private toggleDetail() {
    this.useDetailedChars = !this.useDetailedChars;
    const btn = document.getElementById('detailBtn')!;
    btn.classList.toggle('active');
    if (this.currentFrameData) {
      this.processFrameData(this.currentFrameData.data, this.currentFrameData.width, this.currentFrameData.height);
    }
  }

  private setFilter(filter: 'none' | 'edge' | 'contrast') {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${filter}FilterBtn`)!.classList.add('active');
    
    if (this.currentFrameData) {
      this.processFrameData(this.currentFrameData.data, this.currentFrameData.width, this.currentFrameData.height);
    }
  }

  private setColorMode(mode: 'grayscale' | 'color' | 'ansi') {
    this.currentColorMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}Btn`)!.classList.add('active');

    if (this.currentFrameData) {
      this.processFrameData(this.currentFrameData.data, this.currentFrameData.width, this.currentFrameData.height);
    }
  }

  private async startCamera() {
    try {
      if (!this.camera) {
        this.camera = new CameraController();
      }

      await this.camera.start(true);
      
      const resolution = this.camera.getResolution();
      console.log('Camera started:', {
        facingMode: this.camera.getCurrentFacingMode(),
        resolution: `${resolution.width}x${resolution.height}`
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const switchBtn = document.getElementById('switchCameraBtn');
      if (isMobile && switchBtn) {
        switchBtn.style.display = 'flex';
      }

      this.showSuccessMessage('Camera started successfully!');
      this.processLoop();
    } catch (error) {
      console.error('Failed to start camera:', error);
      this.showErrorMessage('Failed to start camera. Please check permissions.');
    }
  }

  private async switchCamera() {
    if (!this.camera?.isActive()) {
      this.showErrorMessage('Camera is not active');
      return;
    }

    try {
      await this.camera.switchCamera();
      const newMode = this.camera.getCurrentFacingMode();
      console.log('Camera switched to:', newMode);
      this.showSuccessMessage(`Switched to ${newMode === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
      console.error('Failed to switch camera:', error);
      this.showErrorMessage('Failed to switch camera');
    }
  }

  private processLoop = () => {
    if (!this.camera?.isActive()) return;

    const frame = this.camera.captureFrame();
    if (frame) {
      this.currentFrameData = frame;
      this.processFrameData(frame.data, frame.width, frame.height);
    }

    this.animationId = requestAnimationFrame(this.processLoop);
  }

  private handleFileUpload(e: Event) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.camera) {
      this.camera.stop();
      
      // Hide switch camera button when uploading image
      const switchBtn = document.getElementById('switchCameraBtn');
      if (switchBtn) {
        switchBtn.style.display = 'none';
      }
    }

    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showErrorMessage('Please select a valid image file');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      this.currentFrameData = { data: imageData.data, width: img.width, height: img.height };
      
      // Calculate proper dimensions for container
      this.calculateTargetDimensions(img.width, img.height);
      
      this.processFrameData(imageData.data, img.width, img.height);
      this.showSuccessMessage('Image loaded successfully!');
    };
    
    img.onerror = () => {
      this.showErrorMessage('Failed to load image');
    };

    img.src = URL.createObjectURL(file);
  }

  private processFrameData(rgba: Uint8ClampedArray, width: number, height: number) {
    try {
      // Calculate dimensions if not set
      if (this.targetWidth === 0 || this.targetHeight === 0) {
        this.calculateTargetDimensions(width, height);
      }

      const rgbaArray = new Uint8Array(rgba);
      let processedRgba = rgbaArray;

      if (this.currentFilter === 'contrast') {
        const contrast = apply_contrast(rgbaArray, width, height, 50);
        processedRgba = new Uint8Array(contrast);
      }

      const gridWidth = Math.floor(width / this.BLOCK_SIZE);
      const gridHeight = Math.floor(height / this.BLOCK_SIZE);

      if (this.currentFilter === 'edge') {
        const asciiBytes = apply_edge_detection(processedRgba, width, height, this.BLOCK_SIZE);
        const asciiChars = Array.from(asciiBytes).map((b: number) => String.fromCharCode(b));
        
        const blockData = asciiChars.map(char => ({
          char,
          r: 255,
          g: 255,
          b: 255
        }));

        this.renderer!.renderWithColorAndDimensions(
          blockData, 
          gridWidth, 
          gridHeight, 
          'grayscale',
          this.targetWidth,
          this.targetHeight
        );
      } else {
        const processed = process_frame_with_color(processedRgba, width, height, this.BLOCK_SIZE, this.useDetailedChars);
        const asciiBytes = processed.chars();
        const colorBytes = processed.colors();

        const blockData = [];
        for (let i = 0; i < asciiBytes.length; i++) {
          blockData.push({
            char: String.fromCharCode(asciiBytes[i]),
            r: colorBytes[i * 3],
            g: colorBytes[i * 3 + 1],
            b: colorBytes[i * 3 + 2]
          });
        }

        this.renderer!.renderWithColorAndDimensions(
          blockData, 
          gridWidth, 
          gridHeight, 
          this.currentColorMode,
          this.targetWidth,
          this.targetHeight
        );
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }

  private exportAsText() {
    if (!this.currentFrameData) {
      this.showErrorMessage('No image to export. Please load an image first.');
      return;
    }

    try {
      const gridWidth = Math.floor(this.currentFrameData.width / this.BLOCK_SIZE);
      const gridHeight = Math.floor(this.currentFrameData.height / this.BLOCK_SIZE);
      
      const rgbaArray = new Uint8Array(this.currentFrameData.data);
      const processed = process_frame_with_color(rgbaArray, this.currentFrameData.width, this.currentFrameData.height, this.BLOCK_SIZE, this.useDetailedChars);
      const asciiBytes = processed.chars();
      
      let text = '';
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const idx = y * gridWidth + x;
          text += String.fromCharCode(asciiBytes[idx]);
        }
        text += '\n';
      }

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `askii-art-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.showSuccessMessage('ASCII art exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      this.showErrorMessage('Failed to export ASCII art');
    }
  }

  private showErrorMessage(text: string) {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.transition = 'opacity 0.3s ease';
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 5000);
  }

  private showSuccessMessage(text: string) {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(34, 197, 94, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.transition = 'opacity 0.3s ease';
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }
}