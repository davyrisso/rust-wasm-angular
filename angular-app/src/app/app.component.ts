import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThreeViewerComponent } from './three-viewer/three-viewer.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      <app-three-viewer></app-three-viewer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .app-container {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `],
  standalone: true,
  imports: [SidebarComponent, ThreeViewerComponent]
})
export class AppComponent {
  title = '3D Mesh Viewer';
}
