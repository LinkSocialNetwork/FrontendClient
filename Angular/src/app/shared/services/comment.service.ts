import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comments } from '../model/Comments';
import { GetCookieService } from './get-cookie.service';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private myHttpCli:HttpClient, private cookieService: GetCookieService) { }

  insertNewComment(comment:Comments):Observable<string>{
    let authtoken = this.cookieService.getCookie("token")
    let url:string="http://localhost:9080/api/postservice/protected/comment";
    return this.myHttpCli.post<string>(url,comment,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });
  }
}
