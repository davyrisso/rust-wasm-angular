import { Component, OnInit } from '@angular/core';
import { PrimitiveType } from '@wasm/rust_wasm';
import { MeshService } from '../mesh.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class SidebarComponent implements OnInit {
  primitiveTypes = [
    { value: PrimitiveType.Cube, label: 'Cube' },
    { value: PrimitiveType.Tetrahedron, label: 'Tetrahedron' },
    { value: PrimitiveType.Octahedron, label: 'Octahedron' }
  ];
  selectedPrimitive = PrimitiveType.Cube;

  constructor(private meshService: MeshService) { }

  ngOnInit(): void { }

  onPrimitiveChange(): void {
    this.meshService.changePrimitive(this.selectedPrimitive);
  }

  subdivide(): void {
    this.meshService.subdivide();
  }
} 