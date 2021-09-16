import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public webSocket$: WebSocketSubject<any>;

  constructor() {
    this.webSocket$ = webSocket({
      url: environment.url,
      serializer: this.serializer,
      deserializer: (e: MessageEvent) => JSON.parse(e.data),
    });
  }

  private serializer(value: any) {
    let returnValue;
    switch (typeof value) {
      case 'string':
        returnValue = value;
        break;
      default:
        returnValue = JSON.stringify(value);
    }
    return returnValue;
  }
}
