import { UserService } from 'src/app/user/user.service';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { getStorage, validateAllFormFields, APIErrStr, defaultLabel, defaultTitle } from '../utils';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-updateprofile',
  templateUrl: './updateprofile.component.html'
})

export class UpdateprofileComponent implements OnInit {

  updateProfileForm: FormGroup;
  messageType = "error";
  errorMessage = "";
  popUpMessage: string = APIErrStr;
  popUptitle: string = defaultTitle;
  popUpLabel: string = defaultLabel;


  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.updateProfileForm = this.formBuilder.group({
      "Name": ['', Validators.required],
      "Mail": ['', Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")
      ])],
      "DisplayName": ['', Validators.required],
      "MobileNumber": ['', Validators.compose([
        Validators.required,
        Validators.pattern("^\\+[0-9() +-]{4}[0-9() +-]{5,10}$")
      ])],
    });

    if (getStorage("userId") !== null) {
      this.userService.getAttributes(getStorage("userId")).subscribe({
        next: data => {
          if (data.success) {
            let userControls = this.updateProfileForm.controls;
            let user = data.Result;
            userControls.Name.setValue(user.Name);
            userControls.Mail.setValue(user.Mail);
            userControls.DisplayName.setValue(user.DisplayName);
            userControls.MobileNumber.setValue(user.MobileNumber);
          } else {
            this.showInfo(this, { error: data.Message });
          }
        },
        error: error => {
          this.showInfo(this, error);
          console.error(error);
        }
      });
    }
  }

  updateUserProfile(formData: any) {

    if (!validateAllFormFields(this.updateProfileForm)) {
      return;
    }

    let data = formData;
    data.ID = getStorage("userId");
    this.userService.updateProfile(data).subscribe({
      next: data => {
        if (data && data.success) {
          this.showInfo(this, data.success);
        } else {
          this.showInfo(this, { error: data });
        }
      },
      error: error => {
        this.showInfo(this, error);
        console.error(error);
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    let form = this.updateProfileForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }

  showInfo(context, info) {
    if (info === true) {
      context.popUpMessage = "User information successfully updated";
      context.popUptitle = "Success";
      context.popUpLabel = "OK";
    }
    else {
      context.popUpMessage = info.error.ErrorMessage || info.error.error_description || info.error.Message;
      context.popUpLabel = "OK";
    }

    (<any>$('#errorPopup')).modal();
  }

  onOk(): void {
    this.router.navigate(['/updateprofile']);
  }
}