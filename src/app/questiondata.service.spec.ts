import { TestBed, inject } from '@angular/core/testing';

import { QuestiondataService } from './questiondata.service';

describe('QuestiondataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestiondataService]
    });
  });

  it('should ...', inject([QuestiondataService], (service: QuestiondataService) => {
    expect(service).toBeTruthy();
  }));
});
