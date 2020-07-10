import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule }            from '@angular/flex-layout';
import { FormsModule,
	 ReactiveFormsModule }         from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule}          from '@angular/material/input'
import {MatProgressBarModule} from '@angular/material/progress-bar'
import {MatIconModule}          from '@angular/material/icon'
import {MatButtonModule}          from '@angular/material/button'
import {MatCardModule}          from '@angular/material/card'
import {MatCheckboxModule}          from '@angular/material/checkbox'
import {MatToolbarModule}          from '@angular/material/toolbar'
import {MatListModule}          from '@angular/material/list'
import {MatMenuModule}          from '@angular/material/menu'
import {MatSelectModule}          from '@angular/material/select'
import {MatDialogModule}          from '@angular/material/dialog'
import {MatExpansionModule}          from '@angular/material/expansion'
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
		BrowserAnimationsModule,
    MatMenuModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
		MatProgressBarModule,
		MatSlideToggleModule
  ],
  exports: [
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
		MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
		BrowserAnimationsModule,
    MatMenuModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
		MatSlideToggleModule
  ]
})
export class ShareModule { }
