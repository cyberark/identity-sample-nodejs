import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateprofileComponent } from './updateprofile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('UpdateprofileComponent', () => {
  let component: UpdateprofileComponent;
  let fixture: ComponentFixture<UpdateprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateprofileComponent ],
      imports: [ReactiveFormsModule, HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
