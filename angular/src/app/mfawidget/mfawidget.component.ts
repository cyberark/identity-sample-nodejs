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
declare let LaunchLoginView: any;
import { Router } from '@angular/router';
import { getStorage, Settings, addChildNodes } from '../utils';

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
  ) { }

  ngOnInit() {
    var me = this;
    const settings: Settings = JSON.parse(getStorage('settings'));

    addChildNodes(settings, () => {
      LaunchLoginView({
        "containerSelector": "#cyberark-login",
        "widgetId": settings.mfaWidgetId,
        "apiFqdn": settings.tenantUrl.split("/")[2],
        "username": getStorage('preferred_username'),
        autoSubmitUsername: true,
        success: function (AuthData) { me.loginSuccessHandler(AuthData, me) },
      });
    })

    this.isStepUp = this.router.url.includes('fromFundTransfer');
  }
  loginSuccessHandler(AuthData, context) {
    if (context.isStepUp) {
      context.router.navigate(['fundtransfer'], { queryParams: { isFundTransferSuccessful: true }});
    } else {
      context.router.navigate(['userdata']);
    }
  }
}