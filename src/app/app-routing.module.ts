import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VendorHomeComponent } from './vendor/vendor-home/vendor-home.component';
import { ProductHomeComponent } from '@app/product/product-home/product-home.component';
import { GeneratorComponent } from '@app/purchaseOrder/generator/generator.component';
import { ViewerComponent } from '@app/purchaseOrder/viewer/viewer.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'CaseStudy - Home' },
  {
    path: 'vendors',
    component: VendorHomeComponent,
    title: 'CaseStudy - Vendors',
  },
  {
    path: 'products',
    component: ProductHomeComponent,
    title: 'CaseStudy - Products',
  },
  { path: 'generator', component: GeneratorComponent },

  { path: 'viewer', component: ViewerComponent },

  { path: '', component: HomeComponent, title: 'CaseStudy - Home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
