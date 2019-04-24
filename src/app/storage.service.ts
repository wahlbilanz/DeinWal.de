import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
    this.checkSaving ();
  }
  
	cachedData = {};
  doSave = false;
  saveImpossible = false;
  
  private checkSaving () {
		this.doSave = false;
			this.saveImpossible = false;
    try {
			if (localStorage.getItem ('doSave') !== null) {
				this.doSave = JSON.parse(localStorage.getItem('doSave'));
			}
		} catch (e) {
			this.saveImpossible = true;
		}
    
  }
  
	public toggleSave() {
	if (!this.saveImpossible) {
			localStorage.setItem('doSave', JSON.stringify (!this.doSave));
			this.checkSaving ();
			
	}
	}
  
	public isSaving () {
    return this.doSave;
  }
  
  public isSaveImpossible () {
    return this.saveImpossible;
  }
  
	public setItem(item, data, component="global") {
    
    const storageId = component + "::" + item;
    
    this.cachedData[storageId] = data;
    if (this.doSave) {
      localStorage.setItem(storageId, data);
      //console.log ("saving item " + storageId);
      //console.log (data);
    }
    
    return this.cachedData[storageId];
	}
	public getItem(item, component="global") {
    
    const storageId = component + "::" + item;
    
		if (this.doSave && !this.cachedData.hasOwnProperty(storageId)) {
      //console.log ("getting item " + storageId);
      this.cachedData[storageId] = localStorage.getItem(storageId);
      
    }
    //console.log (this.cachedData[storageId]);
    return this.cachedData[storageId];
	}
  clear () {
    //console.log ("clearing storage");
    if (!this.saveImpossible) {
		localStorage.clear(); // clear the whole thing
	}
  this.checkSaving ();
  }
}
