import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from "../../core/user/user.service";
import { IUser } from "../../core/user/user";
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';

@Injectable({
  providedIn: 'root'
})
export class UserAdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.userService.users().pipe(
      map((user: IUser | null) => {
        if (user && user.userRoleId === UserRoleEnum.SUPER_ADMIN) {
          return true;
        }
        this.router.navigate(['/access-denied']);
        return false;
      })
    );
  }
}
