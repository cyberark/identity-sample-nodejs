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

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { UserService } from 'src/app/user/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthorizationFlow, getStorage, revokeToken, setStorage } from '../../utils';
import { AuthorizationService } from 'src/app/metadata/authorizationservice';

const imgSrc = "../../../assets/images/acme_logo.png";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() isLoginVisible: boolean = false;
  @Input() isSignUpVisible: boolean = false;
  @Input() isHomeVisible: boolean = false;
  @Input() isSettingsVisible: boolean = false;
  @Input() isLogoutVisible: boolean = false;
  @Input() isTOTPVisible: boolean = false;
  @Input() isUserProfileVisible: boolean = false;

  page = "home";
  name = "";
  signOutMenu = false;
  homeMenu = false;
  loading = false;
  imageSource: string;

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authorizationService: AuthorizationService
  ) { }

  ngOnInit() {
    if (getStorage("settings"))
      this.imageSource = JSON.parse(getStorage("settings")).appImage;

    this.loading = true;
    this.userService.getUISettings().subscribe({
      next: data => {
        this.loading = false;
        if (data.Result.appImage) {
          this.imageSource = data.Result.appImage;
          setStorage("isSettingsLocked", (data.Result.tenantUrl) != "" ? "true" : "false");
          setStorage("settings", JSON.stringify(data.Result));
        } else {
          console.log("Incorrect data response");
        }
      },
      error: error => {
        this.loading = false;
        console.error(error);
      }
    });

    if (getStorage("displayName") !== null && getStorage("displayName") !== "") {
      this.name = getStorage("displayName");
    } else if (getStorage("username") !== null) {
      this.name = getStorage("username");
    }

    switch (this.router.url) {
      case "/":
      case "/login":
      case "/register":
        this.page = "home";
        break;
      case "/fundtransfer":
      case "/fundtransfer?isFundTransferSuccessful=true":
      case "/mfawidget?fromFundTransfer=true":
      case "/loginWidget?fromFundTransfer=true":
      case "/user":
      case "/custom":
      case "/totpregister":
        this.page = "user";
        break;
    }
  }

  getTrimmedImageData(appImage) {
    return appImage.substr(1, appImage.length - 2);
  }

  checkPage(page: string) {
    return this.page == page;
  }

  checkFlow2_Flow3UserPage() {
    return (document.cookie.includes('flow2') || document.cookie.includes('flow3')) && this.page === 'user';
  }


  checkSelectedTab(href: string) {
    if (this.router.url == href) {
      return true;
    }
  }

  notRegister() {
    return !this.checkSelectedTab('/register');
  }

  onTabClick(href: string) {
    if (href === 'login' && document.cookie.includes('flow3')) href = 'basiclogin';
    else if (href === 'settings' && getStorage("isSettingsLocked") === "true") {
      this.router.navigateByUrl('/login', { state: { gotoSettingsAfterLogin: true } })
      return false;
    }

    this.router.navigate([href]);
    return false;
  }

  toggleHomeMenu() {
    return this.homeMenu = !this.homeMenu;
  }

  logout() {
    if (getStorage('oidcTokens') && getStorage('authFlow') === AuthorizationFlow.OIDC) {
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
}