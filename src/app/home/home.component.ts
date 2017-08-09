import { Component, OnInit } from '@angular/core';
import { QuestiondataService } from '../questiondata.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private qserv: QuestiondataService, private app: AppComponent) {
		this.qserv.getData ().subscribe((data) => { this.app.log('preloaded votes.json from home component :)'); });
	}

  ngOnInit() {
  }

}
