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

//TODO: remove tenant url and tenant id - read from settings.json
const TENANT_URL = 'YOUR_TENANT_URL';
const TENANT_ID = 'YOUR_TENANT_ID';
const AUTH_FLOW = {
    OAUTH: "OAUTH",
    OIDC: "OIDC"
}
const SYS_ADMIN_ROLE = 'System Administrator';
const OIDC_REDIRECT_URI = 'http://localhost:2200/api/RedirectResource';
const POSSIBLE_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const USERDATA_URL = "http://localhost:4200/userdata";
const OIDC_DEFAULT_SCOPE = ['openid', 'email', 'profile', 'address', 'phone'];
const REDIRECT_URI = "http://localhost:4200/RedirectResource";

module.exports = {
    TENANT_URL,
    TENANT_ID,
    AUTH_FLOW,
    SYS_ADMIN_ROLE,
    OIDC_REDIRECT_URI,
    POSSIBLE_STR,
    USERDATA_URL,
    OIDC_DEFAULT_SCOPE,
    REDIRECT_URI
}