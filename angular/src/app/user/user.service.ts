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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { User, verifyTotpReq } from '../user/user';
import { map } from 'rxjs/operators';
import {  EndpointsConnector } from '../EndpointsConnector';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient) { }
  getById(id: string) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.UserOpsURL + `${id}`, { headers: head, withCredentials: true });
  }

  register(user: User, clientIP: string) {
    let head = new HttpHeaders().set('Content-Type', 'application/json').set('CLIENT_IP', clientIP);
    return this.http.post<any>(EndpointsConnector.RegisterEndpoint, user, { headers: head, withCredentials: true });
  }

  getClientIP(){
    return this.http.get<any>("https://api.ipify.org/?format=json");
  }

  update(user: {}, id: string) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<any>(EndpointsConnector.UserOpsURL + `${id}`, user, { headers: head, withCredentials: true });
  }

  getSettings() {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.GetSettingsEndpoint, { headers: head, withCredentials: true });
  }

  setSettings(settings: {}) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<any>(EndpointsConnector.UpdateSettingsEndpoint, settings, { headers: head, withCredentials: true });
  }

  getTotpQR() {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.getTotpQR, { headers: head, withCredentials: true });
  }

  changePassword(oldPassword: string, newPassword: string) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(EndpointsConnector.ChangePassword, { oldPassword, newPassword }, { headers: head, withCredentials: true });
  }
    
  verifyTotp(body: verifyTotpReq) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(EndpointsConnector.verifyTotp, body, { headers: head, withCredentials: true });
  }

  getChallengeID() {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.GetChallengeIDEndPoint, { headers: head, withCredentials: true });
  }

  getAttributes(id: string) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.UserAttributes+`${id}`, { headers: head, withCredentials: true });
  }

  updateProfile(body: User) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<any>(EndpointsConnector.UpdateProfile, body, { headers: head, withCredentials: true });
  }

  addFundtransferdata(data: {}) {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(EndpointsConnector.FundTransfer, data, { headers: head, withCredentials: true });
  }

  getTransactiondata() {
    let head = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(EndpointsConnector.TransactionSummary, { headers: head, withCredentials: true });
  }
}
