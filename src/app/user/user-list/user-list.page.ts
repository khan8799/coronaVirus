import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  public userSearchForm: FormGroup;
  public userList;

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.userSearchForm = this.fb.group({
      block: ['all', [Validators.required]],
      panchayat: ['all', [Validators.required]],
      uid: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });
  }


  async searchUser() {
    if (!this.userSearchForm.valid) {
      await this.toastService.presentToast('Form is not valid');
      return;
    }

    await this.loadingService.presentLoading('Fetching infected persons...');

    const userObject = {
      ...this.userSearchForm.value
    };
    console.log(userObject);

    this.userService
        .getUserList(userObject)
        .subscribe(
          (resp) => {
            console.log(resp);
            this.userList = resp;
            this.dismissLoading('');
          },
          err => this.dismissLoading(err.message)
        );
  }

  openForm(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    this.navController.navigateForward(['/user-detail'], navigationExtras);
  }

  logout() {
    this.navController.navigateBack(['/']);
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) {
      await this.toastService.presentToast(err);
    }
  }

}
