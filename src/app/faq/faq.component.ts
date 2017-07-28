import { Component, OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, DoCheck, OnChanges {
  localStorageOn = 'gespeichert';
  
  constructor() {
    this.updateLocalStorage ();
  }

  ngOnInit() {
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
