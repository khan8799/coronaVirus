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
  private token           = null;
  // private API_URL         = environment.apiURL;
  // private API_URL         = environment.apiEndpoint;
  private API_URL         = environment.apiEndpointProxy;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.headers.has('Content-Type')) {
      req = req.clone({headers: req.headers.set('Content-Type', 'application/json')});
    }

    req = this.setUrl(req);

    req = this.addAuthenticationToken(req);

    return next.handle(req)
      .pipe(
        retry(1),
        map(response => {
          if (response instanceof HttpResponse) {
            response = response.clone({ body: this.interceptResponse(response.body) });
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          let errorMessage;
          if (error.error instanceof ErrorEvent) {
            errorMessage = { message: error.message };
          } else {
            errorMessage = {
              message: error.error.exception.errorMessage
            };
          }

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

    // tslint:disable-next-line: curly
    if (this.token === null) return request;

    return request.clone({headers: request.headers.set(this.AUTH_HEADER, 'Bearer ' + this.token)});
  }
}
