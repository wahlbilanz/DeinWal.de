import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class QuestiondataService {

	constructor(public http:Http) { }
	
	cachedData = null;
	
	getData() {
		if (this.cachedData) {
      console.log('using cached votes:', this.cachedData);
      return Observable.of(this.cachedData);
    } else {
      console.log('votes not cached yet');
      return this.http.get("/assets/votes.json")
            .map(res => res.json())
            .do((data) => {
              this.cachedData = data;
            });
    }
		//return this.http.get("/assets/votes.json")
		//.map((res:Response) => res.json());
	}

}
