import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { BASEURL } from '@app/constants';
@Injectable({
  providedIn: 'root',
})
export class GenericHttpService<T> {
  constructor(
    private http: HttpClient,
    @Inject(String) private entity: string
  ) {}
  getAll(): Observable<T[]> {
    return this.http
      .get<T[]>(`${BASEURL}/${this.entity}`)
      .pipe(take(1), catchError(this.handleError));
  }
  getById(id: number): Observable<T> {
    const urlWithId = `${BASEURL}/${this.entity}}/${id}`;
    return this.http
      .get<T>(urlWithId)
      .pipe(take(1), catchError(this.handleError));
  }
  create(data: T): Observable<T> {
    return this.http
      .post<T>(`${BASEURL}/${this.entity}`, data)
      .pipe(take(1), catchError(this.handleError));
  }
  update(data: T): Observable<T> {
    const urlWithId = `${BASEURL}/${this.entity}`;
    return this.http
      .put<T>(urlWithId, data)
      .pipe(take(1), catchError(this.handleError));
  }
  delete(id: number): Observable<number> {
    const urlWithId = `${BASEURL}/${this.entity}/${id}`;
    return this.http
      .delete<number>(urlWithId)
      .pipe(take(1), catchError(this.handleError));
  }
  deleteString(id: string): Observable<number> {
    const urlWithId = `${BASEURL}/${this.entity}/${id}`;
    return this.http
      .delete<number>(urlWithId)
      .pipe(take(1), catchError(this.handleError));
  }

  getProducts(): Observable<T[]> {
    return this.http.get<T[]>(`${BASEURL}/products`);
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  } //errorHandler
}
