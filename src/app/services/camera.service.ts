import { Injectable, Inject } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@ionic-native/camera-preview/ngx';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  // Camera options
  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: this.cameraPreview.CAMERA_DIRECTION.BACK,
    tapPhoto: true,
    previewDrag: false,
    toBack: true,
  };

  // Take picture options
  pictureOpts: CameraPreviewPictureOptions = {
    width: 360,
    height: 640,
    quality: 50
  };

  constructor(
    @Inject(CameraPreview) public  cameraPreview: CameraPreview
  ) { }

  openCameraPreview(): Promise<any> {
    return this.cameraPreview.startCamera(this.cameraPreviewOpts);
  }

  takePicture(): Promise<any> {
    return this.cameraPreview.takePicture(this.pictureOpts);
  }

  stopCamera(): Promise<any> {
    return this.cameraPreview.stopCamera();
  }

  getSuppportedFlashModes(): Promise<any> {
    return this.cameraPreview.getSupportedFlashModes();
  }

  getFlashMode(): Promise<any> {
    return this.cameraPreview.getFlashMode();
  }

  setFlashMode(flashType: string): Promise<any> {
    return this.cameraPreview.setFlashMode(flashType);
  }
}
