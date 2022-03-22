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
import { interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {  EndpointsConnector } from '../EndpointsConnector';
import { getStorage, Settings } from '../utils';

@Injectable({
  providedIn: 'root'
})

export class BasicLoginService {

  constructor(private http: HttpClient) { }

  basicLoginUser(Username:string, Password:string){

    let head = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Access-Control-Allow-Methods', 'POST')
    .set('Access-Control-Allow-Origin', '*');
    return this.http.post<any>(EndpointsConnector.BasicLoginEndPoint, { Username, Password }, { headers: head, withCredentials: true })
      .pipe(map(result => {
        return result;
      }));
  }

  completeLoginUser(sessionUuid : string, authorizationCode : string, clientId : string, codeVerifier : string){
    let head = this.setHeaders();
    return this.http.post<any>(EndpointsConnector.CompleteLoginEndPoint, { sessionUuid, authorizationCode, clientId, codeVerifier }, { headers: head, withCredentials: true })
      .pipe(map(result => {
        return result;
      }));
  }

  private setHeaders() {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Access-Control-Allow-Methods', 'POST')
      .set('Access-Control-Allow-Origin', '*');
  }

  authorize(authentication_token : string, clientId : string, codeChallenge : string){

    const settings: Settings = JSON.parse(getStorage('settings'));

    let head = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + authentication_token);

    let url = `https://${settings.tenantUrl.split("/")[2]}/oauth2/authorize/${settings.oauthAppId}?scope=${settings.oauthScopesSupported}&client_id=${clientId}&code_challenge=${codeChallenge}&code_challenge_method=S256&response_type=code&redirect_uri=${environment.baseUrl}:${environment.serverPort}/api/RedirectResource`;

    return this.http.get<any>(url, { headers: head, withCredentials: true});
  }

  setAuthCookie(sessionUuid : string, authorizationCode : string, clientId : string, codeVerifier : string){
    const head = this.setHeaders();
    return this.http.post<any>(EndpointsConnector.SetAuthCookie, { sessionUuid, authorizationCode, clientId, codeVerifier }, { headers: head, withCredentials: true})
      .pipe(map(res => {
        return res;
      }));
  }
}
