export class CameraController {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private facingMode: 'user' | 'environment' = 'user';

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

      this.facingMode = useFrontCamera ? 'user' : 'environment';

      // Try exact facingMode first (better for mobile)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { exact: this.facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16 / 9 }
        },
        audio: false
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn('Failed with exact facingMode, trying ideal:', err);
        
        // Fallback to ideal facingMode
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: this.facingMode },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        };
        
        try {
          this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } catch (err2) {
          console.warn('Failed with ideal facingMode, trying basic:', err2);
          
          // Last fallback: basic constraints
          const basicConstraints: MediaStreamConstraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          };
          this.stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        }
      }

      this.video.srcObject = this.stream;

      await new Promise<void>((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          this.video.play()
            .then(() => {
              console.log('Camera started successfully');
              console.log(`Facing mode: ${this.facingMode}`);
              console.log(`Resolution: ${this.video.videoWidth}x${this.video.videoHeight}`);
              
              // Log actual facing mode from track settings
              const videoTrack = this.stream?.getVideoTracks()[0];
              if (videoTrack) {
                const settings = videoTrack.getSettings();
                console.log('Actual camera facing mode:', settings.facingMode);
              }
              
              resolve();
            })
            .catch(reject);
        };

        setTimeout(() => reject(new Error('Camera timeout')), 10000);
      });

    } catch (error) {
      console.error('Camera error:', error);
      this.handleCameraError(error);
      throw error;
    }
  }

  async switchCamera(): Promise<void> {
    const useFrontCamera = this.facingMode === 'environment'; // Switch to opposite
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

  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
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
      errorMessage = 'The requested camera is not available. Trying default camera...';
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