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
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { CookieService } from 'ngx-cookie-service';
import { setStorage } from '../utils';

@Component({
  selector: 'logic-protocol',
  templateUrl: './loginprotocol.component.html',
  styleUrls: ['./loginprotocol.component.css']
})
export class LoginProtocolComponent implements OnInit {
  loading = false;
  messageType = "error";
  errorMessage = "";
  isFlow1=true;

  constructor(
    private router: Router,
    private userService: UserService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.isFlow1 = this.cookieService.get('flow') === 'flow1';
  }

  onApiOnlyClick() {
    this.router.navigate(['user'])
  }

  onApiOidcClick(){
    // Check if challenge is required to solve
    this.loading = true;
    this.userService.getChallengeID().subscribe(
    {
      next: (d) => {
          this.loading = false;
          if (d.Success && d.Result) {
            setStorage('challengeStateID', d.Result);
            this.router.navigate(['login']);
          } else {
            this.router.navigate(['oidcflow'])
          }
      },
      error: (e) => {
          this.loading = false;
          this.errorMessage = e.error.ErrorMessage;
          console.error(e);
      }
    });
  }
  
  onApiOAuthClick(){
    this.router.navigate(['oauthflow']);
  }

  onM2MClick(){
    this.router.navigate(['m2m']);
  }

  checkMessageType() {
    return this.messageType == "info";
  }

  onAuthLogin() {
    document.cookie = 'flow=flow2';
    setStorage("showSignUpWidget", "false");
    this.router.navigate(['loginWidget'])
  }

  onSignUp() {
    this.router.navigate(['register']);
  }

  onLogin() {
    this.router.navigate(['login']);
  }

}
