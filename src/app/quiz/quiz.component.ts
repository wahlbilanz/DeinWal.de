import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common';
import { QuestiondataService } from '../questiondata.service';
import { AppComponent } from '../app.component';
/*import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';*/


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges {
  /** is this production or debug mode?*/
  production;
  /** the whole question information as it will be retrieved from votes.json*/
  questionData = [];
  /** currently visible question index*/
  questionIndex = 0;
  /** currently visible question -- basically equals `this.questionData[this.questionIndex]`*/
  question = {};
  /** actual questions in `question`*/
  actualQuestions = [];
  /** the usesr's answers to the questions, keys are the question ids, values are one of `voteOptions`*/
  answers = {};
  /** current progress in the quiz */
  progress = "0%";
  /** auswertung anzeigen?*/
  resultsVisible = false;
  /** options for votes with: 0 => enthaltung; 1 => ja ; 2 => nein*/
  voteOptions = ['enthaltung', 'ja', 'nein'];
  /** should we save the answers in the local storage*/
  doSave: boolean = false; // if true: save choices in localStorage
  /** saving is impossible if the users blocks local storage */
  saveImpossible: boolean = false;
  /** auswertung der auswertung*/
  overallResult = {};
  /** text fuer den speichern button */
  speichernText = 'speichern';
  /** text fuer den speichern tooltip */
  speichernTooltip = 'Speichere deine Eingaben lokal in deinem Browser.';

  constructor(private qserv: QuestiondataService, private app: AppComponent, private route: ActivatedRoute,private location: Location) {
    
    this.checkSave ();

    if (this.doSave) {
      this.app.log('restoring data from local storage');
      this.getQuestionDataFromLocalStorage();
    }

    this.app.log('retrieving newest questions');
    this.qserv.getData().subscribe((data) => {
      this.app.log('retrieved data:', data);
      if (!Array.isArray(data)) {
        this.app.log('error retrieving data!')
        // TODO: what are we supposed to do here?
        // at least show some warning...
      } else {
        this.questionData = data;
        // for every question -> extract the actual question ids, that makes it easier to iterate over questions in the HTML
        for (const q of this.questionData) {
          q['fragenIds'] = [];
          for (const f in q['fragen']) {
            if (q['fragen'].hasOwnProperty(f)) {
              // -1 means -> not answered yet
              if (!this.answers.hasOwnProperty(f)) {
                this.answers[f] = -1;
              }
              q['fragenIds'].push(f);
            }
          }
        }
      }
      // show first question
      //this.showQuestion(0); //happens in ngOnInit
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      try {
        if(params['questionPage']=='results'){
          this.showResults();
        } else {
          this.questionIndex = Number.parseInt(params['questionPage']);
          this.showQuestion(this.questionIndex);
        }
      } catch (e) {
        console.log('keine question id angegeben ')
        // show first question
        this.showQuestion(0);
      }
    });

  }
  ngAfterContentInit() {
    this.checkSave ();
  }
  ngAfterViewInit() {
    this.checkSave ();
  }
  ngAfterViewChecked() {
    this.checkSave ();
  }
  ngDoCheck() {
    this.checkSave ();
  }
  ngOnChanges(changes) {
    this.checkSave ();
  }

  /**
   * print answers in console
   */
  debugAnswers() {
    console.log(this.answers);
  }

  /**
   * select an answer
   */
  choose(id, choice) {
    // unselect a previously selected answer
    if (this.answers[id] === choice) {
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
  showQuestion(n) {
    this.questionIndex = n;
    this.location.go('quiz/' + n) // die entsprechende URL im adressfeld anzeigen und auf history-stack pushen

    // there is no question with negative index...
    if (this.questionIndex < 0) {
      this.questionIndex = 0;
    }

    // if n is bigger than the number of questions -> show results
    if (this.questionIndex >= this.questionData.length) {
      this.showResults();
    } else { // otherwise show question n
      this.app.overwriteTitle('Quiz');
      this.resultsVisible = false;
      this.progress = this.toPercent (n / this.questionData.length);
      this.question = this.questionData[this.questionIndex];
      // get sub-questions
      this.actualQuestions = Object.keys(this.question['fragen']);
    }
  }



  /**
   * jump a number of questions forward (n is positiv) or backward (n is negative)
   */
  nextQuestion(n) {
    this.showQuestion(this.questionIndex + n);
  }



  /**
   * beautiful percentage:
   * give n in [0,1] and get percent in [0.0, 100.0]
   * with nachkommastellen precision
   */
  toPercent(n,nachkommastellen=0) {
    let precision = [ 1, 10, 100, 1000, 1000, 10000] //10 ^ x-1
    return (Math.round(100 * precision[nachkommastellen] * n) / (precision[nachkommastellen])) + "%";
  }


  /**
   * auswertungstabelle generieren und anzeigen
   */
  showResults() {
    this.location.go('quiz/results') // change URL
    this.questionIndex = this.questionData.length;
    this.progress = this.toPercent (1);
    this.app.overwriteTitle("Auswertung");

    this.overallResult = { 'gruenen': '-', 'cdu/csu': '-', 'die.linke': '-', 'spd': '-' };
    const nzustimmung = { 'gruenen': 0.0, 'cdu/csu': 0.0, 'die.linke': 0.0, 'spd': 0.0 };
    let nAnswered = 0;

    for (const q of this.questionData) {
      for (const f in q['fragen']) {
        if (q['fragen'].hasOwnProperty(f)) {
          if (this.answers[f] >= 0) {
            const opt = this.voteOptions;
            const answer = opt[this.answers[f]];
            const results = q['fragen'][f]['results'];
            nAnswered++;
            for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
              const tempPunkte = this.getZustimmungsPunkte(results[partyName], answer);
              q['fragen'][f][partyName] = this.toPercent(tempPunkte.punkteRelativ);
              nzustimmung[partyName] += tempPunkte.punkteRelativ;
              //this.app.log('---h3', partyName, tempPunkte);
            }
          } else {
            for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
              q['fragen'][f][partyName] = '-';
            }
          }
        }
      }
    }

    if (nAnswered > 0) {
      this.overallResult['spd'] = this.toPercent(nzustimmung['spd'] / nAnswered);
      this.overallResult['gruenen'] = this.toPercent(nzustimmung['gruenen'] / nAnswered);
      this.overallResult['die.linke'] = this.toPercent(nzustimmung['die.linke'] / nAnswered);
      this.overallResult['cdu/csu'] = this.toPercent(nzustimmung['cdu/csu'] / nAnswered);
    }
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
  getZustimmungsPunkte(partyResults, answer) {
    const opt = this.voteOptions;
    let nAbgegebeneStimmen = partyResults[opt[0]] + partyResults[opt[1]] + partyResults[opt[2]];
    let punkte = 0;
    if (answer === 'enthaltung') { // Enthaltung
      punkte = partyResults[opt[0]] + 0.5 * partyResults[opt[1]] + 0.5 * partyResults[opt[2]];
    } else if (answer === 'ja') { // ja
      punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[1]];
    } else if (answer === 'nein') { // nein
      punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[2]];
    } else {
      // wenn der Benutzer gar keine Antwort ausgewaehlt hat
      // sowol punkte als auch nAbgegebeneStimmen auf 0 setzen, damit sie nicht ins gesamtergebnis reinzaehlen:
      punkte = 0;
      nAbgegebeneStimmen = 0;
    }
    return { 'punkteRelativ': (punkte / nAbgegebeneStimmen), 'punkteAbsolut': punkte, 'nAbgegebeneStimmen': nAbgegebeneStimmen };
  }





  // below is local storage stuff


  toggleSave() {
	if (!this.saveImpossible) {
	    localStorage.setItem('doSave', JSON.stringify (!this.doSave));
	    this.checkSave ();
	    
	    if (this.doSave) {
	      this.saveQuestionDataToLocalStorage();
	    } else {
	      this.eraseQuestionDataFromLocalStorage();
	    }
	}
  }

  checkSave () {
    this.doSave = false;
    
    try {
	    if (localStorage.getItem ('doSave') !== null) {
	      this.doSave = JSON.parse(localStorage.getItem('doSave'));
	    }
    } catch (e) {
    	this.saveImpossible = true;
    }

    if (this.doSave) {
      this.speichernText = 'gespeichert';
      this.speichernTooltip = 'Deine Eingaben werden in deinem Browser gespeichert. Nochmal drücken zum Löschen.';
    } else if (this.saveImpossible) {
        this.speichernText = 'speichern nicht möglich';
        this.speichernTooltip = 'Dein Browser erlaubt keine Cookies und/oder local Storage. Deine Eingaben gehen verloren wenn du das Fenster schliesst oder neu lädst.';
    } else {
      this.speichernText = 'speichern';
      this.speichernTooltip = 'Speichere deine Eingaben lokal in deinem Browser.';
    }
  }

  eraseQuestionDataFromLocalStorage() {
	if (!this.saveImpossible) {
		localStorage.clear(); // clear the whole thing
	}
  }

  saveQuestionDataToLocalStorage() {
    if (this.doSave) {
      localStorage.setItem('questionData', JSON.stringify(this.questionData));
      localStorage.setItem('answers', JSON.stringify(this.answers));
    }
  }

  getQuestionDataFromLocalStorage() {
    this.questionData = JSON.parse(localStorage.getItem('questionData'));
    this.answers = JSON.parse(localStorage.getItem('answers'));
    this.doSave = JSON.parse(localStorage.getItem('doSave'));
  }




}
