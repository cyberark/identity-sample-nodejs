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

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from '../components/header/header.component';
import { FormGroup, NgForm, FormControl, Validators } from '@angular/forms';
import { validateAllFormFields, getStorage, TransactionData, setStorage } from '../utils';
import { HeartBeatService } from '../heartbeat/heartbeat.service';
import { UserService } from 'src/app/user/user.service';

@Component({
    selector: 'app-fundtransfer',
    templateUrl: './fundtransfer.component.html',
    styleUrls: ['./fundtransfer.component.css']
})

export class FundTransferComponent implements OnInit {
    @ViewChild(HeaderComponent, { static: true })
    private isFundTransferSuccessful = false;

    loading = false;
    submitButtonText = "Transfer";
    fundTransferForm: FormGroup;
    messageType = "error";
    errorMessage = "";
    popUpBody = "Your funds were transferred successfully";
    iconSrc = "../../assets/images/green_check.png";

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private heartBeatService: HeartBeatService,
        private cookieService: CookieService,
        private userService: UserService
    ) { }

    ngOnInit() {
        if (!this.cookieService.check('sampleapp')) {
            this.router.navigate(['/home']);
        }

        this.fundTransferForm = new FormGroup({
            'amount': new FormControl(null, Validators.min(1)),
            'remarks': new FormControl(null)
        });

        this.heartBeatService.checkHeartBeat(this);

        this.isFundTransferSuccessful = JSON.parse(this.route.snapshot.queryParamMap.get('isFundTransferSuccessful'));

        if (this.isFundTransferSuccessful) {
            let data = new TransactionData();
            data.username = getStorage('preferred_username');
            data.transferAmount = getStorage('transferAmount');
            data.description = getStorage('description');
            this.userService.addFundtransferdata(data).subscribe({
                next: data => {
                    (<any>$('#errorPopup')).modal();
                },
                error: error => {
                    console.error(error);
                }
            });
        }
    }

    transferFunds(form: NgForm) {
        if (!validateAllFormFields(this.fundTransferForm)) {
            return;
        }
        this.heartBeatService.checkHeartBeat(this);
        this.router.navigate(['mfawidget'], { queryParams: { fromFundTransfer: true } });
        setStorage('transferAmount', this.fundTransferForm.get("amount").value);
        setStorage('description', this.fundTransferForm.get("remarks").value);        
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    hasError(controlName: string, errorName: string) {
        let form = this.fundTransferForm;
        let control = form.controls[controlName];
        return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
    }

    checkMessageType() {
        return this.messageType == "info";
    }

    checkSelectedTab(href: string) {
        if (this.router.url == href) {
            return true;
        }
    }

    showPage(){
        return !this.router.url.includes('isFundTransferSuccessful');
    }

    onDone() {
        this.router.navigateByUrl('/fundtransfer');
    }
}
