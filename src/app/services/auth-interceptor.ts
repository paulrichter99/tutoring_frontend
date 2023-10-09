import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import { ACCESS_TOKEN } from "../variables/variables";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem(ACCESS_TOKEN);

    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set("Authorization",
                                 "Bearer " + idToken)
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
