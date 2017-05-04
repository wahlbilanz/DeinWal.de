# WahlWal Prototyp in Angular 2 und Typescript

## Installation

 * nodejs und npm installieren
 * angular 2 installieren
 * angular-cli installieren
 * im Ordner hier drüber `npm install` tipseln
 * `ng serve` startet einen server. App kann über localhost:4200 aufgerufen werden

 * bauen: `ng build`
 * besseres bauen:
 `ng build --prod --bh / -d /`
 danach ist alles in dist\ zu finden

## The Docker way

* work on it:

    docker run --rm -it -v /PATH/TO/PROJECT:/usr/src/app -p 4200:4200 binfalse/angular-cli

* compile a release:

    docker run --rm -it -v /PATH/TO/PROJECT:/usr/src/app -p 4200:4200 binfalse/angular-cli ng build --prod --bh / -d /

* serve the release through an nginx:

    docker run --rm -it -p 8081:80 -v /PATH/TO/PROJECT/dist:/usr/share/nginx/html:ro nginx

 ## Wichtige Dateien

 Alles wichtige ist im Ordner src\app\ und dann:

 questiondata.service.ts --> enthält alle "Daten"

 quiz\quiz.component.html --> layout für das Quiz

 quiz\quiz.component.ts --> logik hinterm Quiz

## UI mit W3.CSS

Als CSS-Framework wird jetzt auf [w3.css](https://www.w3schools.com/w3css/w3css_intro.asp) gesetzt.

