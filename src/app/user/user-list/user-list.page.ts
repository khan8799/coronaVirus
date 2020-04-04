import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {

  constructor(
    private navController: NavController,
  ) { }

  ngOnInit() {
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

}
