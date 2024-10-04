import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeComponent } from '../../home.component';
import { SubjectComponent } from '../subject.component';

interface Answer {
  content: string; // Đổi từ text thành content
  isCorrect: number; // Thêm thuộc tính isCorrect
}

@Component({
  selector: 'app-question-update',
  templateUrl: './question-update.component.html',
  styleUrl: './question-update.component.css'
})

export class QuestionUpdateComponent implements OnInit {
  constructor(private authService: AuthService, private home: HomeComponent, private http: HttpClient, public toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, public subjectComponent: SubjectComponent) { }

  subjects: any;
  subjectId: number = 0;
  subjectName: any;

  questionId: number = 0;
  listChapter: any;
  listLevel = [
    { id: 1, name: 'Easy', point: 1 },
    { id: 2, name: 'Hard', point: 2 }
  ];

  dataQuestion: any;
  
  question: any = {
    content: '',
    subjectId: 0,
    chapters: [],
    levelId: 0,
    imageFile: null,
    answers: []
  };

  ngOnInit(): void {
    this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) ?? 0;

    this.http.get<any>(`${this.authService.apiUrl}/subject/${this.subjectId}`, this.home.httpOptions).subscribe((data: any) => {
      this.http.get<any>(`${this.authService.apiUrl}/subject/sem/${data.sem.id}`, this.home.httpOptions).subscribe(data1 => {
        this.subjects = data1;
        for (let sub of this.subjects) {
          if (sub.id == this.subjectId) {
            this.subjectName = sub.name;
          }
        }
      });
    });

    this.questionId = Number(this.activatedRoute.snapshot.params['id']) ?? 0;

    this.http.get<any>(`${this.authService.apiUrl}/question/detail/${this.questionId}`, this.home.httpOptions).subscribe(data => {
      this.dataQuestion = data;
      this.question.content = this.dataQuestion.content;
      this.question.imageFile = this.dataQuestion.image;
      this.question.subjectId = this.dataQuestion.subject.id;
      this.question.levelId = this.dataQuestion.level.id;
      this.question.answers = this.dataQuestion.answers;
      
      for (let chapter of this.dataQuestion.chapters) {
        this.question.chapters.push(chapter.id);
      }

      if (this.question.imageFile) {
        const imgPreview = document.getElementById(`imagePreview`) as HTMLImageElement;
        imgPreview.src = '../../../../../../img-question/' + this.question.imageFile; // Đặt src của ảnh
        imgPreview.style.display = 'block'; // Hiển thị ảnh
      }
    });

    this.http.get<any>(`${this.authService.apiUrl}/chapter/${this.subjectId}`, this.home.httpOptions).subscribe((data: any) => {
      this.listChapter = data;
    });
  }

  isPopupChapter = false;

  openPopup() {
    this.isPopupChapter = true;
  }

  // Hàm này được gọi khi người dùng nhấn checkbox
  toggleChapterSelection(chapterId: number, event: Event) {
    const checkbox = (event.target as HTMLInputElement);

    if (!this.question.chapters) {
      this.question.chapters = [];
    }

    if (checkbox.checked) {
      this.question.chapters.push(chapterId);
    } else {
      this.question.chapters = this.question.chapters.filter((id: any) => id !== chapterId);
    }

    console.log(this.question.chapters);
  }

  closePopup(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Ngăn việc sự kiện click ra ngoài ảnh hưởng đến việc đóng modal
    }
    this.isPopupChapter = false;
    this.isCancelPopup = false;
  }

  addAnswer() {
    this.question.answers.push({ content: '', isCorrect: 0 }); // Thêm câu trả lời mới
  }

  toggleIsCorrect(answer: Answer) {
    answer.isCorrect = answer.isCorrect === 1 ? 0 : 1; // Chuyển đổi giữa 0 và 1
    console.log('Current isCorrect value:', answer.isCorrect); // In ra giá trị
  }

  removeAnswer(answerIndex: number) {
    this.question.answers.splice(answerIndex, 1);
  }

  changeImg: boolean = false;

  previewImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    const imgPreview = document.getElementById(`imagePreview`) as HTMLImageElement;
    const imgContainer = imgPreview.parentElement; // Lấy phần tử cha của img

    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        imgPreview.src = loadEvent.target?.result as string;
        imgPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);

      // Đánh dấu là đã chọn ảnh và thêm lớp ẩn border
      this.question.imageFile = file; // Lưu file vào đối tượng
      imgContainer?.classList.add('hidden-border'); // Thêm lớp để ẩn border
      this.changeImg = true;
    } else {
      imgContainer?.classList.remove('hidden-border'); // Xóa lớp nếu không có ảnh
    }
  }

  removeImage() {
    this.question.imageFile = null; // Xóa thông tin file
    const imgPreview = document.getElementById(`imagePreview`) as HTMLImageElement;
    imgPreview.src = ''; // Đặt lại src của ảnh
    imgPreview.style.display = 'none'; // Ẩn ảnh đi
  }

  saveQuestions() {
    const formData = new FormData();
  
    // Tạo danh sách câu hỏi
    const questionsList = {
      content: this.question.content,
      image: null, // Hoặc giá trị tương ứng nếu có ảnh
      subjectId: this.question.subjectId,
      chapters: this.question.chapters,
      levelId: this.question.levelId,
      answers: this.question.answers.map((answer: any) => ({
        content: answer.content,
        isCorrect: answer.isCorrect
      }))
    };
  
    // Thêm danh sách câu hỏi vào FormData
    formData.append('question', new Blob([JSON.stringify(questionsList)], { type: 'application/json' }));
  
    // Thêm các file vào FormData
    if (this.changeImg) {
      formData.append('file', this.question.imageFile); // Sử dụng file đã lưu
    }
    else {
      formData.append('file', new Blob([]));
    }
  
    // Gửi yêu cầu POST
    this.http.put(`${this.authService.apiUrl}/question/${this.questionId}`, formData, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Questions saved successfully!', 'Success', {
          timeOut: 2000,
        });
        console.log('Questions saved successfully:', response);
        this.router.navigate([`/admin/home/subject/${this.subjectId}/questionList`]);
      },
      error => {
        this.toastr.error('Error saving questions.', 'Error', {
          timeOut: 2000,
        });
        console.error('Error saving questions:', error);
      }
    );
  }

  isCancelPopup: boolean = false;
  
  cancel() {
    this.isCancelPopup = true;
  }

  confirmCancel() {
    this.isCancelPopup = false;
    this.router.navigate([`/admin/home/subject/${this.subjectId}/questionList`]);
  }
}