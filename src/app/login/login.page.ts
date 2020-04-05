import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { NavController } from '@ionic/angular';

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
  ) { }

  ngOnInit() {
    localStorage.clear();
    this.initializeForm();
  }

  initializeForm(): void {
    this.userLoginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async login() {
    if (!this.userLoginForm.valid) {
      await this.toastService.presentToast('Form is not valid');
      return;
    }

    await this.loadingService.presentLoading('Logging in...');

    const userObject = {
      ...this.userLoginForm.value
    };
    console.log(userObject);

    this.userService
        .login(userObject)
        .subscribe(
          (resp) => this.setUserDetailShared(resp),
          err => this.dismissLoading(err.message)
        );
  }

  setUserDetailShared(resp) {
    localStorage.setItem('accessToken', resp.token);

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
