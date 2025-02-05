import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { FaqService } from '../../domain/services/faq.service';

import { NgbAccordionConfig, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FaqGroupModel } from '../../domain/interfaces/faqgroup.interface';
import { FranchiseType } from '../../../../../LincolnVideoGallery.Web/src/app/domain/enums/franchisetype.enum';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FaqComponent implements OnInit {
  faqGroups: FaqGroupModel[];

  constructor(private faqService: FaqService, config: NgbAccordionConfig) {
    config.closeOthers = true;
  }

  public updateTracking(event: NgbPanelChangeEvent) {
    if(event.nextState == true){
      window['dataLayer'].push({
        event: 'faq',
        title: event.panelId
      });
    }
  }

  private get franchise() {
    const franchiseFromSessionStorage = sessionStorage.getItem('Franchise');

    if (!franchiseFromSessionStorage) {
      return null;
    }

    switch (franchiseFromSessionStorage) {
      case 'Ford':
        return FranchiseType.Ford;
      case 'Lincoln':
        return FranchiseType.Lincoln;
      case 'Both':
        return FranchiseType.Both;
      default:
        break;
    }
  }


  ngOnInit() {
    this.faqService.groups(this.franchise).subscribe(
      resultArray => {
        this.faqGroups = resultArray;
        console.log(this.faqGroups);
      },
      error => console.log('Error: ${error}')
    );
  }
}
