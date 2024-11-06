import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HomeComponent } from '../home.component';
import { response } from 'express';
declare var $: any;

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrl: './level.component.css'
})
export class LevelComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private home: HomeComponent, private http: HttpClient, public toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute) { }

  dataTable: any;
  apiData: any;
  _level: any = {
    id: 0,
    name: '',
  };
  levelId: any;
  name: String = '';
  point: number = 1;

  isPopupConfirm: boolean = false;

  ngOnInit(): void {

    this.http.get<any>(`${this.authService.apiUrl}/level`, this.home.httpOptions).subscribe((data: any) => {
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
        { title: 'Level', data: 'name' },
        {
          title: 'Action',
          data: null,
          render: function (data: any, type: any, row: any) {
            return `<span data-bs-toggle="collapse" role="button" aria-expanded="false"
                    aria-controls="collapseExample" class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
            <span class="mdi mdi-delete-forever icon-action delete-icon" title="Delete" data-id="${row.id}"></span>`;
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
        $('.edit-icon').on('click', (event: any) => {
          this.levelId = $(event.currentTarget).data('id');
          this._level = this.apiData.find((item: any) => item.id === this.levelId);
          $('#addLevel').removeClass('show');
          $('#updateLevel').addClass('show');
          setTimeout(() => {  // Cuộn xuống form mới thêm
            const newLevelForm = document.getElementById('updateLevel');
            if (newLevelForm) {
              newLevelForm.scrollIntoView({ behavior: 'smooth' });
            }
          }, 0);
        });
        $('.btn-add').on('click', (event: any) => {
          this.name = '';
          $('#updateLevel').removeClass('show');
          setTimeout(() => {  // Cuộn xuống form mới thêm
            const newLevelForm = document.getElementById('addLevel');
            if (newLevelForm) {
              newLevelForm.scrollIntoView({ behavior: 'smooth' });
            }
          }, 0);
        });
        $('.delete-icon').on('click', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.levelId = id;
          this.isPopupConfirm = true;
        });
      }
    });
  }

  closePopup(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Ngăn việc sự kiện click ra ngoài ảnh hưởng đến việc đóng modal
    }
    this.isPopupConfirm = false;
  }

  updateDataTable(newData: any[]): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
    }
  }

  reloadTable(): void {
    this.http.get<any>(`${this.authService.apiUrl}/level`, this.home.httpOptions).subscribe((data: any) => {
      this.apiData = data;
      this.updateDataTable(this.apiData); // Cập nhật bảng với dữ liệu mới
    });
    this.closeform();
  }

  createLevel(): void {
    const level =
    {
      name: this.name,
      point: this.point
    }

    this.http.post(`${this.authService.apiUrl}/level`, level, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Create new level Successful!', 'Success', {
          timeOut: 2000,
        });
        this.reloadTable();
        this.closeform();
      },
      error => {
        if (error.status === 401) {
          this.toastr.error('Not found', 'Failed', {
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

  updateLevel(): void {
    const level =
    {
      id: this.levelId,
      name: this._level.name,
      point: this.point
    }

    this.http.put(`${this.authService.apiUrl}/level/${this.levelId}`, level, this.home.httpOptions).subscribe(
      response => {
        this.toastr.success('Update level Successful!', 'Success', {
          timeOut: 2000,
        });
        this.reloadTable();
        this.closeform();
      },
      error => {
        if (error.status === 401) {
          this.toastr.error('Not found', 'Failed', {
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

  deletingLevel: any;

  deleteLevel(id: number): void {
    this.isPopupConfirm = false;
    this.http.put(`${this.authService.apiUrl}/level/delete/${id}`, this.home.httpOptions).subscribe(
      response => {
        this.deletingLevel = response;
        this.toastr.success(`Level with name ${this.deletingLevel.name} deleted successfully`, 'Success', {
          timeOut: 2000,
        });
        this.reloadTable();
      },
      error => {
        this.toastr.error('Error deleting item!', 'Error', {
          timeOut: 2000,
        });
      }
    );
  }

  closeform() {
    document.getElementById('addLevel')?.classList.remove('show');
    document.getElementById('updateLevel')?.classList.remove('show');
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
