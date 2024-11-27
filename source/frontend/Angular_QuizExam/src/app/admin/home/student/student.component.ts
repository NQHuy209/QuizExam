import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { HomeComponent } from '../home.component';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UrlService } from '../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-class',
  templateUrl: './student.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './student.component.css'
  ]
})
export class StudentComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private home: HomeComponent,
    private el: ElementRef,
    private renderer: Renderer2,
    private http: HttpClient,
    private toastr: ToastrService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  dataTable: any;
  apiData: any;
  stdResponse: any = null;
  isPopupUpdate = false;
  isPopupCreate = false;
  isPopupMove = false;
  classes: any;
  _classId: any;
  classId: any = 1;
  class: String = '';
  userIds: Number[] = [];
  statusId: number = 1;

  dateOfBirth: string = '';

  studentId: any;

  nameError: String = '';
  dobError: String = '';
  addressError: String = '';
  phoneNumberError: String = '';
  emailError: String = '';
  rollNumberError: String = '';
  rollPortalError: String = '';

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;
  isPopupDelete: boolean = false;
  isPopupResetPassword: boolean = false;
  isPopupBackupRestore: boolean = false;

  searchClass: string = '';
  filterClass: any[] = [];

  get formattedDob(): string {
    const dob = this.stdResponse.userResponse.dob;
    // Chuyển đổi chuỗi "dd-MM-yyyy" sang định dạng "yyyy-MM-dd"
    if (dob) {
      const [day, month, year] = dob.split('-');
      return `${year}-${month}-${day}`;  // Định dạng yyyy-MM-dd
    }
    return '';
  }

  onDateChange(event: any) {
    // Khi người dùng thay đổi ngày, lưu giá trị đó lại
    this.dateOfBirth = event; // Giá trị sẽ ở định dạng yyyy-MM-dd
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Students');
    this.authService.entityExporter = 'studentManagement';
    this._classId = Number(this.activatedRoute.snapshot.params['classId']) ?? 0;
    if (this._classId != 0 && !Number.isNaN(this._classId)) {
      this.http.get<any>(`${this.authService.apiUrl}/student-management/${this._classId}/${this.statusId}`, this.home.httpOptions).subscribe((data: any) => {
        this.apiData = data;
        this.authService.listExporter = data;
        this.initializeDataTable();
      });
    }
    else {
      this._classId = 0;
      this.http.get<any>(`${this.authService.apiUrl}/student-management/${this.statusId}`, this.home.httpOptions).subscribe((data: any) => {
        this.apiData = data;
        this.initializeDataTable();
      });
    }
    this.http.get<any>(`${this.authService.apiUrl}/class`, this.home.httpOptions).subscribe((data: any) => {
      this.classes = data;
      this.filterClass = data;
      for (let dt of data) {
        if (this._classId == dt.id) {
          this.class = dt.name;
        }
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.apiData,
      autoWidth: false, // Bỏ width của table
      pageLength: 10, // Đặt số lượng mục hiển thị mặc định là 10
      lengthMenu: [10, 15, 20, 25], // Tùy chọn trong dropdown: 10, 15, 20, 25
      language: {
        search: '' // Xóa chữ "Search:"
      },
      info: false, // Xóa dòng chữ Showing 1 to 10 of 22 entries
      columns: [
        {
          title: 'STT',
          data: null, // Không cần dữ liệu từ nguồn API
          render: (data: any, type: any, row: any, meta: any) => {
            return meta.row + 1; // Trả về số thứ tự, `meta.row` là chỉ số của hàng bắt đầu từ 0
          }
        },
        { title: 'Roll Number', data: 'rollNumber' },
        { title: 'Roll Portal', data: 'rollPortal' },
        { title: 'Full Name', data: 'userResponse.fullName' },
        { title: 'Phone Number', data: 'userResponse.phoneNumber' },
        {
          title: 'Action',
          data: '_class',
          render: (data: any, type: any, row: any) => {
            if (this.statusId == 1) {
              if (data == null) {
                return `<input type="checkbox" class="icon-action chk_box" data-id="${row.userResponse.id}">
                <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.userResponse.id}"></span>
                <span class="mdi mdi-lock-reset icon-action reset-password-icon" title="Reset Password" data-id="${row.userResponse.id}"></span>
                <span class="mdi mdi-delete-forever icon-action delete-icon" title="Delete" data-id="${row.userResponse.id}"></span>`;
              }
              else {
                return `<span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.userResponse.id}"></span>
                <span class="mdi mdi-lock-reset icon-action reset-password-icon" title="Reset Password" data-id="${row.userResponse.id}"></span>
                <span class="mdi mdi-delete-forever icon-action delete-icon" title="Delete" data-id="${row.userResponse.id}"></span>`;
              }
            }
            return `<span class="mdi mdi-backup-restore icon-action backup-restore-icon" title="Backup Restore" data-id="${row.userResponse.id}"></span>`;
          },
        },
      ],

      drawCallback: () => {
        this.addEventListeners();
        this.cssDataTable();
      }
    });
  }

  addEventListeners(): void {
    // Sửa input search thêm button vào
    if (!$('.dataTables_filter button').length) {
      $('.dataTables_filter').append(`<button type="button"><i class="fa-solid fa-magnifying-glass search-icon"></i></button>`);
    }

    // Thêm placeholder vào input của DataTables
    $('.dataTables_filter input[type="search"]').attr('placeholder', 'Search');

    // Click vào info icon sẽ hiện ra popup
    $('.edit-icon').on('click', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.studentId = id;
      console.log(this.studentId);
      this.showPopupEdit(id);
    });

    $('.reset-password-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.dialogTitle = 'Are you sure?';
      this.dialogMessage = 'Do you want to reset the password for this Student?';
      this.isConfirmationPopup = true;
      this.isPopupResetPassword = true;
    });

    $('.delete-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.dialogTitle = 'Are you sure?';
      this.dialogMessage = 'Do you really want to delete this Student?';
      this.isConfirmationPopup = true;
      this.isPopupDelete = true;
    });

    $('.backup-restore-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.dialogTitle = 'Are you sure?';
      this.dialogMessage = "Do you really want to recover this Student's account?";
      this.isConfirmationPopup = true;
      this.isPopupBackupRestore = true;
    });

    // $('.create').on('click', () => {
    //   this.isPopupCreate = true;
    // });

    $('.chk_box').on('click', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.userIds.includes(id) ? this.userIds.splice(this.userIds.indexOf(id), 1) : this.userIds.push(id);
    });
  }

  cssDataTable(): void {
    if (!$('#custom-select-status').length) {
      $('.dataTables_length').append(`
        <label for="" class="label-status">Status:</label>
        <select id="custom-select-status" class="select-status">
          <option value=1>Active</option>
          <option value=0>Inactive</option>
        </select>
      `);

      // Theo dõi sự thay đổi của dropdown
      $('#custom-select-status').on('change', () => {
        this.statusId = $('#custom-select-status').val();
        this.reloadTable(this._classId);
      });
    }

    const dataTablesLength = this.el.nativeElement.querySelector('.dataTables_length');
    this.renderer.setStyle(dataTablesLength, 'display', 'inline-flex');
    
    const lengthElement = this.el.nativeElement.querySelector('.dataTables_length label');
    this.renderer.setStyle(lengthElement, 'width', '160px');

    const labelStatus = this.el.nativeElement.querySelector('.label-status');
    this.renderer.setStyle(labelStatus, 'margin', '0 5px 0 30px');
    this.renderer.setStyle(labelStatus, 'align-content', 'center');

    const selectStatus = this.el.nativeElement.querySelector('.select-status');
    this.renderer.setStyle(selectStatus, 'width', '120px');
    this.renderer.setStyle(selectStatus, 'cursor', 'pointer');
  }

  showMovePopup(): void {
    this.isPopupMove = true;
  }

  showCreatePopup(): void {
    this.isPopupCreate = true;
  }

  showPopupEdit(id: number): void {
    this.stdResponse = this.apiData.find((item: any) => item.userResponse.id === id);
    this.isPopupUpdate = true;
  }

  closePopup(): void {
    this.isPopupUpdate = false;
    this.isPopupCreate = false;
    this.isPopupMove = false;
    this.isPopupDelete = false;
    this.isPopupBackupRestore = false;
    this.isPopupResetPassword = false;
  }
  
  stdRequest: any = {
    userRequest: {
      fullName: "",
      email: "",
      dob: "",
      phoneNumber: "",
      address: "",
      gender: 1,
      roleId: 5
    },
    rollNumber: "",
    rollPortal: ""
  }

  updateDataTable(newData: any[]): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
    }
  }

  reloadTable(id: number): void {
    this.http.get<any>(id != 0 ? `${this.authService.apiUrl}/student-management/${id}/${this.statusId}` : `${this.authService.apiUrl}/student-management/${this.statusId}`, this.home.httpOptions).subscribe((data: any) => {
      this.apiData = data;
      this.updateDataTable(this.apiData); // Cập nhật bảng với dữ liệu mới
    });
    this.closePopup();
  }

  errorEmpty(): void {
    this.nameError = '';
    this.dobError = '';
    this.addressError = '';
    this.phoneNumberError = '';
    this.emailError = '';
    this.rollNumberError = '';
    this.rollPortalError = '';
  }

  createStudent(): void {
    this.errorEmpty();
    if (this._classId != 0) {
      this.stdRequest.classId = this._classId;
    }
    this.http.post(`${this.authService.apiUrl}/student-management`, this.stdRequest, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Create Successful!', 'Success', {
          timeOut: 2000,
        });
        console.log('Create successfully', response);
        this.reloadTable(this._classId);
      },
      error => {
        this.toastr.error('Error create Student', 'Error', {
          timeOut: 2000,
        });
        console.log('Error', error);
      }
    )
  }


  updateStudent(): void {
    this.errorEmpty();
    const _studentRequest = {
      userRequest: {
        fullName: this.stdResponse.userResponse.fullName,
        email: this.stdResponse.userResponse.email,
        dob: this.dateOfBirth,
        phoneNumber: this.stdResponse.userResponse.phoneNumber,
        address: this.stdResponse.userResponse.address,
        gender: this.stdResponse.userResponse.gender,
        roleId: 5
      },
      rollNumber: this.stdResponse.rollNumber,
      rollPortal: this.stdResponse.rollPortal
    }
    this.http.put(`${this.authService.apiUrl}/student-management/${this.studentId}`, _studentRequest, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Update Successful!', 'Success', {
          timeOut: 2000,
        });
        this.reloadTable(this._classId);
      },
      error => {
        this.toastr.error(error.error.message, 'Error', {
          timeOut: 2000,
        });
        console.log(error);
      }
    )
  }

  deletingStudent: any;

  deleteStudent(id: number): void {
    this.isPopupDelete = false;
    this.http.put(`${this.authService.apiUrl}/student-management/remove/${id}`, {}, this.home.httpOptions).subscribe(
      response => {
        this.deletingStudent = response;
        this.toastr.success(`Student with name ${this.deletingStudent.fullName} deleted successfully`, 'Success', {
          timeOut: 2000,
        });
        this.reloadTable(this._classId);
      },
      error => {
        this.toastr.error('Error deleting item!', 'Error', {
          timeOut: 2000,
        });
      }
    );
  }

  resetPasswordStudent(): void {
    this.http.put(`${this.authService.apiUrl}/user/reset-password/${this.studentId}`, {}, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Reset Successful!', 'Success', { timeOut: 2000 });
        this.reloadTable(this._classId);
      },
      error => {
        this.toastr.error('Reset Fail!', 'Error', { timeOut: 2000 });
      }
    );
  }

  backupRestoreStudent(): void {
    this.http.put(`${this.authService.apiUrl}/student-management/restore/${this.studentId}`, {}, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Backup Successful!', 'Success', { timeOut: 2000 });
        this.reloadTable(this._classId);
      },
      error => {
        this.toastr.error('Backup Fail!', 'Error', { timeOut: 2000 });
      }
    );
  }

  moveStudent(): void {
    const _class =
    {
      classId: this.classId,
      userIds: this.userIds
    }

    this.http.put(`${this.authService.apiUrl}/student-management/update-class`, _class, this.home.httpOptions).subscribe({
      next: () => {
        this.toastr.success('Move Successful!', 'Success', { timeOut: 2000 });
        this.router.navigate([this.urlService.classDetailUrl(this.classId)]);
      },
      error: (err) => {
        this.toastr.error(err, 'Error', { timeOut: 2000 });
      }
    });
  }

  onSearchClassChange(): void {
    this.filterClass = this.classes.filter((c: any) =>
      c.name.toLowerCase().includes(this.searchClass.toLowerCase())
    );
    if (this.filterClass.some(() => true)) {
      this.classId = this.filterClass[0].id;
    } else {
      this.classId = 0;
    }
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  exportExcel() {
    this.authService.listExporter = this.apiData;
    this.authService.exportDataExcel().subscribe(
      (response) => {
        const url = window.URL.createObjectURL(new Blob([response], { type: 'blob' as 'json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_excel.xlsx'; // Thay đổi tên file nếu cần
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Export failed', error);
      }
    );
  }

  exportPDF() {
    this.authService.listExporter = this.apiData;
    this.authService.exportDataPDF().subscribe(
      (response) => {
        const url = window.URL.createObjectURL(new Blob([response], { type: 'blob' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_pdf.pdf'; // Thay đổi tên file nếu cần
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Export failed', error);
      }
    );
  }
}
