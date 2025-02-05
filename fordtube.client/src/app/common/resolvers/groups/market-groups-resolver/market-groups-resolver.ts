import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { UserGroupModel } from '../../../../domain/interfaces/usergroup.interface';
import { GroupsService } from '../../../../domain/services/groups.service';

@Injectable({
  providedIn: 'root'
})
export class MarketGroupsResolverService implements Resolve<UserGroupModel[]> {
  constructor(private groupsService: GroupsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserGroupModel[]> {
    return this.groupsService.marketGroups().pipe(response => response);
  }
}
