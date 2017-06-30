import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyVotesComponent } from './party-votes.component';

describe('PartyVotesComponent', () => {
  let component: PartyVotesComponent;
  let fixture: ComponentFixture<PartyVotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyVotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
