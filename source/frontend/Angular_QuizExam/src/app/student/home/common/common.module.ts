import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    // HeaderComponent,
    // FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [RouterModule]
})
export class ImportModule {
  
 }
