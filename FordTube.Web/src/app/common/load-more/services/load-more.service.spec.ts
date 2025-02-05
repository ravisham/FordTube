import { TestBed, inject } from '@angular/core/testing';

import { LoadMoreService } from './load-more.service';

describe('LoadMoreService',
  () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [LoadMoreService]
      });
    });

    it('should be created',
      inject([LoadMoreService],
        (service: LoadMoreService) => {
          expect(service).toBeTruthy();
        }));
  });
