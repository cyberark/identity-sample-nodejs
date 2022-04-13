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

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user/user.service';
import { HeartBeatService } from '../heartbeat/heartbeat.service';
import { validateAllFormFields } from '../utils';

@Component({
    selector: 'totpregister',
    templateUrl: './totpregister.component.html'
})

export class TOTPRegisterComponent implements OnInit {
    @ViewChild('divToScroll', { static: true }) divToScroll: ElementRef;

    qrSrc: string = "";
    loading = false;
    verifyCodeForm: FormGroup;
    profileUuid: string = "";
    errorMessage: string = "";
    hasErrorOccurred: boolean = false;

    constructor(
        private userService: UserService,
        private heartBeatService: HeartBeatService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.verifyCodeForm = this.formBuilder.group({
            "otpCode": ['', Validators.required]
        });
        this.loading = true;
        this.heartBeatService.checkHeartBeat(this);
        this.userService.getTotpQR().subscribe(
            {
                next: (d) => {
                    this.loading = false;
                    if (d.success) {
                        this.qrSrc = d.Result.UrlQr;
                        this.profileUuid = d.Result.ProfileUuid;
                    } else {
                        this.hasErrorOccurred = true;
                        this.errorMessage = d.Message || d.message;
                        this.showError(this, { error: d });
                    }
                },
                error: (e) => {
                    this.loading = false;
                    this.hasErrorOccurred = true;
                    this.errorMessage = e.error.ErrorMessage;
                    this.showError(this, e);
                }
            }
        )
    }

    verify(formData: any) {
        if (!validateAllFormFields(this.verifyCodeForm)) return;

        let data = formData;
        data.uuid = this.profileUuid;
        this.loading = true;
        this.userService.verifyTotp(data).subscribe({
            next: d => {
                this.loading = false;
                if (d.success) {
                    this.hasErrorOccurred = false;
                    this.errorMessage = "OATH OTP registration successful";
                }
                else {
                    this.hasErrorOccurred = true;
                    this.errorMessage = d.Message;
                }
                this.divToScroll.nativeElement.scrollTop = 0;
            },
            error: err => {
                this.loading = false;
                this.hasErrorOccurred = true;
                this.errorMessage = err.error.ErrorMessage;
            }
        })
    }

    checkMessageType() {
        return !this.hasErrorOccurred;
    }

    public hasError = (controlName: string, errorName: string) => {
        let form = this.verifyCodeForm;
        let control = form.controls[controlName];
        return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
    }

    showError(context, error) {
        context.errorMessage = error.error.ErrorMessage || error.error.error_description || error.error.message;
        if (this.errorMessage === 'Request failed with status code 401') {
            context.errorMessage = 'You do not have access to this content. Please contact your system administrator for assistance.'
        }
    }
}