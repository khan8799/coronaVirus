import { Component, OnInit } from '@angular/core';
import { CameraService } from '../services/camera.service';
import { NavController } from '@ionic/angular';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Geolocation} from '@ionic-native/geolocation/ngx';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';

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
  address: any = '';
  lat;
  long;
  public infectedPersonId;

  constructor(
    private navController: NavController,
    private customizeCameraService: CameraService,
    public geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private activatedRoute: ActivatedRoute,
    private file: File,
    private storage: Storage,
    private webview: WebView,
  ) { }

  ngOnInit() {
    const token = localStorage.getItem('token');
    localStorage.clear();
    localStorage.setItem('token', token);
    this.openCamera();

    this.activatedRoute.queryParams.subscribe(params => {
      this.infectedPersonId = params.id;
      if (!this.infectedPersonId) { this.navController.navigateRoot(['/user-list']); }
    });
  }

  openCamera() {
    this.customizeCameraService.openCameraPreview().then(
      (res) => {
        this.isCameraOpen = true;
        this.showIcons    = true;
      },
      (err) => {
        if (err === 'Illegal access') {
          const navigationExtras: NavigationExtras = {
            queryParams: { id: this.infectedPersonId }
          };
          this.navController.navigateRoot(['/user-detail'], navigationExtras);
        }
      }
    );
  }

  takePicture() {
    this.customizeCameraService.takePicture().then(
      (imageData) => {
        this.customizeCameraService.stopCamera().then(
          (res) => {
            console.log(imageData);
            this.picture = 'data:image/jpeg;base64,' + imageData;
            this.storage.set('imagePath', {filePath: imageData, base64Image: this.picture}),
            // this.isCameraOpen = false;

            // const currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
            // const currentPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);

            // this.copyFileToLocalDir(currentPath, currentName, this.createFileName());

            this.checkLocation();
          },
          (err) => console.log(err)
        );
      },
      (err) => console.log(err)
    );
  }

  copyFileToLocalDir(currentPath, currentName, newFileName) {
    this.file
        .copyFile(currentPath, currentName, this.file.dataDirectory, newFileName)
        .then(
          _ => this.storage.set('imagePath', {filePath: newFileName, picture: this.picture}),
          error => console.log(error)
        );
  }

  createFileName() {
    const d = new Date(),
          n = d.getTime(),
          newFilename = n + '.jpg';
    return newFilename;
  }

  pathForImage(img) {
    if (img === null) return;
    const converted = this.webview.convertFileSrc(img);
    return converted;
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

  checkLocation() {
    this.geolocation
        .getCurrentPosition({ enableHighAccuracy: true})
        .then((resp) => {
          this.lat = resp.coords.latitude;
          this.long = resp.coords.longitude;
          this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
        })
        .catch((error) => console.log(error));
  }

  getAddressFromCoords(lattitude, longitude) {
    console.log('getAddressFromCoords ' + lattitude + ' ' + longitude);
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 1
    };

    this.nativeGeocoder
        .reverseGeocode(lattitude, longitude, options)
        .then((result: NativeGeocoderResult[]) => {
          console.log(result);
          this.address = '';
          const responseAddress = [];
          for (const [key, value] of Object.entries(result[0])) {
            if (value.length > 0) {
              responseAddress.push(value);
            }
          }
          responseAddress.reverse();
          for (const value of responseAddress) {
            this.address += value + ', ';
          }
          this.address = this.address.slice(0, -2);
          console.log(this.address);
          this.navigate();
        })
        .catch((error: any) =>  this.address = 'Address Not Available!');
  }

  navigate() {
    this.storage.set('location', {
      address: this.address,
      lat: this.lat,
      long: this.long,
    });
    const navigationExtras: NavigationExtras = {
      queryParams: { id: this.infectedPersonId }
    };
    this.navController.navigateRoot(['/user-detail'], navigationExtras);
  }

}
