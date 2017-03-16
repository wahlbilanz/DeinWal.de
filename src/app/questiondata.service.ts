import { Injectable } from '@angular/core';

@Injectable()
export class QuestiondataService {
  questions = [
    {
      "id":"Afghanistan1",
      "qtitle":"Soll der Afghanistan-einsatz verlängert werden?",
      "qdescription":"blablabla .... bombem .... Flugzeuge .... 1000 Soldaten ... kinder umbringen ... krankenhäuser aufbauen und zerbomben",
      "results":{
        "overall":{"yes":66.05,"no":6.73,"neutral":6.48,"away":6.75},
        "cdu":{"yes":77.93,"no":7.0,"neutral":0.0,"away":7.07},
        "csu":{"yes":55.36,"no":0.0,"neutral":55.0,"away":55.64},
        "gruen":{"yes":44.13,"no":4.59,"neutral":4.12,"away":44.11},
        "linke":{"yes":27.0,"no":72.44,"neutral":2.0,"away":22.56},
        "spd":{"yes":33.16,"no":3.63,"neutral":33.52,"away":33.70}
      }
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

  getResultById(id:string){
    //there should be a better way... but who cares..
    for(let question of this.questions){
      if (question.id==id){
        return question.results;
      }
    }
    return null; //not found
  }

  getDefinitiveAnswerByIdAndParty(id:string,party:string){
    let result = this.getResultById(id);
    let partyResults = result[party]; //like this: {"yes":79.05,"no":8.73,"neutral":0.48,"away":11.75}
    //now get the answer with the highest percent points:
    let maxAnswer = 'dunno';
    let maxPercentage = -0.0;
    for(let answer in partyResults){
      if(partyResults[answer]>maxPercentage){
        maxAnswer = answer; //'yes' or 'no' or...
        maxPercentage = partyResults[answer];
      }
    }
    return maxAnswer;
  }

  getNRandomQuestions(n:number){
    return this.questions;
  }

}
