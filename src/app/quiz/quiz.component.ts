import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';
/*import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';*/


@Component ({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questionData = [];
  questionIndex = 0;
  question = {};
  actualQuestions = [];
  answers = {};
  progress = 0.0;
  resultsVisible = false;
  test={"ja":11,"nein":"10"};
  // user votes with: 0 => enthaltung; 1 => ja ; 2 => nein
  partyVotes = [ 'enthaltung', 'ja', 'nein' ];
  //  parties = [ 'gruenen', 'cdu/csu', 'die.linke', 'spd' ];
  //  partyResultsDifferent = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};
  //  partyResultsSame = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};
  doSave:boolean = false; // if true: save choices in localStorage
  overallResult = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};

  constructor (private qserv: QuestiondataService) {
    let loadNewData = true;
    if (localStorage.getItem('doSave')) {
      this.doSave = JSON.parse(localStorage.getItem('doSave'));
      console.log('doSave is there: ', this.doSave,localStorage.getItem('doSave'))
      if(this.doSave){
        loadNewData = false;
        if(localStorage.getItem('questionData')){
          console.log('load data from local storage...')
          this.getQuestionDataFromLocalStorage();
          this.showQuestion(0);
        }
      } else {
        loadNewData = true;
      }
    }

    if (loadNewData) {      
      this.qserv.getData ().subscribe ((data) => {
        console.log ('what is in the data', data);
        if (!Array.isArray (data)) {
          this.questionData = [];
        } else {
          this.questionData = data;
          for (const q of this.questionData) {
            q['fragenIds'] = [];
            for (const f in q['fragen']) {
              if (q['fragen'].hasOwnProperty (f)) {
                this.answers[f] = -1;
                q['fragenIds'].push (f);
              }
            }
          }
        }
        this.showQuestion (0);
      });
    }

    ///example to test localStorage:
    if (localStorage.getItem('count')) {
      localStorage.setItem('count', String(Number(localStorage.getItem('count')) + 1));
      console.log('number of times you opened the quiz: ', localStorage.getItem('count'));
    } else {
      localStorage.setItem('count','1');
    }
    //// example-end/
  }

  ngOnInit () {
  }

  print () {
    console.log (this.answers);
  }

  choose (id, choice) {
    if(this.answers[id]==choice){
      this.answers[id]=null;
    } else {
      this.answers[id] = choice;
    }
    this.saveQuestionDataToLocalStorage();
    // console.log (this.answers);
  }

  /**
   * Zeige nur Question Nummer n (div.style.display = block), verstecke alle anderen(div.style.display = none)
   * nicht wirklich schoen.
   * @param {any} n
   *
   * @memberof QuizComponent
   */
  showQuestion (n) {
    this.questionIndex = n;
    this.resultsVisible = false;
    const nQuestions = this.questionData.length;
    // console.log ('anzahl fragen:', nQuestions);
    this.progress = 100.0 * n / (nQuestions);
    this.question = this.questionData[n];
    this.actualQuestions = Object.keys (this.question['fragen']);
  }
  
  /**
   *
   */
  nextQuestion (n) {
    this.questionIndex += n;
    if (this.questionIndex >= this.questionData.length) {
      // auswertung
      this.progress = 100;
      this.showResults ();
    } else if (this.questionIndex < 0) {
      this.questionIndex = 0;
      this.showQuestion (this.questionIndex);
    } else {
      this.showQuestion (this.questionIndex);
    }
  }

  toPercent (n) {
    return (Math.round (10000 * n) / 100) + "%";
  }

  showResults () {
    let nzustimmung = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};
    let ngesamt = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};
    for (const q of this.questionData) {
      for (const f in q['fragen']) {
        if (q['fragen'].hasOwnProperty(f)) {
          if (this.answers[f] >= 0) {
            const opt = this.partyVotes;
            const answer = opt[this.answers[f]];
            const results = q['fragen'][f]['results'];
            for(let partyName of ['gruenen','cdu/csu','spd','die.linke']){
              let tempPunkte = this.getZustimmungsPunkte(results[partyName],answer);
              q['fragen'][f][partyName] = tempPunkte.punkteRelativ;
              nzustimmung[partyName] += tempPunkte.punkteAbsolut;
              ngesamt[partyName] += tempPunkte.nAbgegebeneStimmen;
              console.log('---h3', partyName, tempPunkte)
            }
          } else {
            for(let partyName of ['gruenen','cdu/csu','spd','die.linke']){
              q['fragen'][f][partyName] = -1
            }
          }
        }
      }
    }
    this.overallResult['spd'] = nzustimmung.spd / ngesamt.spd;
    this.overallResult['gruenen'] = nzustimmung['gruenen'] / ngesamt['gruenen'];
    this.overallResult['die.linke'] = nzustimmung['die.linke'] / ngesamt['die.linke']; 
    this.overallResult['cdu/csu'] = nzustimmung['cdu/csu'] / ngesamt['cdu/csu'];
    this.resultsVisible = true;
  }

  getZustimmungsPunkte(partyResults, answer){
    const opt = this.partyVotes;
    let nAbgegebeneStimmen = partyResults[opt[0]] + partyResults[opt[1]] + partyResults[opt[2]];
    let punkte = 0;
    if(answer=='enthaltung'){ //Enthaltung
      punkte = partyResults[opt[0]] + 0.5* partyResults[opt[1]] + 0.5 * partyResults[opt[2]];
    } else if (answer=='ja'){ //ja
      punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[1]];
    } else if (answer=='nein'){ //nein
      punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[2]];
    } else {
      //wenn der Benutzer gar keine Antwort ausgewaehlt hat
      //sowol punkte als auch nAbgegebeneStimmen auf 0 setzen, damit sie nicht ins gesamtergebnis reinzaehlen:
      punkte = 0;
      nAbgegebeneStimmen = 0;
    }
    return {'punkteRelativ':(punkte / nAbgegebeneStimmen), 'punkteAbsolut':punkte, 'nAbgegebeneStimmen':nAbgegebeneStimmen};
  }
  
  toggleSave(){
    this.doSave = !this.doSave;
    localStorage.setItem('doSave', JSON.stringify(this.doSave));
    if(this.doSave){
      this.saveQuestionDataToLocalStorage();
    } else {
      this.eraseQuestionDataFromLocalStorage();
    }
  }

  eraseQuestionDataFromLocalStorage(){
    localStorage.removeItem('questionData');
    localStorage.removeItem('answers');
    //localStorage.clear(); //alternatively clear the whole thing
  }

  saveQuestionDataToLocalStorage(){
    if(this.doSave){
      localStorage.setItem('questionData', JSON.stringify(this.questionData));
      localStorage.setItem('answers', JSON.stringify(this.answers));
      //console.log('save QuestionData...: ', JSON.stringify(this.questionData));
    }
  }

  getQuestionDataFromLocalStorage(){
        this.questionData = JSON.parse(localStorage.getItem('questionData'));
        this.answers = JSON.parse(localStorage.getItem('answers'));
  }
}
