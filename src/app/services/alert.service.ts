import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(public alertController: AlertController) {}

  async presentAlertConfirm(data) {
    const alert = await this.alertController.create({
      header: data.heading,
      message: data.message,
      buttons: [
        {
          text: data.cancelBtnText,
          role: 'cancel',
          cssClass: 'alert-medium',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: data.okBtnText,
          cssClass: 'alert-danger',
          handler: () => {
            console.log('Confirm Okay');
            // tslint:disable-next-line: no-string-literal
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present();
  }
}
