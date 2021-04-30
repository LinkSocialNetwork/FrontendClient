import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { Post } from 'src/app/shared/model/Post';
import { User } from 'src/app/shared/model/User';
import { GetPostService } from 'src/app/shared/services/get-post.service';
import { GetUserService } from 'src/app/shared/services/get-user.service';
import { ImageUploadService } from 'src/app/shared/services/image-upload.service';
import { LoginService } from 'src/app/shared/services/login.service';
import { UserService } from 'src/app/shared/services/user.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  posts:Post[]=[];
  mySubscription: any;
  appCom: HTMLElement;
  passwordBlock:HTMLElement;
  isChecked:boolean = false;
  currentUser:User ={
    userID: 0,
    userName: '',
    password: '',
    email: '',
    dob: null,
    profile_img_url: '',
    bio: '',
    posts: null,
    likes: null,
    firstName:'',
    lastName:'',
  };

  // We create another User to hold all changed fields
  updatedUser:User = {
    userID: 0,
    userName: '',
    password: '',
    email: '',
    dob: null,
    profile_img_url: '',
    bio: '',
    posts: null,
    likes: null,
    firstName:'',
    lastName:'',
  }

  // This will hold the updated profile pic file
  updatedImage:File=null;

  // This will hold all the password update fields
  newPassword1:string = '';
  newPassword2:string = '';
  oldPassword:string = '';
  
  constructor(private getUserService:GetUserService,
    private userService:UserService,
    private router:Router,
    private getPostService:GetPostService,
    private loginService:LoginService,
    private imageServ:ImageUploadService,
    private appComponent:AppComponent) {  }

  ngOnInit(): void {
    this.appComponent.isShow=true;

    // Get the currently logged in user and set it
    this.loginService.getLoggedInUser().subscribe(
      data =>{
        if(data==null){
          this.router.navigate(['/login']);
        }
        else {
          //force update the current user
          this.loginService.setCurrent(data);
          this.currentUser = data;

          // Initialize the updated user with the current fields
          this.updatedUser = data;
        }
      }
    )
    this.appCom = document.getElementById("home-navbar");
    this.appCom.setAttribute("style","");

    this.passwordBlock = document.getElementById("passwordBlock");
    this.passwordBlock.setAttribute("style","display:none")
    this.appCom = document.getElementById("home-navbar");
    this.appCom.setAttribute("style","");
  }

  // Basically a ngModel for the updatedImage field
  handleFileInput(files:FileList){
    this.updatedImage = files.item(0);
    console.log("file name:"+this.updatedImage.name);
    console.log("file type:"+this.updatedImage.type);
    console.log("file size:"+this.updatedImage.size);
  }


  getUserPosts(userID:number):void{
    this.getPostService.getPostsCreatedByUser(userID).subscribe(
      data =>{
        let newPosts:Post[];
        newPosts=data;
        newPosts.sort((a,b) => (a.postedAt > b.postedAt) ? -1 : ((b.postedAt > a.postedAt) ? 1 : 0))
        this.posts= newPosts;
      }
    )
  }

  checkIfPostIsLiked(post:Post):boolean{
    let loggedInUser:User =this.currentUser;
    for(var like of post.usersWhoLiked){//will search the post for the Like that connects the user and post

      for(var likeOfUser of loggedInUser.likes){
        if(like.likeId===likeOfUser.likeId){
          return true;
        }
      }
    }
    return false;
  }

  // Updates the logged in user with field values from the form (if they are not empty)
  // We set the updatedUser object to the currentUser object onInit, so if they are not changed, then they will all be the current values
  // TODO: if the user inputs a value, but then deletes the value, the updateUser object field should be changed back to the currentUser object field 
  updateUserInfo(){
    Swal.fire({
      title: 'Updating',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      timer: 4000,
      onOpen: () => {
        Swal.showLoading();
      }
    });
    
    let user:User;
    console.log("Checking if password checkmark is there");

    // This checks if the user is trying to update their password via the toggle button
    // If so, then we use the userService.checkOldPass with the entered in old password to verify if it's valid
    // If not, we return and don't update anything
    if(this.isChecked){
      if(this.newPassword1 != this.newPassword2 || this.newPassword1.length==0 || this.newPassword2.length==0)
      {
        Swal.fire({
          icon: 'warning',
          title: "Passwords do not match",
          timer: 4000,
          showConfirmButton: true
        });
        return;
      }
      else
      {
        this.updatedUser.password = this.oldPassword;

        // If the entered in current password value is not what's in the db,
        // we don't update anything
        this.userService.checkOldPass(this.updatedUser).subscribe(data => {
          if(data)
          {
            Swal.fire({
              icon: 'warning',
              title: "Incorrect Old Password",
              timer: 4000,
              showConfirmButton: true
            });
            return;
          }
        })
      }
    }

    // If there's a new image, upload it and set it to the updatedUser object
    if(this.updatedImage != null){  
      let file:FormData=new FormData;
      file.append("file",this.updatedImage)
      this.imageServ.imageUpload(file).subscribe(
        data=>{
          console.log("We got the url:"+data.message);
          console.log(data.message);

          // Set it to the updated user
          this.updatedUser.profile_img_url=data.message;
        }
      );
    }

    // This will update the user by sending the updatedUser object through the service
    console.log(user);
    this.userService.updateUser(this.updatedUser).subscribe(
      data =>{
        Swal.fire({ 
          icon: 'success',
          title: 'Done',
          timer: 4000,
          showConfirmButton: true
        });
        console.log("UpdateUser result: "+data);
        window.location.reload();
      }
    );
  }

  checkValue(event:any){
    if(event.checked){
      this.isChecked=true;
      this.passwordBlock.setAttribute("style","")
    }else{
      this.isChecked=false;
      this.passwordBlock.setAttribute("style","display:none")
    }
    
 }

}
