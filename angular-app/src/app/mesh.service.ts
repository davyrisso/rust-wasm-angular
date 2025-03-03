import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PrimitiveType } from '@wasm/rust_wasm';

@Injectable({
  providedIn: 'root'
})
export class MeshService {
  private primitiveChangeSubject = new Subject<PrimitiveType>();
  private subdivideSubject = new Subject<void>();

  primitiveChange$ = this.primitiveChangeSubject.asObservable();
  subdivide$ = this.subdivideSubject.asObservable();

  changePrimitive(type: PrimitiveType) {
    this.primitiveChangeSubject.next(type);
  }

  subdivide() {
    this.subdivideSubject.next();
  }
} 