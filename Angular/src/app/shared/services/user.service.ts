import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Follow } from '../model/Follow';
import { ResponseMessage } from '../model/ResponseMessage';
import { User } from '../model/User';
import { GetCookieService } from './get-cookie.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  

  constructor(private myHttpCli:HttpClient, private cookieService: GetCookieService) { }

  insertNewUser(user:User): Observable<ResponseMessage> {
    let url:string="http://localhost:9080/api/userservice/user";
    return this.myHttpCli.post<ResponseMessage>(url,user,{withCredentials:true});
  }

  updateUser(user:User): Observable<boolean>{
    let authtoken = this.cookieService.getCookie("token")
    let url: string = "http://localhost:9080/api/userservice/protected/user";
    return this.myHttpCli.put<boolean>(url,user,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });

  }

  deleteUser(id:number): void{
    let url: string = `http://localhost:9080/api/userservice/user/${id}`;
    this.myHttpCli.delete<HttpResponse<ArrayBuffer>>(url);
  }

  checkOldPass(user:User,oldPassword:string, newPassword: string): Observable<boolean>{
    let authtoken = this.cookieService.getCookie("token")
    const formData = new FormData();
    formData.append("username",user.userName)
    formData.append("oldpassword",oldPassword)
    formData.append("newpassword",newPassword)
    let url: string = "http://localhost:9080/api/userservice/protected/validate-password";
    
    return this.myHttpCli.post<boolean>(url,formData,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });
  }


  getFollowers(userId: number): Observable<User[]>{
    let url: string = `http://localhost:9080/api/userservice/follow/follower/${userId}`;
    
    return this.myHttpCli.get<User[]>(url,{withCredentials:true});
  }

  getFollowees(userId: number): Observable<User[]>{
    let url: string = `http://localhost:9080/api/userservice/follow/followee/${userId}`;
    return this.myHttpCli.get<User[]>(url,{withCredentials:true});
  }

  followUser(follow: Follow): Observable<boolean>{
    let authtoken = this.cookieService.getCookie("token")
    let url: string = `http://localhost:9080/api/userservice/protected/follow`;
    return this.myHttpCli.post<boolean>(url,follow,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });
  }

  unfollowUser(follow: Follow) : Observable<boolean>{
    let authtoken = this.cookieService.getCookie("token")
    let url: string = `http://localhost:9080/api/userservice/protected/follow/${follow.follower.userID}/${follow.followee.userID}`;
    return this.myHttpCli.delete<boolean>(url,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });
  }

  verifyEmail(user:User) : Observable<ResponseMessage>{
    let authtoken = this.cookieService.getCookie("token")
    let url: string = `http://localhost:9080/api/userservice/protected/verify-email`;
    return this.myHttpCli.post<ResponseMessage>(url,user,{
      headers: {
        token: authtoken
      }, withCredentials:true
    });
  }
  
}
