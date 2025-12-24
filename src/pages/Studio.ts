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
  private isControlsCollapsed: boolean = false;
  private readonly MAX_IMAGE_DIMENSION = 1920; // Maximum width or height
  // private readonly COMPRESSION_QUALITY = 0.85; // JPEG quality for compression

  render(): string {
  return `
   
    
    <div class="studio">
      <div class="canvas-container">
        <canvas id="canvas"></canvas>
      </div>
      
      <div class="controls">
      <button id="toggleControlsBtn" class="toggle-controls-btn" title="Toggle Controls">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div class="controls-content">
        <div class="control-group">
          <button id="cameraBtn" class="btn">
            <svg id="cameraIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span id="cameraText">Camera</span>
            <span id="cameraStatus" class="camera-status"></span>
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
          <input type="file" id="fileInput" accept="image/*,.heic,.heif,.HEIC" style="display:none;">
          
          <button id="removeImageBtn" class="btn" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Remove
          </button>
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
          <button id="resetViewBtn" class="btn" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              Reset
            </button>
          <div class="export-dropdown">
            
            <button id="exportBtn" class="btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="export-menu">
              <button id="exportTxtBtn" class="export-option">Export as TXT</button>
              <button id="exportJpgBtn" class="export-option">Export as JPG</button>
              
            </div>
          </div>
        </div>
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
    this.setupControlsToggle();
    this.setupMobileTouchZoom();
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

  private setupControlsToggle() {
  const toggleBtn = document.getElementById('toggleControlsBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      this.isControlsCollapsed = !this.isControlsCollapsed;
      const controls = document.querySelector('.controls');
      const controlsContent = document.querySelector('.controls-content');
      
      if (this.isControlsCollapsed) {
        controls?.classList.add('collapsed');
        controlsContent?.classList.add('hidden');
      } else {
        controls?.classList.remove('collapsed');
        controlsContent?.classList.remove('hidden');
      }
    });
  }
}

  private setupMobileTouchZoom() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  let initialDistance = 0;
  let currentZoom = 1;

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && this.renderer) {
      e.preventDefault();
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const delta = currentDistance - initialDistance;
      
      // Calculate zoom factor
      const zoomChange = delta * 0.005;
      currentZoom = Math.max(0.5, Math.min(5, currentZoom + zoomChange));
      
      // Apply zoom through renderer
      this.renderer.setZoom(currentZoom);
      
      initialDistance = currentDistance;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialDistance = 0;
    }
  });
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

      document.getElementById('cameraBtn')!.addEventListener('click', () => this.toggleCamera());
      document.getElementById('switchCameraBtn')!.addEventListener('click', () => this.switchCamera());
      document.getElementById('uploadBtn')!.addEventListener('click', () => {
        document.getElementById('fileInput')!.click();
      });
      document.getElementById('fileInput')!.addEventListener('change', (e) => this.handleFileUpload(e));
      document.getElementById('removeImageBtn')!.addEventListener('click', () => this.removeImage());

      document.getElementById('grayscaleBtn')!.addEventListener('click', () => this.setColorMode('grayscale'));
      document.getElementById('colorBtn')!.addEventListener('click', () => this.setColorMode('color'));
      document.getElementById('ansiBtn')!.addEventListener('click', () => this.setColorMode('ansi'));

      document.getElementById('noneFilterBtn')!.addEventListener('click', () => this.setFilter('none'));
      document.getElementById('edgeFilterBtn')!.addEventListener('click', () => this.setFilter('edge'));
      document.getElementById('contrastFilterBtn')!.addEventListener('click', () => this.setFilter('contrast'));

      document.getElementById('detailBtn')!.addEventListener('click', () => this.toggleDetail());
     const exportBtn = document.getElementById('exportBtn')!;
    const exportDropdown = document.querySelector('.export-dropdown')!;
    

   exportBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportDropdown.classList.toggle('show-menu');
    
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (!exportDropdown.contains(target)) {
    exportDropdown.classList.remove('show-menu');
  }
});

// Prevent dropdown from closing when clicking inside it
exportDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.getElementById('exportTxtBtn')!.addEventListener('click', () => {
  exportDropdown.classList.remove('show-menu');
  this.exportAsText();
});

document.getElementById('exportJpgBtn')!.addEventListener('click', () => {
  exportDropdown.classList.remove('show-menu');
  this.exportAsJPG();
});

// document.getElementById('exportPdfBtn')!.addEventListener('click', () => {
//   exportDropdown.classList.remove('show-menu');
//   this.exportAsPDF();
// });

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Reset view button
      const resetViewBtn = document.getElementById('resetViewBtn');
      if (resetViewBtn) {
        resetViewBtn.style.display = 'flex';
        
        resetViewBtn.addEventListener('click', () => {
          if (this.renderer) {
            this.renderer.resetView();
            this.showSuccessMessage('View reset to default');
          }
        });
      }

      // Zoom buttons (if you add them later)
      const zoomInBtn = document.getElementById('zoomInBtn');
      const zoomOutBtn = document.getElementById('zoomOutBtn');
      
      if (zoomInBtn && zoomOutBtn) {
        zoomInBtn.style.display = 'flex';
        zoomOutBtn.style.display = 'flex';
        
        zoomInBtn.addEventListener('click', () => {
          if (this.renderer) {
            const currentZoom = this.renderer.getZoom();
            this.renderer.setZoom(currentZoom + 0.2);
          }
        });
        
        zoomOutBtn.addEventListener('click', () => {
          if (this.renderer) {
            const currentZoom = this.renderer.getZoom();
            this.renderer.setZoom(currentZoom - 0.2);
          }
        });
      }
    }


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

  private async toggleCamera() {
  if (this.camera?.isActive()) {
    // Stop camera
    this.stopCamera();
  } else {
    // Start camera
    await this.startCamera();
  }
}

private stopCamera() {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  
  if (this.camera) {
    this.camera.stop();
  }

  // Clear canvas
  this.clearCanvas();
  this.currentFrameData = null;

  // Update UI
  const cameraBtn = document.getElementById('cameraBtn');
  const cameraText = document.getElementById('cameraText');
  const cameraStatus = document.getElementById('cameraStatus');
  const switchBtn = document.getElementById('switchCameraBtn');
  const removeBtn = document.getElementById('removeImageBtn');
  
  if (cameraBtn) cameraBtn.classList.remove('camera-active');
  if (cameraText) cameraText.textContent = 'Camera';
  if (cameraStatus) cameraStatus.classList.remove('active');
  if (switchBtn) switchBtn.style.display = 'none';
  if (removeBtn) removeBtn.style.display = 'none';
  
  this.showSuccessMessage('Camera stopped');
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

    // Update UI to show camera is active
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraText = document.getElementById('cameraText');
    const cameraStatus = document.getElementById('cameraStatus');
    
    if (cameraBtn) cameraBtn.classList.add('camera-active');
    if (cameraText) cameraText.textContent = 'Stop Camera';
    if (cameraStatus) cameraStatus.classList.add('active');

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

  private async handleFileUpload(e: Event) {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  if (this.camera) {
    this.camera.stop();
    
    const switchBtn = document.getElementById('switchCameraBtn');
    if (switchBtn) {
      switchBtn.style.display = 'none';
    }
  }

  if (this.camera?.isActive()) {
    this.stopCamera();
  }

  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Check if it's HEIC/HEIF format
  const fileName = file.name.toLowerCase();
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
  
  if (!file.type.startsWith('image/') && !isHeic) {
    this.showErrorMessage('Please select a valid image file');
    return;
  }

  this.showSuccessMessage('Processing image...');

  // Handle HEIC files using createImageBitmap
  if (isHeic || file.type === 'image/heic' || file.type === 'image/heif') {
    try {
      const bitmap = await createImageBitmap(file);
      this.processBitmap(bitmap);
      return;
    } catch (error) {
      console.error('HEIC processing failed:', error);
      this.showErrorMessage('Failed to process HEIC file. Your browser may not support this format.');
      return;
    }
  }

  // Handle regular image files
  const img = new Image();
  img.onload = () => {
    this.processImageElement(img);
    URL.revokeObjectURL(img.src);
  };
  
  img.onerror = () => {
    this.showErrorMessage('Failed to load image');
    URL.revokeObjectURL(img.src);
  };

  img.src = URL.createObjectURL(file);
}

// Add helper method for ImageBitmap
private processBitmap(bitmap: ImageBitmap) {
  let targetWidth = bitmap.width;
  let targetHeight = bitmap.height;
  
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  
  // Scale down if image is too large
  if (targetWidth > this.MAX_IMAGE_DIMENSION || targetHeight > this.MAX_IMAGE_DIMENSION) {
    const scale = Math.min(
      this.MAX_IMAGE_DIMENSION / targetWidth,
      this.MAX_IMAGE_DIMENSION / targetHeight
    );
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
  }

  // Create canvas for processing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { 
    alpha: false,
    willReadFrequently: true 
  })!;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  
  this.currentFrameData = { 
    data: imageData.data, 
    width: targetWidth, 
    height: targetHeight 
  };
  
  this.calculateTargetDimensions(targetWidth, targetHeight);
  this.processFrameData(imageData.data, targetWidth, targetHeight);
  
  const removeBtn = document.getElementById('removeImageBtn');
  if (removeBtn) {
    removeBtn.style.display = 'flex';
  }
  
  const compressionMsg = (originalWidth !== targetWidth || originalHeight !== targetHeight)
    ? ` (optimized from ${originalWidth}×${originalHeight})`
    : '';
  this.showSuccessMessage(`Image loaded successfully!${compressionMsg}`);
  
  bitmap.close();
}

// Add helper method for HTMLImageElement
private processImageElement(img: HTMLImageElement) {
  let targetWidth = img.width;
  let targetHeight = img.height;
  
  const originalWidth = img.width;
  const originalHeight = img.height;
  
  // Scale down if image is too large
  if (targetWidth > this.MAX_IMAGE_DIMENSION || targetHeight > this.MAX_IMAGE_DIMENSION) {
    const scale = Math.min(
      this.MAX_IMAGE_DIMENSION / targetWidth,
      this.MAX_IMAGE_DIMENSION / targetHeight
    );
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
  }

  // Create canvas for resizing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { 
    alpha: false,
    willReadFrequently: true 
  })!;
  
  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw resized image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  
  // Store processed data
  this.currentFrameData = { 
    data: imageData.data, 
    width: targetWidth, 
    height: targetHeight 
  };
  
  this.calculateTargetDimensions(targetWidth, targetHeight);
  this.processFrameData(imageData.data, targetWidth, targetHeight);
  
  // Show remove button
  const removeBtn = document.getElementById('removeImageBtn');
  if (removeBtn) {
    removeBtn.style.display = 'flex';
  }
  
  const compressionMsg = (originalWidth !== targetWidth || originalHeight !== targetHeight)
    ? ` (optimized from ${originalWidth}×${originalHeight})`
    : '';
  this.showSuccessMessage(`Image loaded successfully!${compressionMsg}`);
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
  private exportAsJPG() {
  if (!this.renderer) {
    this.showErrorMessage('No renderer available');
    return;
  }

  try {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    
    canvas.toBlob((blob) => {
      if (!blob) {
        this.showErrorMessage('Failed to create image');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `askii-art-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.showSuccessMessage('Image exported successfully!');
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('Export error:', error);
    this.showErrorMessage('Failed to export image');
  }
}

// private async exportAsPDF() {
//   if (!this.renderer) {
//     this.showErrorMessage('No renderer available');
//     return;
//   }

//   try {
//     const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    
//     // Create a temporary canvas with white background
//     const tempCanvas = document.createElement('canvas');
//     tempCanvas.width = canvas.width;
//     tempCanvas.height = canvas.height;
//     const ctx = tempCanvas.getContext('2d')!;
    
//     // Fill with white background
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
//     // Draw the ASCII art on top
//     ctx.drawImage(canvas, 0, 0);
    
//     // Convert to blob
//     const blob = await new Promise<Blob>((resolve) => {
//       tempCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
//     });
    
//     // Create PDF with embedded image
//     const link = document.createElement('a');
//     link.download = `askii-art-${Date.now()}.pdf`;
    
//     const reader = new FileReader();
//     reader.onload = () => {
//       const base64 = (reader.result as string).split(',')[1];
//       const pdfBlob = this.createSimplePDF(canvas.width, canvas.height, base64);
//       const url = URL.createObjectURL(pdfBlob);
//       link.href = url;
//       link.click();
//       URL.revokeObjectURL(url);
//       this.showSuccessMessage('PDF exported successfully!');
//     };
//     reader.readAsDataURL(blob);
//   } catch (error) {
//     console.error('Export error:', error);
//     this.showErrorMessage('Failed to export PDF');
//   }
// }

//       private createSimplePDF(width: number, height: number, imageBase64: string): Blob {
//         // A4 dimensions in points
//         const pageWidth = 595;
//         const pageHeight = 842;
//         const margin = 40;
        
//         // Calculate scaled dimensions
//         const imgAspect = width / height;
//         let imgWidth = pageWidth - margin * 2;
//         let imgHeight = imgWidth / imgAspect;
        
//         if (imgHeight > pageHeight - margin * 2) {
//           imgHeight = pageHeight - margin * 2;
//           imgWidth = imgHeight * imgAspect;
//         }
        
//         const x = (pageWidth - imgWidth) / 2;
//         const y = (pageHeight - imgHeight) / 2;
        
//         const pdf = `%PDF-1.4
//       1 0 obj
//       <</Type/Catalog/Pages 2 0 R>>
//       endobj
//       2 0 obj
//       <</Type/Pages/Count 1/Kids[3 0 R]>>
//       endobj
//       3 0 obj
//       <</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pageWidth} ${pageHeight}]/Contents 4 0 R/Resources<</XObject<</Im1 5 0 R>>>>>>
//       endobj
//       4 0 obj
//       <</Length 45>>
//       stream
//       q
//       ${imgWidth.toFixed(2)} 0 0 ${imgHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm
//       /Im1 Do
//       Q
//       endstream
//       endobj
//       5 0 obj
//       <</Type/XObject/Subtype/Image/Width ${width}/Height ${height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${imageBase64.length}>>
//       stream
//       ${atob(imageBase64)}
//       endstream
//       endobj
//       xref
//       0 6
//       0000000000 65535 f 
//       0000000009 00000 n 
//       0000000058 00000 n 
//       0000000115 00000 n 
//       0000000270 00000 n 
//       0000000364 00000 n 
//       trailer
//       <</Size 6/Root 1 0 R>>
//       startxref
//       ${550 + imageBase64.length}
//       %%EOF`;
        
//         return new Blob([pdf], { type: 'application/pdf' });
//       }
  private clearCanvas() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Reset canvas size
      canvas.width = 0;
      canvas.height = 0;
    }
  }
  this.targetWidth = 0;
  this.targetHeight = 0;
}

private removeImage() {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  this.clearCanvas();
  this.currentFrameData = null;

  // Hide remove button
  const removeBtn = document.getElementById('removeImageBtn');
  if (removeBtn) {
    removeBtn.style.display = 'none';
  }

  // Reset file input
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }

  this.showSuccessMessage('Image removed');
}


  private showErrorMessage(text: string) {
  const message = document.createElement('div');
  message.className = 'toast-message toast-error';
  message.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    <span>${text}</span>
  `;
  document.body.appendChild(message);

  setTimeout(() => message.classList.add('show'), 10);
  setTimeout(() => {
    message.classList.remove('show');
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

  private showSuccessMessage(text: string) {
  const message = document.createElement('div');
  message.className = 'toast-message toast-success';
  message.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${text}</span>
  `;
  document.body.appendChild(message);

  setTimeout(() => message.classList.add('show'), 10);
  setTimeout(() => {
    message.classList.remove('show');
    setTimeout(() => message.remove(), 300);
  }, 3000);
}
}