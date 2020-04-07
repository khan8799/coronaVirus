import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation} from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  address: any = '';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.checkLocation();
    });
  }

  checkLocation() {
    this.geolocation
        .getCurrentPosition({ enableHighAccuracy: true})
        .then((resp) => {
          this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
        })
        .catch((error) => {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        });
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
          // alert(JSON.stringify(result))
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

        })
        .catch((error: any) =>  this.address = 'Address Not Available!');
  }
}
