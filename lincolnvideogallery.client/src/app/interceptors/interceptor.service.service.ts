import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpEventType,
  HttpErrorResponse
} from "@angular/common/http";
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LoaderService } from "../domain/services/loader.service";


@Injectable()
export class InterceptorService implements HttpInterceptor {
  count = 0;
  constructor(private loadingService: LoaderService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.count++;
    return next.handle(request).pipe(
      tap(res => {
        if (res.type === HttpEventType.Sent) {
          this.loadingService.loading$.next(true);
          //console.log('request sent---->' + this.count);
        }

        if (res.type === HttpEventType.Response) {
          this.count--;
          //console.log('response received--->' + this.count);
          if (this.count == 0) {
            this.loadingService.loading$.next(false);
          }


        }
      }),
      // retry(1),
      catchError((err: HttpErrorResponse) => {
        this.count--;
        this.loadingService.loading$.next(false);
        if (err.status === 400) {
          //console.log(err);
        }
        const error = err.statusText; //err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }

}
