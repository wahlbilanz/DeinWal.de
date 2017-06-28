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
  // user votes with: 0 => enthaltung; 1 => ja ; 2 => nein
  partyVotes = [ 'enthaltung', 'ja', 'nein' ];
  //  parties = [ 'gruenen', 'cdu/csu', 'die.linke', 'spd' ];
  //  partyResultsDifferent = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};
  //  partyResultsSame = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};

  constructor (private qserv: QuestiondataService) {
    this.qserv.getData ().subscribe ((data) => {
      // console.log ('what is in the data', data);
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
    this.answers[id] = choice;
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
    for (const q of this.questionData) {
      for (const f in q['fragen']) {
        if (q['fragen'].hasOwnProperty(f)) {
          if (this.answers[f] >= 0) {
            const opt = this.partyVotes;
            const answer = opt[this.answers[f]];
            const results = q['fragen'][f]['results'];

            const s_gruen = results['gruenen'][opt[0]] + results['gruenen'][opt[1]] + results['gruenen'][opt[2]];
            q['fragen'][f]['gruene'] = this.toPercent (results['gruenen'][answer] / s_gruen);

            const s_cdu = results['cdu/csu'][opt[0]] + results['cdu/csu'][opt[1]] + results['cdu/csu'][opt[2]];
            q['fragen'][f]['cdu'] = this.toPercent (results['cdu/csu'][answer] / s_cdu);

            const s_linke = results['die.linke'][opt[0]] + results['die.linke'][opt[1]] + results['die.linke'][opt[2]];
            q['fragen'][f]['linke'] = this.toPercent (results['die.linke'][answer] / s_linke);

            const s_spd = results['spd'][opt[0]] + results['spd'][opt[1]] + results['spd'][opt[2]];
            q['fragen'][f]['spd'] = this.toPercent (results['spd'][answer] / s_spd);
          } else {
            q['fragen'][f]['gruene'] = '-';
            q['fragen'][f]['cdu'] = '-';
            q['fragen'][f]['linke'] = '-';
            q['fragen'][f]['spd'] = '-';
          }
        }
      }
    }
    this.resultsVisible = true;
  }
}
