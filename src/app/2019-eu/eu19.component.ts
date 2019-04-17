import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common';
import { QuestiondataService } from '../questiondata.service';
import { AppComponent } from '../app.component';


@Component({
	selector: 'app-quiz',
	templateUrl: './eu19.component.html',
	styleUrls: ['./eu19.component.css']
})
export class EuropaWal2019 implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges {
  
  routeId = "europawal2019";
  
  
	/** is this production or debug mode?*/
	production;
	/** the whole question information as it will be retrieved from votes.json*/
	questionData = [];
	/** the party results for all questions */
	questionResults = {}
	/** the usesr's answers to the questions, keys are the question ids, values are one of `voteOptions`*/
	answers = {};
	/** current progress in the quiz */
	progress = "0%";
	/** auswertung anzeigen?*/
	resultsVisible = false;
	/** options for votes with: 0 => enthaltung; 1 => ja ; 2 => nein*/
	voteOptions = ['enthalten', 'dafuer', 'dagegen'];
	/** should we save the answers in the local storage*/
	doSave: boolean = false; // if true: save choices in localStorage
	/** saving is impossible if the users blocks local storage */
	saveImpossible: boolean = false;
	/** auswertung der auswertung*/
	overallResult = {};
	/** text fuer den speichern button */
	speichernText = 'speichern';
	/** text fuer den speichern tooltip */
	speichernTooltip = 'Speichere deine Eingaben lokal in deinem Browser.';
	/** possible parties */
	parties = [];
	/** sequence of parties in auswertung */
	partypriority;
	/** are those already up-to-date questions? */
	updatedQuestions = false;
	/** show details in the simple table? */
	simpleDetails = {};
	/** show details in the complex table? */
	complexDetails = {};
	/** which table to show */
	showComplexTable = false;
	/** is this a touch device? then we shouldn't do hover stuff...*/
	touchDevice = false;
	/** wie hoch soll das auswertungspodest sein? -- wenn eine partei nur wenige stimmen hat, ist der name schwer zu lesen, daher hab ich mal ein podest eingefuehrt */
	auswertungspodesthoehe = "0em";
	/** which divs with moreInfos to show?1 */
	moreInfos = {};
	/** text to share on twitter etc*/
	shareText = "Mit #DeinWal kannst du prüfen, welche Partei wie du denkt!";
	/** topics */
	themengebiete = "";
	/** number of questions */
	nQuestions = 0;
	/** necessary to get the keys of an object in fe */
	Object = Object;
	/** extra alert slide to show notifications and errors */
	alertSlide = {};
	/** should we show the alert? */
	alert = true;
	
	constructor (
			private qserv: QuestiondataService,
			private app: AppComponent,
			private route: ActivatedRoute,
				private router: Router,
			//private params: RouteParams,
			private location: Location
			) {
		if (!this.app.questionIndex.hasOwnProperty(this.routeId))
      this.app.questionIndex[this.routeId] = 0;
		this.parties = [];
		this.partypriority = this.parties;
		this.alert = true;
		this.checkSave ();
		this.simpleDetails = {};
		
		this.touchDevice = false;

		if (this.doSave) {
//			this.app.log('restoring data from local storage');
			this.getQuestionDataFromLocalStorage();
		}

		this.alertSlide = {
			'titel': 'Quiz wird geladen',
			'beschreibung': 'Das kann unter Umständen eine Sekunde dauern...'
		};
		
		this.updatedQuestions = false;
		this.observeUrl ();
	}

	ngOnInit() {
	}
	ngAfterContentInit() {
		this.checkSave ();
	}
	ngAfterViewInit() {
		this.checkSave ();
	}
	ngAfterViewChecked() {
		this.checkSave ();
	}
	ngDoCheck() {
		this.checkSave ();
	}
	ngOnChanges(changes) {
		this.checkSave ();
	}
	
	
	getQuestionIndex () {
		return this.app.questionIndex[this.routeId];
	}
	
	updateQuestions (initialCard) {
		this.qserv.getData(this.routeId).subscribe((data) => {
				this.app.log('retrieved data:', data);
				try {
					this.questionData = data.quiz;
					this.questionResults = data.results;
          
          for (const r in this.questionResults) {
            for (const p in this.questionResults[r]) {
              if (p == "individual")
                continue;
              if (!this.parties.hasOwnProperty (p))
                this.parties.push(p);
            }
            break;
          }
					
					for (const q of this.questionData) {
						if (q.intro)
							continue;
						q['fragenIds'] = [];
						for (const f in q['fragen']) {
							if (q['fragen'].hasOwnProperty(f)) {
                
                // enforce a space after the context of every question.
                // to make sure there is a space between context and actual question
                if (q['fragen'][f]['context'].length > 0 && q['fragen'][f]['context'].substr(q['fragen'][f]['context'].length - 1))
                  q['fragen'][f]['context'] = q['fragen'][f]['context'] + " ";
                
								// -1 means -> not answered yet
								if (!this.answers.hasOwnProperty(f)) {
									this.answers[f] = -1;
								}
								q['fragenIds'].push(f);
								
								this.simpleDetails[f] = false;
								this.complexDetails[f] = false;
								this.moreInfos[f] = false;
								
								if (q['fragen'][f]["invert"]) {
									let curResults = this.questionResults[f];
									for (const party of this.parties) {
										let tmp = curResults[party]['ja'];
										curResults[party]['ja'] = curResults[party]['nein'];
										curResults[party]['nein'] = tmp;
									}
									this.questionResults[f] = curResults;
								}

								for (const opt of this.voteOptions) {
									this.questionResults[f]['gesamt' + opt] = 0;
								}
								
								for (const party of this.parties) {
									this.questionResults[f][party]["relevant"] = 0;
									for (const opt of this.voteOptions) {
										this.questionResults[f][party]["relevant"] += this.questionResults[f][party][opt];
										this.questionResults[f]['gesamt' + opt] += this.questionResults[f][party][opt];
									}
								}

								if (this.questionResults[f]['gesamtja'] > this.questionResults[f]['gesamtnein']) {
									this.questionResults[f]['gesamt'] = "Vom Parlament <strong>angenommen mit " + this.questionResults[f]['gesamtja'] + " Ja-Stimmen</strong> bei " + this.questionResults[f]['gesamtnein'] + " Nein-Stimmen und " + this.questionResults[f]['gesamtenthaltung'] + " Enthaltungen";
								} else {
									this.questionResults[f]['gesamt'] = "Vom Parlament <strong>abgelehnt mit " + this.questionResults[f]['gesamtnein'] + " Nein-Stimmen</strong> bei " + this.questionResults[f]['gesamtja'] + " Ja-Stimmen und " + this.questionResults[f]['gesamtenthaltung'] + " Enthaltungen";
								}
								
							}
						}
					}
          
          
          
					// special stuff for intro card
					for (let q = 0; q < this.questionData.length; q++) {
						this.themengebiete += this.questionData[q]['titel'];
						if (q == this.questionData.length - 2) {
							this.themengebiete += ' und ';
						} else if (q < this.questionData.length - 2) {
							this.themengebiete += ', ';
						}
					}
					this.nQuestions = Object.keys(this.answers).length + 2; /*cause that's the answer! and who's checking that anyway...*/
					
					this.updatedQuestions = true;
				} catch (e) {
					// unexpected votes format?
					this.app.log('could not parse votes.json', e);
					// show error
					this.alertSlide = {
						'titel': 'Es ist ein Fehler aufgetreten!',
						'beschreibung': 'Die Quiz-Daten konnten leider nicht geladen werden. Versuch es später noch einmal!'
					};
					this.alert = true;
				}
				
				
				if (initialCard < 0) {
					this.showResults();
				} else {
					this.showQuestion(initialCard);
				}
				this.alert = false;
				
      //this.app.log (this.questionData)
      this.app.log (this.parties);
		this.partypriority = this.parties;
			},
			err => {
				this.alertSlide = {
					'titel': 'Es ist ein Fehler aufgetreten!',
					'beschreibung': 'Die Quiz-Daten konnten leider nicht geladen werden. Ist die <code>votes_'+this.routeId+'.js</code> korrektes JSON? Versuch es später noch einmal!'
				};
				this.alert = true;
			});
      
	}
	
	observeUrl () {
		// parse route/url
		this.route.params.subscribe(params => {
			//console.log ("found params: ", params);
			try {
				let card = 0;
				// requested auswertung?
				if (params['questionPage']=='auswertung') {
					card = -1;
				} else {
					card = Number.parseInt(params['questionPage']);
				}
				
				// is card number not parseable? -> first question
				if (Number.isNaN(card)) {
					card = 0;
					this.router.navigate(['europawal2019', 0], {replaceUrl:true});
					//console.log ("replacing location to " + 'quiz/0');
				} else {
					if (!this.updatedQuestions) {
						this.updateQuestions (card);
					} else if (card < 0) {
						this.showResults();
					} else {
						this.showQuestion(card);
					}
			
				}
			} catch (e) {
				// if there was an error or nothing is given: show first question
				//console.log('keine question id angegeben ');
				//initialCard = 0;
				this.router.navigate(['europawal2019', 0], {replaceUrl:true});
				//console.log ("replacing location to " + 'quiz/0');
			}
		
		});
	}

	/**
	 * print answers in console
	 */
	debugAnswers() {
		this.app.log(this.answers);
	}

	/**
	 * select an answer
	 */
	choose(id, choice) {
		
		// unselect a previously selected answer
		if (this.answers[id] === choice) {
			this.answers[id] = -1;
		} else {
			// select this answer
			this.answers[id] = choice;
		}
    
		// save the selection (if saving is enabled)
		this.saveQuestionDataToLocalStorage();
	}

	/**
	 * Zeige nur Question Nummer n
	 */
	showQuestion(n) {
    
		this.app.currentQuiz = this.routeId;
    
		this.app.questionIndex[this.routeId] = n;
		window.scrollTo(0,0);
		
		// alle more-infos wieder einklappen
		for (const q in this.moreInfos) {
			this.moreInfos[q] = false;
		}

		// there is no question with negative index...
		if (this.app.questionIndex[this.routeId] < 0) {
			this.app.questionIndex[this.routeId] = 0;
		}
		
//		this.app.log ("show question:");
//		this.app.log (this.app.questionIndex[this.routeId]);
//		this.app.log (this.questionData.length);
//		this.app.log (this.questionData);

		// if n is bigger than the number of questions -> show results
		if (this.app.questionIndex[this.routeId] >= this.questionData.length && this.questionData.length > 0) {
			//this.location.replaceState ('quiz/auswertung'); // change URL
			this.router.navigate(['europawal2019', 'auswertung'], {replaceUrl:true});
			//this.app.log ("setting location to " + 'quiz/auswertung');
			this.showResults();
		} else if (this.questionData.length == 0) {
			this.resultsVisible = false;
			this.progress = this.toPercent (0);
			//this.actualQuestions = [];
		} else { // otherwise show question n
			this.router.navigate(['europawal2019', this.app.questionIndex[this.routeId]], {replaceUrl:true});
			this.app.overwriteTitle('Quiz zur Europawahl 2019');
			this.resultsVisible = false;
			this.progress = this.toPercent (n / (this.questionData.length));
			//this.question = this.questionData[this.app.questionIndex[this.routeId]];
			//this.app.log ("question title " + this.question["titel"]);
			// get sub-questions
			//this.actualQuestions = Object.keys(this.question['fragen']);
			//this.app.log (this.question);
		}
	}



	/**
	 * jump a number of questions forward (n is positiv) or backward (n is negative)
	 */
	nextQuestion(n) {
		let next = this.app.questionIndex[this.routeId] + n;
		//this.location.go('quiz/' + next);
		this.router.navigate(['europawal2019', next]);
		//this.app.log ("setting location to " + 'quiz/' + next);
		this.showQuestion(next); // die entsprechende URL im adressfeld anzeigen und auf history-stack pushen
	}



	/**
	 * beautiful percentage:
	 * give n in [0,1] and get percent in [0.0, 100.0]
	 * with nachkommastellen precision
	 */
	toPercent(n,nachkommastellen=1) {
		let precision = [ 1, 10, 100, 1000, 1000, 10000] //10 ^ x-1
		return (Math.round(100 * precision[nachkommastellen] * n) / (precision[nachkommastellen])) + "%";
	}


	/**
	 * auswertungstabelle generieren und anzeigen
	 */
	showResults() {
		this.router.navigate(['europawal2019', 'auswertung'], {replaceUrl:true});
		window.scrollTo(0,0);
		this.app.questionIndex[this.routeId] = this.questionData.length + 1;
		this.progress = this.toPercent (1);
		this.app.overwriteTitle("Auswertung");

    this.overallResult = {'consent': {}, 'groupedConsent': {}, 'groupedConsentKeys': []};
    const nzustimmung = {};
    
    for (const p of this.parties) {
      this.overallResult[p] = '-';
      nzustimmung[p] = 0.0;
    }
    
		let nAnswered = 0;

		for (const q of this.questionData) {
			if (q.intro)
				continue;
			for (const f in q['fragen']) {
				q['fragen'][f]['consent'] = [];
				q['fragen'][f]['score'] = {};
				if (q['fragen'].hasOwnProperty(f)) {
					if (this.answers[f] >= 0) {
						const opt = this.voteOptions;
						const answer = opt[this.answers[f]];
						const results = this.questionResults[f];
						nAnswered++;
						for (const partyName of this.parties) {
							if (!this.overallResult['consent'][partyName]) {
								this.overallResult['consent'][partyName] = 0;
							}
							const tempPunkte = this.getZustimmungsPunkte(results[partyName], answer);
              q['fragen'][f][partyName] = this.toPercent(tempPunkte.punkteRelativ);
							q['fragen'][f]['score'][partyName] = tempPunkte.scoreDescription;
							nzustimmung[partyName] += tempPunkte.punkteRelativ;
							if (tempPunkte.punkteRelativ >= 2/3) {
								q['fragen'][f]['consent'].push (partyName);
								this.overallResult['consent'][partyName]++;
							}
						}
					} else {
						for (const partyName of this.parties) {
							q['fragen'][f][partyName] = '-';
						}
					}
				}
			}
		}
    
		
		this.shareText = "Mit #DeinWal kannst du prüfen, welche Partei wie du denkt!";
		
		if (nAnswered > 0) {
      for (const partyName of this.parties) {
        this.overallResult[partyName] = this.toPercent(nzustimmung[partyName] / nAnswered);
      }
			
			// set party priority
			for (let i = 0; i < this.partypriority.length; i++) {
				for (let j = i+1; j < this.partypriority.length; j++) {
					if (nzustimmung[this.partypriority[i]] < nzustimmung[this.partypriority[j]]) {
						// swap those two in the sequence
						const tmp = this.partypriority[i];
						this.partypriority[i] = this.partypriority[j];
						this.partypriority[j] = tmp;
					}
				}
			}
			
			if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.04) {
				this.auswertungspodesthoehe = "6em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.09) {
				this.auswertungspodesthoehe = "5em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.15) {
				this.auswertungspodesthoehe = "4em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.20) {
				this.auswertungspodesthoehe = "3em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.25) {
				this.auswertungspodesthoehe = "2em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.30) {
				this.auswertungspodesthoehe = "1em";
			}
			else {
				this.auswertungspodesthoehe = "0em";
			}
			this.shareText = "";
			for (let i = 0; i < this.partypriority.length; i++) {
				this.shareText += this.overallResult[this.partypriority[i]] +  " " + this.getProperPartyName (this.partypriority[i]) + " ";
			}
			this.shareText += " -- sagt #DeinWal";
		}
    
    for (const p in this.overallResult.consent) {
      if (!this.overallResult.groupedConsent.hasOwnProperty (this.overallResult.consent[p])) {
        this.overallResult.groupedConsent[this.overallResult.consent[p]] = [];
        this.overallResult.groupedConsentKeys.push (this.overallResult.consent[p]);
      }
      this.overallResult.groupedConsent[this.overallResult.consent[p]].push (p);
    }
		
		this.shareText = encodeURIComponent (this.shareText);
		this.resultsVisible = true;
	}
  
	/**
	 * hat eine partei mit der antwort eines users uebereingestimmt?
	 *
	 *
	 * @param partyResults object of `voteOptions` (ja/nein/..) -> `anzahl votes`
	 * @param answer human readable vote of user (ja/nein/..)
	 *
	 */
	getZustimmungsPunkte(partyResults, answer) {
		const opt = this.voteOptions;
		let nAbgegebeneStimmen = partyResults[opt[0]] + partyResults[opt[1]] + partyResults[opt[2]];
    // in der eu gibts parties mit nur einer person... wenn die mal nicht da ist -> keine abgegebene stimme -> division durch 0 -> :(
    if (nAbgegebeneStimmen < 1) {
      return { 'punkteRelativ': 0, 'punkteAbsolut': 0, 'nAbgegebeneStimmen': 0, 'scoreDescription': "nicht beteiligt"  };
    }
		let punkte = 0;
		let description = "";
		if (answer === 'enthalten') { // Enthaltung
			punkte = partyResults[opt[0]] + 0.5 * partyResults[opt[1]] + 0.5 * partyResults[opt[2]];
			description = "(1/2 · Ja + 1/2 · Nein + Enthaltung) / Gesamt = ("
				+ 0.5 * partyResults[opt[1]] + " + " + 0.5 * partyResults[opt[2]] + " + " + partyResults[opt[0]] + ") / " + nAbgegebeneStimmen
				+ " = " + this.toPercent (punkte / nAbgegebeneStimmen);
		} else if (answer === 'dafuer') { // ja
			punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[1]];
			description = "(Ja + 1/2 · Enthaltung) / Gesamt = ("
				+ partyResults[opt[1]] + " + " + 0.5 * partyResults[opt[0]] + ") / " + nAbgegebeneStimmen
				+ " = " + this.toPercent (punkte / nAbgegebeneStimmen);
		} else if (answer === 'dagegen') { // nein
			punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[2]];
			description = "(Nein + 1/2 · Enthaltung) / Gesamt = ("
				+ partyResults[opt[2]] + " + " + 0.5 * partyResults[opt[0]] + ") / " + nAbgegebeneStimmen
				+ " = " + this.toPercent (punkte / nAbgegebeneStimmen);
		} else {
			// wenn der Benutzer gar keine Antwort ausgewaehlt hat
			// sowol punkte als auch nAbgegebeneStimmen auf 0 setzen, damit sie nicht ins gesamtergebnis reinzaehlen:
			punkte = 0;
			nAbgegebeneStimmen = 0;
		}
		return { 'punkteRelativ': (punkte / nAbgegebeneStimmen), 'punkteAbsolut': punkte, 'nAbgegebeneStimmen': nAbgegebeneStimmen, 'scoreDescription':description  };
	}



	getProperPartyName (nonproper) {
		switch(nonproper) {
			case "GRUENE":
				return "Bündnis 90/Die Grünen";
			case "CDU/CSU":
				return "CDU/CSU";
			case "LINKE":
				return "Die Linke";
			case "SPD":
				return "SPD";
			case "FDP":
				return "FDP";
			case "OEDP":
				return "ÖDP";
			case "BUENDNISC":
				return "Bündnis C";
			case "ALFA":
				return "ALFA";
			case "DIEPARTEI":
				return "Die PARTEI";
			case "AFD":
				return "AfD";
			case "NPD":
				return "NPD";
			case "BLAUE":
				return "Die Blauen";
			case "FREIEWAEHLER":
				return "Freie Wähler";
			case "PIRATEN":
				return "Piraten";
			default:
      this.app.log ("do not know party " + name);
					return "unknown";
		}
	}
	
	getPartyLogo (name) {
		switch(name) {
			case "GRUENE":
				return "diegruenen.png";
			case "CDU/CSU":
				return "cducsu.png";
			case "LINKE":
				return "dielinke.png";
			case "SPD":
				return "spd.png";
			case "FDP":
				return "fdp.png";
			case "OEDP":
				return "oedp.png";
			case "BUENDNISC":
				return "buendnisc.png";
			case "ALFA":
				return "alfa.png";
			case "DIEPARTEI":
				return "diepartei.png";
			case "AFD":
				return "afd.png";
			case "NPD":
				return "npd.png";
			case "BLAUE":
				return "blaue.png";
			case "FREIEWAEHLER":
				return "freiewaehler.png";
			case "PIRATEN":
				return "piraten.png";
			default:
      this.app.log ("do not know party " + name);
					return "unknown.png";
		}
	}
	
	getPartyClass (name) {
		switch(name) {
			case "GRUENE":
				return "diegruenen";
			case "CDU/CSU":
				return "cducsu";
			case "LINKE":
				return "dielinke";
			case "SPD":
				return "spd";
			case "FDP":
				return "fpd";
			case "OEDP":
				return "oedp";
			case "BUENDNISC":
				return "buendnisc";
			case "ALFA":
				return "alfa";
			case "DIEPARTEI":
				return "diepartei";
			case "AFD":
				return "afd";
			case "NPD":
				return "npd";
			case "BLAUE":
				return "blaue";
			case "FREIEWAEHLER":
				return "freiewaehler";
			case "PIRATEN":
				return "piraten";
			default:
      this.app.log ("do not know party " + name);
					return "unknown";
		}
	}
	
	getVoteOption (voteOption) {
		if (voteOption == -1) {
			return "-";
		}
		switch(this.voteOptions[voteOption]) {
			case "dafuer":
				return "Ja";
			case "dagegen":
				return "Nein";
			case "enthalten":
				return "Enthaltung"
			default:
					return "unknown";
		}
	}

	  @HostListener('touchstart', ['$event'])
	  @HostListener('touchend', ['$event'])
	  @HostListener('touchcancel', ['$event'])
	  handleTouch(ev){
		  this.touchDevice = true;
	  }
	
	toggleSimpleDetails (qid) {
		this.simpleDetails[qid] = !this.simpleDetails[qid];
	}
	
	
	toggleComplexDetails (qid) {
		this.complexDetails[qid] = !this.complexDetails[qid];
	}
	
	
	toggleComplexTable() {
		this.showComplexTable = !this.showComplexTable;
	}
	
	toggleMoreInfos (qid)
	{
		this.moreInfos[qid] = !this.moreInfos[qid];
	}
	

	// below is local storage stuff


	toggleSave() {
	if (!this.saveImpossible) {
			localStorage.setItem('doSave', JSON.stringify (!this.doSave));
			this.checkSave ();
			
			if (this.doSave) {
				this.saveQuestionDataToLocalStorage();
			} else {
				this.eraseQuestionDataFromLocalStorage();
			}
	}
	}

	checkSave () {
		this.doSave = false;
		
		try {
			if (localStorage.getItem ('doSave') !== null) {
				this.doSave = JSON.parse(localStorage.getItem('doSave'));
			}
		} catch (e) {
			this.saveImpossible = true;
		}

		if (this.doSave) {
			this.speichernText = 'gespeichert';
			this.speichernTooltip = 'Deine Eingaben werden in deinem Browser gespeichert. Nochmal drücken zum Löschen.';
		} else if (this.saveImpossible) {
				this.speichernText = 'speichern nicht möglich';
				this.speichernTooltip = 'Dein Browser erlaubt keine Cookies und/oder local Storage. Deine Eingaben gehen verloren wenn du das Fenster schliesst oder neu lädst.';
		} else {
			this.speichernText = 'speichern';
			this.speichernTooltip = 'Speichere deine Eingaben lokal in deinem Browser.';
		}
	}

	eraseQuestionDataFromLocalStorage() {
	if (!this.saveImpossible) {
		localStorage.clear(); // clear the whole thing
	}
	}

	saveQuestionDataToLocalStorage() {
		if (this.doSave) {
			localStorage.setItem('questionData', JSON.stringify(this.questionData));
			localStorage.setItem('questionResults', JSON.stringify(this.questionResults));
			localStorage.setItem('answers', JSON.stringify(this.answers));
		}
	}

	getQuestionDataFromLocalStorage() {
	this.questionResults = JSON.parse(localStorage.getItem('questionResults'));
		this.questionData = JSON.parse(localStorage.getItem('questionData'));
		this.answers = JSON.parse(localStorage.getItem('answers'));
		this.doSave = JSON.parse(localStorage.getItem('doSave'));
	}




}
