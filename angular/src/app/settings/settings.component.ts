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
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import Tagify from '@yaireo/tagify';
import { defaultErrStr, getStorage, setStorage, Settings, validateAllFormFields } from '../utils';
import { UserService } from '../user/user.service';
declare var $:any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
  @ViewChild('divToScroll', { static: true }) divToScroll: ElementRef;

  settingsForm: FormGroup;
  messageType = "info";
  errorMessage = "";
  loading = false;
  customData: any;
  showModal = false;
  selectedFile: File;
  imagePreview: SafeResourceUrl;
  settings: Settings;
  hasAppLogoError = false;
  isCaptchaEnabledInSettings = false;
  isCaptchaEnabled = false;
  popUpBody = defaultErrStr;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();
    this.settingsForm = this.formBuilder.group({
      "appImage": ['',],
      "tenantUrl": ['', Validators.compose([
        Validators.required,
        Validators.maxLength(80),
        Validators.pattern('^((https)|(HTTPS))://.*\\..+')
      ])],
      "roleName": ['', Validators.required],
      "loginWidgetId": ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$')
      ])],
      "mfaWidgetId": ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$')
      ])],
      "oauthAppId": ['', Validators.required],
      "oauthServiceUserName": ['', Validators.required],
      "oauthServiceUserPassword": ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64)
      ])],
      "oauthScopesSupported": ['', Validators.required],
      "oidcAppId": ['', Validators.required],
      "oidcClientId": ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$')
      ])], 
      "oidcClientPassword": ['', Validators.required],
      "oidcScopesSupported": ['', Validators.required],
      "sessionTimeout": ['', Validators.compose([
        Validators.required,
        Validators.max(500)
      ])],
      "mobileTimeout": ['', Validators.compose([
        Validators.required,
        Validators.max(500)
      ])],
      "isCaptchaEnabledInSettings": ['',],
      "siteKey": ['',Validators.compose([
            this.requiredIfValidator(() => this.settingsForm.get('isCaptchaEnabledInSettings').value) 
        ])]
    });

    document.querySelectorAll('input[name=basic]').forEach(ele => {
      new Tagify(ele, {
        originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(' '),
        delimiters: " "
      });
    });

    this.loading = true;
    this.userService.getSettings().subscribe({
      next: data => {
        this.loading = false;
        this.settings = data.Result;
        if(this.settings && this.settings.appImage){
          this.imagePreview = this.settings.appImage;
          this.settings.appImage = "";
          this.settingsForm.setValue(this.settings);
          if(this.settings.isCaptchaEnabledInSettings) 
            this.isCaptchaEnabled = true;
          else
            this.isCaptchaEnabled = false;
        }
      }, 
      error: error => {
        this.loading = false;
        this.popUpBody = error.error.ErrorMessage;
        (<any>$('#errorPopup')).modal();
        console.error(error);
      }
    });
  }

  onCheckCaptchaEnabled(isChecked: boolean) {
      this.isCaptchaEnabled = isChecked;
      if(isChecked)
        this.settingsForm.controls.siteKey.setValue("");
  }
  
  requiredIfValidator(predicate: { (): any; (): any; }) {
    return ((formControl: AbstractControl) => {
      if (!formControl.parent) {
        return null;
      }
      if (predicate()) {
        return Validators.required(formControl); 
      }
      return null;
    })
  }

  onOIDCScopeChange(val: string) {
    this.settingsForm.controls.oidcScopesSupported.setValue(val);
  }

  onOAuthScopeChange(val: string) {
    this.settingsForm.controls.oauthScopesSupported.setValue(val);
  }

  checkMessageType(){
    return this.messageType === "info";
  }

  onImageUpload(event) {
    this.selectedFile = event.target.files[0];
    const fileName = this.selectedFile.name;
    if(this.selectedFile.size > 1000000 || this.checkImageFileExt(fileName.substring(fileName.lastIndexOf('.')+1, fileName.length))){
      this.hasAppLogoError = true;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result.toString();
    };
    reader.readAsDataURL(this.selectedFile);
  }

  checkImageFileExt(extension: string){
    return !["png","jpg","gif","ico","bmp"].includes(extension);
  }

  onSave(){
    if(!validateAllFormFields(this.settingsForm)) return;

    this.loading = true;
    let data = this.settingsForm.value;
    data.appImage = this.imagePreview;
    this.userService.setSettings(data).subscribe({
      next: d => {
        this.loading = false;
        this.updateUISettingsData(data);
        this.messageType = "info";
        this.errorMessage = d.Result;
        this.divToScroll.nativeElement.scrollTop = 0;
      },
      error: error => {
        console.error(error);
        this.loading = false;
        this.divToScroll.nativeElement.scrollTop = 0;
        this.popUpBody = error.error.ErrorMessage;
        (<any>$('#errorPopup')).modal();
      }
    })
  }

  onCancel(){
    setStorage("loginUserId", null);
    this.router.navigate(['home']);
  }

  onRetry() {
    this.router.navigateByUrl('/login', { state: {gotoSettingsAfterLogin: true}});
  }

  updateUISettingsData(data: {}) {
    setStorage("settings", JSON.stringify(data));
  }

  public hasError = (controlName: string, errorName: string) => {
    let form = this.settingsForm;
    let control = form.controls[controlName];
    return ((control.invalid && (control.dirty || control.touched)) && control.hasError(errorName));
  }
}