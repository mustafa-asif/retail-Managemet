import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const ALLOWED_JOBS = ['JOB_REFRESH_MV', 'JOB_MONTHLY_AUDIT', 'JOB_WEEKLY_EXPORT'];

const BRANCH_USERS = [
    'GULSHAN_MGR',
    'DEFENSE_MGR',
    'AWAMI_MGR',
    'GULSHAN_CASHIER',
    'DEFENSE_CASHIER',
    'AWAMI_CASHIER',
    'ANALYST_USER',
];

@Injectable()
export class AdminService {
    constructor(private readonly db: DatabaseService) { }

    // ─── Scheduler Jobs ───

    async getJobs() {
        const result = await this.db.execute(`
      SELECT job_name, state, enabled, 
             TO_CHAR(last_start_date, 'YYYY-MM-DD HH24:MI:SS') AS last_start_date,
             TO_CHAR(next_run_date, 'YYYY-MM-DD HH24:MI:SS') AS next_run_date,
             repeat_interval
      FROM user_scheduler_jobs
      ORDER BY job_name
    `);
        return result.rows;
    }

    async runJob(jobName: string) {
        const upperName = jobName.toUpperCase();
        if (!ALLOWED_JOBS.includes(upperName)) {
            throw new BadRequestException(
                `Invalid job name. Allowed jobs: ${ALLOWED_JOBS.join(', ')}`,
            );
        }
        await this.db.execute(`BEGIN DBMS_SCHEDULER.RUN_JOB(:job_name); END;`, {
            job_name: upperName,
        });
        return { message: `Job ${upperName} executed successfully` };
    }

    // ─── Users & Roles ───

    async getUsers() {
        const placeholders = BRANCH_USERS.map((_, i) => `:u${i}`).join(', ');
        const binds: Record<string, string> = {};
        BRANCH_USERS.forEach((u, i) => {
            binds[`u${i}`] = u;
        });

        const result = await this.db.execute(
            `SELECT username, account_status, 
              TO_CHAR(created, 'YYYY-MM-DD') AS created
       FROM all_users 
       WHERE username IN (${placeholders})
       ORDER BY username`,
            binds,
        );

        // For each user, get their granted roles
        const users: any[] = [];
        for (const row of (result.rows as any[]) || []) {
            const roleResult = await this.db.execute(
                `SELECT granted_role FROM dba_role_privs WHERE grantee = :username`,
                { username: row.USERNAME },
            );
            users.push({
                ...row,
                roles: (roleResult.rows as any[] || []).map((r: any) => r.GRANTED_ROLE),
            });
        }
        return users;
    }

    async getRoles() {
        const roles = ['STORE_MANAGER', 'CASHIER', 'ANALYST'];
        const allRoles: any[] = [];

        for (const role of roles) {
            const sysPrivs = await this.db.execute(
                `SELECT privilege FROM role_sys_privs WHERE role = :role`,
                { role },
            );
            const tabPrivs = await this.db.execute(
                `SELECT privilege, table_name FROM role_tab_privs WHERE role = :role`,
                { role },
            );
            allRoles.push({
                role,
                system_privileges: (sysPrivs.rows as any[] || []).map((r: any) => r.PRIVILEGE),
                table_privileges: tabPrivs.rows || [],
            });
        }
        return allRoles;
    }
}
