import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule]
})
export class StatusBarComponent {
  @Input() vertices: number = 0;
  @Input() edges: number = 0;
  @Input() faces: number = 0;
} 