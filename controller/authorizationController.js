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

const { AUTH_FLOW, OIDC_REDIRECT_URI, POSSIBLE_STR, USERDATA_URL, OIDC_DEFAULT_SCOPE, REDIRECT_URI } = require('../constants');

const { tenantUrl: TENANT_URL,
        oauthAppId: OAUTH_APPID,
        oauthServiceUserName: OAUTH_USERNAME,
        oauthServiceUserPassword: OAUTH_PWD,
        oauthScopesSupported: OAUTH_SCOPE,
        oidcAppId: OIDC_APP_ID,
        oidcClientId: OIDC_CLIENT_ID,
        oidcScopesSupported: OIDC_SCOPES,
        loginWidgetId: LOGIN_WIDGET_ID } = require('../settings.json');

let pkce, OIDC_APP = {
    AppID: '',
    ClientID: '',
    ClientSecret: '',
    Redirects: '',
    Scopes: []
};


authorizationController.get('/pkceMetaData', async (req, res) => {
    try {
        pkce = generatePKCEMetadata();
        res.send({ Result: pkce });
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/buildAuthorizeURL', async (req, res) => {
    try {
        const isFlow1 = checkFlow1(req);
        let clientObj;
        if (req.body.authFlow === AUTH_FLOW.OAUTH) {
            clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, req.body.appId, req.body.clientId, req.body.clientSecret);
        } else {
            clientObj = new CyberArkIdentityOIDCClient(
                TENANT_URL, 
                isFlow1 ? OIDC_APP_ID : OIDC_APP.AppID, 
                isFlow1 ? OIDC_CLIENT_ID : OIDC_APP.ClientID, 
                OIDC_APP.ClientSecret
            );
        }
        const authURL = await clientObj.authorizeURL(
            req.body.redirect_uri,
            isFlow1 ? OIDC_SCOPES.split(' ') : OIDC_APP.Scopes,
            req.body.responseType.split(' '),
            req.body.codeChallenge,
            req.body.params
        );
        res.send({ Result: { authorizeUrl: authURL } });
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/tokenSet', async (req, res) => {
    try {
        const isFlow1 = checkFlow1(req);
        const appId = isFlow1 ? OIDC_APP_ID : OIDC_APP.AppID;
        const clientId = isFlow1 ? OIDC_CLIENT_ID : OIDC_APP.ClientID;
        const scopes = isFlow1 ? OIDC_SCOPES : OIDC_APP.Scopes;

        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, appId, clientId);
        const tokens = await clientObj.requestToken(req.body.grant_type, req.body.code_verifier, REDIRECT_URI, req.body.code, null, null, scopes);
        res.send({Result: tokens});
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
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, OIDC_APP.AppID, OIDC_APP.ClientID, OIDC_APP.ClientSecret);
        const result = await clientObj.revokeToken(req.body.authResponseAccessToken);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/endSession', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, OIDC_APP.AppID, OIDC_APP.ClientID, OIDC_APP.ClientSecret);
        const result = await clientObj.endSession();
        res.clearCookie('sampleapp');
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/claims', async (req, res) => {
    try {
        const clientObj = new CyberArkIdentityOAuthClient(TENANT_URL, OIDC_APP.AppID, OIDC_APP.ClientID, OIDC_APP.ClientSecret);
        const claims = await clientObj.claims(req.query.token);
        res.send({Result : claims});
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/oidc/userInfo', async (req, res) => {
    try {
        const isFlow1 = checkFlow1(req);
        const clientObj = new CyberArkIdentityOIDCClient(
            TENANT_URL, 
            isFlow1 ? OIDC_APP_ID : OIDC_APP.AppID, 
            isFlow1 ? OIDC_CLIENT_ID : OIDC_APP.ClientID, 
            OIDC_APP.ClientSecret
        );
        const userInfo = await clientObj.getUserInfo(req.query.accessToken);
        res.send({Result: userInfo});
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
        const result = await getOIDCAppDetails(TENANT_URL, req.params.appKey, req.params.accessToken);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.post('/tokenRequestPreview', async (req, res) => {
    try {
        const isFlow1 = checkFlow1(req);
        const appId = isFlow1 ? OIDC_APP_ID : OIDC_APP.AppID;
        let apiBody = {};
        apiBody.payload = req.body;
        apiBody.apiEndPoint = `${TENANT_URL}/OAuth2/Token/${appId}`;
        res.send({ Result: apiBody });
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/RedirectResource', async (req, res) => {
    try {
        const isFlow1 = checkFlow1(req);

        const code = req.query.code;
        const clientObj = new CyberArkIdentityOIDCClient(
            TENANT_URL, 
            isFlow1 ? OIDC_APP_ID : OIDC_APP.AppID, 
            isFlow1 ? OIDC_CLIENT_ID : OIDC_APP.ClientID
        );
        const tokens = await clientObj.requestToken(
            'authorization_code', 
            pkce.code_verifier,
            OIDC_REDIRECT_URI, 
            code, 
            null, 
            null, 
            isFlow1 ? OIDC_SCOPES.split(' ') : OIDC_APP.Scopes
        );
        res.cookie('sampleapp', tokens.access_token);
        res.redirect(302, USERDATA_URL);
    } catch (error) {
        res.send(error);
    }
});

authorizationController.get('/oidcAppScopes', async (req, res) => {
    try {
        const client = new CyberArkIdentityOAuthClient(TENANT_URL, OAUTH_APPID, OAUTH_USERNAME, OAUTH_PWD);
        const TOKEN = await client.requestToken('client_credentials', null, null, null, OAUTH_USERNAME, OAUTH_PWD, OAUTH_SCOPE.split(' '));
        
        const APPKEY = await getWidgetAssociatedApp(TENANT_URL, LOGIN_WIDGET_ID);
        if (APPKEY === 'Invalid widgetId' || APPKEY === 'No application associated with the given widgetId') {
            throw new Error(APPKEY);
        }
        
        const appDetails = await getOIDCAppDetails(TENANT_URL, APPKEY, TOKEN.access_token);
        if (typeof appDetails === 'string') {
            throw new Error(appDetails);
        }
        
        Object.assign(OIDC_APP, appDetails);
        
        OIDC_APP.Scopes = [...OIDC_DEFAULT_SCOPE];
        if (appDetails.Scopes !== undefined) {
            for (const element of appDetails.Scopes) {
                OIDC_APP.Scopes.push(element.Scope);
            }
        }
        res.send(OIDC_APP.Scopes);
    } catch (error) {
        res.send(error);
    }
})

function generatePKCEMetadata() {
    let metadata = {
        code_verifier: "",
        codeChallenge: ""
    };
    let text = "";

    for (let index = 0; index < 48; index++) {
        text += POSSIBLE_STR.charAt(Math.floor(Math.random() * POSSIBLE_STR.length));
    }
    metadata.code_verifier = text;
    const digest = crypto.createHash('sha256').update(text, 'ascii').digest();
    metadata.codeChallenge = Buffer.from(digest).toString('base64url');
    return metadata;
}

function checkFlow1(req) {
    return req.cookies.flow === 'flow1';
}

module.exports = authorizationController;