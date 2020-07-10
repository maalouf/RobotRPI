import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WifiSelectorComponent} from 'components/wifi-selector/wifi-selector.component'
import {HomePageComponent} from 'components/home-page/home-page.component'
import {ChoiceComponent} from 'components/choice/choice.component'
const routes: Routes = [
  {
    path: '',
    component: ChoiceComponent,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePageComponent,
    pathMatch: 'full',
  },
  {
    path: 'scanWifi',
    component: WifiSelectorComponent,
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
