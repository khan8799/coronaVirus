import { Component, OnInit } from '@angular/core';
import { CameraService } from '../services/camera.service';
import { NavController } from '@ionic/angular';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Geolocation} from '@ionic-native/geolocation/ngx';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  public picture       = '';
  public isCameraOpen  = false;
  public showIcons     = false;

  // Flash Mode
  public flashModes: Promise<any>;
  public activeFlash = '';
  public address: any = '';
  public lat;
  public long;
  public infectedPersonId;

  constructor(
    private navController: NavController,
    private customizeCameraService: CameraService,
    public geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private activatedRoute: ActivatedRoute,
    private file: File,
    private storage: Storage,
    private filePath: FilePath,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (Object.entries(params).length < 1) return this.navController.navigateRoot(['/user-list']);

      this.infectedPersonId = params.id;
      this.openCamera();
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
            this.isCameraOpen = false;

            this.filePath
                .resolveNativePath('file://' + imageData[0])
                .then(filePath => {
                    const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                    const currentName = filePath.substring(filePath.lastIndexOf('/') + 1);
                    this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                });

          },
          (err) => console.log(err)
        );
      },
      (err) => console.log(err)
    );
  }

  createFileName() {
    const d = new Date(),
          n = d.getTime(),
          newFilename = n + '.jpg';
    return newFilename;
  }

  copyFileToLocalDir(currentPath, currentName, newFileName) {
    this.file
        .copyFile(currentPath, currentName, this.file.dataDirectory, newFileName)
        .then(
          res => {
            this.storage.set('imagePath', res);
            this.checkLocation();
          },
          error => console.log(error)
        );
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
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 1
    };

    this.nativeGeocoder
        .reverseGeocode(lattitude, longitude, options)
        .then((result: NativeGeocoderResult[]) => {
          this.address = '';
          const responseAddress = [];
          for (const [key, value] of Object.entries(result[0])) {
            if (value.length > 0) responseAddress.push(value);
          }
          responseAddress.reverse();
          for (const value of responseAddress) {
            this.address += value + ', ';
          }
          this.address = this.address.slice(0, -2);
          this.navigate();
        })
        .catch((error: any) =>  this.address = 'Address Not Available!');
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

  setFlashMode(flashType: string) { this.customizeCameraService.setFlashMode(flashType); }

  refresh() {
    this.picture = '';
    this.openCamera();
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
