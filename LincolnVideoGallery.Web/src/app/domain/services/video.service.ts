
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddCommentModel } from '../interfaces/addcomment.interface';
import { AddReviewModel } from '../interfaces/addreview.interface';
import { MigrationModel } from '../interfaces/migration.interface';
import { UploadVideoModel } from '../interfaces/uploadvideo.interface';
import { ReplaceVideoModel } from '../interfaces/replacevideo.interface';
import { VideoSearchRequestModel } from '../interfaces/videosearchrequest.interface';
import { ManageVideoModel } from '../interfaces/managevideo.interface';
import { VideoReportQueryModel } from '../interfaces/videoreportquery.interface';
import { VideoEmbeddingQueryModel } from '../interfaces/videoembeddingquery.interface';
import { FlaggedDetailsRequestModel } from '../interfaces/flaggeddetailsrequest.interface';
import { EditRatingModel } from '../interfaces/editrating.interface';
import { MakeVideoFeaturedModel } from '../interfaces/makevideofeatured.interface';
import { EditVideoModel } from '../interfaces/editvideo.interface';
import { DownloadCsvModel } from '../interfaces/downloadcsv.interface';
import { ReportModel } from '../interfaces/report.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.VideoController
  */
@Injectable()
export class VideoService {
  constructor(private httpClient: HttpClient) {}

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Video/delete/${encodeURIComponent(id)}`);
  }

  remove(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Video/remove/${encodeURIComponent(id)}`);
  }

  activate(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Video/activate/${encodeURIComponent(id)}`);
  }

  addComment(id: string, model: AddCommentModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/add-comment/${encodeURIComponent(id)}`, model);
  }

  addReview(id: string, model: AddReviewModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/add-review/${encodeURIComponent(id)}`, model);
  }

  migrate(id: string, model: MigrationModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/migrate/${encodeURIComponent(id)}`, model);
  }

  mappings(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/mappings`);
  }

  upload(model: UploadVideoModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/upload`, model);
  }

  uploadDealerVideo(model: UploadVideoModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/dealer-upload`, model);
  }

  dealerUpload2(): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/dealer-upload2`, null);
  }

  upload2(): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/upload2`, null);
  }

  uploadRequest(): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/upload-request`, null);
  }

  editVideo2(id: string): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/edit-video2/${encodeURIComponent(id)}`, id);
  }

  replace(id: string, model: ReplaceVideoModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/replace/${encodeURIComponent(id)}`, id);
  }

  inactiveVideos(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/inactive-videos?scrollId=${encodeURIComponent(scrollId)}`);
  }

  videosForApproval(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/queue-videos?scrollId=${encodeURIComponent(scrollId)}`);
  }

  mostRecentVideos(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/most-recent`);
  }

  search(model: VideoSearchRequestModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/search`, model);
  }

  userVideos(model: ManageVideoModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/user-videos`, model);
  }

  privateVideos(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/private-videos?scrollId=${encodeURIComponent(scrollId)}`);
  }

  archives(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/archives?scrollId=${encodeURIComponent(scrollId)}`);
  }

  topFeatured(showAll: boolean): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/top-featured?showAll=${showAll}`);
  }

  topVideos(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/top-videos?scrollId=${encodeURIComponent(scrollId)}`);
  }

  reject(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/reject/${encodeURIComponent(id)}`, null);
  }

  status(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/status/${encodeURIComponent(id)}`);
  }

  getPlaybackUrl(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/playback-url/${encodeURIComponent(id)}`);
  }

  list(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/list`);
  }

  report(model: VideoReportQueryModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/report`, model);
  }

  videosCount(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/videos-count`);
  }

  fields(model: VideoReportQueryModel): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/fields`);
  }

  embedding(model: VideoEmbeddingQueryModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/embedding`, model);
  }

  details(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/details/${encodeURIComponent(id)}`);
  }

  detailsFlagged(model: FlaggedDetailsRequestModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/details-flagged`, model);
  }

  detailsForEdit(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/details-for-edit/${encodeURIComponent(id)}`);
  }

  getAttachedFile(id: number): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/attached-file/${id}`);
  }

  downloadSupplementalFile(videoid: string, fileid: string, filename: string): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Video/${videoid}/downloadfile/${fileid}?filename=${filename}`);
  }

  removeAttachedFile(id: number): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/remove-file/${id}`, null);
  }

  getId(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/id/${encodeURIComponent(id)}`);
  }

  comments(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/comments/${encodeURIComponent(id)}`);
  }

  pendings(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/pending`);
  }

  rating(id: string, model: EditRatingModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/rating/${encodeURIComponent(id)}`, model);
  }

  makeVideoFeatured(model: MakeVideoFeaturedModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/make-featured`, model);
  }

  editDetails(model: EditVideoModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Video/edit-details`, model);
  }

  download(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/download/${encodeURIComponent(id)}`);
  }

  getArchiveCsv(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/archive-csv`);
  }

  getQueueCsv(model: DownloadCsvModel): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/queue-csv?franchise=${model.franchise}&toUploadDate=${model.toUploadDate}&fromUploadDate=${model.fromUploadDate}`,{
      responseType: 'blob',
      observe: 'response'
    });
  }

  approve(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/approve/${encodeURIComponent(id)}`, null);
  }

  rejectRequest(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/reject-request/${encodeURIComponent(id)}`, null);
  }

  deleteRequest(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/delete-request/${encodeURIComponent(id)}`, null);
  }

  addReport(id: string, model: ReportModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/add-report/${encodeURIComponent(id)}`, model);
  }

  getReports(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/get-reports/${encodeURIComponent(id)}`);
  }

  archive(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/archive/${encodeURIComponent(id)}`, null);
  }

  unarchive(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/unarchive/${encodeURIComponent(id)}`, null);
  }

  flag(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/flag/${encodeURIComponent(id)}`, null);
  }

  unflag(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Video/unflag/${encodeURIComponent(id)}`, null);
  }

  flagged(scrollId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Video/flagged?scrollId=${encodeURIComponent(scrollId)}`);
  }

}
