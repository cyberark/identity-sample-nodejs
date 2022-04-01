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
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cookieParser = require('cookie-parser');

const authController = require('./controller/authController');
const usersController = require('./controller/usersController');
const authorizationController = require('./controller/authorizationController');
const settingsController = require('./controller/settingsController');

const PORT = 2200;
const API_VER = '/api';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(cookieParser());

app.use(`${API_VER}/auth`, authController);
app.use(`${API_VER}/users`, usersController);
app.use(`${API_VER}`, authorizationController);
app.use(`${API_VER}`, settingsController);

app.listen(PORT, () => {
    console.log('listening on port ', PORT);
})