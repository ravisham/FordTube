import { Component, OnInit } from '@angular/core';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-reporting',
  templateUrl: './admin-reporting.component.html',
  styleUrls: ['./admin-reporting.component.scss']
})
export class AdminReportingComponent implements OnInit {

  currentMenuItem = AdminMenuItems.AdminReporting;
  isLoading: { [key: string]: boolean } = {};

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  downloadReport(type: string): void {
    this.isLoading[type] = true;
    this.http.get(`${environment.maApiUrl}api/reports/download/${type}`, { responseType: 'blob' }).subscribe(blob => {
      const filename = type === 'active' ? 'ActiveVideoReport.csv' : 'InactiveDeletedVideoReport.csv';
      saveAs(blob, filename);
      this.isLoading[type] = false;
    }, error => {
      console.error('Error downloading the report:', error);
      this.isLoading[type] = false;
    });
  }
}
