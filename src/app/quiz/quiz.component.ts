import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';
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
export class QuizComponent implements OnInit {
	questionData = [];
  questionIndex = 0;
  question = {};
  actualQuestions = [];
  answers = {};
  progress = 0.0;
  //choice = {};
  resultsVisible = false;
//  partyResultsDifferent = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};
//  partyResultsSame = {'cdu/csu':[0],'spd':[0],'gruenen':[0],'die.linke':[0]};

	constructor(private qserv: QuestiondataService) {
		this.qserv.getData().subscribe((data) => {
			console.log("what is in the data ", data);
      if (! Array.isArray(data)){
        this.questionData = [];
      } else {
			  this.questionData = data;
        for (let q of this.questionData) {
          for (let f in q["fragen"]) {
            this.answers[f] = -1;
          }
        }
      }
      this.showQuestion(0);
		})
	}
	
  ngOnInit() {
  }

  print(){
    console.log(this.answers);
    this.testresultauswertung();
  }

  choose(id, choice){
    this.answers[id] = choice;
    console.log (this.answers)
  }

  testresultauswertung(){
  }

  /**
   * Zeige nur Question Nummer n (div.style.display = block), verstecke alle anderen(div.style.display = none)
   * nicht wirklich schoen.
   * @param {any} n 
   * 
   * @memberof QuizComponent
   */
  showQuestion(n) {
//    this.choice = {};
      let i;
      let nQuestions = this.questionData.length;
      console.log('anzahl fragen:', nQuestions);
      this.progress = 100.0 * n / (nQuestions);
      this.question = this.questionData[n];
    this.actualQuestions = Object.keys (this.question['fragen']);
    /*for (let q of this.actualQuestions) {
      if (this.answers[q])
            this.choice[q] = 'notyet';
      else
            this.choice[q] = 'notyet';
    }*/
  }
  
  nextQuestion(n) {
    this.questionIndex += n;
    if(this.questionIndex>=this.questionData.length){
      //reached last question
      this.progress = 100;
      this.showResults();
    } else {
      this.showQuestion(this.questionIndex);
    }
  }

  showResults(){
    this.resultsVisible = true;
  }
}
