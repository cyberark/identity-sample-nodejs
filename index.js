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

const express = require('express');
const { startAuthentication, answerChallenge } = require('@cyberark/identity-js-sdk');

const PORT = 2200;
const API_VER = '/api';
const TENANT_URL = 'YOUR_TENANT_URL';
const TENANT_ID = 'YOUR_TENANT_ID';

const app = express();

app.use(express.json());

app.post(`${API_VER}/auth/beginAuth`, async (req, res) => {
    try {
        const result = await startAuthentication(TENANT_URL, TENANT_ID, req.body.username);
        res.send(result);        
    } catch (error) {
        res.send(error);
    }
});

app.post(`${API_VER}/auth/advanceAuth`, async (req, res) => {
    try {
        const result = await answerChallenge(req.body.mechanismId, req.body.answer);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

app.listen(PORT, () => {
    console.log('listening on port ', PORT);
})