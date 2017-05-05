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
  answers = {};
  progress = 0.0;
  choice = 'notyet';
  partyResultsDifferent = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
  partyResultsSame = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};

	constructor(private qserv: QuestiondataService) {
		this.qserv.getData().subscribe((data) => {
			console.log("what is in the data ", data);
      if (! Array.isArray(data)){
        this.questionData = [];
      } else {
			  this.questionData = data;
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

  choose(choice, questionId){
    if(this.choice!=choice){
      this.choice = choice;
      this.answers[questionId] = choice;
    } else {
      this.choice = 'notyet';
      this.answers[questionId] = 'notyet';
    }
  }

  testresultauswertung(){
  /*this.partyResultsDifferent = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
    for(let questionID in this.answers){
      //console.log('QuestionID:' + questionID + ' answer:' + this.answers[questionID]);
      for(let partei in this.partyResultsDifferent){
        let answerByParty = this.questionData.getDefinitiveAnswerByIdAndParty(questionID,partei);
        if (answerByParty==this.answers[questionID]){
          this.partyResultsDifferent[partei].push(0.0);
          this.partyResultsDifferent[partei][0] += 0.0;
          this.partyResultsSame[partei].push(1.0);
          this.partyResultsSame[partei][0] += 1.0;
        } else {
          this.partyResultsDifferent[partei].push(1.0);
          this.partyResultsDifferent[partei][0] += 1.0;
          this.partyResultsSame[partei].push(0.0);
          this.partyResultsSame[partei][0] += 0.0;
        }
      }
    }
    console.log(this.partyResultsDifferent);*/
  }

  /**
   * Zeige nur Question Nummer n (div.style.display = block), verstecke alle anderen(div.style.display = none)
   * nicht wirklich schoen.
   * @param {any} n 
   * 
   * @memberof QuizComponent
   */
  showQuestion(n) {
      let i;
      let x = document.getElementsByClassName("myQuestions");
      console.log('anzahl fragen:', x.length);

      this.progress = 100.0 * n / (x.length-1);

      for (i = 0; i < x.length; i++) {
        let y = <HTMLElement> x[i];
        y.style.display = "none";
      }
      if(n>=x.length){
        //vorbei!
        console.log('vorbei!');
      } else {
        let y = <HTMLElement> x[this.questionIndex];
        y.style.display = "block";
      }
  }
  
  nextQuestion(n) {
    this.choice = 'notyet';
    this.questionIndex += n;
    this.showQuestion(this.questionIndex);
  }


}
