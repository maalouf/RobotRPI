import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WifiSelectorComponent } from './wifi-selector/wifi-selector.component';
import {MatListModule}          from '@angular/material/list'
import {MatIconModule}          from '@angular/material/icon'
import { FlexLayoutModule }            from '@angular/flex-layout';
import {MatButtonModule}          from '@angular/material/button'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { PasswordDialogComponent } from './password-dialog/password-dialog.component';
import {MatInputModule}          from '@angular/material/input'
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { FormsModule } from '@angular/forms';
import { HomePageComponent } from './home-page/home-page.component';
import { GamepadComponent } from './gamepad/gamepad.component';
import { ChoiceComponent } from './choice/choice.component';
import { StatusComponent } from './status/status.component';

@NgModule({
  declarations: [WifiSelectorComponent, PasswordDialogComponent, HomePageComponent, GamepadComponent, ChoiceComponent, StatusComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
    MatProgressBarModule

  ],
  "entryComponents":[
    PasswordDialogComponent
  ]
})
export class ComponentsModule { }
