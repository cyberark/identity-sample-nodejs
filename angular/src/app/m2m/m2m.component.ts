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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorizationService } from '../metadata/authorizationservice';
import { AuthorizationFlow, getStorage, GrantType, OAuthFlow, setStorage, TokenMetadataRequest, validateAllFormFields } from '../utils';

@Component({
  selector: 'm2m',
  templateUrl: './m2m.component.html',
})

export class M2MComponent implements OnInit {
  @ViewChild('submitBtn', { static: true }) submitBtn: ElementRef;

  isFormVisible: boolean = false;
  loginForm: FormGroup;
  username: string = getStorage('username');
  selectedFlow: OAuthFlow = OAuthFlow.clientCreds;
  loading = false;
  tokenPostCall = "Token URL";
  tokenPostCallBody = "";
  isPasswordVisible = true;
  tokenMetaReq = new TokenMetadataRequest();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
    setStorage('authFlow', AuthorizationFlow.OAUTH);
    setStorage('oauthflow_flow', OAuthFlow.clientCreds);
  }

  onSelect(val: OAuthFlow){
    this.selectedFlow = val;
    setStorage('oauthflow_flow', val);
    if(val === OAuthFlow.clientCreds){
      this.isFormVisible = false;
    }
    else this.isFormVisible = true;
  }

  onBack(){
    this.router.navigate(['loginprotocols']);
  }

  /**
   * based on the oauth flow builds the token url
   */
  onBuildTokenUrl(){
    if(this.selectedFlow === OAuthFlow.resourceOwner && !validateAllFormFields(this.loginForm)) return;

    this.loading = true;
    this.tokenMetaReq.authFlow = AuthorizationFlow.OAUTH;
    if(this.selectedFlow === OAuthFlow.clientCreds) {
        this.tokenMetaReq.grant_type = GrantType.client_credentials;
    }else {
        this.tokenMetaReq.grant_type = GrantType.password;
        this.tokenMetaReq.user_name = this.username;
        this.tokenMetaReq.password = this.loginForm.get('password').value;
    }

    this.authorizationService.getTokenRequestPreview(this.tokenMetaReq).subscribe({
      next: data => {
          this.loading = false;
          this.submitBtn.nativeElement.disabled = false;
          this.tokenPostCall = 'POST ' + data.Result.apiEndPoint;
          this.tokenPostCallBody= data.Result.payload;
        },
      error: error => {
          this.loading = false;
          console.error(error);
      }
    });
  }

  onSubmit(){
    this.router.navigateByUrl('/metadata', { state: {authResponse: {code: "code"}, tokenReq: this.tokenMetaReq}})
  }

  // #TODO Move in common util
  public hasError = (controlName: string, errorName: string) => {
    let form = this.loginForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}