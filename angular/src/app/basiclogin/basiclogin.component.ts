/*
* Copyright (c) 2022 CyberArk Software Ltd. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm, AbstractControl } from '@angular/forms';
import { BasicLoginService } from './basiclogin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { getAppImgStr, getStorage, setStorage, validateAllFormFields } from '../utils';

@Component({
  selector: 'app-login',
  templateUrl: './basiclogin.component.html',
  styleUrls: ['./basiclogin.component.css']
})

export class BasicLoginComponent implements OnInit {
  loginForm: FormGroup;
  loginButtonText ="Login";
  authMessage = "";
  messageType = "error";
  loading = false;
  appImage = "";

  constructor(
    private formBuilder: FormBuilder,
    private loginService: BasicLoginService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (getStorage("username") !== null) {
      this.router.navigate(['user']);
    }
    if (getStorage("registerMessageType") !== null) {
      this.messageType = getStorage("registerMessageType");
      this.authMessage = getStorage("registerMessage");
      setStorage("registerMessage", "");
    }
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.appImage = getAppImgStr();
  }

  // Getter for easy access to form fields
  get formControls() { return this.loginForm.controls; }

  checkMessageType() {
    return this.messageType == "info";
  }

  loginUser(form: NgForm) {
    if(!validateAllFormFields(this.loginForm)){
      return;
    }
    this.loading = true;
    this.loginService.basicLoginUser(this.formControls.username.value,this.formControls.password.value).subscribe({
      next: data => {
        this.loading = false;
        if (data && data.Success == true) {
          this.redirectToMFA(data.Result);
        }else{
          this.onLoginError(data.ErrorMessage);
        }
      },
      error: error => {
        console.error(error);
        this.onLoginError(error.error.ErrorMessage);
      }
    });
  }

  onLoginError(message) {
    this.loading = false;
    this.authMessage = message;
    this.messageType = "error";
    this.resetFormFields();
  }
  redirectToMFA(result: any) {
    setStorage("sessionUuid", result.SessionUuid);
    setStorage("mfaUsername", result.MFAUserName);
    this.router.navigate(['mfawidget']);
  }

  resetFormFields(): boolean {
    let valid = true;
    Object.keys(this.loginForm.controls).forEach(fieldname => {
      const field = this.loginForm.get(fieldname);
      field.markAsUntouched({ onlySelf: true });
      if (field.invalid) {
        valid = false;
      }
    });
    return valid;
  }

  // #TODO Move in common util
  public hasError = (controlName: string, errorName: string) => {
    let form = this.loginForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}
