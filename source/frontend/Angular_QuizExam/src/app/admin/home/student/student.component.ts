import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-class',
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private http: HttpClient, public toastr: ToastrService, private router: Router) { }

  dataTable: any;
  apiData: any;
  stdDetail: any = null;
  isPopupDetail = false;
  isPopupCreate = false;
  isPopupMove = false;

  ngOnInit(): void {
    this.http.get<any>(`${this.authService.apiUrl}/user`).subscribe((data: any) => {
      this.apiData = data;
      this.initializeDataTable();
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
        { title: 'Full Name', data: 'fullName' },
        { title: 'Phone Number', data: 'phoneNumber' },
        {
          title: 'Action',
          data: null,
          render: function (data: any, type: any, row: any) {
            return `<span class="mdi mdi-information-outline icon-action info-icon" data-id="${row.id}"></span>
            <span class="mdi mdi-delete-forever icon-action delete-icon"></span>`;
          }
        }
      ],

      drawCallback: () => {
        // Sửa input search thêm button vào
        if (!$('.dataTables_filter button').length) {
          $('.dataTables_filter').append(`<button type="button"><i class="fa-solid fa-magnifying-glass search-icon"></i></button>`);
        }

        // Thêm placeholder vào input của DataTables
        $('.dataTables_filter input[type="search"]').attr('placeholder', 'Search');

        // Click vào info icon sẽ hiện ra popup
        $('.info-icon').on('click', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.showPopupDetail(id);
        });

        $('.create').on('click', () => {
          this.isPopupCreate = true;
        });

        $('.move').on('click', () => {
          this.isPopupMove = true;
        });
      }
    });
  }

  showPopupDetail(id: number): void {
    this.stdDetail = this.apiData.find((item: any) => item.id === id);
    this.isPopupDetail = true;
  }

  closePopup(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Ngăn việc sự kiện click ra ngoài ảnh hưởng đến việc đóng modal
    }
    this.isPopupDetail = false;
    this.isPopupCreate = false;
  }



  fullName: String = '';
  email: String = '';
  dob: String = '';
  phoneNumber: String = '';
  address: String = '';
  gender: number = 1;
  rollNumber: String = '';
  rollPortal: String = '';
  createStudent(): void {
    const employee =
    {
      fullName: this.fullName, email: this.email, dob: this.dob,
      phoneNumber: this.phoneNumber, address: this.address,
      gender: this.gender, rollNumber: this.rollNumber, rollPortal: this.rollPortal
    }

    this.http.post(`${this.authService.apiUrl}/auth/register`, employee, { responseType: 'json' }).subscribe(
      response => {
        this.toastr.success('Create Successful!', 'Success', {
          timeOut: 2000,
        });
        console.log('Create successfully', response);
        this.router.navigate(['/admin/home/employee']);
      },
      error => {
        this.toastr.error('Error create Employee', 'Error', {
          timeOut: 2000,
        });
        console.log('Error', error);
      }
    )
  }

  class: String = '';
  moveStudent(): void {
    const classes =
    {
      class: this.class
    }

    this.http.post(`${this.authService.apiUrl}/auth/register`, classes, { responseType: 'json' }).subscribe(
      response => {
        this.toastr.success('Move Successful!', 'Success', {
          timeOut: 2000,
        });
        console.log('Move successfully', response);
        this.router.navigate(['/admin/home/student']);
      },
      error => {
        this.toastr.error('Error ', 'Error', {
          timeOut: 2000,
        });
        console.log('Error', error);
      }
    )
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
