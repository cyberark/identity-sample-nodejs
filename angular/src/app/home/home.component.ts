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
import { getStorage, setStorage } from '../utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    if (getStorage("userId") !== null) {
      this.router.navigate(['user']);
    }
  }

  onFlow1Login() {
    document.cookie = 'flow=flow1';
    this.router.navigate(['login'])
  }

  onFlow1Signup() {
    document.cookie = 'flow=flow1';
    this.router.navigate(['register'])
  }

  onFlow2Login() {
    document.cookie = 'flow=flow2';
    setStorage("showSignUpWidget", "false");
    this.router.navigate(['loginWidget'])
  }

  onFlow2Signup() {
    document.cookie = 'flow=flow2';
    setStorage("showSignUpWidget", "true");
    this.router.navigate(['loginWidget'])
  }

  onFlow3Login() {
    document.cookie = 'flow=flow3';
    this.router.navigate(['basiclogin'])
  }

  onFlow3Signup() {
    document.cookie = 'flow=flow3';
    this.router.navigate(['register'])
  }

  onGetStarted() {
    this.router.navigate(['loginprotocols'])
  }

}
