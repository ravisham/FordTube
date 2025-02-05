import { TestBed, inject } from '@angular/core/testing';

import { DetailsForEditResolverService } from './details-for-edit-resolver.service';

describe('DetailsForEditResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetailsForEditResolverService]
    });
  });

  it('should be created', inject([DetailsForEditResolverService], (service: DetailsForEditResolverService) => {
    expect(service).toBeTruthy();
  }));
});
