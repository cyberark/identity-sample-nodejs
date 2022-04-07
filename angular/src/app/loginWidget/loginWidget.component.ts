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
import { BasicLoginService } from '../basiclogin/basiclogin.service';
import { AuthorizationService } from '../metadata/authorizationservice';
import { ActivatedRoute, Router } from '@angular/router';
import { getStorage, APIErrStr, Settings, addChildNodes } from '../utils';
import { ajax, css } from "jquery";
import { UserService } from '../user/user.service';
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
    private router: Router,
    private route: ActivatedRoute,
    private loginService: BasicLoginService,
    private authorizationService: AuthorizationService,
    private userService: UserService
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
      const username = getStorage('username');
      config["username"] = username;
      config["autoSubmitUsername"] = username ? true : false;
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