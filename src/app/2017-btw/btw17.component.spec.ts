import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundestagsWal2017 } from './btw17.component';

describe('BundestagsWal2017', () => {
  let component: BundestagsWal2017;
  let fixture: ComponentFixture<BundestagsWal2017>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundestagsWal2017 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundestagsWal2017);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
