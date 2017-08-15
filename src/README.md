# DeinWal.de in Angular 2 und Typescript

## Code Aufbau

Die eigentliche Web-Applikation befindet sich im Verzeichnis `app` und besteht aus 4 Modulen.
Die Module `home`, `faq` und `impressum` sind eher statischer Natur.
Der Kern der Webseite bildet das [`quiz` Modul](app/quiz/).
Die einzelnen Fragen und Abstimmungsergebnisse der Parteien findest du in der [Datei `assets/votes.json`].

Die Module bestehen jeweils aus 4 Komponenten:

* eine HTML Datei beschreibt wie die Seite fuer den Browser aufgebaut wird
* eine CSS Datei anthält Layout-Definitionen (zusätzlich zum W3.CSS)
* eine TS Datei bringt dynamische Inhalte in die Webseite
* die `.spec.ts` kannst du getrost ignorieren

Das User-Interface wird mit [W3.CSS gestaltet](https://www.w3schools.com/w3css/w3css_intro.asp).

## Installation

Um die Webseite kompilieren zu können musst du Angular2 installiert haben.
Eine [Installationsanleitung und weitere Doku findest du auf angular.io](https://angular.io/guide/quickstart). 

Die Abhängigkeiten der Webseite kannst du dann einfach mittels `npm install` aus dem [Ordner hierdrüber](..) installieren.
Mit `ng serve` startet einen Server, der die aktuelle Version der Webseite auf [localhost:4200](http://localhost:4200) ausliefert.

Ein Release kann mit `ng build --prod --bh / -d /` erzeugt werden.
Die Files sind dann alle in `dist/` zu finden.

## The Docker way

Du kannst Angular2 im Docker-Container laufen lassen während du daran arbeitest:

    docker run --rm -it -v /PATH/TO/PROJECT:/usr/src/app -p 4200:4200 binfalse/angular-cli

Um ein release zu kompilieren rufst du einfach wieder den build-Befehl auf:

    docker run --rm -it -v /PATH/TO/PROJECT:/usr/src/app -p 4200:4200 binfalse/angular-cli ng build --prod --bh / -d /

Ein weiterer Docker-Container mit nginx kann das Projekt dann ganz einfach ausliefern:

    docker run --rm -it -p 80:80 -v /PATH/TO/PROJECT/dist:/usr/share/nginx/html:ro nginx

