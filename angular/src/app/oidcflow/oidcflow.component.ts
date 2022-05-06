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
import { Router } from '@angular/router';
import { AuthorizationService } from '../metadata/authorizationservice';
import { AuthorizationFlow, AuthorizationMetadataRequest, authURLStr, buildAuthorizeURL, OidcFlow, setStorage } from '../utils';

@Component({
  selector: 'oidcflow',
  templateUrl: './oidcflow.component.html',
  styleUrls: ['./oidcflow.component.css'],
})

export class OidcFlowComponent implements OnInit {
  @ViewChild('authorizeBtn', { static: true }) authorizeBtn;

  oidcFlow: OidcFlow = OidcFlow.auth;
  responseTypes = ["code"];
  authURL = authURLStr;
  loading = false;
  codeChallenge = "";
  codeVerifier = "";
  tokenSet = {};
  isIdTokenChecked = false;
  isIdTokenDisabled = false;
  isTokenChecked = false;

  constructor(
    private router: Router,
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    setStorage('authFlow', AuthorizationFlow.OIDC);
  }

  onBuildAuthUrl() {
    this.loading = true;
    let authRequest = new AuthorizationMetadataRequest();
    authRequest.redirect_uri = "http://localhost:4200/RedirectResource";
    if (this.oidcFlow === OidcFlow.implicit) {
      authRequest.responseType = this.responseTypes.join(' ');
      buildAuthorizeURL(authRequest, this);
    } else {
      this.authorizationService.getPKCEMetadata().subscribe({
        next: pkceMetadata => {
          this.codeChallenge = pkceMetadata.Result.codeChallenge;
          this.codeVerifier = pkceMetadata.Result.code_verifier;
          setStorage('codeVerifier', this.codeVerifier);
          authRequest.codeChallenge = pkceMetadata.Result.codeChallenge;
          authRequest.responseType = this.responseTypes.join(' ');
          buildAuthorizeURL(authRequest, this);
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['loginprotocols']);
  }

  onAccept() {
    this.loading = true;
    window.location.href = this.authURL + "&AUTH=" + this.authorizationService.readCookie("AUTH");
  }

  onSelect(val: OidcFlow) {
    this.oidcFlow = val;
    if (this.oidcFlow === OidcFlow.auth) {
      this.responseTypes = ["code"];
    } else if (this.oidcFlow === OidcFlow.hybrid) {
      this.isIdTokenChecked = false;
      this.isIdTokenDisabled = false;
      this.isTokenChecked = false;

      this.responseTypes = ["code"];
    } else {
      this.isIdTokenChecked = true;
      this.isIdTokenDisabled = true;
      this.isTokenChecked = false;

      this.responseTypes = ["id_token"];
    }
  }

  onCheckIdToken(isChecked: boolean) {
    this.isIdTokenChecked = isChecked;
    if (isChecked && !this.responseTypes.includes("id_token")) this.responseTypes.push("id_token");
    else this.responseTypes = this.responseTypes.filter(t => t !== "id_token");
  }

  onCheckToken(isChecked: boolean) {
    this.isTokenChecked = isChecked;
    if (isChecked && !this.responseTypes.includes("token")) this.responseTypes.push("token");
    else this.responseTypes = this.responseTypes.filter(t => t !== "token");
  }
}