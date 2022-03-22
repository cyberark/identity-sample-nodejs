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

const settingsController = require('express').Router();
const { getUserRolesAndRights } = require('@cyberark/identity-js-sdk');
const fs = require('fs');
const settings = require('../settings.json');
const { SYS_ADMIN_ROLE } = require('../constants');

const isSystemAdmin = async (uuid, bearerToken) => {
    try {
        const result = await getUserRolesAndRights(settings.tenantUrl, uuid, bearerToken);
        result.Result.Results.forEach(item => {
            if (item.Row.RoleName === SYS_ADMIN_ROLE)
                return true;
        })
        return false;
    } catch (error) {
        return false;
    }
}

settingsController.put('/settings/:uuid', async (req, res) => {
    try {
        await isSysAdminCheck(res, req);
        fs.writeFileSync('settings.json', JSON.stringify(req.body));
        res.send({Result: 'Settings updated successfully'});
    } catch (error) {
        res.status(500).send({Success: false, ErrorMessage: error.message});
    }
}).get('/settings/:uuid', async (req, res) => {
    try {
        await isSysAdminCheck(res, req);
        res.send({Result: settings});
    } catch (error) {
        res.status(500).send({Success: false, ErrorMessage: error.message});
    }
});

settingsController.get('/settings', async (req, res) => {
    try {
        res.send({
            Result: {
                appImage: settings.appImage,
                tenantUrl: settings.tenantUrl,
                loginWidgetId: settings.loginWidgetId,
                mfaWidgetId: settings.mfaWidgetId,
                oauthAppId: settings.oauthAppId,
                oauthScopesSupported: settings.oauthScopesSupported,
                isCaptchaEnabledInSettings: settings.isCaptchaEnabledInSettings,
                siteKey: settings.siteKey
            }
        });
    } catch (error) {
        res.status(500).send({Success: false, ErrorMessage: 'Failed to fetch UI settings.'});
    }
});

module.exports = settingsController;

async function isSysAdminCheck(res, req) {
    const isSettingsLocked = settings.tenantUrl !== "";
    if (isSettingsLocked) {
        if (!res.locals.token) {
            throw new Error("Please login to access settings.");
        }
        const isSysAdmin = await isSystemAdmin(req.params.uuid, res.locals.token);
        if (!isSysAdmin) {
            throw new Error("You are not authorized to access settings. You need to be a system administrator in CyberArk Identity.");
        }
    }
}
