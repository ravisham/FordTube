import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from "../../core/user/user.service";
import { IUser } from "../../core/user/user";
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';
import { UserTypeEnum } from '../../domain/enums/usertype.enum';

@Injectable({
  providedIn: 'root'
})
export class UserEmployeeDealerAdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.userService.user$.pipe(
      map((user: IUser | null) => {
        if (user &&
        (user.userRoleId === UserRoleEnum.DEALER_ADMIN ||
          user.userRoleId === UserRoleEnum.SUPER_ADMIN ||
          user.userRoleId === UserRoleEnum.DEALER ||
          user.userTypeId === UserTypeEnum.Nonovvm ||
          user.userTypeId === UserTypeEnum.Supplier ||
          user.userTypeId === UserTypeEnum.Other)) {
          return true;
        }
        this.router.navigate(['/access-denied']);
        return false;
      })
    );
  }
}
