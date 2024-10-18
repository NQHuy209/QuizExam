import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HomeComponent } from '../../home.component';
import { response } from 'express';
import { ExamComponent } from '../exam.component';
declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  constructor(private authService: AuthService, public home: HomeComponent, private http: HttpClient, public toastr: ToastrService, private router: Router, public examComponent: ExamComponent) { }

  semesters: any;
  examList: any = [];
  isPopupExam: any;
  popupExamIndex: number = 0;
  selectedExam: any;

  ngOnInit(): void {
    this.http.get<any>(`${this.authService.apiUrl}/sem`, this.home.httpOptions).subscribe(response => {
      this.semesters = response;
    })

    this.http.get<any>(`${this.authService.apiUrl}/exam`, this.home.httpOptions).subscribe((data: any) => {
      this.examList = data;
      this.examList.forEach((element: any) => {
        let id = element.id;
        this.isPopupExam = false;
      });
      console.log(this.isPopupExam);
    });
  }

  openPopupExam(exam: any) {
    this.isPopupExam = true;
    this.selectedExam = this.examList.filter((examination: any) => examination.id == exam)[0];
    console.log(this.selectedExam);
  }

  closePopupExam(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Ngăn việc sự kiện click ra ngoài ảnh hưởng đến việc đóng modal
    }
    this.isPopupExam = false;
    this.popupExamIndex = 0; // Reset khi đóng popup
  }

  startExam(examid:any): void {
    this.router.navigateByUrl('/student/home/exam/detail/' + examid);
  };
}
