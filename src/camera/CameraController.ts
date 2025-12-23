export class CameraController {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private facingMode: 'user' | 'environment' = 'user';
  private availableCameras: MediaDeviceInfo[] = [];
  private currentCameraIndex: number = 0;

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
    try {
      this.stop();

      // Enumerate cameras first
      await this.enumerateCameras();
      
      this.facingMode = useFrontCamera ? 'user' : 'environment';

      console.log('=== Starting Camera ===');
      console.log('Requested facing mode:', this.facingMode);
      console.log('Available cameras:', this.availableCameras.length);
      this.availableCameras.forEach((cam, idx) => {
        console.log(`Camera ${idx}:`, cam.label || `Camera ${idx}`, cam.deviceId.substring(0, 20));
      });

      // Try device-specific approach first if we have multiple cameras
      if (this.availableCameras.length > 1) {
        const success = await this.startWithDeviceId();
        if (success) return;
      }

      // Fallback to facingMode approach
      await this.startWithFacingMode();

    } catch (error) {
      console.error('Camera error:', error);
      this.handleCameraError(error);
      throw error;
    }
  }

  private async enumerateCameras(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to enumerate cameras:', error);
      this.availableCameras = [];
    }
  }

  private async startWithDeviceId(): Promise<boolean> {
    // Find camera by facing mode preference
    const preferredCamera = this.availableCameras.find(cam => {
      const label = cam.label.toLowerCase();
      if (this.facingMode === 'environment') {
        return label.includes('back') || label.includes('rear') || label.includes('environment');
      } else {
        return label.includes('front') || label.includes('user') || label.includes('face');
      }
    });

    const targetCamera = preferredCamera || this.availableCameras[this.currentCameraIndex];
    
    if (!targetCamera) return false;

    console.log('Trying specific device:', targetCamera.label, targetCamera.deviceId.substring(0, 20));

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: targetCamera.deviceId },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.setupVideoStream();
      
      console.log('✓ Successfully started with deviceId');
      return true;
    } catch (error) {
      console.warn('Failed with deviceId:', error);
      return false;
    }
  }

  private async startWithFacingMode(): Promise<void> {
    console.log('Trying facingMode approach');
    
    // Try 1: exact facingMode
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { exact: this.facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.setupVideoStream();
      console.log('✓ Successfully started with exact facingMode');
      return;
    } catch (err) {
      console.warn('Failed with exact facingMode:', err);
    }

    // Try 2: ideal facingMode
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.setupVideoStream();
      console.log('✓ Successfully started with ideal facingMode');
      return;
    } catch (err) {
      console.warn('Failed with ideal facingMode:', err);
    }

    // Try 3: basic constraints
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    await this.setupVideoStream();
    console.log('✓ Successfully started with basic constraints');
  }

  private async setupVideoStream(): Promise<void> {
    this.video.srcObject = this.stream;

    await new Promise<void>((resolve, reject) => {
      this.video.onloadedmetadata = () => {
        this.video.play()
          .then(() => {
            console.log('=== Camera Info ===');
            console.log('Resolution:', `${this.video.videoWidth}x${this.video.videoHeight}`);
            
            const videoTrack = this.stream?.getVideoTracks()[0];
            if (videoTrack) {
              const settings = videoTrack.getSettings();
              console.log('Track settings:', settings);
              console.log('Actual facingMode:', settings.facingMode || 'unknown');
              console.log('Device ID:', settings.deviceId?.substring(0, 20) || 'unknown');
            }
            
            resolve();
          })
          .catch(reject);
      };

      setTimeout(() => reject(new Error('Camera timeout')), 10000);
    });
  }

  async switchCamera(): Promise<void> {
    console.log('=== Switching Camera ===');
    console.log('Current facing mode:', this.facingMode);
    
    // FIXED: Properly toggle the facing mode
    // If currently using front camera (user), switch to back (environment)
    // If currently using back camera (environment), switch to front (user)
    const newFacingMode = this.facingMode === 'user' ? 'environment' : 'user';
    const useFrontCamera = newFacingMode === 'user';
    
    console.log('Switching to facing mode:', newFacingMode);
    
    // Method 1: Try cycling through available cameras by deviceId
    if (this.availableCameras.length > 1) {
      // Increment camera index for next attempt
      this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
    }

    await this.start(useFrontCamera);
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
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
      console.warn('Video dimensions are 0');
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
      console.error('Frame capture error:', error);
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

  getActualFacingMode(): string | undefined {
    const videoTrack = this.stream?.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      return settings.facingMode;
    }
    return undefined;
  }

  getResolution(): { width: number; height: number } {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    };
  }

  getCameraCount(): number {
    return this.availableCameras.length;
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
      errorMessage = 'The requested camera is not available. Using default camera...';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera access requires HTTPS. Please use https:// or localhost.';
    }

    console.error(errorMessage, error);
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

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  destroy(): void {
    this.stop();
    if (this.video.parentNode) {
      this.video.parentNode.removeChild(this.video);
    }
  }
}