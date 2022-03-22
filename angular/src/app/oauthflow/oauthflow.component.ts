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

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorizationService } from '../metadata/authorizationservice';
import { AuthorizationFlow, AuthorizationMetadataRequest, buildAuthorizeURL, getStorage, OAuthFlow, setStorage, validateAllFormFields } from '../utils';

@Component({
  selector: 'oauthflow',
  templateUrl: './oauthflow.component.html',
  styleUrls: ['./oauthflow.component.css'],
})

export class OAuthFlowComponent implements OnInit {
  @ViewChild('authorizeBtn', { static: true }) authorizeBtn;

  loginForm: FormGroup;
  username: string = getStorage('username') || '';
  selectedFlow: OAuthFlow = OAuthFlow.auth;
  loading = false;
  authURL = "Authorize URL";
  isPasswordVisible = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required],
    })
    setStorage('authFlow', AuthorizationFlow.OAUTH);
    setStorage('oauthflow_flow', OAuthFlow.auth);
  }

  onSelect(val: OAuthFlow){
    this.selectedFlow = val;
    setStorage('oauthflow_flow', val);
    if(val !== OAuthFlow.auth){
      this.isPasswordVisible = false;
      localStorage.removeItem('client_secret');
    }
    else this.isPasswordVisible = true;
  }

  onBack(){
    this.router.navigate(['loginprotocols']);
  }

  onAccept(){
    this.loading = true;
    window.location.href = this.authURL + "&AUTH=" + this.authorizationService.readCookie("AUTH");
  }

  /**
   * based on the oauth flow builds the authorization url
   */
  onBuildAuthUrl(){
    if(this.selectedFlow === OAuthFlow.auth && !validateAllFormFields(this.loginForm)) return;

    let authReqMetaData = new AuthorizationMetadataRequest();
    authReqMetaData.authFlow = AuthorizationFlow.OAUTH;
    authReqMetaData.clientId = this.username;
    authReqMetaData.responseType = this.selectedFlow === OAuthFlow.implicit ? "token" : "code";
    if (this.selectedFlow === OAuthFlow.auth) {
      const passValue = this.loginForm.get('password').value;
      authReqMetaData.clientSecret = passValue;
      setStorage('client_secret', passValue);
    }
    if (this.selectedFlow === OAuthFlow.authPKCE){
      this.loading = true;
      this.authorizationService.getPKCEMetadata().subscribe({
        next: data => {
          this.loading = false;
          authReqMetaData.codeChallenge = data.Result.codeChallenge;
          setStorage('codeVerifier', data.Result.code_verifier);
          buildAuthorizeURL(authReqMetaData, this);
        },
        error: error => {
          this.loading = false;
          console.error(error);
        }
      })
    } else {
      this.loading = true;
      buildAuthorizeURL(authReqMetaData, this);
    }
  }

  // #TODO Move in common util
  public hasError = (controlName: string, errorName: string) => {
    let form = this.loginForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}