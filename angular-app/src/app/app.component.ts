import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ViewportComponent } from './viewport/viewport.component';
import { StatusBarComponent } from './status-bar/status-bar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, SidebarComponent, ViewportComponent, StatusBarComponent]
})
export class AppComponent implements AfterViewInit {
  title = '3D Mesh Viewer';
  @ViewChild(ViewportComponent) viewport!: ViewportComponent;
  
  showStats = false;

  ngAfterViewInit(): void {
    // Wait for the next tick to ensure viewport is initialized
    setTimeout(() => {
      this.showStats = true;
    });
  }
}
