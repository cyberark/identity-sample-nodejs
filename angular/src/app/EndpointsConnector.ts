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

import { environment } from '../environments/environment';

let baseUrl = '/api';//`${environment.baseUrl}:${environment.serverPort}/api`;

export const EndpointsConnector = {
    BasicLoginEndPoint : `${baseUrl}/BasicLogin`,
    CompleteLoginEndPoint : `${baseUrl}/CompleteLogin`,
    BeginAuthEndPoint : `${baseUrl}/auth/beginAuth`,
    AdvanceAuthEndPoint : `${baseUrl}/auth/advanceAuth`,
    LogOutEndPoint : `${baseUrl}/auth/logout`,
    PkceMetaDataEndPoint : `${baseUrl}/pkceMetaData`,
    BuildAuthorizeURLEndPoint : `${baseUrl}/buildAuthorizeURL`,
    TokenSetEndPoint : `${baseUrl}/tokenSet`,
    RefreshTokenEndPoint : `${baseUrl}/refreshToken`,
    RevokeTokenEndPoint : `${baseUrl}/revokeToken`,
    IntrospectEndPoint : `${baseUrl}/introspect`,
    TokenRequestPreviewEndPoint : `${baseUrl}/tokenRequestPreview`,
    ClaimsEndPoint : `${baseUrl}/claims`,
    OIDCUserInfoEndPoint : `${baseUrl}/oidc/userInfo`,
    GetSettingsEndpoint: `${baseUrl}/settings/`,
    GetUISettingsEndpoint: `${baseUrl}/settings`,
    UpdateSettingsEndpoint: `${baseUrl}/settings/`,
    RegisterEndpoint: `${baseUrl}/user/register`,
    UserOpsURL: `${baseUrl}/userops/`,
    getTotpQR: `${baseUrl}/users/getTotpQr`,
    verifyTotp: `${baseUrl}/users/verifyTotp`,
    SetAuthCookie: `${baseUrl}/setAuthCookie`,
    GetChallengeIDEndPoint : `${baseUrl}/userops/challengeID`,
    BeginChallengeEndPoint : `${baseUrl}/auth/beginChallenge`,
    HeartBeat: `${baseUrl}/HeartBeat`,
    EndSessionEndPoint : `${baseUrl}/endSession`,
    ChangePassword: `${baseUrl}/users/changePassword`,
    UpdateProfile: `${baseUrl}/users/profile`,
    UserAttributes: `${baseUrl}/users/attributes/`,
    FundTransfer: `${baseUrl}/users/fundtransfer`,
  }