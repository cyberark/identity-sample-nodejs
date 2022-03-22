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

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../user/user.service';
import { HeaderComponent } from '../components/header/header.component';
import { getStorage, setStorage, validateAllFormFields, APIErrStr, getAppImgStr, getSiteKey, getCaptchaStatus } from '../utils';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { HttpStatusCode } from '@angular/common/http';
import { AuthorizationService } from '../metadata/authorizationservice';
import { BasicLoginService } from '../basiclogin/basiclogin.service';
import { HeartBeatService } from '../heartbeat/heartbeat.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  @ViewChild(HeaderComponent)
  private header: HeaderComponent;

  update = false;
  submitButtonText = "Register";
  btnText = "Register";
  registerForm: FormGroup;
  messageType = "error";
  errorMessage = "";
  matchPasswordsCheck = true;
  loading = false;
  showConsent = false;
  appImage: string = "";
  reCaptchaToken: string;
  siteKey: string = "";
  isCaptchaEnabled: boolean;
  disableSignUp: boolean;

  @ViewChild('divToScroll', { static: true }) divToScroll: ElementRef;
 


  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    private loginService: BasicLoginService,
    private authorizationService: AuthorizationService,
    private heartBeatService: HeartBeatService
  ) { }

  ngOnInit() {
    if (getStorage("userId") !== null && (this.router.url == "/register")) {
      this.router.navigate(['user']);
    } else if (getStorage("userId") == null && (this.router.url == "/user")) {
      this.router.navigate(['/login']);
    }

    this.registerForm = this.formBuilder.group({
      "Name": ['', Validators.required],
      "Mail": ['', Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")
      ])],
      "DisplayName": ['', Validators.required],
      "Password": ['', Validators.compose([
        Validators.required,
        Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,64}$")
      ])],
      
      "ConfirmPassword": ['', Validators.required],
      "MobileNumber": ['',Validators.pattern("^\\+[0-9() +-]{4}[0-9() +-]{5,10}$")],
      "MFA": [false],
    }, { updateOn: 'blur' });

    this.appImage = getAppImgStr();
    this.siteKey = getSiteKey();
    this.isCaptchaEnabled = getCaptchaStatus();
    this.disableSignUp = false;

    if (getStorage("userId") !== null) {
      this.loading = true;
      this.heartBeatService.checkHeartBeat(this);
      this.userService.getById(getStorage("userId")).subscribe({
        next: data => {
          this.loading = false;
          if (data.success) {
            let userControls = this.registerForm.controls;
            let user = data.Result;
            userControls.Name.setValue(user.Name);
            userControls.Mail.setValue(user.Mail);
            userControls.DisplayName.setValue(user.DisplayName);
            userControls.MobileNumber.setValue(user.MobileNumber);
          } else {
            this.setMessage("error", data.Message); 
          }
        },
        error: error => {
          let errorMessage = APIErrStr;
          if (error.status == HttpStatusCode.Forbidden && error.error) {
            errorMessage = error.error.ErrorMessage;
          }
          console.error(error);
          this.setMessage("error", errorMessage); 
        }
      });
      this.update = true;
      this.submitButtonText = "Update";
    } else {
      this.update = false;
      this.submitButtonText = "Sign up";
      this.registerForm.reset();
    }
  }

  pick(obj: {}, keys) {
    return Object.assign({}, ...keys.map(k => k in obj ? { [k]: obj[k] } : {}))
  }

  checkMessageType() {
    return this.messageType == "info";
  }

  matchPasswords() {
    if (this.registerForm.controls.ConfirmPassword.pristine) {
      return;
    }
    let pass = this.registerForm.controls.Password.value;
    let confirmPass = this.registerForm.controls.ConfirmPassword.value;

    return this.matchPasswordsCheck = pass === confirmPass; // ? null : { notSame: true }
  }

  toggleUserConsentDialog() {
    return this.showConsent = !this.showConsent;
  }

  validateRegisterForm(form: NgForm) {
    if (this.update) {
      let fieldArray = ["Name", "Mail", "DisplayName", "MobileNumber", "MFA"];
      if (!this.validateFormFields(fieldArray)) {
        this.divToScroll.nativeElement.scrollTop = 0;
        return;
      }
    } else {
      const isValid = validateAllFormFields(this.registerForm);
      this.matchPasswords();
      if (!isValid || !this.matchPasswordsCheck) {
        this.divToScroll.nativeElement.scrollTop = 0;
        return;
      }
    }

    if (this.registerForm.controls.MFA.value && !this.update) {
      return this.toggleUserConsentDialog();
    } else {
      this.registerUser(form);
    }
  }

  public resolved(captchaResponseToken: string) {
    this.disableSignUp = false;
    this.reCaptchaToken =  captchaResponseToken;
  }

  public errored() {
    this.disableSignUp = true;
  }

  registerUser(form: NgForm) {
    let user;
    this.loading = true;

    if (this.update) {
      let fieldArray = ["Name", "Mail", "DisplayName", "MobileNumber", "MFA"];

      user = this.pick(form, fieldArray)
      this.userService.update(user, getStorage("userId")).subscribe({
        next: data => {
          this.loading = false;
          if (data.success == true) {
            setStorage("mfaUsername", data.UserName);
            this.setMessage("info", "User information updated successfully");
            this.router.navigate(['/user']);
          } else {
            this.setMessage("error", data.Message);
          }
        },
        error: error => {
          let errorMessage = APIErrStr;
          if (error.status == HttpStatusCode.Forbidden && error.error) {
            errorMessage = error.error.ErrorMessage;
          }
          console.error(error);
          this.setMessage("error", errorMessage); 
        }
      });
    } else {
      user = Object.assign({}, form);
      user.ReCaptchaToken = this.reCaptchaToken;
      this.userService.getClientIP().subscribe({
        next: ipData => {
          this.userService.register(user, ipData.ip).subscribe({
            next: data => {
              this.loading = false;
              if (data.success == true) {
                if (data.Result != null && data.Result.IntegrationResult != null && data.Result.IntegrationResult.IsManualApprovalTriggered == true) {
                  setStorage("registerMessageType", "error");
                  setStorage("registerMessage", "Your account sign-up request is pending approval. You will receive an email once it’s approved, and then you will be able to login.")
                } else {
                  setStorage("registerMessageType", "info");
                  setStorage("registerMessage", "User " + user.Name + " registered successfully. Enter your credentials here to proceed.")
                }
                if(data.Result.Auth) {
                  this.authorizationService.getPKCEMetadata().subscribe({
                    next: d => {
                      this.loginService.authorize(data.Result.Auth, data.Result.UserId, d.Result.codeChallenge).subscribe({
                        next: auth => {
                          this.loginService.setAuthCookie("", auth.Result.AuthorizationCode, data.Result.UserId, d.Result.code_verifier).subscribe({
                            next: res => {
                              setStorage("loginUserId", data.Result.UserId);
                              setStorage("mfaUsername", res.Result.mfaUsername);
                              setStorage("sessionUuid", res.Result.SessionUuid);
                              setStorage("userId", data.Result.UserId);
                              if (document.cookie.includes('flow1'))
                                this.router.navigate(['/loginprotocols']);
                              else
                                this.router.navigate(['/user']);
                            },
                            error: e => {
                              console.error(e);
                            }
                          })
                        },
                        error: e => {
                          console.error(e);
                        }
                      })
                    },
                    error: e => {
                      console.error(e);
                    }
                  })
                } else {
                  if (document.cookie.includes('flow1'))
                    this.router.navigate(['/login']);
                  else
                    this.router.navigate(['/basiclogin']);
                }
              } else {
                this.setMessage("error", data.Message);
              }
            },
            error: error => {
              console.error(error);
              this.setMessage("error", APIErrStr); 
            }
          });
        },
        error: error => {
          console.error(error);
          this.setMessage("error", error.message);
        }
      });
    }
  }

  setMessage(messageType: string, message: string) {
    this.loading = false;
    this.messageType = messageType;
    this.errorMessage = message;
    this.divToScroll.nativeElement.scrollTop = 0;
  }

  cancelRegister() {
    this.registerForm.reset();
    if (this.update) {
      this.router.navigate(['user']);
    } else {
      this.router.navigate(['/']);
    }
  }

  checkScenario3() {
    return !this.update && document.cookie.includes('flow3');
  }

  onClick(event) {
    if (event.target.attributes.id && event.target.attributes.id !== "" && event.target.attributes.id.nodeValue === "signOutButton") {
      return;
    }
    this.header.signOutMenu = false;
  }

  // #TODO Move in common util
  validateFormFields(controls: Array<string>): boolean {
    let valid = true;
    for (let index in controls) {
      let field = this.registerForm.get(controls[index]);
      field.markAsTouched({ onlySelf: true });
      if (field.invalid) {
        valid = false;
      }
    }
    return valid;
  }

  // #TODO Move in common util
  public hasError = (controlName: string, errorName: string) => {
    let form = this.registerForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}
