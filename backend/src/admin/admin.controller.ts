import { Controller, Get, Post, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('jobs')
    getJobs() {
        return this.adminService.getJobs();
    }

    @Post('jobs/run/:jobName')
    runJob(@Param('jobName') jobName: string) {
        return this.adminService.runJob(jobName);
    }

    @Get('users')
    getUsers() {
        return this.adminService.getUsers();
    }

    @Get('roles')
    getRoles() {
        return this.adminService.getRoles();
    }
}
