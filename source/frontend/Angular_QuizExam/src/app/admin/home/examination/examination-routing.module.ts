
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../service/authguard.service';

import { ExaminationComponent } from './examination.component';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: ExaminationComponent,
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'examform',
        component: FormComponent
      },
      {
        path: ':detail',
        component: DetailComponent,
      },
     
    ],
    canActivate: [AuthGuard],
    data: {roles: ['ADMIN', 'DIRECTOR', 'SRO']},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExaminationRoutingModule { }