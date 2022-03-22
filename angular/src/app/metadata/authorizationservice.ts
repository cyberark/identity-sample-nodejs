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
import { AuthorizationMetadataRequest, OIDCTokens, TokenMetadataRequest } from '../utils';
import {  EndpointsConnector } from '../EndpointsConnector';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationService {

    constructor(private http: HttpClient) { }

    getPKCEMetadata(){
        let head = this.getHeaders();
        return this.http.get<any>(EndpointsConnector.PkceMetaDataEndPoint, { headers: head, withCredentials: true })
    }

    buildAuthorizeURL(authorizationMetadataRequest: AuthorizationMetadataRequest){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.BuildAuthorizeURLEndPoint, authorizationMetadataRequest, { headers: head, withCredentials: true })
    }

    getTokenSet(tokenMetadataRequest: TokenMetadataRequest){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.TokenSetEndPoint, tokenMetadataRequest, { headers: head, withCredentials: true })
    }

    getRefreshToken(tokenMetadataRequest: TokenMetadataRequest){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.RefreshTokenEndPoint, tokenMetadataRequest, { headers: head, withCredentials: true })
    }
    getIntrospect(accessToken : string){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.IntrospectEndPoint,null,{ headers:head, withCredentials: true,params: new HttpParams().set("accessToken", accessToken)})
    }
    
    revokeToken(oidcTokens: OIDCTokens){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.RevokeTokenEndPoint, oidcTokens, { headers: head, withCredentials: true })
    }

    getTokenRequestPreview(tokenPreviewReq: TokenMetadataRequest){
        let head = this.getHeaders();
        return this.http.post<any>(EndpointsConnector.TokenRequestPreviewEndPoint, tokenPreviewReq, { headers: head, withCredentials: true })
    }

    getClaims(token : string){
        let head = this.getHeaders();
        return this.http.get<any>(EndpointsConnector.ClaimsEndPoint, { headers: head, withCredentials: true, params: new HttpParams().set("token", token) })
    }

    getUserInfo(accessToken : string){
        let head = this.getHeaders();
        return this.http.get<any>(EndpointsConnector.OIDCUserInfoEndPoint, { headers: head, withCredentials: true, params: new HttpParams().set("accessToken", accessToken) })
    }

    getHeaders(){
        return new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Access-Control-Allow-Methods', 'POST')
            .set('Access-Control-Allow-Methods', 'GET')
            .set('Access-Control-Allow-Origin', '*');
    }

    readCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (const i of ca) {
            let c = i;
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
}
    