import { CameraComponent } from './camera/camera.component';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: 'tabs',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./user/user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: 'user-detail',
    loadChildren: () => import('./user/user-detail/user-detail.module').then( m => m.UserDetailPageModule)
  },
  {
    path: 'camera',
    component: CameraComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
