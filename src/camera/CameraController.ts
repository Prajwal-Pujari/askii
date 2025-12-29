export class CameraController {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private facingMode: 'user' | 'environment' = 'user';
  private isStarting: boolean = false; // Prevent multiple simultaneous starts

  constructor() {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('muted', '');
    this.video.style.display = 'none';
    document.body.appendChild(this.video);
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async start(useFrontCamera: boolean = true): Promise<void> {
    // Prevent multiple simultaneous starts
    if (this.isStarting) {
      // console.log('Camera start already in progress...');
      return;
    }

    this.isStarting = true;

    try {
      // Stop existing stream if any
      this.stop();

      this.facingMode = useFrontCamera ? 'user' : 'environment';

      // console.log('🎥 Starting camera with facingMode:', this.facingMode);

      // Mobile-optimized constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: this.facingMode }, // Use 'ideal' for better fallback
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16 / 9 }
        },
        audio: false
      };

      // Try with facingMode first
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        // console.log('✅ Camera started with facingMode');
      } catch (err) {
        // console.warn('⚠️ Failed with facingMode, trying without:', err);
        
        // Fallback: try without facingMode
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        };
        this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        // console.log('✅ Camera started without facingMode (fallback)');
      }

      // Set video source
      this.video.srcObject = this.stream;

      // Wait for video to be ready with timeout
      await this.waitForVideoReady();

      // console.log('✅ Camera fully initialized:', {
      //   facingMode: this.facingMode,
      //   resolution: `${this.video.videoWidth}x${this.video.videoHeight}`,
      //   readyState: this.video.readyState
      // });

    } catch (error) {
      // console.error('❌ Camera error:', error);
      this.handleCameraError(error);
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  private async waitForVideoReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // If already ready, resolve immediately
      if (this.video.readyState >= this.video.HAVE_ENOUGH_DATA) {
        this.video.play().then(resolve).catch(reject);
        return;
      }

      const onReady = () => {
        cleanup();
        this.video.play()
          .then(() => {
            // console.log('📹 Video playing');
            resolve();
          })
          .catch(reject);
      };

      const onError = (error: any) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        this.video.removeEventListener('loadedmetadata', onReady);
        this.video.removeEventListener('error', onError);
        clearTimeout(timeoutId);
      };

      this.video.addEventListener('loadedmetadata', onReady);
      this.video.addEventListener('error', onError);

      // Timeout after 10 seconds
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Camera initialization timeout'));
      }, 10000);
    });
  }

  async switchCamera(): Promise<void> {
    // console.log('🔄 Switching camera...');
    
    const newFacingMode = this.facingMode === 'user' ? 'environment' : 'user';
    
    try {
      // Start new camera (this will stop the old one automatically)
      await this.start(newFacingMode === 'user');
      // console.log('✅ Camera switched successfully to:', newFacingMode);
    } catch (error) {
      // console.error('❌ Failed to switch camera:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        // console.log('🛑 Camera track stopped:', track.label);
      });
      this.stream = null;
    }

    if (this.video.srcObject) {
      this.video.srcObject = null;
    }
  }

  captureFrame(): { data: Uint8ClampedArray; width: number; height: number } | null {
    if (!this.stream || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return null;
    }

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    if (width === 0 || height === 0) {
      // console.warn('⚠️ Video dimensions are 0');
      return null;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    try {
      this.ctx.drawImage(this.video, 0, 0, width, height);
      const imageData = this.ctx.getImageData(0, 0, width, height);
      
      return {
        data: imageData.data,
        width,
        height
      };
    } catch (error) {
      // console.error('❌ Frame capture error:', error);
      return null;
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.video.readyState === this.video.HAVE_ENOUGH_DATA;
  }

  getVideoElement(): HTMLVideoElement {
    return this.video;
  }

  getCurrentFacingMode(): 'user' | 'environment' {
    return this.facingMode;
  }

  getResolution(): { width: number; height: number } {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    };
  }

  private handleCameraError(error: any): void {
    let errorMessage = 'Camera access failed';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera does not support the requested settings.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera access requires HTTPS. Please use https:// or localhost.';
    }

    // console.error('📛', errorMessage, error);
    this.showErrorMessage(errorMessage);
  }

  private showErrorMessage(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
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
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  destroy(): void {
    this.stop();
    if (this.video.parentNode) {
      this.video.parentNode.removeChild(this.video);
    }
  }
}