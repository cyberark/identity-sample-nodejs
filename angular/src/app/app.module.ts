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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './components/header/header.component';
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
import { HttpXsrfInterceptor } from './HttpXsrfInterceptor';
import { M2MComponent } from './m2m/m2m.component';
import { ErrorComponent } from './components/error/error.component';
import { TOTPRegisterComponent } from './totpregister/totpregister.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { UserdataComponent } from './userdata/userdata.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    ErrorComponent,
    RegisterComponent,
    HomeComponent,
    SettingsComponent,
    BasicLoginComponent,
    MFAWidgetComponent,
    LoginWidgetComponent,
    FundTransferComponent,
    LoginProtocolComponent,
    ApionlyComponent,
    Metadata,
    OidcFlowComponent,
    RedirectComponent,
    OAuthFlowComponent,
    M2MComponent,
    TOTPRegisterComponent,
    UserdataComponent,
    ChangepasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RecaptchaModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({headerName: 'X-XSRF-TOKEN', cookieName: 'XSRF-TOKEN'})
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpXsrfInterceptor, multi: true}, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
