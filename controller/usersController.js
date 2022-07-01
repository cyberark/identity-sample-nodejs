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
const usersController = require('express').Router();
const { CyberArkIdentityOAuthClient } = require('@cyberark/identity-js-sdk');
const { tenantUrl: TENANT_URL,
    oauthAppId: OAUTH_APPID,
    oauthServiceUserName: OAUTH_USERNAME,
    oauthServiceUserPassword: OAUTH_PWD,
    oauthScopesSupported: OAUTH_SCOPE,
    loginWidgetId: LOGIN_WIDGET_ID } = require('../settings.json');
const { changeUserPassword, userAttributes, getTotpQr, validateTotp, updateProfile, signUpWithCaptcha, signUpWithBearerToken } = require('@cyberark/identity-js-sdk');
var dateTime = require('node-datetime');
const sqlLite3 = require("sqlite3").verbose();
const { body, validationResult } = require('express-validator');

const db = new sqlLite3.Database("./Database.db", sqlLite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
})

usersController.post('/changePassword', async (req, res) => {
    try {
        const result = await changeUserPassword(TENANT_URL, req.cookies.sampleapp, req.body.oldPassword, req.body.newPassword);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.get('/attributes/:id', async (req, res) => {
    try {
        const result = await userAttributes(TENANT_URL, req.cookies.sampleapp, req.params.id);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.get('/getTotpQr', async (req, res) => {
    try {
        const result = await getTotpQr(TENANT_URL, req.cookies.sampleapp);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/verifyTotp', async (req, res) => {
    try {
        const result = await validateTotp(TENANT_URL, req.cookies.sampleapp, req.body);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.put('/profile', async (req, res) => {
    try {
        const result = await updateProfile(TENANT_URL, req.body, req.cookies.sampleapp);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/signUpWithBearerToken', async (req, res) => {
    try {
        const client = new CyberArkIdentityOAuthClient(TENANT_URL, OAUTH_APPID, OAUTH_USERNAME, OAUTH_PWD);
        const TOKEN = await client.requestToken('client_credentials', null, null, null, OAUTH_USERNAME, OAUTH_PWD, OAUTH_SCOPE.split(' '));
        const result = await signUpWithBearerToken(TENANT_URL, req.body, TOKEN.access_token);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/fundtransfer', 
    body('username').not().isEmpty().trim().escape(),
    body('transferAmount').isNumeric().trim().escape(),
    body('description').trim().escape(),
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let dt = dateTime.create();
        let formatted = dt.format('Y-m-d H:M:S');
        var decoded = jwtDecode(req.cookies.sampleapp);
        const scopes = decoded.scope.split(" ");
        if (scopes.includes("TransferFunds")) {
                db.run(`INSERT INTO FundTransfer( username, transfer_amount, description, tranx_date_time) VALUES(?,?,?,?)`,
                [req.body.username, req.body.transferAmount, req.body.description, formatted]
            );
            res.send({ "success": true });
        } else {
            res.status(401).send({ message: 'You are not authorized.' });
        }
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/signupWithCaptcha', async (req, res) => {
    try {
        const result = await signUpWithCaptcha(TENANT_URL, req.body);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.get('/transactiondata', async (req, res) => {
    try {
        var decoded = jwtDecode(req.cookies.sampleapp);
        const scopes = decoded.scope.split(" ");
        if (scopes.includes("TransferSummaryData")) {
                db.all(`SELECT * FROM FundTransfer WHERE username=?`, [decoded.unique_name], (error, rows) => {
                res.send(rows);
            });
        }
        else {
            res.status(401).send({ message: 'You are not authorized to view the transaction summary.' });
        }
    } catch (error) {
        res.send(error);
    }
});

function jwtDecode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

module.exports = usersController;