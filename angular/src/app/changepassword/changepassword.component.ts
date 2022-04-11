import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, AbstractControl } from '@angular/forms';
import { validateAllFormFields, APIErrStr, defaultTitle, defaultLabel } from '../utils';
@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html'
})
export class ChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  matchPasswordsCheck = true;
  popUpMessage: string = APIErrStr;
  popUptitle: string = defaultTitle;
  popUpLabel: string = defaultLabel;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.formBuilder.group({
      oldpassword: ['', Validators.required],
      newpassword: ['', Validators.required],
      confirmpassword: ['', Validators.required]
    });
  }

  get formControls() { return this.changePasswordForm.controls; }
  onChangePassword() {
    if (!validateAllFormFields(this.changePasswordForm) || !this.matchPasswords()) {
      return;
    }
    this.userService.changePassword(this.formControls.oldpassword.value, this.formControls.newpassword.value).subscribe({
      next: data => {
        if (data && data.success == true) {
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
    let form = this.changePasswordForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }

  matchPasswords() {
    if (this.changePasswordForm.controls.confirmpassword.pristine) {
      return;
    }
    let pass = this.changePasswordForm.controls.newpassword.value;
    let confirmPass = this.changePasswordForm.controls.confirmpassword.value;
    return this.matchPasswordsCheck = pass === confirmPass;
  }

  showInfo(context, info) {
    if (info == true) {
      context.popUpMessage = "Password changed successfully";
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
    window.location.reload();
  }

}
