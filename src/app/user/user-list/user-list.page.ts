import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  public userSearchForm: FormGroup;
  public userData;
  public userList;
  public filterUserist;

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private storage: Storage,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.getUserData();
  }

  initializeForm(): void {
    this.userSearchForm = this.fb.group({
      block: [''],
      panchayat: [''],
      uid: [''],
      name: [''],
      phone: [''],
    });
  }

  async getUserData() {
    this.userData = await this.storage.get('userData');
    this.getUserList();
  }

  async getUserList() {
    const userLists = await this.storage.get('userList');
    if (userLists) {
      this.userList = userLists;
      this.filterUserist = userLists;
      console.log(this.userList[0]);
      return;
    }

    await this.loadingService.presentLoading('Fetching infected persons...');
    const formData = new FormData();

    formData.append('user_id', this.userData.id);

    this.userService
        .getUserList(formData)
        .subscribe(
          (resp) => {
            this.userList = resp.data;
            this.filterUserist = resp.data;
            this.storage.set('userList', this.userList);
            this.dismissLoading('');
          },
          err => this.dismissLoading(err.message)
        );
  }

  searchUser() {
    const userObject = { ...this.userSearchForm.value };

    this.filterUserist = this.userList.filter(list => {
      const name = userObject.name === '' ? '111111111' : userObject.name.toLowerCase();

      if (
        list.name.toLowerCase().includes(name) ||
        list.id.toString() === userObject.uid.toString() ||
        list.contact === userObject.phone
      ) {
        return true;
      }
    });
  }

  openForm(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    this.navController.navigateForward(['/user-detail'], navigationExtras);
  }

  logout() {
    this.storage.clear();
    this.navController.navigateBack(['/']);
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) {
      await this.toastService.presentToast(err);
    }
  }

}
