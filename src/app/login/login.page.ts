import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public userLoginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    localStorage.clear();
    this.initializeForm();
    this.getUserData();
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) { this.navController.navigateRoot(['/user-list']); }
  }

  initializeForm(): void {
    this.userLoginForm = this.fb.group({
      user_id: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
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

    console.log(formData);

    this.userService
        .login(formData)
        .subscribe(
          (resp) => this.setUserDetailShared(resp),
          err => this.dismissLoading(err.message)
        );
  }

  setUserDetailShared(resp) {
    this.storage.set('userData', resp.data[0]);

    this.dismissLoading('');
    this.navController.navigateRoot(['/user-list']);
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) {
      await this.toastService.presentToast(err);
    }
  }


}
