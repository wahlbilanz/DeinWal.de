import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  answers = {};
  partyResultsDifferent = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
  partyResultsSame = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};

  constructor(public questionData:QuestiondataService) { }

  ngOnInit() {
  }

  print(){
    console.log(this.answers);
    this.testresultauswertung();
  }

  testresultauswertung(){
  this.partyResultsDifferent = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
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
    console.log(this.partyResultsDifferent);
  }

}
