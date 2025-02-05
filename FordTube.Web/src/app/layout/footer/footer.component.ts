import { OnInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';
import { getCookie } from '../../common/utilities/cookie-utilities';
import { CategoriesService } from '../../domain/services/categories.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @ViewChild('footerSearch', { static: false })
  private _inputElement: ElementRef;

  year = new Date().getFullYear().toString();
  query: string;
  categories = [];
  sections = {
    Resources: {
      id: 0,
      isCollapsed: true
    },
    VideoCategories: {
      id: 1,
      isCollapsed: true
    },
    RelatedSites: {
      id: 2,
      isCollapsed: true
    },
    Admin: {
      id: 3,
      isCollapsed: true
    }
  };

  constructor(private router: Router, private elementRef: ElementRef, private categoriesService: CategoriesService) {}

  get showDealerItems() {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return userRole === UserRoleEnum.SUPER_ADMIN || userRole === UserRoleEnum.DEALER_ADMIN || userRole === UserRoleEnum.DEALER;
  }

  get showAdminItems() {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return userRole === UserRoleEnum.SUPER_ADMIN || userRole === UserRoleEnum.DEALER_ADMIN;
  }

  searchPressed() {
    this.router.navigate(['/search'], { queryParams: { q: this.query } });
    this.query = '';
    return false;
  }

  fmcClick() {
    window.open('http://www.fmcdealer.dealerconnection.com', '_blank');
  }

  lincolnClick() {
    if (environment.franchise === 0) {
      window.open(environment.lincolnUrl, '_blank');
    } else {
      window.open(environment.fordtubeUrl, '_blank');
    }
  }
  focusInput() {
    this._inputElement.nativeElement.focus();
  }

  ngOnInit() {
    this.categoriesService.getRoot().subscribe(
      response => {
        this.categories = response;
        console.log(response);
      },
      error => console.log('Error: ', error)
    );
  }
}
