import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../metadata/authorizationservice';
import { CookieService } from 'ngx-cookie-service';
import { setStorage } from '../utils';

@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.component.html',
  styleUrls: ['./userdata.component.css']
})
export class UserdataComponent implements OnInit {
  public decoded: any = {};
 
  constructor( 
    private router: Router,
    private authorizationService: AuthorizationService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    const token = this.cookieService.get('sampleapp');
    if (token != null) {
      this.authorizationService.getUserInfo(token).subscribe({
        next: data => {
          this.decoded = data;
          setStorage('preferred_username', data.preferred_username);
        },
        error: error => {
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
 
}
