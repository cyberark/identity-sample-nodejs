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
import { AuthorizationService } from '../metadata/authorizationservice';
import { getStorage, APIErrStr, Settings, addChildNodes, redirectOIDCAPI, codeChallengeMethod } from '../utils';
import { ajax, css } from "jquery";
declare let LaunchLoginView: any;

@Component({
  selector: 'app-loginWidget',
  templateUrl: './loginWidget.component.html',
  styleUrls: ['./loginWidget.component.css']
})

export class LoginWidgetComponent implements OnInit {

  errorMessage: string = APIErrStr;;
  showSignUpWidget = false;

  constructor(
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    var me = this;
    const settings: Settings = JSON.parse(getStorage('settings'));
    this.showSignUpWidget = getStorage("showSignUpWidget") === "true";
    this.loginView(settings);
  }

  loginView(settings) {
    let config = {
      "containerSelector": "#cyberark-login",
      "showSignup": this.showSignUpWidget,
      "signUpLinkText": "Sign Up",
      "apiFqdn": settings.tenantUrl.split("/")[2],
      "widgetId": settings.loginWidgetId,
    };

    if (!this.showSignUpWidget) {
      this.authorizationService.getPKCEMetadata().subscribe({
        next: pkce => {
          this.authorizationService.getOIDCAppScopes().subscribe({
            next: s => {
              const username = getStorage('username');
              config["username"] = username;
              config["autoSubmitUsername"] = username ? true : false;
              config["redirect_uri"] = redirectOIDCAPI;
              config["scope"] = s.join(' ');
              config["code_challenge"] = pkce.Result.codeChallenge;
              config["code_challenge_method"] = codeChallengeMethod;
            },
            error: err => {
              this.showError(this, err);
            }
          })
        },
        error: err => {
          this.showError(this, err);
        }
      });
    }

    addChildNodes(settings, () => {
      LaunchLoginView(config);
    });
  }

  onRetry(): void {
    window.location.reload();
  }

  showError(context, error) {
    context.errorMessage = error.error.ErrorMessage || error.error.error_description;
    (<any>$('#errorPopup')).modal();
  }
}