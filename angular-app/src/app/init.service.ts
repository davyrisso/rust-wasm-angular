import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    wasm: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private wasmInitializedSubject = new BehaviorSubject<boolean>(false);
  wasmInitialized$ = this.wasmInitializedSubject.asObservable();
  private wasmModule: any = null;

  constructor() {
    // Listen for WASM initialization event
    window.addEventListener('wasm-initialized', () => {
      this.wasmModule = window.wasm;
      this.wasmInitializedSubject.next(true);
    });
  }

  setWasmInitialized() {
    this.wasmModule = window.wasm;
    this.wasmInitializedSubject.next(true);
  }

  isWasmInitialized(): boolean {
    return this.wasmInitializedSubject.value && this.wasmModule !== null;
  }

  getWasmModule(): any {
    return this.wasmModule;
  }
} 