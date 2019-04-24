import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EuropaWal2019 } from './eu19.component';

describe('EuropaWal2019', () => {
  let component: EuropaWal2019;
  let fixture: ComponentFixture<EuropaWal2019>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EuropaWal2019 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EuropaWal2019);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
