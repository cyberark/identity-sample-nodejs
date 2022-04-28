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
const {tenantUrl: TENANT_URL} = require('../settings.json');
const { changeUserPassword, userAttributes, getTotpQr, validateTotp, updateProfile, signUpWithCaptcha, signUpWithBearerToken } = require('@cyberark/identity-js-sdk');
var dateTime = require('node-datetime');
const sqlLite3 = require("sqlite3").verbose();
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
        const result = await updateProfile(TENANT_URL,req.body,req.cookies.sampleapp);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/signUpWithBearerToken', async (req, res) => {
    try {
        const result = await signUpWithBearerToken(TENANT_URL,req.body,req.cookies.sampleapp);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.post('/fundtransfer', async (req, res) => {
    try {        
        let dt = dateTime.create();
        let formatted = dt.format('Y-m-d H:M:S');
        db.run(`INSERT INTO FundTransfer( username, transfer_amount, description, tranx_date_time) VALUES(?,?,?,?)`,
            [req.body.username, req.body.transferAmount, req.body.description, formatted]
        );
        res.send({"success": true });
        } catch (error) {
        res.send(error);
    }
});

usersController.post('/signupWithCaptcha', async (req, res) => {
    try {
        const result = await signUpWithCaptcha(TENANT_URL,req.body);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

usersController.get('/transactiondata/:username', async (req, res) => {
    try {
        db.all(`SELECT * FROM FundTransfer WHERE username=?`, [req.params.username], (error, rows) => {
            res.send(rows);
        });
    } catch (error) {
        res.send(error);
    }
});

module.exports = usersController;