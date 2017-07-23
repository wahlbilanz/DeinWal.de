import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';
import { settings } from '../settings';
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
  // is this production or debug mode?
  production;
  // the whole question information as it will be retrieved from votes.json
  questionData = [];
  // currently visible question index
  questionIndex = 0;
  // currently visible question -- basically equals `this.questionData[this.questionIndex]`
  question = {};
  // actual questions in `question`
  actualQuestions = [];
  // the usesr's answers to the questions, keys are the question ids, values are one of `voteOptions`
  answers = {};
  // current progress in the quiz 
  progress = 0.0;
  // auswertung anzeigen?
  resultsVisible = false;
  // options for votes with: 0 => enthaltung; 1 => ja ; 2 => nein
  voteOptions = [ 'enthaltung', 'ja', 'nein' ];
  // should we save the answers in the local storage
  doSave:boolean = false; // if true: save choices in localStorage
  // auswertung der auswertung
  overallResult = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};

  constructor (private qserv: QuestiondataService) {
    
    if (localStorage.getItem('doSave')) {
      this.debugLog ("restoring data from local storage");
       this.getQuestionDataFromLocalStorage();
    }
    
    this.debugLog ("retrieving newest questions");
    this.qserv.getData ().subscribe ((data) => {
      this.debugLog ('retrieved data:', data);
      if (!Array.isArray (data)) {
        this.debugLog ("error retrieving data!")
        // TODO: what are we supposed to do here?
        // at least show some warning...
      } else {
        this.questionData = data;
        // for every question -> extract the actual question ids, that makes it easier to iterate over questions in the HTML
        for (const q of this.questionData) {
          q['fragenIds'] = [];
          for (const f in q['fragen']) {
            if (q['fragen'].hasOwnProperty (f)) {
              // -1 means -> not answered yet
              this.answers[f] = -1;
              q['fragenIds'].push (f);
            }
          }
        }
      }
      // show first question
      this.showQuestion (0);
    });
  }

  ngOnInit () {
  }

  /**
   * print answers in console
   */
  debugAnswers () {
    console.log (this.answers);
  }
  
  /**
   * print some debug message, unless we're in production mode...
   */
  debugLog (...msg) {
    if (!settings.production)
      console.log (msg);
  }

  /**
   * select an answer
   */
  choose (id, choice) {
    // unselect a previously selected answer
    if (this.answers[id] == choice){
      this.answers[id] = null;
    } else {
      // select this answer
      this.answers[id] = choice;
    }
    
    // save the selection (if saving is enabled)
    this.saveQuestionDataToLocalStorage();
  }

  /**
   * Zeige nur Question Nummer n
   */
  showQuestion (n) {
    this.questionIndex = n;
    
    // there is no question with negative index...
    if (this.questionIndex < 0)
      this.questionIndex = 0;
    
    // if n is bigger than the number of questions -> show results
    if (this.questionIndex >= this.questionData.length) {
      this.showResults ();
    }
    // otherwise show question n
    else {
      
      this.resultsVisible = false;
      this.progress = 100.0 * n / this.questionData.length;
      this.question = this.questionData[this.questionIndex];
      // get sub-questions
      this.actualQuestions = Object.keys (this.question['fragen']);
    }
  }
  
  
  
  /**
   * jump a number of questions forward (n is positiv) or backward (n is negative)
   */
  nextQuestion (n) {
    this.showQuestion (this.questionIndex + n);
  }

  
  
  /**
   * beautiful percentage:
   * give n in [0,1] and get percent in [0.00, 100.00]
   */
  toPercent (n) {
    return (Math.round (10000 * n) / 100) + "%";
  }

  
  /**
   * auswertungstabelle generieren und anzeigen
   */
  showResults () {
    this.questionIndex = this.questionData.length;
    this.progress = 100;
    
    let nzustimmung = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};
    let ngesamt = {'gruenen':0.0,'cdu/csu':0.0,'die.linke':0.0,'spd':0.0};
    for (const q of this.questionData) {
      for (const f in q['fragen']) {
        if (q['fragen'].hasOwnProperty(f)) {
          if (this.answers[f] >= 0) {
            const opt = this.voteOptions;
            const answer = opt[this.answers[f]];
            const results = q['fragen'][f]['results'];
            for(let partyName of ['gruenen','cdu/csu','spd','die.linke']){
              let tempPunkte = this.getZustimmungsPunkte(results[partyName],answer);
              q['fragen'][f][partyName] = tempPunkte.punkteRelativ;
              nzustimmung[partyName] += tempPunkte.punkteAbsolut;
              ngesamt[partyName] += tempPunkte.nAbgegebeneStimmen;
              console.log('---h3', partyName, tempPunkte);
            }
          } else {
            for(let partyName of ['gruenen','cdu/csu','spd','die.linke']){
              q['fragen'][f][partyName] = 0;
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

  /**
   * hat eine partei mit der antwort eines users uebereingestimmt?
   * 
   * 
   * @param partyResults object of `voteOptions` (ja/nein/..) -> `anzahl votes`
   * @param answer human readable vote of user (ja/nein/..)
   * 
   */
  getZustimmungsPunkte(partyResults, answer){
    const opt = this.voteOptions;
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
  
  
  
  
  
  // below is local storage stuff
  
  
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
    }
  }

  getQuestionDataFromLocalStorage(){
        this.questionData = JSON.parse(localStorage.getItem('questionData'));
        this.answers = JSON.parse(localStorage.getItem('answers'));
  }
}
