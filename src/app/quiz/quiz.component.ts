import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  model:any;
  answers = ["neutral","neutral","neutral","neutral"]
  constructor(public questionData:QuestiondataService) { }

  ngOnInit() {
  }

  print(){
    console.log(this.model);
    console.log(this.answers);
  }
}
