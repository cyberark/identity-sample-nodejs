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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorComponent } from '../components/error/error.component';
import { HeaderComponent } from '../components/header/header.component';
import { Metadata } from './metadata.component';
import { CookieService } from 'ngx-cookie-service';

describe('Metadata', () => {
  let component: Metadata;
  let fixture: ComponentFixture<Metadata>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Metadata, HeaderComponent, ErrorComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    window.history.pushState({},'','')
    fixture = TestBed.createComponent(Metadata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
