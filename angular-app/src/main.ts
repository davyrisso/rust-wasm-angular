import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { InitService } from './app/init.service';

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    InitService
  ]
}).catch(err => console.error(err));
