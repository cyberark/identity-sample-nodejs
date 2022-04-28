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

import { FormControl, FormGroup } from "@angular/forms";

export const authURLStr = "Authorize URL";
export const defaultErrStr = "Oops, something went wrong. Please try again later.";
export const APIErrStr = "Oops, Something went wrong. Verify App configuration and user permissions.";
export const defaultTitle = "Error";
export const defaultLabel = "Retry";
export enum AuthorizationFlow {
  OAUTH = "OAUTH",
  OIDC = "OIDC"
}

export enum OAuthFlow {
  auth = "auth",
  implicit = "implicit",
  authPKCE = "authPKCE",
  clientCreds = "clientCreds",
  resourceOwner = "resourceOwner",
}

export enum GrantType {
  authorization_code = "authorization_code",
  client_credentials = "client_credentials",
  password = "password",
  refresh_token = "refresh_token"
}

export enum OidcFlow {
  auth = "auth",
  implicit = "implicit",
  hybrid = "hybrid"
}

export class PKCEMetaData {
  code_verifier: string;
  codeChallenge: string;
}

export class Settings {
  appImage: string;
  tenantUrl: string;
  roleName: string;
  mfaWidgetId: string;
  loginWidgetId: string;
  oauthAppId: string;
  oauthServiceUserName: string;
  oauthServiceUserPassword: string;
  oauthScopesSupported: string;
  oidcAppId: string;
  oidcClientId: string;
  oidcClientPassword: string
  oidcScopesSupported: string;
  siteKey: string;
  isCaptchaEnabledInSettings: boolean;

}

export class AuthorizationMetadataRequest extends PKCEMetaData {
  authFlow: AuthorizationFlow = AuthorizationFlow.OIDC;
  clientId: string;
  clientSecret: string;
  responseType: string = "code";
}

export class TokenMetadataRequest extends PKCEMetaData {
  authFlow: AuthorizationFlow = AuthorizationFlow.OIDC;
  code: string;
  grant_type: GrantType = GrantType.authorization_code;
  user_name: string;
  password: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export class OIDCTokens {
  authResponseIDToken: string;
  authResponseAccessToken: string;
  tokenResponseAccessToken: string;
}
export class TransactionData {
  username: string;
  transferAmount: string;
  description: string;
}

/**
 * Fetches the authorization URL
 * @param authRequest AuthorizationMetadataRequest
 * @param context any - The component class context
 */
export const buildAuthorizeURL = (authRequest: AuthorizationMetadataRequest, context: any) => {
  context.authorizationService.buildAuthorizeURL(authRequest).subscribe({
    next: data => {
      context.loading = false;
      context.authURL = data.Result.authorizeUrl;
      context.authorizeBtn.nativeElement.disabled = false;
    },
    error: error => {
      console.error(error);
      context.loading = false;
    }
  });
}

/**
 * Revoke Access Token, ID Token using OIDCClient
 * Revoking ID Token as the lifetime of ID Token is equivalent to Access Token
 * @param accessToken Access Token to Revoke
 * @param context any - The component class context
 */
export const revokeToken = (oidcTokens: OIDCTokens, context: any) => {
  context.authorizationService.revokeToken(oidcTokens).subscribe({
    next: data => {
      context.loading = false;
    },
    error: error => {
      console.error(error);
      context.loading = false;
    }
  });
}

/**
 * stores the key value pair in local storage where value is base64 encoded
 * @param key string key
 * @param val string value
 */
export const setStorage = (key: string, val: string) => {
  localStorage.setItem(key, btoa(val));
}

/**
 * gets the value from local storage based on key and decodes it
 * @param key string key
 * @returns base64 decoded string value
 */
export const getStorage = (key: string) => {
  const val = localStorage.getItem(key);
  if (val) return atob(val);
  else return val;
}

/**
 * Validates are the form fields in the given form group
 * @param form form group instance to be validated
 * @returns true if all fields are valid otherwise false
 */
export const validateAllFormFields = (form: FormGroup): boolean => {
  let valid = true;
  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);
    if (control instanceof FormControl) {
      control.markAsTouched({ onlySelf: true });
      if (control.invalid) {
        valid = false;
      }
    } else if (control instanceof FormGroup) {
      validateAllFormFields(control);
    }
  });
  return valid;
}

/**
 * Adds login.js and login.css to the dom
 * @param settings settings object from settings pages
 * @param callback login.js on laod callback
 */
export const addChildNodes = (settings: Settings, callback: (this: GlobalEventHandlers, ev: Event) => any) => {
  let node = document.createElement('script');
  node.src = settings.tenantUrl + "/vfslow/lib/uibuild/standalonelogin/login.js";
  node.type = 'text/javascript';
  node.onload = callback;
  document.getElementsByTagName('head')[0].appendChild(node);

  let linkNode = document.createElement('link');
  linkNode.href = settings.tenantUrl + "/vfslow/lib/uibuild/standalonelogin/css/login.css";
  linkNode.type = 'text/css';
  linkNode.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(linkNode);
}

/**
 * Returns App image string from settings
 */
export const getAppImgStr = () => {
  let imgStr = '';
  const settings: Settings = JSON.parse(getStorage("settings"));
  if (settings && settings.appImage) {
    imgStr = settings.appImage;
  }
  return imgStr;
}

export const getSiteKey = () => {
  let siteKey = '';
  const settings: Settings = JSON.parse(getStorage("settings"));
  if (settings && settings.siteKey) {
    siteKey = settings.siteKey;
  }
  return siteKey;
}

export const getCaptchaStatus = () => {
  const settings: Settings = JSON.parse(getStorage("settings"));
  if (settings && settings.isCaptchaEnabledInSettings) {
    return settings.isCaptchaEnabledInSettings;
  }
  return false;
}

export const setUserDetails = (result: any) => {
  setStorage("userId", result.UserId);
  setStorage("username", result.User);
  setStorage("displayName", result.DisplayName);
  setStorage("tenant", result.PodFqdn);
  setStorage("customerId", result.CustomerID);
  setStorage("custom", result.Custom);
  setStorage("loginUserId", result.UserId);
}
