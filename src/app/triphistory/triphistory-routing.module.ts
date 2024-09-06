import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TriphistoryPage } from './triphistory.page';

const routes: Routes = [
  {
    path: '',
    component: TriphistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TriphistoryPageRoutingModule {}
