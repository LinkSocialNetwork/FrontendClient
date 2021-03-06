import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Notifications } from '../../model/Notifications';
import { User } from '../../model/User';
import { GetCookieService } from '../../services/get-cookie.service';
import { LoginService } from '../../services/login.service';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  //================================================= INPUT ====================================================//

  @Input()
  active: string = 'home';

  //================================================== OUTPUT ==================================================//

  @Output()
  toggleTheme: EventEmitter<void> = new EventEmitter();

  //================================================== VARIABLES ==================================================//

  title = 'Project2';
  user: User;
  notifications: Array<Notifications> = [];

  //-============================================== CONSTRUCTOR / HOOKS =============================================//

  constructor(
    private loginService: LoginService,
    private cookieService: GetCookieService,
    private router: Router,
    private notificationServ: NotificationService,
  ) {}

  ngOnInit(): void {
    this.notifications = [];
    let authtoken = this.cookieService.getCookie('token');
    if (authtoken) {
      this.loginService.getLoggedInUser().subscribe((data) => {
        if (data) {
          this.user = data;
          this.getNotifications();
        }
      });
    }
  }

  //-=============================================== METHODS ====================================================//

  getNotifications() {
    this.notificationServ
      .getAllNotifications(this.user.userID)
      .subscribe(note => {
        let newNotes:Notifications[]=[];
        newNotes = note;
        newNotes.sort((a,b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0))
        for(const noti of newNotes){
          this.notifications.push(noti);
        }
      });
  }

  //---------------------------------------------------------------------------------------------------------------//

  logout() {
    this.cookieService.eraseCookie('token');
    this.router.navigate(['login']);
  }

  //---------------------------------------------------------------------------------------------------------------//

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  //---------------------------------------------------------------------------------------------------------------//

  activate(link: string) {
    let home = document.getElementById('home');
    let profile = document.getElementById('profile');
    let cahtRoom = document.getElementById('chatroom');
    let search = document.getElementById('search');
    home.setAttribute('class', 'nav-item');
    profile.setAttribute('class', 'nav-item');
    cahtRoom.setAttribute('class', 'nav-item');
    search.setAttribute('class', 'nav-item');
    document.getElementById(link).setAttribute('class', 'nav-item active');
  }

  //---------------------------------------------------------------------------------------------------------------//

  clearAllNotifications(): void {
    this.notificationServ
      .clearAllNotifications(this.user.userID)
      .subscribe((data) => {
        this.ngOnInit();
      });
    }

  //---------------------------------------------------------------------------------------------------------------//

  toggleDarkMode(): void{
    this.toggleTheme.emit();
  }

  //---------------------------------------------------------------------------------------------------------------//

}
