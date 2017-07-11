import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-party-votes',
  templateUrl: './party-votes.component.html',
  styleUrls: ['./party-votes.component.css']
})
export class PartyVotesComponent implements OnInit {

  @Input()
  results = {"ja":37, "nein":77, "enthaltung":4};

  resultsPercent = {"ja":37.43, "nein":61.33, "enthaltung":4.44};

  
  constructor() { 
    console.log("inputof partyvotes Component", this.results);
  }

  calculatePercents() { 

  }
  
  ngOnInit() {
  }

}
