import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private AUTH_HEADER     = 'Authorization';
  // private AUTH_HEADER  = 'accessToken';
  private token           = null;
  private API_URL         = environment.apiEndpointProxy;
  // private API_URL         = environment.apiEndpointLive;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = this.setUrl(req);

    req = this.addAuthenticationToken(req);

    return next.handle(req)
      .pipe(
        // retry(1),
        catchError((error: HttpErrorResponse) => {
          let errorMessage;
          errorMessage = { message: error.message };
          return throwError(errorMessage);
        })
      );
  }

  interceptResponse(data) {
    return {message: data.returnMessage, data: data.returnObject};
  }

  private setUrl(req: HttpRequest<any>): HttpRequest<any> {
    const url = this.API_URL;

    return req.clone({url: url + req.url});
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    this.token = localStorage.getItem('accessToken');
    return request;

    // tslint:disable-next-line: curly
    if (this.token === null) return request;
    return request.clone({headers: request.headers.set(this.AUTH_HEADER, this.token)});
  }
}
