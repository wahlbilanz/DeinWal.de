import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent implements OnInit {

  creators = []
  addr = 'info <ät> deinWal [punkt] de ';
  ack = [];
  ackStr = "";
  contactlink = 'https://binfalse.de';
  
  constructor() {
    this.addr = this.addr.replace(' <ät> ', '@').replace(' [punkt] ', '.');
    const tmp = 'ailt';
      this.contactlink = 'm' + tmp + 'o:' + this.addr;
    
    this.creators = this.shuffle ([
      {
        'name': 'Tom Theile',
        'link': 'https://github.com/tomthe',
        'job': 'Tom arbeitet als Entwicklungsingenieur bei <a href="http://ati-kueste.de/" target="_blank">ATI Küste GmbH</a>.'
      },
      {
        'name': 'Martin Scharm',
        'link': 'https://cv.binfalse.de',
        'job': 'Martin hat am <a href="https://www.sbi.uni-rostock.de/" target="_blank">Lehrstuhl für Systembiologie</a> promoviert und arbeitet als Systemingenieur an der <a href="https://www.uni-rostock.de/" target="_blank">Universität Rostock</a>.'
      }
    ]);
    
		this.ack = this.shuffle ([
			/*{
			'name': '',
			'link': ''
			},*/
			{
				'name': 'Holger Hennig',
				'link': 'https://www.sbi.uni-rostock.de/team/single/holger-hennig/'
			},
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
				'name': 'Daniela Theile',
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
			},
			{
				'name': 'Daniel Werner',
				'link': 'https://github.com/powerdan'
			},
			{
				'name': 'Johannes Visintini',
				'link': 'https://github.com/joker234'
			},
			{
				'name': 'x29a',
				'link': 'https://github.com/x29a'
			},
      {
				'name': 'Matthias Vogelgesang',
				'link': 'https://github.com/matze'
			},
      {
				'name': 'Dennis',
				'link': 'https://github.com/d-nnis'
			},
      {
				'name': 'Niklas Kreer',
				'link': 'https://github.com/nkreer'
			},
			/*
      {
				'name': '',
				'link': ''
			},
      */
      {
        'name': 'Jörn Zaefferer',
        'link': 'https://github.com/jzaefferer'
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
