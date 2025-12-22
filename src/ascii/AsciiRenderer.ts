export class AsciiRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private zoomLevel: number = 1;
  private fontSize: number = 10;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private onZoomCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.setupZoom();
    this.setupPan();
  }

  onZoomChange(callback: () => void) {
    this.onZoomCallback = callback;
  }

  private setupZoom(): void {
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoomLevel = Math.max(0.3, Math.min(10, this.zoomLevel * delta));
      
      if (this.onZoomCallback) {
        this.onZoomCallback();
      }
    }, { passive: false });
  }

  private setupPan(): void {
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.offsetX += dx;
        this.offsetY += dy;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        if (this.onZoomCallback) {
          this.onZoomCallback();
        }
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    });

    this.canvas.style.cursor = 'grab';
  }

  renderWithColor(
    blockData: Array<{ char: string; r: number; g: number; b: number }>,
    gridWidth: number,
    gridHeight: number,
    mode: 'grayscale' | 'color' | 'ansi'
  ): void {
    const charWidth = this.fontSize * 0.6 * this.zoomLevel;
    const charHeight = this.fontSize * this.zoomLevel;

    // Set canvas to full window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Clear background
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate content dimensions
    const contentWidth = gridWidth * charWidth;
    const contentHeight = gridHeight * charHeight;

    // Center the content initially (only if not panned)
    const startX = (this.canvas.width - contentWidth) / 2 + this.offsetX;
    const startY = (this.canvas.height - contentHeight) / 2 + this.offsetY;

    // Set font
    this.ctx.font = `${this.fontSize * this.zoomLevel}px monospace`;
    this.ctx.textBaseline = 'top';

    // Render each character
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const idx = y * gridWidth + x;
        if (idx >= blockData.length) continue;

        const block = blockData[idx];
        
        switch (mode) {
          case 'grayscale':
            this.ctx.fillStyle = '#fff';
            break;
          
          case 'color':
            this.ctx.fillStyle = `rgb(${block.r}, ${block.g}, ${block.b})`;
            break;
          
          case 'ansi':
            this.ctx.fillStyle = this.getAnsiColor(block.r, block.g, block.b);
            break;
        }

        this.ctx.fillText(
          block.char,
          startX + x * charWidth,
          startY + y * charHeight
        );
      }
    }
  }

  // NEW METHOD - Add this
  renderWithColorAndDimensions(
    blockData: Array<{ char: string; r: number; g: number; b: number }>,
    gridWidth: number,
    gridHeight: number,
    mode: 'grayscale' | 'color' | 'ansi',
    targetWidth: number,
    targetHeight: number
  ): void {
    // Set canvas to container dimensions
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    // Clear background
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate character size based on target dimensions and zoom
    const charWidth = (targetWidth / gridWidth) * this.zoomLevel;
    const charHeight = (targetHeight / gridHeight) * this.zoomLevel;

    // Center the content
    const startX = (this.canvas.width - (gridWidth * charWidth)) / 2 + this.offsetX;
    const startY = (this.canvas.height - (gridHeight * charHeight)) / 2 + this.offsetY;

    // Set font size based on character height
    const fontSize = Math.max(6, Math.min(100, charHeight));
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.textBaseline = 'top';

    // Render each character
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const idx = y * gridWidth + x;
        if (idx >= blockData.length) continue;

        const block = blockData[idx];
        
        switch (mode) {
          case 'grayscale':
            this.ctx.fillStyle = '#fff';
            break;
          
          case 'color':
            this.ctx.fillStyle = `rgb(${block.r}, ${block.g}, ${block.b})`;
            break;
          
          case 'ansi':
            this.ctx.fillStyle = this.getAnsiColor(block.r, block.g, block.b);
            break;
        }

        this.ctx.fillText(
          block.char,
          startX + x * charWidth,
          startY + y * charHeight
        );
      }
    }
  }

  private getAnsiColor(r: number, g: number, b: number): string {
    const brightness = (r + g + b) / 3;
    
    if (brightness < 64) return '#1a1a1a';
    if (brightness > 220) return '#ffffff';
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    // Low saturation = grayscale
    if (saturation < 0.2) {
      if (brightness < 100) return '#555555';
      if (brightness < 160) return '#aaaaaa';
      return '#dddddd';
    }
    
    const mid = brightness > 140;
    
    if (r === max) {
      if (g > b + 20) {
        return mid ? '#ffaa00' : '#cc8800'; // Orange/Yellow
      }
      return mid ? '#ff5555' : '#cc0000'; // Red
    }
    
    if (g === max) {
      if (b > r + 20) {
        return mid ? '#55ffff' : '#00cccc'; // Cyan
      }
      return mid ? '#55ff55' : '#00cc00'; // Green
    }
    
    if (b === max) {
      if (r > g + 20) {
        return mid ? '#ff55ff' : '#cc00cc'; // Magenta
      }
      return mid ? '#5555ff' : '#0000cc'; // Blue
    }
    
    return mid ? '#aaaaaa' : '#666666';
  }

  render(asciiGrid: string[], gridWidth: number, gridHeight: number): void {
    const charWidth = this.fontSize * 0.6 * this.zoomLevel;
    const charHeight = this.fontSize * this.zoomLevel;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const contentWidth = gridWidth * charWidth;
    const contentHeight = gridHeight * charHeight;
    const startX = (this.canvas.width - contentWidth) / 2 + this.offsetX;
    const startY = (this.canvas.height - contentHeight) / 2 + this.offsetY;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${this.fontSize * this.zoomLevel}px monospace`;
    this.ctx.textBaseline = 'top';

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const idx = y * gridWidth + x;
        if (idx < asciiGrid.length) {
          this.ctx.fillText(
            asciiGrid[idx],
            startX + x * charWidth,
            startY + y * charHeight
          );
        }
      }
    }
  }
}