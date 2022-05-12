import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { APIErrStr, defaultTitle, defaultLabel } from '../utils';
import { UserService } from 'src/app/user/user.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html',
  styleUrls: ['./transaction-summary.component.css']
})
export class TransactionSummaryComponent implements OnInit {

  public tranx_data: any = [];
  record = true;
  popUpMessage: string = APIErrStr;
  popUptitle: string = defaultTitle;
  popUpLabel: string = defaultLabel;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const token = this.cookieService.get('sampleapp');
    if (token != null && token) {
      this.userService.getTransactiondata().subscribe({
        next: data => {
          if (data.length != 0) {
            this.tranx_data = data;
          } else {
            this.record = false;
          }
        },
        error: error => {
          this.showInfo(this, error);
          console.error(error);
        }
      })
    }
  }

  dataKeys(object: Object) { return Object.keys(object); }

  /**
  * Copies string content clipboard
  * @param form string to copy
  */
  copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
  }

  showInfo(context, info) {
    context.popUpMessage = info.error.ErrorMessage || info.error.error_description || info.error.Message || info.error.message;
    context.popUpLabel = "OK";
    
    (<any>$('#errorPopup')).modal();
  }

  onOk(): void {
    this.router.navigate(['userdata']);
  }


}
