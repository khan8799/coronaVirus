import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(
    public loadingController: LoadingController,
  ) { }

  async presentLoading(msg: string) {
    const loading = await this.loadingController.create({
      message: msg,
    });
    await loading.present();
  }

  async presentLoadingWithOptions(options) {
    const loading = await this.loadingController.create({
      spinner: options.showSpinner,
      duration: 3000,
      message: options.msg,
      translucent: true,
      cssClass: options.cssClasses
    });
    return await loading.present();
  }

  async dismissLoading() {
    await this.loadingController.dismiss();
  }
}
