import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  answers = {};
  partyResults = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};

  constructor(public questionData:QuestiondataService) { }

  ngOnInit() {
  }

  print(){
    console.log(this.answers);
    this.testresultauswertung();
  }

  testresultauswertung(){
  this.partyResults = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
    for(let questionID in this.answers){
      //console.log('QuestionID:' + questionID + ' answer:' + this.answers[questionID]);
      for(let partei in this.partyResults){
        let answerDifference = 1.0;
        let answerByParty = this.questionData.getDefinitiveAnswerByIdAndParty(questionID,partei);
        if (answerByParty==this.answers[questionID]){
          answerDifference = 0.0;
        } else {
          answerDifference = 1.0;
        }
        this.partyResults[partei].push(answerDifference);
        this.partyResults[partei][0] += answerDifference;
      }
    }
    console.log(this.partyResults);
  }

}
