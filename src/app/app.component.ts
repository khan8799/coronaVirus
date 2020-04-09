import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation} from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public geolocation: Geolocation,
    private navController: NavController,
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
          const token = localStorage.getItem('accessToken');
          if (token === null) this.navController.navigateRoot(['/login']);
          else this.navController.navigateRoot(['/user-list']);
        })
        .catch((error) => {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        });
  }
}
