import { ToastService } from 'src/app/services/toast.service';
import { AlertService } from './services/alert.service';
import { Component, NgZone } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation} from '@ionic-native/geolocation/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  online: Subscription;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public geolocation: Geolocation,
    private navController: NavController,
    private network: Network,
    private ngZone: NgZone,
    private alertService: AlertService,
    private toastService: ToastService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.platform.is('cordova'))  this.checkInternetConnection();
      this.checkLocation();
    });
  }

  checkLocation() {
    this.geolocation
        .getCurrentPosition({ enableHighAccuracy: true})
        .then((resp) => {
          const token = localStorage.getItem('accessToken');
          if (token === null) this.navController.navigateRoot(['/login']);
          else this.navController.navigateRoot(['/user-list']);
        })
        .catch((error) => {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        });
  }

  checkInternetConnection() {
    this.network
        .onDisconnect()
        .subscribe((res) =>  this.networkGoneAlert(res));

    this.network
        .onConnect()
        .subscribe((res) => this.networkRestoredAlert(res));
  }

  networkGoneAlert(res) {
    this.ngZone.run(() => {
      console.log(res);
      const alertData = {
        header: 'OOPS!!!',
        subHeader: '',
        message: 'There is no internet connection, please connect to any network.',
        buttonText: 'Ok'
      };

      this.alertService.simpleAlert(alertData);
    });
  }

  networkRestoredAlert(res) {
    console.log(res);
    this.ngZone.run(async () => {
      await this.toastService.presentToast('Network connection has been restored');
    });
  }
}
