import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-party-votes',
  templateUrl: './party-votes.component.html',
  styleUrls: ['./party-votes.component.css']
})
export class PartyVotesComponent implements OnInit {

  @Input()
  test = {"ja":37, "nein":"77"};

  @Input()
  testtext = "bambalamui9";

  
  constructor() { 
    console.log("inputof partyvotes Component", this.test);
  }

  ngOnInit() {
  }

}
