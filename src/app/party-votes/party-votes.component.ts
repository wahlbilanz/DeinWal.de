import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { QuizComponent } from '../quiz/quiz.component';
//declare var d3: any;

@Component({
  selector: 'app-party-votes',
  templateUrl: './party-votes.component.html',
  styleUrls: ['./party-votes.component.css']
})
export class PartyVotesComponent implements OnInit {

  @Input()
  questions: any;
  
  results = {'ja': 37, 'nein': 77, 'enthaltung': 4};

  @Input()
  choice = -1;

  @Input()
  qid = 'unknown';

  @Input()
  party = 'unknown';

  resultsPercent = {'ja': 0.0, 'nein': 95.6, 'enthaltung': 4.4};
  
  score = '-';
  nAbgeordnete = 0;
  
  id = 'unknown';

  constructor(private quiz: QuizComponent) {
  }

  ngOnInit () {
    this.id = this.qid + '-' + this.party;
    //console.log (this.questions.fragen[this.qid]);
    //console.log (this.party);
    this.results = this.questions.fragen[this.qid].results[this.party];
    
    
    this.nAbgeordnete = (this.results.ja + this.results.nein + this.results.enthaltung);
    this.calculatePercents();
    this.calcScore ();
  }
  
  calculatePercents() {
    this.resultsPercent.ja = this.results.ja / this.nAbgeordnete;
    this.resultsPercent.nein = this.results.nein / this.nAbgeordnete;
    this.resultsPercent.enthaltung = this.results.enthaltung / this.nAbgeordnete;
  }

  calcScore () {
    if (this.choice === 1) {
      this.score = '(' + this.results.ja + ' + 1/2 · ' + this.results.enthaltung + ') / ' + this.nAbgeordnete + ' = ' + this.quiz.toPercent((this.results.ja + .5 * this.results.enthaltung) / this.nAbgeordnete);
    } else if (this.choice === 2) {
      this.score = '(' + this.results.nein + ' + 1/2 · ' + this.results.enthaltung + ') / ' + this.nAbgeordnete + ' = ' + this.quiz.toPercent((this.results.nein + .5 * this.results.enthaltung) / this.nAbgeordnete);
    } else if (this.choice === 0) {
      this.score = '(' + this.results.enthaltung + ' + 1/2 · ' + this.results.ja + '+ 1/2 · ' + this.results.nein + this.results.enthaltung + ') / ' + this.nAbgeordnete + ' = ' + this.quiz.toPercent((this.results.enthaltung + .5 * this.results.ja + .5 * this.results.nein) / this.nAbgeordnete);
    }
  }


//
//  setupPi () {
//    
//    var dataset = [
//  { label: 'Ja', count: this.results.ja },
//  { label: 'Nein', count: this.results.nein },
//  { label: 'Enthaltung', count: this.results.enthaltung }
//];
//    var width = 50;
//var height = 50;
//var radius = Math.min(width, height) / 2;
//    
//    
//    var svg = d3.select(this.div.nativeElement)
//  .append('svg')
//  .attr('width', width)
//  .attr('height', height)
//  .append('g')
//  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
//    
//   var arc = d3.arc()
//  .innerRadius(0)
//  .outerRadius(radius);
//     
//     var pie = d3.pie()
//  .value(function(d) { return d.count; })
//  .sort(null);
//     
//     var path = svg.selectAll('path')
//  .data(pie(dataset))
//  .enter()
//  .append('path')
//  .attr('d', arc).attr('fill', function (d, i) {
//    if (d.data.label === 'Ja') {
//      return '#4CAF50';
//    } else if (d.data.label === 'Nein') {
//      return '#f44336';
//    } else {
//      return '#2196F3';
//    }
//  });
//     
//     
//     
//     
//     
//    
//  }

}
