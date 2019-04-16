import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private app: AppComponent) {
	}
	
	getQuestionIndex (route) {
		return this.app.questionIndex[route];
	}

  ngOnInit() {
  }

}
