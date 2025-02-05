import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
/**
 * @description LoginComponent handles the login process.
 */
@Component({
  selector: 'app-login',
  template: '<p>Redirecting to login...</p>',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || '/';
      console.log('returnUrl:', returnUrl); 
      this.authService.redirectToAdfs(returnUrl);
    });
    
  }
}
