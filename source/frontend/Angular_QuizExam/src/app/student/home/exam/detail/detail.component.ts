import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Title } from '@angular/platform-browser';
import { HomeComponent } from '../../home.component';
import { ExamComponent } from '../exam.component';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {
  examId: number = 0;

  examStartTime: any;
  remainingTime: string = '';
  countdown: any;

  examDetail: any;
  questionStatus: boolean[] = [];
  studentAnswers: { questionRecordId: number; selectedAnswerIds: number[] }[] = [];

  showPopupConfirm: boolean = false;
  showPopupWarning: boolean = false;
  warningMessage: string = '';
  noteMessage: string = '';
  violationMessage: string = '';
  autoSubmitTimer: any;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private home: HomeComponent,
    public examComponent: ExamComponent,
    private http: HttpClient,
    private toastr: ToastrService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Exam');
    this.examId = Number(this.activatedRoute.snapshot.paramMap.get('examId'));
    this.loadData();
    this.setupScrollListener();
    this.setupAntiCheatMonitoring();
  }

  loadData(): void {
    const markRequest = this.http.get<any>(`${this.authService.apiUrl}/mark/${this.examId}`, this.home.httpOptions);
    const examRequest = this.http.get<any>(`${this.authService.apiUrl}/exam/${this.examId}`, this.home.httpOptions);

    forkJoin([markRequest, examRequest]).subscribe(([markData, examData]) => {
      this.examComponent.mark = markData;
      this.examDetail = examData;

      const startTime = new Date(this.examDetail.startTime);
      const endTime = new Date(this.examDetail.endTime);
      const currentTime = new Date(); // Lấy thời gian hiện tại

      if (startTime > currentTime) {
        this.router.navigate([this.urlService.examPageUrl()]);
        return;
      }

      if (this.examComponent.mark.score != null) {
        this.router.navigate([this.urlService.resultExamPageUrl(this.examId)]);
        return;
      }
      
      if (this.examComponent.mark.beginTime == null) {
        if (currentTime > endTime) {
          this.router.navigate([this.urlService.examPageUrl()]);
          return;
        }
        this.http.put(`${this.authService.apiUrl}/mark/begin-time/${this.examComponent.mark.id}`, {}, this.home.httpOptions).subscribe({
          next: (response) => { console.log('Update Begin Time successful: ', response); },
          error: (err) => { console.log('Update Begin Time fail: ', err); }
        });
      }

      if (this.examComponent.mark.warning != null) {
        this.setupWarnings();
        this.autoSubmit();
      }
      this.examStartTime = new Date();
      this.questionStatus = Array(this.examDetail.questionRecordResponses.length).fill(false);
      this.calculateNewDuration();
      this.loadFromSession();
    });
  }

  calculateNewDuration(): void {
    const beginTime = this.examComponent.mark.beginTime ? new Date(this.examComponent.mark.beginTime) : this.examStartTime; // Chuyển đổi string thành Date
    const durationMinutes = this.examDetail.duration;

    // Tính toán endTime.
    const endTime = new Date(beginTime.getTime() + durationMinutes * 60000); // thêm phút vào thời gian bắt đầu

    // Lấy thời gian hiện tại.
    const now = new Date();

    // Tính toán số giây còn lại.
    const remainingDuration = endTime > now ? Math.floor((endTime.getTime() - now.getTime()) / 1000) : 0; // Nếu thời gian đã qua, đặt thành 0
    
    this.remainingTime = this.formatTime(remainingDuration); // Cập nhật remainingTime
    this.startCountdown(remainingDuration); // Bắt đầu đếm ngược từ remainingDuration (bằng giây)
  }

  startCountdown(duration: number): void {
    let remainingSeconds = duration;
    const warningTimes = [180, 120, 60]; // Các mốc thời gian cần thông báo (giây)
  
    this.countdown = setInterval(() => {
      if (remainingSeconds <= 0) {
        this.submitExam(); // Optionally submit answers when time is up
        return;
      }

      // Kiểm tra và gửi thông báo cho các mốc thời gian
      if (warningTimes.includes(remainingSeconds)) {
        this.toastr.warning(`Only ${remainingSeconds / 60} minute(s) left!`);
      }
  
      remainingSeconds--;
      this.remainingTime = this.formatTime(remainingSeconds);
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(secs)}`;
  }

  padNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  setupWarnings(): void {
    this.showPopupWarning = true;
    this.warningMessage = `Please do not click outside the exam.`;
    this.violationMessage = `(Current violations: ${this.examComponent.mark.warning})`;
    this.noteMessage = `Note: The system will automatically submit the exam after 3 violations.`;
  }

  updateWarning(): void {
    const mark = { warning: this.examComponent.mark.warning }
    this.http.put(`${this.authService.apiUrl}/mark/warning/${this.examComponent.mark.id}`, mark, this.home.httpOptions).subscribe({
      next: () => { this.autoSubmit(); },
      error: () => {}
    });
  }

  preventDeveloperTools = (event: KeyboardEvent) => {
    if (event.key === 'F12' || (event.ctrlKey && event.key === 'u')) {
      event.preventDefault();
      this.toastr.warning("This action is disabled.");
    }
  };

  preventCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    this.toastr.warning("Copying content is not allowed.");
  };

  preventRightClick = (event: MouseEvent) => {
    event.preventDefault();
    this.toastr.warning("Right-click is disabled.");
  };

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    event.preventDefault();
    this.toastr.warning("Reloading the page may be considered a violation. Please be cautious!");
  };

  handleBlur = () => {
    if (this.examComponent.mark.warning == null || this.examComponent.mark.warning < 3) {
      this.examComponent.mark.warning++;
      this.setupWarnings();
      this.updateWarning();
    }
  };

  handleFocus = () => {
    clearInterval(this.countdown);
    this.calculateNewDuration();
  };

  setupAntiCheatMonitoring() {
    document.addEventListener('keydown', this.preventDeveloperTools); // Ngăn chặn mở Developer Tools
    document.addEventListener('copy', this.preventCopy); // Ngăn chặn sao chép nội dung
    document.addEventListener('contextmenu', this.preventRightClick); // Ngăn chặn menu chuột phải
    window.addEventListener('beforeunload', this.handleBeforeUnload); // Xử lý sự kiện load lại trang
    window.addEventListener('blur', this.handleBlur); // Xử lý sự kiện blur (Check cửa sổ đó bị mất tiêu điểm)
    window.addEventListener('focus', this.handleFocus); // Xử lý sự kiện focus
  }

  setupScrollListener(): void {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = (): void => {
    const sidebarContainer = document.querySelector('.sidebar-container') as HTMLElement;
    if (sidebarContainer) {
      sidebarContainer.style.transform = window.scrollY > 50 ? 'translate3d(0px, 100px, 0px)' : 'translate3d(0px, 0px, 0px)';
      sidebarContainer.style.marginBottom = window.scrollY > 50 ? "100px" : "0";
    }
  }

  scrollToQuestion(index: number): void {
    const questionElement = document.getElementById(`question-${index + 1}`);
    if (questionElement) {
      const headerOffset = 80; // Chiều cao của header
      const elementPosition = questionElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  getSelectedAnswerId(index: number): number | null {
    const selectedAnswer = this.examDetail.questionRecordResponses[index].answerRecords.find((answer: any) => 
      (document.getElementById(answer.id) as HTMLInputElement)?.checked
    );
    return selectedAnswer ? selectedAnswer.id : null;
  }

  getSelectedAnswerIds(index: number): number[] {
    return this.examDetail.questionRecordResponses[index].answerRecords.filter((answer: any) => 
      (document.getElementById(answer.id) as HTMLInputElement)?.checked
    ).map((answer: any) => answer.id);
  }

  markQuestionAsCompleted(index: number): void {
    const question = this.examDetail.questionRecordResponses[index];
    const selectedAnswerIds = question.type === 1 
      ? [this.getSelectedAnswerId(index)].filter((id): id is number => id !== null) 
      : this.getSelectedAnswerIds(index);
    
    // Kiểm tra xem questionRecordId đã tồn tại chưa
    const existingAnswer = this.studentAnswers.find(answer => answer.questionRecordId === question.id);

    if (existingAnswer) {
      if (question.type === 1) {
        // Xử lý cho câu hỏi dạng radio
        existingAnswer.selectedAnswerIds = selectedAnswerIds; // Cập nhật với ID đã chọn
      }
      else {
        // Xử lý câu hỏi dạng checkbox
        existingAnswer.selectedAnswerIds = existingAnswer.selectedAnswerIds.filter(id => selectedAnswerIds.includes(id));
        for (const id of selectedAnswerIds) {
          if (!existingAnswer.selectedAnswerIds.includes(id)) {
              existingAnswer.selectedAnswerIds.push(id);
          }
        }
      }
      if (selectedAnswerIds.length === 0) {
        // Nếu không có lựa chọn nào, xóa hẳn entry trong studentAnswers
        this.studentAnswers = this.studentAnswers.filter(answer => answer.questionRecordId !== question.id);
      }
    }
    else {
      // Nếu chưa tồn tại, thêm mới
      this.studentAnswers.push({ questionRecordId: question.id, selectedAnswerIds });
    }

    this.updateQuestionStatus();
    this.saveToSession();
  }

  updateQuestionStatus() {
    // Cập nhật questionStatus dựa trên questionRecordId
    this.questionStatus = this.examDetail.questionRecordResponses.map((q: any) => 
      this.studentAnswers.some(answer => answer.questionRecordId === q.id)
    );
  }

  isSelectedAnswer(questionId: number, answerId: number): boolean {
    const questionIndex = this.examDetail.questionRecordResponses.findIndex((q: any) => q.id === questionId);
    if (questionIndex !== -1) {
      const studentAnswer = this.studentAnswers.find(answer => answer.questionRecordId === questionId);
      if (studentAnswer) {
        return studentAnswer.selectedAnswerIds.includes(answerId);
      }
    }
    return false;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 là mã ASCII cho 'A'
  }

  getQuestionsStatusCount(): number {
    return this.questionStatus.filter(Boolean).length;
  }

  saveToSession(): void {
    localStorage.setItem('studentAnswers', JSON.stringify({ studentAnswers: this.studentAnswers }));
  }

  loadFromSession(): void {
    const sessionData = localStorage.getItem('studentAnswers');
    if (sessionData) {
      const { studentAnswers } = JSON.parse(sessionData);
      this.studentAnswers = studentAnswers;
      this.updateQuestionStatus();
    }
  }

  openPopupConfirm(): void {
    this.showPopupConfirm = true;
  }

  closePopup(): void {
    this.noteMessage = '';
    this.violationMessage = '';
    this.showPopupWarning = false;
    this.showPopupConfirm = false;
  }

  autoSubmit(): void {
    if (this.examComponent.mark.warning >= 3) {
      this.violationMessage = `(Current violations: ${this.examComponent.mark.warning} - The exam will be automatically submitted in 5 seconds)`;
      this.autoSubmitTimer = setTimeout(() => {
        this.submitExam();
      }, 5000);
    }
  }

  submitExam(): void {
    const body = { markId: this.examComponent.mark.id, studentQuestionAnswers: this.studentAnswers };
    this.http.post(`${this.authService.apiUrl}/student-answers`, body, this.home.httpOptions).subscribe({
      next: () => {
        localStorage.removeItem('studentAnswers');
        this.router.navigate([this.urlService.resultExamPageUrl(this.examId)]);
      },
      error: () => { this.toastr.error('Submission failed'); }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.preventDeveloperTools);
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('contextmenu', this.preventRightClick);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);

    window.removeEventListener('scroll', this.handleScroll);
    
    clearInterval(this.countdown);
    clearInterval(this.autoSubmitTimer);
  }
}