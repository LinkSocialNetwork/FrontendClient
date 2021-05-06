import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  myUser : User = {
    'userID': 0,
    'userName':'',
    'password':'',
    'email':'',
    'dob': '',
    'profileImg':'',
    'bio':'',
    'firstName':'',
    'lastName':'',
    'posts':[],
    'likes':[],
    'following': []
  }
  constructor() { }
  dobModifier(dob: string) {
    const dateSendingToServer = new DatePipe('en-US').transform(dob, 'MM-dd-yyyy')
    return dateSendingToServer;
  }
}
