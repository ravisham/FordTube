import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { FaqService } from '../../domain/services/faq.service';

import { NgbAccordionConfig, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FaqGroupModel } from '../../domain/interfaces/faqgroup.interface';
import { FranchiseType } from '../../../../../LincolnVideoGallery.Web/src/app/domain/enums/franchisetype.enum';
import { UserService } from 'src/app/core/user/user.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FaqComponent implements OnInit {
  faqGroups: FaqGroupModel[];


  constructor(private faqService: FaqService, private userService: UserService, config: NgbAccordionConfig) {
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

  ngOnInit() {
    this.faqService.groups(this.userService.getFranchiseSmart("int") as number).subscribe(
      resultArray => {
        this.faqGroups = resultArray;
        console.log(this.faqGroups);
      },
      error => console.log('Error: ${error}')
    );
  }
}
