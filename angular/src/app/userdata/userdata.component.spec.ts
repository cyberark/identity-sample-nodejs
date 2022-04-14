import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { UserdataComponent } from './userdata.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserdataComponent', () => {
  let component: UserdataComponent;
  let fixture: ComponentFixture<UserdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserdataComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [CookieService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
