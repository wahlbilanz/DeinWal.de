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
	questionData = {};
  answers = {};
  partyResultsDifferent = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};
  partyResultsSame = {'cdu':[0],'csu':[0],'spd':[0],'gruen':[0],'linke':[0],'overall':[0]};

	constructor(private qserv: QuestiondataService) {
		this.qserv.getData().subscribe((data) => {
			console.log("what is in the data ", data);
			this.questionData = data;
		})
	}
	
  ngOnInit() {
  }

  print(){
    console.log(this.answers);
    this.testresultauswertung();
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

}
