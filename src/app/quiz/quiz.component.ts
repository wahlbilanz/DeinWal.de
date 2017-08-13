import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges } from '@angular/core';
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

		if (this.doSave) {
//			this.app.log('restoring data from local storage');
			this.getQuestionDataFromLocalStorage();
		}

		this.question = {
			'titel': 'Quiz wird geladen',
			'beschreibung': 'Das kein unter Umstaenden eine Sekunde dauern...'
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
								
								if (q['fragen'][f]["invert"]) {
									let curResults = this.questionResults[f];
									for (const party of this.parties) {
										let tmp = curResults[party]['ja'];
										curResults[party]['ja'] = curResults[party]['nein'];
										curResults[party]['nein'] = tmp;
									}
									this.questionResults[f] = curResults;
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
						'beschreibung': 'Die Quiz-Daten konnten leider nicht geladen werden. Versuch es spaeter noch einmal!'
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
			console.log ("found params: ", params);
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
					console.log ("replacing location to " + 'quiz/0');
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
				console.log('keine question id angegeben ');
				//initialCard = 0;
				//this.location.replaceState ('quiz/0');
				this.router.navigate(['quiz', 0], {replaceUrl:true});
				console.log ("replacing location to " + 'quiz/0');
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
		console.log ("showing question " + n);
		this.app.questionIndex = n;
		window.scrollTo(0,0);

		// there is no question with negative index...
		if (this.app.questionIndex < 0) {
			this.app.questionIndex = 0;
		}
		
//		console.log (this.questionIndex);
//		console.log (this.questionData);

		// if n is bigger than the number of questions -> show results
		if (this.app.questionIndex >= this.questionData.length && this.questionData.length > 0) {
			//this.location.replaceState ('quiz/auswertung'); // change URL
			this.router.navigate(['quiz', 'auswertung'], {replaceUrl:true});
			console.log ("setting location to " + 'quiz/auswertung');
			this.showResults();
		} else if (this.questionData.length == 0) {
			this.resultsVisible = false;
			this.progress = this.toPercent (0);
			this.actualQuestions = [];
		} else { // otherwise show question n
			this.router.navigate(['quiz', this.app.questionIndex], {replaceUrl:true});
			this.app.overwriteTitle('Quiz');
			this.resultsVisible = false;
			this.progress = this.toPercent (n / this.questionData.length);
			this.question = this.questionData[this.app.questionIndex];
			console.log ("question title " + this.question["titel"]);
			// get sub-questions
			this.actualQuestions = Object.keys(this.question['fragen']);
		}
	}



	/**
	 * jump a number of questions forward (n is positiv) or backward (n is negative)
	 */
	nextQuestion(n) {
		let next = this.app.questionIndex + n;
		//this.location.go('quiz/' + next);
		this.router.navigate(['quiz', next]);
		console.log ("setting location to " + 'quiz/' + next);
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
		console.log ("showing results");
//		this.location.go('quiz/auswertung') // change URL
		this.router.navigate(['quiz', 'auswertung'], {replaceUrl:true});
		window.scrollTo(0,0);
		this.app.questionIndex = this.questionData.length;
		this.progress = this.toPercent (1);
		this.app.overwriteTitle("Auswertung");

		this.overallResult = { 'gruenen': '-', 'cdu/csu': '-', 'die.linke': '-', 'spd': '-' };
		const nzustimmung = { 'gruenen': 0.0, 'cdu/csu': 0.0, 'die.linke': 0.0, 'spd': 0.0 };
		let nAnswered = 0;

		for (const q of this.questionData) {
			for (const f in q['fragen']) {
				q['fragen'][f]['consent'] = [];
				if (q['fragen'].hasOwnProperty(f)) {
					if (this.answers[f] >= 0) {
						const opt = this.voteOptions;
						const answer = opt[this.answers[f]];
						const results = this.questionResults[f];
						nAnswered++;
						for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
							const tempPunkte = this.getZustimmungsPunkte(results[partyName], answer);
							q['fragen'][f][partyName] = this.toPercent(tempPunkte.punkteRelativ);
							nzustimmung[partyName] += tempPunkte.punkteRelativ;
							//this.app.log('---h3', partyName, tempPunkte);
							if (tempPunkte.punkteRelativ >= 2/3) {
								q['fragen'][f]['consent'].push (partyName);
							}
						}
					} else {
						for (const partyName of ['gruenen', 'cdu/csu', 'spd', 'die.linke']) {
							q['fragen'][f][partyName] = '-';
						}
					}
				}
				console.log (f, q['fragen'][f]['consent']);
			}
		}

		if (nAnswered > 0) {
			this.overallResult['spd'] = this.toPercent(nzustimmung['spd'] / nAnswered);
			this.overallResult['gruenen'] = this.toPercent(nzustimmung['gruenen'] / nAnswered);
			this.overallResult['die.linke'] = this.toPercent(nzustimmung['die.linke'] / nAnswered);
			this.overallResult['cdu/csu'] = this.toPercent(nzustimmung['cdu/csu'] / nAnswered);
			
			// TODO: set party priority
			
		}
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
		if (answer === 'enthaltung') { // Enthaltung
			punkte = partyResults[opt[0]] + 0.5 * partyResults[opt[1]] + 0.5 * partyResults[opt[2]];
		} else if (answer === 'ja') { // ja
			punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[1]];
		} else if (answer === 'nein') { // nein
			punkte = 0.5 * partyResults[opt[0]] + partyResults[opt[2]];
		} else {
			// wenn der Benutzer gar keine Antwort ausgewaehlt hat
			// sowol punkte als auch nAbgegebeneStimmen auf 0 setzen, damit sie nicht ins gesamtergebnis reinzaehlen:
			punkte = 0;
			nAbgegebeneStimmen = 0;
		}
		return { 'punkteRelativ': (punkte / nAbgegebeneStimmen), 'punkteAbsolut': punkte, 'nAbgegebeneStimmen': nAbgegebeneStimmen };
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
