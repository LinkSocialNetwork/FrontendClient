import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { Comments } from '../../model/Comments';
import { Like } from '../../model/LIke';
import { Post } from '../../model/Post';
import { User } from '../../model/User';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {

  //================================================= INPUT ====================================================//

  @Input()
  post: Post;

  @Input()
  currentUser: User;

  //================================================== OUTPUT ==================================================//

  @Output()
  getFollowingPosts: EventEmitter<void> = new EventEmitter();

  @Output()
  resetPage: EventEmitter<void> = new EventEmitter();

  @Output()
  refreshNav: EventEmitter<void> = new EventEmitter();

  //-============================================== CONSTRUCTOR / HOOKS =============================================//

  constructor(
    private loginServ: LoginService,
    private commentService: CommentService,
    private likeServ: LikeService
  ) {}

  ngOnInit(): void {}

  //-=============================================== METHODS ====================================================//

  checkIfPostIsLiked(post: Post): boolean {
    let loggedInUser: User = this.loginServ.getCurrent();

    let userLiked = post?.usersWhoLiked.find(
      (element) => element.user.userID === loggedInUser?.userID
    );

    if (userLiked) return true;

    return false;
  }

  //---------------------------------------------------------------------------------------------------------------//

  addNewComment(valueOfPost: Post) {
    let commentText = (<HTMLInputElement>(
      document.getElementById(<string>(<unknown>valueOfPost.postId))
    )).value;
    if (commentText.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Please write a comment first.',
        timer: 8000,
        showConfirmButton: true,
      });
      return;
    }
    let newComment: Comments = {
      commentId: 0,
      commentContent: commentText,
      commentedAt: <string>(<unknown>new Date().getTime()),
      commentWriter: this.loginServ.getCurrent(),
      commentPost: valueOfPost,
    };
    this.commentService.insertNewComment(newComment).subscribe((data) => {
      this.resetPage.emit();
      this.getFollowingPosts.emit();
      this.loginServ.triggerRetrieveCurrent();
      this.refreshNav.emit();
    });
  }

  //---------------------------------------------------------------------------------------------------------------//

  toggleLike(valueOfPost: Post, isLiked: boolean) {
    if (isLiked) {
      //if the Post is liked by the User it will call delete
      //first get the loggedInUser
      let loggedIn: User = this.loginServ.getCurrent();
      let valueOfLike: Like | null = null;
      for (var like of valueOfPost.usersWhoLiked) {
        //will search the post for the Like that connects the user and post
        if (like.user.userID === loggedIn.userID) {
          valueOfLike = like;
          break;
        }
      }
      this.likeServ.deleteLike(valueOfLike).subscribe((data) => {
        this.resetPage.emit();
        this.getFollowingPosts.emit();
        this.loginServ.triggerRetrieveCurrent();
      });
    } else {
      let newLike: Like = {
        likeId: 0,
        user: this.loginServ.getCurrent(),
        post: valueOfPost,
      };

      this.likeServ.insertNewLike(newLike).subscribe((data) => {
        this.resetPage.emit();
        this.getFollowingPosts.emit();
        this.loginServ.triggerRetrieveCurrent();
        this.refreshNav.emit();
      });
    }
  }

  //---------------------------------------------------------------------------------------------------------------//

}
