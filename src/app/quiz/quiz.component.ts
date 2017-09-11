import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common';
import { QuestiondataService } from '../questiondata.service';
import { AppComponent } from '../app.component';


@Component({
	selector: 'app-quiz',
	templateUrl: './quiz.component.html',
	styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges {
	/** is this production or debug mode?*/
	production;
	/** the whole question information as it will be retrieved from votes.json*/
	questionData = [];
	/** the party results for all questions */
	questionResults = {}
	/** currently visible question index*/
	//questionIndex = 0;
	/** currently visible question -- basically equals `this.questionData[this.questionIndex]`*/
	question = {};
	/** actual questions in `question`*/
	actualQuestions = [];
	/** the usesr's answers to the questions, keys are the question ids, values are one of `voteOptions`*/
	answers = {};
	/** current progress in the quiz */
	progress = "0%";
	/** auswertung anzeigen?*/
	resultsVisible = false;
	/** options for votes with: 0 => enthaltung; 1 => ja ; 2 => nein*/
	voteOptions = ['enthaltung', 'ja', 'nein'];
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
	parties = ['gruenen', 'cdu/csu', 'die.linke', 'spd'];
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
	shareText = "https://deinwal.de";
	
	constructor (
			private qserv: QuestiondataService,
			private app: AppComponent,
			private route: ActivatedRoute,
				private router: Router,
			//private params: RouteParams,
			private location: Location
			) {
		
		this.checkSave ();
		this.partypriority = this.parties;
		this.simpleDetails = {};
		
		this.touchDevice = false;

		if (this.doSave) {
//			this.app.log('restoring data from local storage');
			this.getQuestionDataFromLocalStorage();
		}

		this.question = {
			'titel': 'Quiz wird geladen',
			'beschreibung': 'Das kann unter Umständen eine Sekunde dauern...'
		};
		
		this.updatedQuestions = false;
		this.observeUrl ();
		
		/** the following unfortunatelly returns the wrong number?? */
		/*this.location.subscribe ((ev:PopStateEvent) => {
			this.app.log ('browser back/forward detected');
			console.log (this.route.snapshot.params);
		});*/
		
		
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
		return this.app.questionIndex;
	}
	
	updateQuestions (initialCard) {
		this.qserv.getData().subscribe((data) => {
//				this.app.log('retrieved data:', data);
				try {
					this.questionData = data.quiz;
					this.questionResults = data.results;
					
					for (const q of this.questionData) {
						q['fragenIds'] = [];
						for (const f in q['fragen']) {
							if (q['fragen'].hasOwnProperty(f)) {
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
									this.questionResults[f]['gesamt'] = "Vom Bundestag <strong>angenommen mit " + this.questionResults[f]['gesamtja'] + " Ja-Stimmen</strong> bei " + this.questionResults[f]['gesamtnein'] + " Nein-Stimmen und " + this.questionResults[f]['gesamtenthaltung'] + " Enthaltungen";
								} else {
									this.questionResults[f]['gesamt'] = "Vom Bundestag <strong>abgelehnt mit " + this.questionResults[f]['gesamtnein'] + " Nein-Stimmen</strong> bei " + this.questionResults[f]['gesamtja'] + " Ja-Stimmen und " + this.questionResults[f]['gesamtenthaltung'] + " Enthaltungen";
								}
								
							}
						}
					}
					
					
					this.updatedQuestions = true;
				} catch (e) {
					// unexpected votes format?
					console.log('could not parse votes.json', e);
					// show error
					this.question = {
						'titel': 'Es ist ein Fehler aufgetreten!',
						'beschreibung': 'Die Quiz-Daten konnten leider nicht geladen werden. Versuch es später noch einmal!'
					};
				}
				
				
				if (initialCard < 0) {
					this.showResults();
				} else {
					this.showQuestion(initialCard);
				}
				
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
					//this.location.replaceState ('quiz/0');
					this.router.navigate(['quiz', 0], {replaceUrl:true});
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
				//this.location.replaceState ('quiz/0');
				this.router.navigate(['quiz', 0], {replaceUrl:true});
				//console.log ("replacing location to " + 'quiz/0');
			}
		
		});
	}

	/**
	 * print answers in console
	 */
	debugAnswers() {
		console.log(this.answers);
	}

	/**
	 * select an answer
	 */
	choose(id, choice) {
		if (id === 'example') {
			return;
		}
		
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
		//console.log ("showing question " + n);
		this.app.questionIndex = n;
		window.scrollTo(0,0);
		
		// alle more-infos wieder einklappen
		for (const q in this.moreInfos) {
			this.moreInfos[q] = false;
		}

		// there is no question with negative index...
		if (this.app.questionIndex < 0) {
			this.app.questionIndex = 0;
		}
		
//		console.log (this.questionIndex);
//		console.log (this.questionData);

		// if n is bigger than the number of questions -> show results
		if (this.app.questionIndex > this.questionData.length && this.questionData.length > 0) {
			//this.location.replaceState ('quiz/auswertung'); // change URL
			this.router.navigate(['quiz', 'auswertung'], {replaceUrl:true});
			//console.log ("setting location to " + 'quiz/auswertung');
			this.showResults();
		} else if (this.questionData.length == 0) {
			this.resultsVisible = false;
			this.progress = this.toPercent (0);
			this.actualQuestions = [];
		} else if (this.app.questionIndex == 0) {
			this.resultsVisible = false;
			this.router.navigate(['quiz', 0], {replaceUrl:true});
			let themengebiete = "";
			for (let q = 0; q < this.questionData.length; q++) {
				themengebiete += this.questionData[q]['titel'];
				if (q == this.questionData.length - 2) {
					themengebiete += ' und ';
				} else if (q < this.questionData.length - 2) {
					themengebiete += ', ';
				}
			}
			
			this.question = {
				'titel': 'Gleich geht\'s los!',
				'beschreibung': 'Auf den folgenden Quiz-Karten kannst du über Anträge und Gesetzentwürfe aus dem Bundestag entscheiden. '
					+ '<strong>Oben links kannst du die Eingaben in deinem Browser-Profil speichern,</strong> '
					+ 'dann gehen sie nicht verloren wenn du die Seite neu lädst oder kurz eine andere Seite besuchst. <br> <br> '
					+ 'Mit den Knöpfen ganz unten kannst du zwischen den Themengebieten navigieren oder direkt zur Auswertung gelangen. '
					+ 'Du musst nicht zwingend alle Fragen beantworten, sondern kannst Fragen unbeantwortet lassen oder das Quiz '
					+ 'vorzeitig beenden und direkt zur Auswertung wechseln. '
					+ 'Von der Auswertung kannst du natürlich auch jeder Zeit wieder zurück zu den Fragen! '
					+ 'Ganz unten zeigt dir ein grüner Fortschrittsbalken wie weit du bist. <br> <br> '
					+ '<strong>Aus über 200&nbsp;real stattgefundenen Abstimmungen haben wir '
					+ (Object.keys(this.answers).length + 2 /*cause that's the answer! and who's checking that anyway...*/) + '&nbsp;Fragen ausgewählt und in '
					+ this.questionData.length + '&nbsp;Themengebiete unterteilt:</strong> '
					+ themengebiete
					+ '. Jedes Themengebiet wird in einer eigenen Quiz-Karte (so wie diese Seite) angezeigt. '
					+ 'Eine einzelne Abstimmung sieht wie folgt aus:',
				'fragen': {
					'example-1': {
						'context': 'Eine Frage hat manchmal ein bisschen Kontext.',
						'frage': 'Die eigentliche Frage ist aber immer fett gedruckt.',
						'inverted': false,
						'link': 'https://wahlbilanz.de',
						'short': 'example',
						'subtext': 'Über einen Link kannst du mehr zu einer Abstimmung erfahren:',
					}
				}
			};
			this.actualQuestions = ['example-1'];
			this.progress = this.toPercent (0);
			
		} else { // otherwise show question n
			this.router.navigate(['quiz', this.app.questionIndex], {replaceUrl:true});
			this.app.overwriteTitle('Quiz');
			this.resultsVisible = false;
			this.progress = this.toPercent (n / (this.questionData.length + 1));
			this.question = this.questionData[this.app.questionIndex - 1];
			//console.log ("question title " + this.question["titel"]);
			// get sub-questions
			this.actualQuestions = Object.keys(this.question['fragen']);
			//console.log (this.question);
		}
	}



	/**
	 * jump a number of questions forward (n is positiv) or backward (n is negative)
	 */
	nextQuestion(n) {
		let next = this.app.questionIndex + n;
		//this.location.go('quiz/' + next);
		this.router.navigate(['quiz', next]);
		//console.log ("setting location to " + 'quiz/' + next);
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
		//console.log ("showing results");
//		this.location.go('quiz/auswertung') // change URL
		this.router.navigate(['quiz', 'auswertung'], {replaceUrl:true});
		window.scrollTo(0,0);
		this.app.questionIndex = this.questionData.length + 1;
		this.progress = this.toPercent (1);
		this.app.overwriteTitle("Auswertung");

		this.overallResult = { 'gruenen': '-', 'cdu/csu': '-', 'die.linke': '-', 'spd': '-', 'consent': {} };
		const nzustimmung = { 'gruenen': 0.0, 'cdu/csu': 0.0, 'die.linke': 0.0, 'spd': 0.0 };
		let nAnswered = 0;

		for (const q of this.questionData) {
			for (const f in q['fragen']) {
				q['fragen'][f]['consent'] = [];
				q['fragen'][f]['score'] = {};
				if (q['fragen'].hasOwnProperty(f)) {
					if (this.answers[f] >= 0) {
						const opt = this.voteOptions;
						const answer = opt[this.answers[f]];
						const results = this.questionResults[f];
						//console.log (f, this.questionResults[f]);
						nAnswered++;
						for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
							if (!this.overallResult['consent'][partyName]) {
								this.overallResult['consent'][partyName] = 0;
							}
							const tempPunkte = this.getZustimmungsPunkte(results[partyName], answer);
							q['fragen'][f][partyName] = this.toPercent(tempPunkte.punkteRelativ);
							q['fragen'][f]['score'][partyName] = tempPunkte.scoreDescription;
							nzustimmung[partyName] += tempPunkte.punkteRelativ;
							//this.app.log('---h3', partyName, tempPunkte);
							if (tempPunkte.punkteRelativ >= 2/3) {
								q['fragen'][f]['consent'].push (partyName);
								this.overallResult['consent'][partyName]++;
							}
						}
					} else {
						for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
							q['fragen'][f][partyName] = '-';
						}
					}
				}
				//console.log (f, q['fragen'][f]['score']);
			}
		}

		if (nAnswered > 0) {
			this.overallResult['spd'] = this.toPercent(nzustimmung['spd'] / nAnswered);
			this.overallResult['gruenen'] = this.toPercent(nzustimmung['gruenen'] / nAnswered);
			this.overallResult['die.linke'] = this.toPercent(nzustimmung['die.linke'] / nAnswered);
			this.overallResult['cdu/csu'] = this.toPercent(nzustimmung['cdu/csu'] / nAnswered);
			
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
				this.auswertungspodesthoehe = "3em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.09) {
				this.auswertungspodesthoehe = "2em";
			}
			else if (nzustimmung[this.partypriority[this.partypriority.length - 1]] / nAnswered < 0.15) {
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
		let punkte = 0;
		let description = "";
		if (answer === 'enthaltung') { // Enthaltung
			punkte = partyResults[opt[0]] + 0.5 * partyResults[opt[1]] + 0.5 * partyResults[opt[2]];
			description = "(1/2 · Ja + 1/2 · Nein + Enthaltung) / Gesamt = ("
				+ 0.5 * partyResults[opt[1]] + " + " + 0.5 * partyResults[opt[2]] + " + " + partyResults[opt[0]] + ") / " + nAbgegebeneStimmen
				+ " = " + this.toPercent (punkte / nAbgegebeneStimmen);
		} else if (answer === 'ja') { // ja
			punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[1]];
			description = "(Ja + 1/2 · Enthaltung) / Gesamt = ("
				+ partyResults[opt[1]] + " + " + 0.5 * partyResults[opt[0]] + ") / " + nAbgegebeneStimmen
				+ " = " + this.toPercent (punkte / nAbgegebeneStimmen);
		} else if (answer === 'nein') { // nein
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
			case "gruenen":
				return "Bündnis 90/Die Grünen";
			case "cdu/csu":
				return "CDU/CSU";
			case "die.linke":
				return "Die Linke";
			case "spd":
				return "SPD";
			default:
					return "unknown";
		}
	}
	
	getPartyLogo (name) {
		switch(name) {
			case "gruenen":
				return "diegruenen.png";
			case "cdu/csu":
				return "cducsu.png";
			case "die.linke":
				return "dielinke.png";
			case "spd":
				return "spd.png";
			default:
					return "unknown.png";
		}
	}
	
	getPartyClass (name) {
		switch(name) {
			case "gruenen":
				return "diegruenen";
			case "cdu/csu":
				return "cducsu";
			case "die.linke":
				return "dielinke";
			case "spd":
				return "spd";
			default:
					return "unknown";
		}
	}
	
	getVoteOption (voteOption) {
		if (voteOption == -1) {
			return "-";
		}
		switch(this.voteOptions[voteOption]) {
			case "ja":
				return "Ja";
			case "nein":
				return "Nein";
			case "enthaltung":
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
