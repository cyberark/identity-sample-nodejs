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

const authorizationController = require('express').Router();
const { CyberArkIdentityOAuthClient, CyberArkIdentityOIDCClient, getWidgetAssociatedApp, getOIDCAppDetails } = require('@cyberark/identity-js-sdk');
const crypto = require('crypto');

const { AUTH_FLOW } = require('../constants');
const settings = require('../settings.json');
const TENANT_URL = settings.tenantUrl;

authorizationController.get('/pkceMetaData', async (req, res) => {
    try {
        let metadata = {
            code_verifier: "",
            codeChallenge: ""
        };
        
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let index = 0; index < 48; index++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        metadata.code_verifier = text;
        
        const digest = crypto.createHash('sha256').update(text, 'ascii').digest();
        metadata.codeChallenge = Buffer.from(digest).toString('base64url');

        res.send(metadata);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/buildAuthorizeURL', async (req, res) => {
    try {
        let clientObj;
        if(req.body.authFlow === AUTH_FLOW.OAUTH) {
            clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        }else {
            clientObj = new CyberArkIdentityOIDCClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        }
        const authURL = await clientObj.authorizeURL(req.body.redirect_uri, req.body.scope, req.body.responseType, req.body.codeChallenge,req.body.params);
        res.send({authorizeUrl: authURL});
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/tokenSet', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.client_id, req.body.client_secret);
        const tokens = await clientObj.requestToken(req.body.grant_type, req.body.code_verifier, req.body.redirect_uri, req.body.code, req.body.user_name, req.body.password, req.body.scope);
        res.send(tokens);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/refreshToken', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        const tokens = await clientObj.refreshToken(req.body.refresh_token);
        res.send(tokens);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/revokeToken', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        const result = await clientObj.revokeToken(req.body.authResponseAccessToken);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/endSession', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        const result = await clientObj.endSession();
        if(result.success)
        res.redirect(req.body.postLogoutURL);
        else
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/claims/:token', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        const claims = await clientObj.claims(req.params.token);
        res.send(claims);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/oidc/userInfo/:appId/:accessToken', async (req, res)=> {
    try {
        const clientObj = new CyberArkIdentityOIDCClient(TENANT_URL, req.params.appId, req.body.clientId, req.body.clientSecret);
        const userInfo = await clientObj.getUserInfo(req.params.accessToken);
        res.send(userInfo);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/introspect/:accessToken', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        const result = await clientObj.introspect(req.params.accessToken);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/widgetAssociatedApp/:widgetId', async (req, res) => {
    try {
        const result = await getWidgetAssociatedApp(TENANT_URL, req.params.widgetId);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/appDetails/:appKey/:accessToken', async (req, res) => {
    try {
        const result = await getOIDCAppDetails(req.params.appKey, req.params.accessToken);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

module.exports = authorizationController;