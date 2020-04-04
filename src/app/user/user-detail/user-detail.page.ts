import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  constructor(
    private navController: NavController,
  ) { }

  ngOnInit() {
  }

  openCamera() {
    this.navController.navigateRoot(['/camera']);
  }

}
