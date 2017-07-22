import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-party-votes',
  templateUrl: './party-votes.component.html',
  styleUrls: ['./party-votes.component.css']
})
export class PartyVotesComponent implements OnInit {

  @Input()
  results = {"ja":37, "nein":77, "enthaltung":4};

  resultsPercent = {"ja":0.0, "nein":95.6, "enthaltung":4.4};

  
  constructor() { 
    }

  ngOnInit (){
    console.log("inputof partyvotes Component", this.results);
    this.calculatePercents();
  }

  calculatePercents() { 
		let gesamt = (this.results.ja + this.results.nein + this.results.enthaltung);
    this.resultsPercent.ja = this.results.ja / gesamt;
    this.resultsPercent.nein = this.results.nein / gesamt;
    this.resultsPercent.enthaltung = this.results.enthaltung / gesamt;
  }
  
}
