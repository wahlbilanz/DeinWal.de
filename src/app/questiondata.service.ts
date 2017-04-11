import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class QuestiondataService {

	constructor(public http:Http) { }
	
	
	getData() {
		return this.http.get("/assets/votes.json")
		.map((res:Response) => res.json());
	}

}
