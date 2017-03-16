import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  answers = {};
  constructor(public questionData:QuestiondataService) { }

  ngOnInit() {
  }

  print(){
    console.log(this.answers);
    this.testresultauswertung();
  }

  testresultauswertung(){
    for(let answer in this.answers){
      console.log(answer);
      let results = this.questionData.getResultById(answer);
      console.log(results);
      for(let partei in results){
        
      }
    }
  }

}
