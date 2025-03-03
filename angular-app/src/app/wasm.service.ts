import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WasmService {
  private initializedSubject = new BehaviorSubject<boolean>(false);
  initialized$ = this.initializedSubject.asObservable();

  setInitialized() {
    this.initializedSubject.next(true);
  }

  isInitialized(): boolean {
    return this.initializedSubject.value;
  }
} 