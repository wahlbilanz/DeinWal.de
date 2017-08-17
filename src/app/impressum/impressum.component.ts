import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent implements OnInit {

  addr = 'info <ät> deinWal [punkt] de ';
  ack = [];
  ackStr = "";
  contactlink = 'https://binfalse.de';
  
  constructor() {
    this.addr = this.addr.replace(' <ät> ', '@').replace(' [punkt] ', '.');
    const tmp = 'ailt';
      this.contactlink = 'm' + tmp + 'o:' + this.addr;
		this.ack = this.shuffle ([
			/*{
			'name': '',
			'link': ''
			},*/
			{
				'name': 'Markus Wolfien',
				'link': 'https://www.sbi.uni-rostock.de/team/single/markus-wolfien/'
			},
			{
				'name': 'Michael Rennecke',
				'link': 'https://blog.0rpheus.net/'
			},
			{
				'name': 'Dagmar Waltemath',
				'link': ''
			},
			{
				'name': 'Daniela Hunsicker',
				'link': ''
			},
			{
				'name': 'Tom Gebhardt',
				'link': 'https://www.sbi.uni-rostock.de/team/single/tom-gebhardt/'
			},
			{
				'name': 'Martin Steinbach',
				'link': 'https://meet-unix.org/'
			},
			{
				'name': 'Ronja Steinbach',
				'link': ''
			}
		]);
   }

  ngOnInit() {
  }
  
	shuffle (array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}
}
