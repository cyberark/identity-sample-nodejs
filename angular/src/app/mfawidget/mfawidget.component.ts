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
declare let LaunchLoginView: any;
import { ActivatedRoute, Router } from '@angular/router';
import { getStorage, setStorage, APIErrStr, Settings, addChildNodes, setUserDetails } from '../utils';

@Component({
  selector: 'app-mfawidget',
  templateUrl: './mfawidget.component.html',
  styleUrls: ['./mfawidget.component.css']
})
export class MFAWidgetComponent implements OnInit {

  private fromFundTransfer = false;
  isStepUp = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: BasicLoginService,
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    var me = this;
    const settings: Settings = JSON.parse(getStorage('settings'));

    addChildNodes(settings, () => {
      LaunchLoginView({
        "containerSelector": "#cyberark-login",
        "widgetId": settings.mfaWidgetId,
        "apiFqdn": settings.tenantUrl.split("/")[2],
        "username": getStorage('mfaUsername'),
        autoSubmitUsername: true,
        success: function (AuthData) { me.loginSuccessHandler(AuthData, me) },
      });
    })

    this.isStepUp = this.router.url.includes('fromFundTransfer');
  }
  loginSuccessHandler(AuthData, context) {

    this.authorizationService.getPKCEMetadata().subscribe({
      next: pkceMetadata => {
        this.loginService.authorize(AuthData.Auth, getStorage('mfaUsername'), pkceMetadata.Result.codeChallenge).subscribe({
          next: data => {
            this.loginService.completeLoginUser(getStorage("sessionUuid"), data.Result.AuthorizationCode, getStorage('mfaUsername'), pkceMetadata.Result.code_verifier).subscribe({
              next: data => {
                if (data && data.Success == true) {
                  setUserDetails(AuthData);
                  context.fromFundTransfer = JSON.parse(context.route.snapshot.queryParamMap.get('fromFundTransfer'));

                  if (context.fromFundTransfer) {
                    context.router.navigate(['fundtransfer'], { queryParams: { isFundTransferSuccessful: true } });
                  } else {
                    context.router.navigate(['user']);
                  }

                } else {
                  context.router.navigate(['basiclogin']);
                }
              },
              error: error => {
                let errorMessage = APIErrStr;
                if (error.error.Success == false) {
                  errorMessage = error.error.ErrorMessage;
                }
                localStorage.clear();
                setStorage("registerMessageType", "error");
                setStorage("registerMessage", errorMessage);
                console.error(error);
                context.router.navigate(['basiclogin']);
              }
            });
          },
          error: error => {
            let errorMessage = APIErrStr;
            if (error.error.Success == false) {
              errorMessage = error.error.ErrorMessage;
            }
            setStorage("registerMessageType", "error");
            setStorage("registerMessage", errorMessage);
            console.error(error);
            context.router.navigate(['basiclogin']);
          }
        })
      }
    });
  }
}