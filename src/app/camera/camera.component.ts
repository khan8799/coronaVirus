import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CameraService } from '../services/camera.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  picture       = '';
  isCameraOpen  = false;
  showIcons     = false;

  // Flash Mode
  flashModes: Promise<any>;
  activeFlash = '';

  constructor(
    private navController: NavController,
    private customizeCameraService: CameraService,
  ) { }

  ngOnInit() {
    this.openCamera();
  }

  openCamera() {
    this.customizeCameraService.openCameraPreview().then(
      (res) => {
        this.isCameraOpen = true;
        this.showIcons    = true;
      },
      (err) => {
        if (err === 'Illegal access') {
          this.navController.navigateRoot(['/user-detail']);
        }
      }
    );
  }

  takePicture() {
    this.customizeCameraService.takePicture().then(
      (imageData) => {
        this.customizeCameraService.stopCamera().then(
          (res) => {
            this.picture = 'data:image/jpeg;base64,' + imageData;
            this.isCameraOpen = false;
          },
          (err) => {
            console.log(err);
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }

  stopCamera() {
    this.isCameraOpen = false;
    return this.customizeCameraService.stopCamera();
  }

  getFlashMode() {
    this.customizeCameraService.getFlashMode().then(
      activeFlash => {
        this.activeFlash  = activeFlash;
        this.customizeCameraService.setFlashMode(this.activeFlash);

        this.flashModes   = this.customizeCameraService.getSuppportedFlashModes();
      }
    );
  }

  setFlashMode(flashType: string) {
    this.customizeCameraService.setFlashMode(flashType);
  }

  refresh() {
    this.picture = '';
    this.openCamera();
  }

  navigate() {
    this.stopCamera().then(
      res => {
        this.navController.navigateRoot(['/user-detail']);
      }
    );
  }
}
