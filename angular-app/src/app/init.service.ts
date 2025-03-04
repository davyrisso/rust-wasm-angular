import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private wasmInitializedSubject = new BehaviorSubject<boolean>(false);
  wasmInitialized$ = this.wasmInitializedSubject.asObservable();

  constructor() {
    window.addEventListener('wasm-initialized', () => {
      this.wasmInitializedSubject.next(true);
    });
  }

  isWasmInitialized(): boolean {
    return this.wasmInitializedSubject.value;
  }

  getWasmModule(): any {
    return (window as any).wasm;
  }
} 