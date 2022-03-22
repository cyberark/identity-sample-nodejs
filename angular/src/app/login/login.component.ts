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

import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { getStorage, setStorage, APIErrStr, getAppImgStr, setUserDetails } from '../utils';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, AfterContentChecked {
  loginForm: FormGroup;
  loginButtonText: string;
  loginPage: string;
  sessionId: string;
  tenantId: string;
  challenges: Array<Object>;
  mechanisms: JSON;
  currentMechanism: JSON;
  answerLabel: string;
  answerErrorText: string;
  disableUsername: string;
  pollChallenge: any;
  textAnswer = false;
  authMessage = "";
  messageType = "error";
  forgotPasswordCheck = false;
  matchPasswordsCheck = true;
  allowForgotPassword = false;
  loading = false;
  secondAuthLoad = false;
  secondMechanisms: JSON;
  showQRCode = false;
  isPhoneCall = false;
  QRImageSource: string;
  loginHeader = "Login to Acme Inc";
  isSignUpVisible = true;
  popupBtnLabel = "Start Over";
  errorMessage = APIErrStr;
  appImage = "";
  gotoSettingsAfterLogin = false;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const state = history.state;
    this.gotoSettingsAfterLogin = state.gotoSettingsAfterLogin;

    if (this.gotoSettingsAfterLogin) {
      this.loginHeader = 'Additional authentication required to access settings';
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      authMethod: ['', Validators.required],
      answer: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    if (getStorage("registerMessageType") !== null) {
      this.messageType = getStorage("registerMessageType");
      this.authMessage = getStorage("registerMessage");
      setStorage("registerMessage", "");
    }

    this.appImage = getAppImgStr();

    if (this.loginPage == null) {
      this.loginPage = "username";
      this.loginButtonText = "Next";
    }

    if (getStorage('challengeStateID')) {
      this.isSignUpVisible = false;
      this.loginHeader = 'Additional authentication required to access this application';
      const username = getStorage("username") !== null ? getStorage("username") : getStorage("mfaUsername");
      this.formControls.username.setValue(username);
      this.loginUser();
    } else if (getStorage("userId")) {
      this.isSignUpVisible = true;
      this.loginHeader = 'Login';
      this.router.navigate(['user']);
    }
  }

  ngAfterContentChecked() {
    if (this.loginPage == "secondChallenge" && !this.secondAuthLoad) {
      this.authMethodChange();
      this.secondAuthLoad = true;
    }
  }

  // Getter for easy access to form fields
  get formControls() { return this.loginForm.controls; }

  showLoginComponent(currentPage: String) {
    let page = this.loginPage;
    if (page == "firstChallenge" || page == "secondChallenge") {
      page = "challenge";
    }
    return currentPage == page;
  }

  showForgotPassword(currentPage: String) {
    return this.showLoginComponent(currentPage) && this.allowForgotPassword;
  }

  checkMessageType() {
    return this.messageType == "info";
  }

  authMethodChange() {
    this.loginForm.controls["answer"].reset();
    let selectedAuthMethod = this.mechanisms[this.formControls.authMethod.value];
    this.showQRCode = false;
    this.textAnswer = false;
    this.isPhoneCall = false;

    if (selectedAuthMethod && selectedAuthMethod.AnswerType == 'Text') {
      this.textAnswer = true;
      this.answerErrorText = "Answer";
      if (selectedAuthMethod.Name == 'SQ') {
        this.answerLabel = selectedAuthMethod.PromptMechChosen;
      } else if (selectedAuthMethod.Name == 'UP') {
        this.answerLabel = selectedAuthMethod.PromptMechChosen;
        this.answerErrorText = "Password";
      }
    } else if (selectedAuthMethod && selectedAuthMethod.AnswerType == 'StartOob' && selectedAuthMethod.Name == 'QR') {
      this.showQRCode = true;
      this.QRImageSource = selectedAuthMethod.Image;
      this.answerErrorText = "QR Code scanning";
    } else if (selectedAuthMethod && selectedAuthMethod.AnswerType == 'StartOob' && selectedAuthMethod.Name == 'PF') {
      this.answerErrorText = "Answering Phone call";
      this.isPhoneCall = true;
    }
    else {
      this.answerErrorText = "Code";
    }
  }

  loginUser() {
    // stop here if form is invalid
    if (!this.validateFormFields(this.getFormFieldsArray(this.loginPage)) || (this.loginPage == "reset" && !this.matchPasswords())) {
      return;
    }

    this.authMessage = "";
    if (this.loginPage === "username" && getStorage('challengeStateID') === null) {
      this.loading = true;
      this.loginService.beginAuth(this.formControls.username.value).subscribe({
        next: data => {
          this.loading = false;
          if (data.success) {
            if (data.Result.Summary == "LoginSuccess") {
              this.redirectToDashboard(data.Result);
            } else if (data.success && data.Result.PodFqdn) {
              this.onLoginError(`Update Tenant URL to \"${data.Result.PodFqdn}\" in <u><a href="/settings">settings page</a></u>.`);
            } else {
              this.loginForm.get('username').disable();
              if (data.Result && data.Result.ClientHints && data.Result.ClientHints.AllowForgotPassword) {
                this.allowForgotPassword = true;
              }
              this.runAuthSuccessFlow(data);
            }
          } else {
            this.onLoginError(data.Message);
          }
        },
        error: error => {
          this.onLoginError(this.getErrorMessage(error));
        }
      });
    } else if (this.loginPage === "username" && getStorage('challengeStateID')) {
      this.loading = true;
      this.loginService.beginChallenge(this.formControls.username.value, getStorage('challengeStateID')).subscribe({
        next: data => {
          this.loading = false;
          if (data.success) {
            if (data.Result.Summary === "LoginSuccess") {
              this.redirectToDashboard(data.Result);
            } else if (data.success && data.Result.PodFqdn) {
              this.onLoginError(`Update Tenant URL to \"${data.Result.PodFqdn}\" in <u><a href="/settings">settings page</a></u>.`);
            } else {
              this.loginForm.get('username').disable();
              if (data.Result && data.Result.ClientHints && data.Result.ClientHints.AllowForgotPassword) {
                this.allowForgotPassword = true;
              }
              this.runAuthSuccessFlow(data);
            }
          } else {
            this.onLoginError(data.Message);
          }
        },
        error: error => {
          console.error(error);
          if (error.error.Result && error.error.Result.Summary === "CannotSatisfyChallenges") {
            this.loading = false;
            this.errorMessage = error.error.Message;
            (<any>$('#errorPopup')).modal();
          } else {
            this.onLoginError(error.error.Message ?? APIErrStr);
          }
        }
      });
    } else {
      if (this.loginPage == "password" || this.loginPage == "reset") {
        this.currentMechanism = this.mechanisms[0];
      } else {
        this.currentMechanism = this.mechanisms[this.formControls.authMethod.value];
      }

      this.loading = true;
      this.loginService.advanceAuth(this.sessionId, this.tenantId, this.currentMechanism["MechanismId"], this.getAction(this.currentMechanism["AnswerType"]), this.formControls.answer.value).subscribe({
        next: data => {
          this.loading = false;
          if (data.success == true) {
            if (this.pollChallenge) {
              this.pollChallenge.unsubscribe();
            }
            if (data.Result.Summary == "LoginSuccess") {
              this.redirectToDashboard(data.Result);
            } else {
              this.runAuthSuccessFlow(data);
            }
          } else {
            this.onLoginError(data.Message);
          }
        },
        error: error => {
          this.onLoginError(this.getErrorMessage(error));
        }
      });
    }
  }

  getFormFieldsArray(loginPage: string): string[] {
    let fieldsArray = [];
    switch (loginPage) {
      case "username":
        fieldsArray = ["username"];
        break;
      case "password":
      case "firstChallengeCode":
      case "secondChallengeCode":
        fieldsArray = ["answer"];
        break;
      case "firstChallenge":
      case "secondChallenge":
        fieldsArray = ["authMethod"];
        if (this.textAnswer) {
          fieldsArray.push("answer");
        }
        break;
      case "reset":
        fieldsArray = ["answer"];
        fieldsArray.push("confirmPassword");
        break;
      default:
        break;
    }
    return fieldsArray;
  }

  getAction(answerType: string) {
    switch (answerType) {
      case "Text":
        return "Answer";
      case "StartTextOob":
      case "StartOob":
        return "StartOOB";
    }
  }

  runAuthSuccessFlow(data) {
    this.loginForm.controls["answer"].reset();
    switch (this.loginPage) {
      case "username":
        this.sessionId = data.Result.SessionId;
        this.tenantId = data.Result.TenantId;
        this.challenges = data.Result.Challenges;
        let challengeCount = this.challenges.length;
        this.mechanisms = this.challenges[0]["Mechanisms"];
        let firstMechanismsCount = Object.keys(this.mechanisms).length;

        if (challengeCount > 0 && firstMechanismsCount > 0) {
          if (firstMechanismsCount == 1 && this.mechanisms[0].Name == "UP") {
            this.textAnswer = true;
            this.answerLabel = this.mechanisms[0].PromptMechChosen;
            this.answerErrorText = "Password";
            this.loginPage = "password";
          } else {
            this.loginPage = "firstChallenge";
            this.formControls.authMethod.setValue(0);
            this.authMethodChange();
          }

          if (challengeCount > 1) {
            this.secondMechanisms = this.challenges[1]["Mechanisms"];
          }
        }
        this.router.navigate(['login']);
        break;
      case "password":
      case "firstChallenge":
      case "firstChallengeCode":
      case "secondChallenge":
      case "secondChallengeCode":
      case "reset":
        if (data.Result.Summary == "OobPending") {
          this.textAnswer = true;
          this.answerLabel = this.currentMechanism["PromptMechChosen"];
          this.loginPage = "firstChallengeCode";
          this.pollChallenge = this.loginService.getPollingChallenge(this.sessionId, this.tenantId, this.currentMechanism["MechanismId"]).subscribe({
            next: data => {
              if (data.success == true) {
                if (data.Result.Summary == "OobPending") {
                } else if (data.Result.Summary == "NewPackage" || data.Result.Summary == "StartNextChallenge") {
                  this.pollChallenge.unsubscribe();
                  this.redirectToNextPage(data);
                } else if (data.Result.Summary == "LoginSuccess") {
                  this.pollChallenge.unsubscribe();
                  this.redirectToDashboard(data.Result);
                }
              } else {
                if (this.router.url == '/login') {
                  this.onLoginError(data.Message);
                }
                this.pollChallenge.unsubscribe();
              }
            },
            error: error => {
              this.onLoginError(this.getErrorMessage(error));
            }
          });
          this.router.navigate(['login']);
        } else if (data.Result.Summary == "NewPackage" || data.Result.Summary == "StartNextChallenge") {
          this.redirectToNextPage(data);
        } else if (data.Result.Summary == "LoginSuccess") {
          this.redirectToDashboard(data.Result);
        } else if (data.Result.Summary == "NoncommitalSuccess") {
          this.startOver();
          this.messageType = "info";
          this.authMessage = data.Result.ClientMessage;
        } else {
          this.onLoginError(data.Message);
        }
        break;
      default:
        this.router.navigate(['login']);
        break;
    }
  }

  startOver() {
    if (this.pollChallenge) {
      this.pollChallenge.unsubscribe();
    }
    this.loginForm.reset();
    this.textAnswer = false;
    this.loginPage = "username";
    this.loginButtonText = "Next";

    this.modifyUserNameControl();
    this.router.navigate(['login']);
    return false;
  }

  modifyUserNameControl() {
    if (getStorage('challengeStateID')) {
      const username = getStorage("username") !== null ? getStorage("username") : getStorage("mfaUsername");
      this.formControls.username.setValue(username);
      this.loginForm.get('username').disable();
    } else {
      this.loginForm.get('username').enable();
    }
  }
  redirectToNextPage(data) {
    this.loginForm.controls["answer"].reset();
    if (data.Result.Summary === "StartNextChallenge") {
      this.mechanisms = this.secondMechanisms;
    } else {
      this.mechanisms = data.Result.Challenges[0]["Mechanisms"];
    }

    if (this.mechanisms[0].Name == "RESET") {
      if (this.loginPage == "reset" && data.Result.ClientMessage) {
        this.onLoginError(data.Result.ClientMessage);
      }
      this.loginPage = "reset";
      this.answerLabel = "New Password";
      this.answerErrorText = "New Password";
      this.textAnswer = true;
      this.loginForm.controls["confirmPassword"].reset();
    } else {
      this.loginPage = "secondChallenge";
      this.textAnswer = false;
    }
    this.resetFormFields(this.getFormFieldsArray(this.loginPage));
    if (this.loginPage == "secondChallenge") {
      this.formControls.authMethod.setValue(0);
      this.authMethodChange();
    }
    this.router.navigate(['login']);
  }

  getErrorMessage(error): string {
    console.error(error);
    return APIErrStr;
  }

  onLoginError(message) {
    this.loading = false;
    this.authMessage = message;
    this.messageType = "error";
    this.resetFormFields(this.getFormFieldsArray(this.loginPage));
    if (this.loginPage && this.loginPage != "username" && this.loginPage != "reset") {
      this.startOver();
    } else {
      this.modifyUserNameControl();
    }
  }

  forgotPassword() {
    this.forgotPasswordCheck = true;
    this.authMessage = "";
    this.textAnswer = false;
    this.loading = true;
    this.loginService.advanceAuth(this.sessionId, this.tenantId, "", "", "").subscribe({
      next: data => {
        this.loading = false;
        if (data.success == true) {
          this.sessionId = data.Result.SessionId;
          this.tenantId = data.Result.TenantId;
          this.challenges = data.Result.Challenges;
          this.mechanisms = this.challenges[0]["Mechanisms"];
          this.loginPage = "firstChallenge";
          this.router.navigate(['login']);
        } else {
          this.onLoginError(data.Message);
        }
      },
      error: error => {
        this.onLoginError(this.getErrorMessage(error));
      }
    });
    return false;
  }

  matchPasswords() { //group: FormGroup
    if (this.loginForm.controls.confirmPassword.pristine) {
      return;
    }
    let pass = this.loginForm.controls.answer.value;
    let confirmPass = this.loginForm.controls.confirmPassword.value;

    return this.matchPasswordsCheck = pass === confirmPass; // ? null : { notSame: true }
  }

  redirectToDashboard(result: any) {
    if (this.gotoSettingsAfterLogin) {
      setStorage("loginUserId", result.UserId);
      this.router.navigate(['settings']);
      return;
    }
    setUserDetails(result);
    if (getStorage('challengeStateID')) {
      setStorage('challengeStateID', null);
      this.router.navigate(['oidcflow']);
    } else {
      this.router.navigate(['loginprotocols']);
    }
  }

  onOk() {
    setStorage('challengeStateID', null);
    this.router.navigate(['loginprotocols']);
  }

  // Don't show action button only in case of QR Code
  isNextBtnVisible() {
    return document.getElementById('idQRCode') === null;
  }

  resetFormFields(controls: Array<string>): boolean {
    let valid = true;
    for (let i = 0; i < controls.length; i++) {
      let field = this.loginForm.get(controls[i]);
      field.markAsUntouched({ onlySelf: true });
      if (field.invalid) {
        valid = false;
      }
    }
    return valid;
  }

  validateFormFields(controls: Array<string>): boolean {
    let valid = true;
    for (let i = 0; i < controls.length; i++) {
      let field = this.loginForm.get(controls[i]);
      field.markAsTouched({ onlySelf: true });
      if (field.invalid) {
        valid = false;
      }
    }
    return valid;
  }

  // #TODO Move in common util
  public hasError = (controlName: string, errorName: string) => {
    let form = this.loginForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}
