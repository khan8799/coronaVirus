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

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private storage: Storage,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe(params => {
      this.infectedPersonId = params.id;
      if (!this.infectedPersonId) { this.navController.navigateRoot(['/user-list']); }
    });

    this.picture  = localStorage.getItem('image');
    this.lat      = localStorage.getItem('lat');
    this.long     = localStorage.getItem('long');
    this.address  = localStorage.getItem('address');

    localStorage.removeItem('image');
    localStorage.removeItem('lat');
    localStorage.removeItem('long');
    localStorage.removeItem('address');

    if (this.picture && this.lat && this.long) { this.scrollToItemFn(); }
    this.getUserData();
    this.getMonitoredUser();
    this.userForm.valueChanges.subscribe(data => this.logValidationErrors());
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      time: [''],
      isAvailable: ['1'],
      officialName: ['', [Validators.required]],
      officialDesignation: ['', [Validators.required]],
      officialPhone: ['', [Validators.required, CustomValidators.phoneValidator]],
      symptoms: [''],
      quarantined: ['', [Validators.required]],
      poster: ['1'],
      remarks: ['', [Validators.required]],
    });

    this.userDataExistForm = this.fb.group({
      date: [''],
      time: [''],
    });

    this.symptomsArray();
    this.checkFormdata();
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

  async checkFormdata() {
    const userFormdataExists = await this.storage.get('userForm');
    const symptomsExist = await this.storage.get('symptoms');

    if (symptomsExist) {
      this.selectedArray = symptomsExist;
      this.symptomsList = this.symptomsList.map(symptoms => {
        const newSymptoms = symptoms;
        console.log(this.selectedArray.indexOf(symptoms.value));
        if (this.selectedArray.indexOf(symptoms.value) !== -1) {
          newSymptoms.isChecked = true;
        }
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

  }

  async getUserData() { this.userData = await this.storage.get('userData'); }

  async getMonitoredUser() {
    const userLists = await this.storage.get('userList');
    this.monitoredUserData = userLists.filter(list => list.id === this.infectedPersonId)[0];
  }

  availabilityChange(ev) {
    this.showSymptoms = true;
    if (ev.detail.value === '0') { this.showSymptoms = false; }
  }

  checkUserdataExistForm() {
    this.showForm = true;
    console.log(this.userDataExistForm.value);
  }

  async submitForm() {
    this.userForm.markAllAsTouched();
    this.logValidationErrors();

    console.log(this.userForm.value);
    if (!this.userForm.valid) {
      await this.toastService.presentToast('Form is not valid');
      return;
    }

    if (!this.picture) {
      await this.toastService.presentToast('Please click image');
      return;
    }

    await this.loadingService.presentLoading('Submitting form...');

    const formData = new FormData();

    formData.append('isAvailable', this.userForm.value.isAvailable);
    formData.append('officialName', this.userForm.value.officialName);
    formData.append('officialDesignation', this.userForm.value.officialDesignation);
    formData.append('officialPhone', this.userForm.value.officialPhone);
    formData.append('symptoms', this.selectedArray);
    formData.append('panchayat', this.userForm.value.panchayat);
    formData.append('quarantined', this.userForm.value.quarantined);
    formData.append('poster', this.userForm.value.poster);
    formData.append('remarks', this.userForm.value.remarks);
    formData.append('image', this.picture);
    formData.append('lat', this.lat);
    formData.append('long', this.long);

    console.log(formData);

    this.userService
        .userForm(formData)
        .subscribe(
          (resp) => {
            this.dismissLoading('Data Submitted Successfully');
            setTimeout(() => {
              this.navController.navigateRoot(['/user-list']);
            }, 200);
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
        value: 'cough',
        isChecked: false
      },
      {
        label: 'साँस लेने में तकलीफ़ - Difficulty Breathing',
        value: 'breathing',
        isChecked: false
      },
      {
        label: 'बुख़ार - Fever',
        value: 'fever',
        isChecked: false
      },
      {
        label: 'सर्दी - Cold',
        value: 'cold',
        isChecked: false
      },
      {
        label: 'दस्त - Diarrhoea',
        value: 'diarrhoea',
        isChecked: false
      },
      {
        label: 'गले में ख़राश - Soar Throat',
        value: 'soarThroat',
        isChecked: false
      },
      {
        label: 'सिरदर्द - Headache',
        value: 'headache',
        isChecked: false
      },
      {
        label: 'शरीर में मरोड़ - Body Ach',
        value: 'bodyAche',
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

  scrollToItemFn() {
    setTimeout(() => {
      const el = document.getElementById('image');
      console.log(el);
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

}
