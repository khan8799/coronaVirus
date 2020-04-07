import { CustomValidators } from './../../custom-validators';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { CustomValidationMessages } from 'src/app/custom-validation-messages';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  public userForm: FormGroup;
  public userDataExistForm: FormGroup;
  public picture;
  public lat;
  public long;
  public address;
  public scrollToItem;
  public infectedPersonId;
  public userData;
  public monitoredUserData;
  public showSymptoms = true;
  public showForm = false;
  public showExistMessage = false;
  selectedArray: any = [];
  symptomsList;
  public validationMessages = CustomValidationMessages.validationMessages;
  public formErrors = {
    officialName: '',
    officialDesignation: '',
    officialPhone: '',
    quarantined: '',
    remarks: '',
  };

  public imgBlob;
  public fileName;
  public slot;
  public date;

  todaysDate = new Date().toISOString();

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private storage: Storage,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
    private file: File,
    private webview: WebView,
  ) { }

  ngOnInit() {
    const accessToken = localStorage.getItem('accessToken');
    console.log(accessToken);
    if (accessToken === null) { this.navController.navigateRoot(['/']); }
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe(params => {
      this.infectedPersonId = params.id;
      if (!this.infectedPersonId) { this.navController.navigateRoot(['/user-list']); }
    });

    this.getLocation();
    this.getUserData();
    this.getMonitoredUser();
    this.userForm.valueChanges.subscribe(data => this.logValidationErrors());
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      time: [''],
      isAvailable: ['yes'],
      officialName: ['', [Validators.required]],
      officialDesignation: ['', [Validators.required]],
      officialPhone: ['', [Validators.required, CustomValidators.phoneValidator]],
      symptoms: [''],
      quarantined: ['at_home', [Validators.required]],
      poster: ['yes'],
      remarks: ['', [Validators.required]],
    });

    this.userDataExistForm = this.fb.group({
      date: [''],
      time: [''],
    });

    this.symptomsArray();
    this.checkFormdata();
  }

  async getLocation() {
    const loc = await this.storage.get('location');
    if (!loc) return;

    this.lat      = loc.lat;
    this.long     = loc.long;
    this.address  = loc.address;
    this.storage.remove('location');
  }

  async checkFormdata() {
    const userFormdataExists = await this.storage.get('userForm');
    const symptomsExist = await this.storage.get('symptoms');
    this.slot = await this.storage.get('slot');
    this.date = await this.storage.get('date');

    if (symptomsExist) {
      this.showForm = true;
      this.selectedArray = symptomsExist;
      this.symptomsList = this.symptomsList.map(symptoms => {
        const newSymptoms = symptoms;
        if (this.selectedArray.indexOf(symptoms.value) !== -1) newSymptoms.isChecked = true;
        return symptoms;
      });
    }

    if (userFormdataExists) {
      setTimeout(() => {
        this.userForm.patchValue({
          isAvailable: userFormdataExists.isAvailable,
          officialName: userFormdataExists.officialName,
          officialDesignation: userFormdataExists.officialDesignation,
          officialPhone: userFormdataExists.officialPhone,
          panchayat: userFormdataExists.panchayat,
          quarantined: userFormdataExists.quarantined,
          poster: userFormdataExists.poster,
          remarks: userFormdataExists.remarks,
        });
      }, 100);
    }

    if (this.date) {
      setTimeout(() => {
        this.userDataExistForm.patchValue({
          date: this.date,
          slot: this.slot
        });
      }, 100);
    }
    this.getImage();

  }

  async getImage() {
    const image = await this.storage.get('imagePath');
    console.log(image);
    if (!image) return;

    this.imgBlob = this.startUpload(image);
  }

  async getUserData() { this.userData = await this.storage.get('userData'); }

  async getMonitoredUser() {
    const userLists = await this.storage.get('userList');
    this.monitoredUserData = userLists.filter(list => list.id === this.infectedPersonId)[0];
  }

  availabilityChange(ev) {
    this.showSymptoms = true;
    if (ev.detail.value === 'no') { this.showSymptoms = false; }
  }

  async checkUserdataExistForm() {
    const form  = this.userDataExistForm.value;
    if (form.date === '' || form.time === '') {
      await this.toastService.presentToast('Form is not valid. Please fill all required fields.');
      return;
    }
    await this.loadingService.presentLoading('Checking data exist...');
    const year  = new Date(form.date).getUTCFullYear();
    let month   = new Date(form.date).getUTCMonth() + 1;
    let day     = new Date(form.date).getUTCDate();

    month = month > 9 ? month : parseInt('0' + month, 10);
    day   = day > 9 ? day : parseInt('0' + day, 10);

    this.showExistMessage = false;
    const formData = new FormData();
    formData.append('user_id', this.userData.id);
    formData.append('pid', this.infectedPersonId);
    formData.append('slot', form.time);
    formData.append('date', year + '-' + month + '-' + day);

    this.storage.set('slot', form.time);
    this.storage.set('date', form.date);
    this.date = form.date;
    this.slot = form.time;

    this.userService
        .checkEntrySlot(formData)
        .subscribe(
          (resp) => {
            if (resp.errorCode === 0) {
              this.showForm = true;
              this.showExistMessage = false;
            } else {
              this.showForm = false;
              this.showExistMessage = true;
              this.scrollToItemFn('existMessage');
            }
            this.dismissLoading('');
          },
          err => this.dismissLoading(err.message)
        );
  }

  async submitForm() {
    this.userForm.markAllAsTouched();
    this.logValidationErrors();

    if (!this.userForm.valid) {
      await this.toastService.presentToast('Form is not valid. Please fill all required fields.');
      return;
    }

    if (!this.imgBlob) {
      await this.toastService.presentToast('Please click image');
      return;
    }

    await this.loadingService.presentLoading('Submitting form...');
    const formData = new FormData();

    formData.append('user_id', this.userData.id);
    formData.append('pid', this.infectedPersonId);
    formData.append('slot', this.slot);
    formData.append('date', this.date);
    formData.append('isAvailable', this.userForm.value.isAvailable);
    formData.append('officialName', this.userForm.value.officialName);
    formData.append('officialDesignation', this.userForm.value.officialDesignation);
    formData.append('officialPhone', this.userForm.value.officialPhone);
    formData.append('symptoms', this.selectedArray);
    formData.append('quarantined', this.userForm.value.quarantined);
    formData.append('poster', this.userForm.value.poster);
    formData.append('remarks', this.userForm.value.remarks);
    formData.append('panchayat', this.userForm.value.panchayat);
    formData.append('lat', this.lat);
    formData.append('long', this.long);
    formData.append('loc_address', this.address);
    formData.append('image', this.imgBlob, this.fileName);

    this.userService
        .userForm(formData)
        .subscribe(
          (resp) => {
            if (resp.errorCode === 0) {
              this.dismissLoading('Data Submitted Successfully');
              setTimeout(() => {
                this.storage.remove('userList');
                this.navController.navigateRoot(['/user-list']);
              }, 200);
            } else this.dismissLoading(resp.message);
          },
          err => this.dismissLoading(err.message)
        );
  }

  selectMember(data) {
    setTimeout(() => {
      if (data.target.checked === true) {
        this.selectedArray.push(data.target.value);
      } else {
        const index = this.selectedArray.indexOf(data.target.value);
        this.selectedArray.splice(index, 1);
      }
    }, 500);
  }

  symptomsArray() {
    this.symptomsList = [
      {
        label: 'सूखी खांसी - Dry Cough',
        value: 'Dry_Cough',
        isChecked: false
      },
      {
        label: 'साँस लेने में तकलीफ़ - Difficulty Breathing',
        value: 'Difficulty_Breathing',
        isChecked: false
      },
      {
        label: 'बुख़ार - Fever',
        value: 'Fever',
        isChecked: false
      },
      {
        label: 'सर्दी - Cold',
        value: 'Cold',
        isChecked: false
      },
      {
        label: 'दस्त - Diarrhoea',
        value: 'Diarrhoea',
        isChecked: false
      },
      {
        label: 'गले में ख़राश - Soar Throat',
        value: 'Soar_Throat',
        isChecked: false
      },
      {
        label: 'सिरदर्द - Headache',
        value: 'Headache',
        isChecked: false
      },
      {
        label: 'शरीर में मरोड़ - Body Ach',
        value: 'Body_Ache',
        isChecked: false
      },
      {
        label: 'इनमें से कोई नहीं None of the above',
        value: 'none',
        isChecked: false
      }
    ];
  }

  openCamera() {
    this.storage.set('userForm', this.userForm.value);
    this.storage.set('symptoms', this.selectedArray);

    const navigationExtras: NavigationExtras = {
      queryParams: { id: this.infectedPersonId }
    };
    this.navController.navigateRoot(['/camera'], navigationExtras);
  }

  scrollToItemFn(id) {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scroll();
        el.scrollIntoView({behavior: 'smooth'});
      }
    }, 500);
  }

  async dismissLoading(err: string) {
    await this.loadingService.dismissLoading();
    if (err) {
      await this.toastService.presentToast(err);
    }
  }

  startUpload(filePath) {
    this.storage.remove('imagePath');
    this.storage.remove('date');
    this.storage.remove('slot');
    this.picture = this.webview.convertFileSrc(this.file.dataDirectory + filePath.name);

    this.fileName = filePath.name;
    this.file
        .resolveLocalFilesystemUrl(filePath.nativeURL)
        .then(
          entry => {
            ( entry as FileEntry).file(file => this.readFile(file));
          }
        )
        .catch(err => console.log(err));
  }

  readFile(file: any) {
    if (this.picture) { this.scrollToItemFn('image'); }
    const reader = new FileReader();
    reader.onloadend = () => {
      const formdata = new FormData();
      const imgBlob = new Blob([reader.result], { type: file.type });
      this.imgBlob = imgBlob;
    };
    reader.readAsArrayBuffer(file);
  }

  logValidationErrors(group: FormGroup = this.userForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl: AbstractControl = group.get(key);

      this.formErrors[key] = '';
      if (
        abstractControl &&
        !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty)
      ) {
        const msg = this.validationMessages[key];

        for (const errorKey in abstractControl.errors) {
          if (errorKey) this.formErrors[key] = msg[errorKey] + ' ';
        }
      }

    });
  }

}
