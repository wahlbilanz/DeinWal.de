import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges {
  localStorageOn = 'gespeichert';
  
  othertoolsBtw17 = [];
  othertoolsEu19 = [];
  
  constructor(private router: Router) {
    this.updateLocalStorage ();
    
	this.othertoolsEu19 = this.shuffle ([
		/*{
			'pre': '',
			'name': '',
			'link': ''
		},*/
		{
			'pre': 'in die',
			'name': 'Wahlprogramme der verschiedenen Parteien',
			'link': 'https://www.europawahl-bw.de/europawahlprogramme.html'
		},
		{
			'pre': '',
			'name': 'Wer steht zur Wahl?',
			'link': 'https://www.bpb.de/politik/wahlen/wer-steht-zur-wahl/287905/europawahl-2019'
		},
		{
			'pre': 'ins',
			'name': 'Europa-Wahlbingo',
			'link': 'https://wahlbingo.bpb.de/'
		},
		{
			'pre': 'zum',
			'name': 'Digital-O-Mat',
			'link': 'https://ep2019.digital-o-mat.de/'
		},
		{
			'pre': 'in den',
			'name': 'Wahl-O-Mat',
			'link': 'https://www.wahl-o-mat.de/'
		},
		{
			'pre': 'auf den',
			'name': 'Voteswiper',
			'link': 'https://www.voteswiper.org'
		},
		{
			'pre': 'zum',
			'name': 'Euromat',
			'link': 'https://www.euromat.info/de/'
		}
  ])
    

	this.othertoolsBtw17 = this.shuffle ([
		/*{
			'pre': '',
			'name': '',
			'link': ''
		},*/
		{
			'pre': 'zum',
			'name': 'Wahlradar',
			'link': 'http://wahlradar.org/'
		},
		{
			'pre': 'zur',
			'name': 'Initiative Informiert wählen',
			'link': 'http://www.informiert-waehlen.de/'
		},
		{
			'pre': 'in den',
			'name': 'Wahl-O-Mat',
			'link': 'https://www.wahl-o-mat.de/'
		},
		{
			'pre': 'in die',
			'name': 'Wahlprogramme der verschiedenen Parteien',
			'link': 'http://www.bundestagswahl-bw.de/wahlprogramme_btwahl2017.html'
		},
		{
			'pre': 'zu',
			'name': 'abgeordnetenwatch.de',
			'link': 'https://www.abgeordnetenwatch.de/'
		},
		{
			'pre': 'zu',
			'name': 'wahlversprechen2013',
			'link': 'http://www.wahlversprechen2013.de/'
		},
		{
			'pre': 'zum',
			'name': 'Wahl.Daten.Helfer',
			'link': 'http://www.wahldatenhelfer.de/'
		},
		{
			'pre': 'zum',
			'name': 'Steuer-O-Mat',
			'link': 'http://steuer-o-mat.de/'
		},
		{
			'pre': 'zum',
			'name': 'Musik-O-Mat',
			'link': 'http://musik-o-mat.com/'
		},
		{
			'pre': 'zur',
			'name': 'Wahlorientierungshilfe',
			'link': 'https://wahl2017.gerritalex.de/'
		},
		{
			'pre': 'zum',
			'name': 'WahlSwiper',
			'link': 'https://movact.de/wahlswiper/'
		},
		{
			'pre': 'zum',
			'name': 'Sozial-O-Mat',
			'link': 'https://www.sozial-o-mat.de/btw17/'
		},
		{
			'pre': 'zum',
			'name': 'Digital-Thesen-Check',
			'link': 'https://digital17.d-64.org/'
		},
		{
			'pre': 'zum',
			'name': 'Wahlkompass Digitales',
			'link': 'http://wahlkompass-digitales.de/'
		},
		{
			'pre': 'zum',
			'name': 'Agrar-O-Mat',
			'link': 'https://www.agrarheute.com/agraromat'
		},
		{
			'pre': 'in die',
			'name': 'Übersicher aller zur Wahl stehenden Parteien',
			'link': 'https://www.bundeswahlleiter.de/info/presse/mitteilungen/bundestagswahl-2017/05_17_parteien_teilnahme.html'
		},
		{
			'pre': 'zum',
			'name': 'Europapolitischen Wahlkompass',
			'link': 'http://www.foederalist.eu/p/europapolitischer-wahlkompass-2017.html'
		},
    {
			'pre': 'in den',
			'name': 'Wahlprüfstein der mathematisch-naturwissenschaftlichen Fachgesellschaften',
			'link': 'http://www.bundestagswahl.naturwissenschaften.mathematik.de/'
		}
	]);
	
  }

  ngOnInit() {
    this.router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = this.router.parseUrl(this.router.url);
        if (tree.fragment) {
          const element = document.querySelector("#" + tree.fragment);
          if (element) { element.scrollIntoView(); }
        }
      }
    });
  }
  ngAfterContentInit() {
    this.updateLocalStorage ();
  }
  ngAfterViewInit() {
    this.updateLocalStorage ();
  }
  ngAfterViewChecked() {
    this.updateLocalStorage ();
  }
  ngDoCheck() {
    this.updateLocalStorage ();
  }
  ngOnChanges(changes) {
    this.updateLocalStorage ();
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
  
  
  updateLocalStorage () {
	try {
	    if (localStorage.getItem('doSave') && JSON.parse(localStorage.getItem('doSave'))) {
	      this.localStorageOn = 'gespeichert';
	    } else {
	      this.localStorageOn = 'nicht gespeichert';
	    }
	} catch (e) {
	    this.localStorageOn = 'nicht gespeichert';
	}
  }
  

  clearData () {
	try {
	    localStorage.clear();
	} catch (e) {
	}
    this.updateLocalStorage ();
  }
  
  /**
   * toggle visibility of an FAQ content element and toggles caret if defined.
   */
  toggleVis(content, caret) {
    if (content.style.display === '') {
      content.style.display = 'none';
      if (caret) {
        caret.className = 'fa fa-caret-down';
      }
    } else {
      content.style.display = '';
      if (caret) {
        caret.className = 'fa fa-caret-up';
      }
    }
  }
  
  
  /**
   * hacks easy to use according function...
   * 
   * this can easily be used from the HTML -- see there for an example ;-)
   */
  accordion(clickEvent) {
    
    let caret = null;
    for (let i = 0; i < clickEvent.target.childNodes.length; i++) {
      if (clickEvent.target.childNodes[i].nodeName === 'I') {
        caret = clickEvent.target.childNodes[i];
      }
    }
    
    const pDiv = clickEvent.target.parentElement.parentElement;
    
    for (let i = 0; i < pDiv.childNodes.length; i++) {
      if (pDiv.childNodes[i].nodeName === 'DIV') {
        this.toggleVis(pDiv.childNodes[i], caret);
      }
    }
  }
}
