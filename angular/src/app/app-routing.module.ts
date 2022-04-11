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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';
import { BasicLoginComponent } from './basiclogin/basiclogin.component'
import { MFAWidgetComponent } from './mfawidget/mfawidget.component';
import { LoginWidgetComponent } from './loginWidget/loginWidget.component';
import { FundTransferComponent } from './fundtransfer/fundtransfer.component';
import { LoginProtocolComponent } from './loginprotocols/loginprotocol.component';
import { ApionlyComponent } from './apionly/apionly.component';
import { Metadata } from './metadata/metadata.component';
import { OidcFlowComponent } from './oidcflow/oidcflow.component';
import { RedirectComponent } from './redirect/redirect.component';
import { OAuthFlowComponent } from './oauthflow/oauthflow.component';
import { M2MComponent } from './m2m/m2m.component';
import { TOTPRegisterComponent } from './totpregister/totpregister.component';
import { IntroComponent } from './intro/intro.component';
import { UserdataComponent } from './userdata/userdata.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { UpdateprofileComponent } from './updateprofile/updateprofile.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: '', component: IntroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user', component: RegisterComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'basiclogin', component: BasicLoginComponent },
  { path: 'mfawidget', component: MFAWidgetComponent },
  { path: 'loginWidget', component: LoginWidgetComponent },
  { path: 'fundtransfer', component: FundTransferComponent },
  { path: 'loginprotocols', component: LoginProtocolComponent },
  { path: 'apionly', component: ApionlyComponent },
  { path: 'metadata', component: Metadata },
  { path: 'oidcflow', component: OidcFlowComponent },
  { path: 'RedirectResource', component: RedirectComponent },
  { path: 'oauthflow', component: OAuthFlowComponent },
  { path: 'm2m', component: M2MComponent },
  { path: 'totpregister', component: TOTPRegisterComponent },
  { path: 'userdata', component: UserdataComponent},
  { path: 'changepassword', component: ChangepasswordComponent }, 
  { path: 'updateprofile', component: UpdateprofileComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
