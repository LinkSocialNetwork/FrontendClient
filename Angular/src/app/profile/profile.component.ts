import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AppComponent } from '../app.component';
import { Post } from '../model/Post';
import { User } from '../model/User';
import { GetPostService } from '../shared/get-post.service';
import { GetUserService } from '../shared/get-user.service';
import { ImageUploadService } from '../shared/image-upload.service';
import { LoginService } from '../shared/login.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit,OnDestroy {

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
    profile_img_url: '',
    bio: '',
    posts: null,
    likes: null,
    firstName:'',
    lastName:''};


  updateForm = this.formBuilder.group({
    imageInput:'',
    userNameInput:'',
    emailInput:'',
    firstNameInput:'',
    lastNameInput:'',
    bioInput:''
    });

  userName:string='';
  email:string='';
  firstName:string='';
  lastName:string='';
  bio:string='';
  image:File=null;
  
  constructor(private getUserService:GetUserService,
    private formBuilder: FormBuilder,
    private userService:UserService,
    private router:Router,
    private getPostService:GetPostService,
    private loginService:LoginService,
    private imageServ:ImageUploadService,
    private appComponent:AppComponent) {  }


  ngOnDestroy():void {
   
  }
  ngOnInit(): void {
    

 

    this.appComponent.isShow=true;

    this.loginService.getLoggedInUser().subscribe(
      data =>{
        // info=data;
        
        if(data==null){
          this.router.navigate(['/login']);
        }
        else {
          //force update the current user
          this.loginService.setCurrent(data);
        }

      }
    )
    this.appCom = document.getElementById("home-navbar");
    this.appCom.setAttribute("style","");

    this.passwordBlock = document.getElementById("passwordBlock");
    this.passwordBlock.setAttribute("style","display:none")
    this.appCom = document.getElementById("home-navbar");
    this.appCom.setAttribute("style","");
    this.getUserService.getCurrentUser().subscribe(
      date => {
        this.currentUser = date;

        
        this.updateForm.value.firstNameInput= this.currentUser.firstName;
        this.updateForm.value.lastNameInput= this.currentUser.lastName;
        this.updateForm.value.bioInput= this.currentUser.bio;
        
        this.userName = this.currentUser.userName;
        this.email= this.currentUser.email;
        this.firstName= this.currentUser.firstName;
        this.lastName= this.currentUser.lastName;
        this.bio= this.currentUser.bio;
        this.getUserPosts(date.userID);
      }
    );

    
  }

  handleFileInput(files:FileList){
    this.image=files.item(0);
    console.log("file name:"+this.image.name);
    console.log("file type:"+this.image.type);
    console.log("file size:"+this.image.size);
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

    // updateForm = this.formBuilder.group({
    //   userNameInput:'',
    //   emailInput:'',
    //   firstNameInput:'',
    //   lastNameInput:'',
    //   bioInput:''
    //   });

    let de:string = (<HTMLInputElement>document.getElementById("input-bio")).value;
    let fn:string = (<HTMLInputElement>document.getElementById("input-first-name")).value;
    let ln:string = (<HTMLInputElement>document.getElementById("input-last-name")).value;
    let np:string = (<HTMLInputElement>document.getElementById("input-new-password")).value;
    let renp:string = (<HTMLInputElement>document.getElementById("input-renew-password")).value;
    let op:string = (<HTMLInputElement>document.getElementById("input-old-password")).value;
    
    let user:User;
    console.log("Checking if password checkmark is there")
    if(this.isChecked){
      if(np!=renp || np.length==0 || renp.length==0){
        Swal.fire({
          icon: 'warning',
          title: "passwords does't match",
          timer: 4000,
          showConfirmButton: true
        });
        return;
      }
      user = {
        userID: this.currentUser.userID,
        userName: this.userName,
        password: op,
        email: this.email,
        profile_img_url: this.currentUser.profile_img_url,
        bio: de,
        posts: this.currentUser.posts,
        likes: this.currentUser.likes,
        firstName:fn,
        lastName:ln
      };

      if(this.image!=null){
        
        let file:FormData=new FormData;
        file.append("file",this.image)
        this.imageServ.imageUpload(file).subscribe(
          data=>{
            console.log("We got the url:"+data.message);
            console.log(data.message);
<<<<<<< HEAD
            user.profilePic=data.message;
            console.log(user.profilePic);
=======
            user.profile_img_url="https://rev-training-p2-bucket.s3.us-east-2.amazonaws.com/"+data.message;
            console.log(user.profile_img_url);
>>>>>>> 5534e6b154b510e3cbfbc16915a56fa151e9ebe7
            this.userService.checkOldPass(user).subscribe(
              data=>{
                
                if(data==null){
                  Swal.fire({
                    icon: 'warning',
                    title: "Old Password Does't match the entered password",
                    timer: 4000,
                    showConfirmButton: true
                  });
                  return;
                }else{
                  user = {
                    userID: this.currentUser.userID,
                    userName: this.userName,
                    password: np,
                    email: this.email,
                    profile_img_url: this.currentUser.profile_img_url,
                    bio: de,
                    posts: this.currentUser.posts,
                    likes: this.currentUser.likes,
                    firstName:fn,
                    lastName:ln
                  };
                  console.log(user);
                  this.userService.updateUser(user).subscribe(
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
              }
            );
          }
        );
      }else{

        console.log(user);
        this.userService.checkOldPass(user).subscribe(
          data=>{
            
            if(data==null){
              Swal.fire({
                icon: 'warning',
                title: "Old Password Does't match the entered password",
                timer: 4000,
                showConfirmButton: true
              });
              return;
            }else{
              user = {
                userID: this.currentUser.userID,
                userName: this.userName,
                password: np,
                email: this.email,
                profile_img_url: this.currentUser.profile_img_url,
                bio: de,
                posts: this.currentUser.posts,
                likes: this.currentUser.likes,
                firstName:fn,
                lastName:ln
              };
              console.log(user);
              this.userService.updateUser(user).subscribe(
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
          }
        );
      }

    }
    else{

      user = {
        userID: this.currentUser.userID,
        userName: this.userName,
        password: this.currentUser.password,
        email: this.email,
        profile_img_url: this.currentUser.profile_img_url,
        bio: de,
        posts: this.currentUser.posts,
        likes: this.currentUser.likes,
        firstName:fn,
        lastName:ln
      }
      if(this.image!=null){
        
        let file:FormData=new FormData;
        file.append("file",this.image)
        this.imageServ.imageUpload(file).subscribe(
          data=>{
            console.log("We got the url:"+data.message);
            console.log(data.message);
<<<<<<< HEAD
            user.profilePic=data.message;
            console.log(user.profilePic);
=======
            user.profile_img_url="https://rev-training-p2-bucket.s3.us-east-2.amazonaws.com/"+data.message;
            console.log(user.profile_img_url);
>>>>>>> 5534e6b154b510e3cbfbc16915a56fa151e9ebe7
            this.userService.updateUser(user).subscribe(
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
        );
      }else{

        console.log(user);
        this.userService.updateUser(user).subscribe(
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
    }    
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
