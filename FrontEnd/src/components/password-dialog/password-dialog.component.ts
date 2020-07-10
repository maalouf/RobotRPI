import { Component, OnInit,Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.css']
})
export class PasswordDialogComponent implements OnInit {
  public password : string;
  public error : string;
  public showError : boolean = false;
  ngOnInit(): void {
    this.password = "";
    this.showError = false;
  }

  constructor(private dialogRef: MatDialogRef<PasswordDialogComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any) { }

  public ok(){
    if (this.password.length == 0) {
      this.error = "Please enter password..."
      this.showError = true;
    } else {
      this.dialogRef.close({"password":this.password});
    }
  }

  public cancel(){
    this.dialogRef.close({});
  }

}
