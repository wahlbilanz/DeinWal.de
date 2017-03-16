import { Injectable } from '@angular/core';

@Injectable()
export class QuestiondataService {
  questions = [
    {
      "id":"Afghanistan1",
      "qtitle":"Soll der Afghanistan-einsatz verlängert werden?",
      "qdescription":"blablabla .... bombem .... Flugzeuge .... 1000 Soldaten ... kinder umbringen ... krankenhäuser aufbauen und zerbomben",

    },
    {
      "id":"Mali1",
      "qtitle":"Fortsetzung des Bundeswehreinsatzes in Mali",
      "qdate":"26.01.2017",
      "qdescription":"Der Bundestag hat eine Ausweitung des Bundeswehreinsatzes in Mali beschlossen. Als einzige Fraktion stimmte die Linke geschlossen gegen den Regierungsantrag.",
      "abgeordnetenwatchLink":"http://www.abgeordnetenwatch.de/fortsetzung_des_bundeswehreinsatzes_in_mali-1105-847.html",
      "results":{
        "overall":{"yes":79.05,"no":8.73,"neutral":0.48,"away":11.75},
        "cdu":{"yes":88.93,"no":0.0,"neutral":0.0,"away":11.07},
        "csu":{"yes":80.36,"no":0.0,"neutral":0.0,"away":19.64},
        "gruen":{"yes":84.13,"no":1.59,"neutral":3.12,"away":11.11},
        "linke":{"yes":0.0,"no":73.44,"neutral":0.0,"away":26.56},
        "spd":{"yes":90.16,"no":3.63,"neutral":0.52,"away":5.70}
      }
    }
  ];

  constructor() { }

}
