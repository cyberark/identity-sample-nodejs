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

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { APIErrStr, AuthorizationFlow, getStorage, GrantType, OAuthFlow, OIDCTokens, revokeToken, setStorage, Settings, TokenMetadataRequest, validateAllFormFields } from '../utils';
import { AuthorizationService } from './authorizationservice';
import { ajax, css } from "jquery";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class Metadata implements OnInit {
  @ViewChild('proceedBtn', { static: true }) proceedBtn: ElementRef;

  tokenSet = {};
  claims = {};
  userInfo = {};
  authResponse = {};
  loading = false;
  hideAccordian = false;
  hideTokensAccordian = false;
  isOauthFlow = getStorage('authFlow') === AuthorizationFlow.OAUTH;
  heading: string = this.isOauthFlow ? 'OAuth Metadata' : 'OIDC Metadata';
  errorMessage: string = APIErrStr;
  hasRefreshToken: boolean = false;
  refreshTokenPostCall: string = "API Request";
  refreshTokenPostCallBody: any = "";
  introspectPostCallBody: any = "";
  password: string = "";
  refreshTokenForm: FormGroup;
  oidcTokens: OIDCTokens;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authorizationService: AuthorizationService,
    private loginService: LoginService,
  ) { }

  ngOnInit() {
    const state = history.state;
    delete state.navigationId;
    this.authResponse = state.authResponse;

    this.refreshTokenForm = this.formBuilder.group({
      password: ['', Validators.required],
    });

    if (!this.authResponse || this.authResponse['error']) {
      this.hideAccordian = true;
      (<any>$('#errorPopup')).modal();
      return;
    }

    if (this.authResponse['code']) {
      this.loading = true;
      this.authorizationService.getTokenSet(state.tokenReq).subscribe({
        next: data => {
          this.loading = false;
          this.tokenSet = data.Result;
          this.hasRefreshToken = Object.keys(this.tokenSet).includes('refresh_token');
          this.getClaims(this.tokenSet['access_token']);
          this.getUserInfo(this.tokenSet['access_token']);
          this.oidcTokens = JSON.parse(getStorage('oidcTokens'));
          if (this.oidcTokens) {
            this.oidcTokens.tokenResponseAccessToken = this.tokenSet['access_token'];
            setStorage('oidcTokens', JSON.stringify(this.oidcTokens));
          }
        },
        error: error => {
          this.loading = false;
          this.errorMessage = error.error.ErrorMessage;
          (<any>$('#errorPopup')).modal();
        }
      });
    } else {
      //implicit flow
      this.hideTokensAccordian = true;
      this.loading = true;
      const token = this.isOauthFlow ? this.authResponse['access_token'] : this.authResponse['id_token'];
      this.getClaims(token);
      this.getUserInfo(token);
      this.loading = false;
    }
  }

  getClaims(idToken: string) {
    this.authorizationService.getClaims(idToken).subscribe({
      next: data => {
        if (data && data.Success) {
          this.claims = data.Result;
        }
      },
      error: error => {
        this.errorMessage = error.error.ErrorMessage;
        (<any>$('#errorPopup')).modal();
      }
    });
  }

  getUserInfo(accessToken: string) {
    if (this.isOauthFlow) return;
    this.authorizationService.getUserInfo(accessToken).subscribe({
      next: data => {
        if (data && data.Success) {
          this.userInfo = data.Result;
        }
      },  
      error: error => {
        console.error(error);
      }
    });
  }

  dataKeys(object: Object) { return Object.keys(object); }

  onTryAnotherFlow() {
    if (getStorage('oidcTokens') && !this.isOauthFlow) {
      revokeToken(JSON.parse(getStorage('oidcTokens')), this);
    }
    this.loginService.logout().subscribe({
      next: data => {
        if (data.success) {
          localStorage.clear();
          this.router.navigate(['home']);
        }
      },
      error: error => {
        console.error(error);
      }
    });
  }

  showAccessTokenBtn(): boolean {
    return this.hasRefreshToken && this.isOauthFlow;
  }

  onIssueNewAccessToken() {
    this.refreshTokenPostCall = "Request API";
    this.refreshTokenPostCallBody = "";
    this.proceedBtn.nativeElement.disabled = true;
    (<any>$('#refreshTokenPopup')).modal();
  }
  onIntrospect() {
    (<any>$('#introspectpopup')).modal();
    let token=this.authResponse['access_token']
    if(!token)
    { 
      token=this.tokenSet['access_token'];
    }
    this.authorizationService.getIntrospect(token).subscribe({
      next: data => {
        if (data && data.Success) {
          this.introspectPostCallBody = data.Result;
        }
      },  
      error: error => {
        console.error(error);
      }
      
    })
  }
  onProceed() {
    this.loading = true;
    let tokenReqMetaData: TokenMetadataRequest = new TokenMetadataRequest();
    tokenReqMetaData.authFlow = AuthorizationFlow.OAUTH;
    tokenReqMetaData.grant_type = GrantType.refresh_token;
    tokenReqMetaData.refresh_token = this.tokenSet['refresh_token'];
    tokenReqMetaData.client_id = this.claims['unique_name'];
    tokenReqMetaData.client_secret = this.password;
    this.authorizationService.getRefreshToken(tokenReqMetaData).subscribe({
      next: data => {
        this.tokenSet = { ...this.tokenSet, ...data.Result };
        this.getClaims(data.Result.access_token);
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.error.ErrorMessage;
        (<any>$('#errorPopup')).modal();
        this.loading = false;
      }
    })
  }

  onShowPreview() {
    if (!validateAllFormFields(this.refreshTokenForm)) return;
    this.password = this.refreshTokenForm.get('password').value;
    const settings: Settings = JSON.parse(getStorage("settings"));
    let postCallBody = {
      "client_id": getStorage("username"),
      "client_secret": this.password,
      "grant_type": "refresh_token",
      "refresh_token": this.tokenSet['refresh_token']
    };
    this.refreshTokenPostCall = `POST ${settings.tenantUrl}/oauth2/token/${settings.oauthAppId}`;
    this.refreshTokenPostCallBody = postCallBody;
    this.proceedBtn.nativeElement.disabled = false;
  }

  isPwdEmpty() {
    return this.password === "";
  }

  onOk() {
    if (getStorage('authFlow') === AuthorizationFlow.OAUTH) {
      const oauthflow_flow = getStorage('oauthflow_flow');
      if (oauthflow_flow === OAuthFlow.resourceOwner || oauthflow_flow === OAuthFlow.clientCreds) {
        this.router.navigate(['m2m']);
      } else {
        this.router.navigate(['oauthflow']);
      }
    } else {
      this.router.navigate(['oidcflow']);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    let form = this.refreshTokenForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }

  /**
  * Copies string content clipboard
  * @param form string to copy
  */
  copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
  }
}