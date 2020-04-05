import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  picture;
  lat;
  long;
  address;
  public scrollToItem;
  public infectedPersonId;

  constructor(
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => this.infectedPersonId = params.id);

    this.picture  = localStorage.getItem('image');
    this.lat      = localStorage.getItem('lat');
    this.long     = localStorage.getItem('long');
    this.address  = localStorage.getItem('address');

    if (this.picture && this.lat && this.long) { this.scrollToItemFn(); }
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

  openCamera() {
    this.navController.navigateRoot(['/camera']);
  }

}
