import { AlertService } from './../../services/alert.service';
import { NavController, Platform } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { Storage } from '@ionic/storage';
import { BackButtonEmitter } from '@ionic/angular/providers/platform';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit, OnDestroy {
  public userSearchForm: FormGroup;
  public userData;
  public userList;
  public filterUserist;
  public blockLists$;
  public panchayatLists$;

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private storage: Storage,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private platform: Platform,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    if (localStorage.getItem('accessToken') === null) return this.navController.navigateRoot(['/login']);

    this.initializeForm();
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

  ionViewWillEnter() {
    this.getUserData();
    const backBtn: BackButtonEmitter = this.platform.backButton;
    backBtn.subscribe(clicked => this.askExitApp());
  }

  askExitApp() {
    console.log('exit app');
    const alertData = {
      heading: 'Exit App',
      message: 'Do you want to exit?',
      cancelBtnText: 'No, thanks',
      okBtnText: 'Yes, please'
    };
    this.alertService.presentAlertConfirm(alertData);
  }

  async getUserData() {
    this.userData = await this.storage.get('userData');

    setTimeout(() => {
      this.getUserList();
      this.getBlockList();
    }, 100);
  }

  async getUserList() {
    await this.loadingService.presentLoading('Fetching monitoring list...');

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

  getBlockList() {
    const formData = new FormData();
    formData.append('district', this.userData.district);

    this.blockLists$ = this.userService.blockList(formData);
  }

  getPanchayatList(ev) {
    const formData = new FormData();
    formData.append('block', ev.target.value);

    this.panchayatLists$ = this.userService.panchayatList(formData);
  }

  searchUser() {
    const userObject = { ...this.userSearchForm.value };

    if (userObject.block) {
      this.filterUserist = this.userList.filter(list => {
        if (list.block.includes(userObject.block)) { return true; }
      });

      if (userObject.panchayat) {
        this.filterUserist = this.filterUserist.filter(list => {
          if (list.panchayat.includes(userObject.panchayat)) { return true; }
        });
      }

      if (userObject.name) this.filterByName(userObject.name);
      if (userObject.id) this.filterById(userObject.id);
      if (userObject.phone) this.filterByPhone(userObject.phone);
      return;
    }

    if (userObject.name) {
      this.filterUserist = this.userList.filter(list => {
        if (list.name.toLowerCase().includes(userObject.name.toLowerCase())) { return true; }
      });
    }

    if (userObject.uid) {
      this.filterUserist = this.userList.filter(list => {
        if (list.id.toString() === userObject.uid.toString()) { return true; }
      });
    }

    if (userObject.phone) {
      this.filterUserist = this.userList.filter(list => {
        if (list.contact.toString().includes(userObject.phone.toString())) { return true; }
      });
    }
  }

  filterByName(name) {
    this.filterUserist = this.filterUserist.filter(list => {
      if (list.name.toLowerCase().includes(name.toLowerCase())) { return true; }
    });
  }

  filterById(id) {
    this.filterUserist = this.filterUserist.filter(list => {
      if (list.id.toString() === id.toString()) { return true; }
    });
  }

  filterByPhone(phone) {
    this.filterUserist = this.filterUserist.filter(list => {
      if (list.contact.toString().includes(phone.toString())) { return true; }
    });
  }

  clearFilter() {
    this.userSearchForm.patchValue({
      block: '',
      panchayat: '',
      uid: '',
      name: '',
      phone: ''
    });
    this.filterUserist = this.userList;
  }

  openForm(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    this.navController.navigateForward(['/user-detail'], navigationExtras);
  }

  logout() {
    this.storage.clear();
    localStorage.clear();
    this.navController.navigateBack(['/login']);
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) await this.toastService.presentToast(err);
  }

  ngOnDestroy() {
    this.storage.remove('userForm');
    this.storage.remove('symptoms');
  }

}
