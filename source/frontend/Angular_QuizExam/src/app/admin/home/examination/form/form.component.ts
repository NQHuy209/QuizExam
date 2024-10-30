
import { ExaminationComponent } from '../examination.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeComponent } from '../../home.component';
declare var $: any;

interface ExamForm {
  name: string; 
  duration: number; 
  startTime: any; 
  endTime: any; 
  classes: number[];
  students: number[];
  subjectId: number;
  chapterIds: number[];
  levelIds: number[];
}
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})

export class FormComponent implements OnInit {
  constructor(private authService: AuthService, private home: HomeComponent, private http: HttpClient, public toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, public examComponent: ExaminationComponent) {

  }
  subjects: any;
  subjectId: number = 1;
  subjectName: any;

  selectedSubject: number = 1;
  listLevel = [
    { id: 1, name: 'Easy'},
    { id: 2, name: 'Medium'},
    { id: 3, name: 'Hard'}
  ];
  
  isPopupLevel = false;

  //classList: number[] = [];

  examsForm: ExamForm = {
    name: '',
    duration: 30,
    startTime: "",
    endTime: "",
    classes: [],
    students: [],
    subjectId: 1,
    chapterIds: [],
    levelIds: []
  };
  checkedStates: any;

  createdExam: any;

  
  createExam() {
    const exam = {
      name: this.examsForm.name,
      duration: this.examsForm.duration,
      startTime: this.examsForm.startTime,
      endTime: this.examsForm.endTime,
      subjectId: this.examsForm.subjectId,
      levels: this.levelId
    };

    if (!this.validateLevel()) {
      this.http.post(`${this.authService.apiUrl}/exam`, exam, this.home.httpOptions).subscribe(
        response => {
          this.toastr.success('Create exam Successful!', 'Success', {
            timeOut: 2000,
          });
          this.createdExam = response;
          this.examComponent.step = true;
          this.router.navigate(['/admin/home/exam/addStudent/1/1']);
        },
        error => {
          if (error.status === 401) {
            this.toastr.error('Unauthorized', 'Failed', {
              timeOut: 2000,
            });
          } else {
            let msg = '';
            if (error.error.message) {
              msg = error.error.message;
            } else {
              error.error.forEach((err: any) => {
                msg += ' ' + err.message;
              })
            }
            this.toastr.error(msg, 'Failed', {
              timeOut: 2000,
            });
          }
          console.log('Error', error);
        }
      )
    }
  }

  levelId: { [key: string]: number; } = {};

  ngOnInit(): void {
    //this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) ?? 0;
    this.http.get<any>(`${this.authService.apiUrl}/subject`, this.home.httpOptions).subscribe(response => {
      this.subjects = response;
    });
    this.initializeLevel();

    this.listLevel.forEach((element:any) => {
      this.levelId[element.id as string] = 0;
      console.log(this.levelId);
    });
  }

  initializeLevel(): void {
    this.http.get<any>(`${this.authService.apiUrl}/level`, this.home.httpOptions).subscribe((data: any) => {
      this.listLevel = data; 
      console.log(this.listLevel);
    }, error => {
      console.error('Error fetching levels:', error); 
    });
  }

  findLevelById(id: string) {
    return this.listLevel.find((level: any) => level.id == (id as unknown as number))?.name;
  }

  selectSubject(subject: any): void {
    this.selectedSubject = subject.target.value;
    this.subjectId = this.selectedSubject;
    this.examsForm.chapterIds = [];
    this.allChecked = false;
    console.log('Selected Sem:', this.selectedSubject);
    this.initializeLevel();
  }

  allChecked = false;

  openPopupLevel() {
    this.isPopupLevel = true;
  }

  getSelectedLevelsNames(): string {
    const selectedLevels = this.listLevel.filter((level: any) => this.examsForm.levelIds.includes(level.id));
    return selectedLevels.map((level: any) => `[${level.name}]`).join(' ');
  }

  toggleStudentSelection(studentId: number, event: Event) {
    const checkbox = (event.target as HTMLInputElement);

    if (checkbox.checked) {
      this.examsForm.students.push(studentId);
    } else {
      this.examsForm.students = this.examsForm.students.filter(id => id !== studentId);
    }

    console.log(this.examsForm.students);
  }

  errorMessageLevel: { [key: string]: string } = {};

  validateLevel(): boolean {
    var flag = false;
    var totalQuestions = 0;
    this.listLevel.forEach((element:any) => {
      if (this.levelId[element.id as string] < 0) {
        this.errorMessageLevel[element.id] = "Question number cannot be negative.";
        flag = true;
      }
      else {
        this.errorMessageLevel[element.id] = "";
      }
      totalQuestions += this.levelId[element.id as string];
    });
    
    if (totalQuestions < 16 || totalQuestions > 25) {
      this.toastr.error('Total of number questions must be between 16 and 25 (Level).', 'Error', {
        timeOut: 2000,
      });
      flag = true;
    }
    return flag;
  }

  closePopupLevel(event?: MouseEvent, flag?: Boolean): void {
    if (this.validateLevel() && flag) {
      return;
    }

    if (event) {
      event.stopPropagation();
    }
    this.isPopupLevel = false;
  }
}