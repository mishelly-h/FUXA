import { Injectable, inject } from '@angular/core';
import { ResourceStorageService } from './rcgi/resource-storage.service';
import { RcgiService } from './rcgi/rcgi.service';
import { Subscription, interval } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class HeartbeatService {
	private authService = inject(AuthService);
	private router = inject(Router);
	private rcgiService = inject(RcgiService);


	private heartbeatInterval = 5 * 60 * 1000;
	private server: ResourceStorageService;
	private heartbeatSubscription: Subscription;
	private activity = false;
	constructor() {
		const rcgiService = this.rcgiService;

		this.server = rcgiService.rcgi;
	}

	startHeartbeatPolling(): void {
		if (this.server) {
			this.stopHeartbeatPolling();
			this.heartbeatSubscription = interval(this.heartbeatInterval).subscribe(() => {
				const activitySinceLastHeartbeat = this.activity;
				this.activity = false;
				this.server.heartbeat(activitySinceLastHeartbeat).subscribe(res => {
					if (res?.message === 'tokenRefresh' && res?.token) {
						this.authService.setNewToken(res.token, res.data);
					} else if (res?.message === 'guest' && res?.token) {
						this.authService.signOut();
					}
				}, (error) => {
					if (error instanceof HttpErrorResponse) {
						if (error.status === 401 || error.status === 403) {
							this.router.navigateByUrl('/');
						}
					}
				});
			});
		}
	}

	stopHeartbeatPolling(): void {
		if (this.heartbeatSubscription) {
			this.heartbeatSubscription.unsubscribe();
		}
	}

	setActivity(activity: boolean) {
		this.activity = activity;
	}
}
