import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(public alertController: AlertController) {}

  async presentAlertConfirm(data) {
    localStorage.setItem('exitAlert', 'on');
    const alert = await this.alertController.create({
      header: data.heading,
      message: data.message,
      buttons: [
        {
          text: data.cancelBtnText,
          role: 'cancel',
          cssClass: 'alert-medium',
          handler: (blah) => {
            localStorage.setItem('exitAlert', 'off');
          }
        },
        {
          text: data.okBtnText,
          cssClass: 'alert-danger',
          handler: () => {
            localStorage.setItem('exitAlert', 'off');
            // tslint:disable-next-line: no-string-literal
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

  async simpleAlert(data) {
    const alert = await this.alertController.create({
      header: data.header,
      subHeader: data.subHeader,
      message: data.message,
      buttons: [
        {
          text: data.buttonText,
          cssClass: 'alert-danger'
        }
      ]
    });

    await alert.present();
  }
}
