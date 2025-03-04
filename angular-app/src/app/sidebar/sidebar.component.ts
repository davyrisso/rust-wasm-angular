import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MeshService } from '../mesh.service';
import { PrimitiveType } from '@wasm/rust_wasm';

interface PrimitiveOption {
  value: PrimitiveType;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule]
})
export class SidebarComponent {
  primitiveTypes: PrimitiveOption[] = [
    { value: PrimitiveType.Cube, label: 'Cube' },
    { value: PrimitiveType.Tetrahedron, label: 'Tetrahedron' },
    { value: PrimitiveType.Octahedron, label: 'Octahedron' }
  ];
  selectedPrimitive = PrimitiveType.Cube;

  constructor(private meshService: MeshService) {}

  onPrimitiveChange(): void {
    this.meshService.changePrimitive(this.selectedPrimitive);
  }

  onSubdivide(): void {
    this.meshService.subdivide();
  }
} 