import { Component, enableProdMode } from '@angular/core';
import { settings } from './settings';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { QuestiondataService } from './questiondata.service';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:beforeunload)': 'beforeunload($event)'
  }
})
export class AppComponent {
	
   beforeunload(event){
     if (!this.storage.isSaving ()) {
       var message = 'Deine Eingaben sind nicht gespeichert! Wenn du die Seite verlässt, geht alle Antworten verloren. Bist du sicher, dass du nicht vorher nochmal speichern möchtest?';
       // TODO the confirm message is default -> how to set our message??
        if (typeof event == 'undefined') {
          event = window.event;
        }
        if (event) {
          event.preventDefault();
          event.returnValue = message;
        }
        return message;
    }
   }
   
  
	questionIndex = {};
  currentQuiz = "";
  
  // setup route-listener to update title of the page 
  constructor(router:Router,
      private titleService:Title,
      private qserv: QuestiondataService,
			private storage: StorageService) {
        
        this.storage.isSaving ();
        
       router.events.subscribe((event)=>{ 
          if(event instanceof NavigationEnd) {
            var title = this.getTitle(router.routerState, router.routerState.root).join('-');
//            console.log('title', title);
            titleService.setTitle(title + " | "  + settings.title);
          }
       });
     if (settings.production)
       enableProdMode ();
       
      this.qserv.getData ("europawal2019").subscribe((data) => { this.log('preloaded votes for eu19 :)'); });
      this.qserv.getData ("bundestagswal2017").subscribe((data) => { this.log('preloaded votes for btw17 :)'); });
    }
  
  /**
   * overwrite the page title
   * 
   * this way components can overwrite the page's title.
   * `settings.title` will always be appended!
   */
  overwriteTitle (title) {
    this.titleService.setTitle(title + " | "  + settings.title);
  }
  
  
  
  /**
   * print some debug message, unless we're in production mode...
   */
  log (...msg) {
    if (!settings.production)
      console.log (msg);
  }
  
  
  
  // get the title based on route-definition
  getTitle (state, parent) {
    var data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if(state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }
  
  
}
