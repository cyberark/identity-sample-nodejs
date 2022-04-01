import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangepasswordComponent } from './changepassword.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('ChangepasswordComponent', () => {
  let component: ChangepasswordComponent;
  let fixture: ComponentFixture<ChangepasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangepasswordComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
