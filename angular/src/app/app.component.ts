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

import { Component } from '@angular/core';
import { getStorage, setStorage } from './utils';
import { UserService } from 'src/app/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
  ],
})
export class AppComponent {
  title = 'CyberArk Identity API Demo';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {    
    let flow = "flow=flow1";
    if (document.cookie.includes('flow2')) {
      flow = 'flow=flow2';
    }
    else if (document.cookie.includes('flow3')) {
      flow = 'flow=flow3';
    }
    document.cookie = flow;

    this.userService.getUISettings().subscribe({
      next: data => {
        if (!data.Result.tenantUrl) {
          this.router.navigate(["settings"]);
        } else {
          setStorage("isSettingsLocked", (data.Result.tenantUrl) != "" ? "true" : "false");
          setStorage("settings", JSON.stringify(data.Result));
        }
      }, 
      error: error => {
        console.error(error);
      }
    });
  }
}
