import { UserService } from './../services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BackButtonEmitter } from '@ionic/angular/providers/platform';
import { AlertService } from '../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  public userLoginForm: FormGroup;
  public backButtonSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private storage: Storage,
    private platform: Platform,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.userLoginForm = this.fb.group({
      user_id: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ionViewWillEnter() {
    console.log(localStorage.getItem('accessToken'), 'token');
    if (localStorage.getItem('accessToken') !== null) this.navController.navigateRoot(['/user-list']);

    localStorage.setItem('exitAlert', 'off');
    const backBtn: BackButtonEmitter = this.platform.backButton;
    this.backButtonSubscription = backBtn.subscribe(clicked => this.askExitApp());
  }

  askExitApp() {
    if (localStorage.getItem('exitAlert') !== 'on') {
      const alertData = {
        heading: 'Exit App',
        message: 'Do you really want to exit?',
        cancelBtnText: 'No, stay',
        okBtnText: 'Yes, please'
      };
      this.alertService.presentAlertConfirm(alertData);
    }
  }

  async login() {
    if (!this.userLoginForm.valid) {
      await this.toastService.presentToast('Form is not valid');
      return;
    }

    await this.loadingService.presentLoading('Logging in...');

    const formData = new FormData();

    formData.append('user_id', this.userLoginForm.value.user_id);
    formData.append('password', this.userLoginForm.value.password);

    this.userService
        .login(formData)
        .subscribe(
          (resp) => this.setUserDetailShared(resp),
          err => this.dismissLoading(err.message)
        );
  }

  setUserDetailShared(resp) {
    if (resp.errorCode === 1) {
      this.dismissLoading(resp.message);
    } else {
      localStorage.setItem('accessToken', resp.data[0].accessToken);
      this.storage
          .set('userData', resp.data[0])
          .then(succ => {
            this.dismissLoading('');
            this.navController.navigateRoot(['/user-list']);
          });
    }
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) await this.toastService.presentToast(err);
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }


}
