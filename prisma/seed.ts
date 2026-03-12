import { PrismaPg } from '@prisma/adapter-pg';
import { Permission, Prisma, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Permissions
  const permissionsData: Prisma.PermissionCreateInput[] = [
    { name: 'View Dashboard', slug: 'view_dashboard', module: 'dashboard' },
    { name: 'Manage Users', slug: 'manage_users', module: 'users' },
    { name: 'Manage Roles', slug: 'manage_roles', module: 'roles' },
    { name: 'View Audit Logs', slug: 'view_audit_logs', module: 'audit_logs' },
    // Leads Module
    { name: 'View Leads', slug: 'view_leads', module: 'leads' },
    { name: 'Manage Leads', slug: 'manage_leads', module: 'leads' },
    // Tasks Module
    { name: 'View Tasks', slug: 'view_tasks', module: 'tasks' },
    { name: 'Manage Tasks', slug: 'manage_tasks', module: 'tasks' },
    // Reports Module
    { name: 'View Reports', slug: 'view_reports', module: 'reports' },
    { name: 'Manage Reports', slug: 'manage_reports', module: 'reports' },
    // Others
    {
      name: 'Access Customer Portal',
      slug: 'access_customer_portal',
      module: 'portal',
    },
    { name: 'Manage Settings', slug: 'manage_settings', module: 'settings' },
  ];

  const permissions: Permission[] = [];
  for (const p of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    permissions.push(permission);
  }

  // 2. Create Roles
  const rolesData = [
    { name: 'admin', description: 'Full system access' },
    { name: 'manager', description: 'Team management access' },
    { name: 'agent', description: 'Assigned modules access' },
    { name: 'customer', description: 'Self-service portal access' },
  ];

  const roles: Record<string, Role> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roles[r.name] = role;
  }

  // 3. Assign Permissions to Roles (RolePermission)
  // Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: roles.admin.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: roles.admin.id,
        permission_id: permission.id,
      },
    });
  }

  // Manager gets some permissions
  const managerPermissions = [
    'view_dashboard',
    'manage_users',
    'view_reports',
    'manage_leads',
    'manage_tasks',
  ];
  for (const slug of managerPermissions) {
    const perm = permissions.find((p) => p.slug === slug);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roles.manager.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: roles.manager.id,
          permission_id: perm.id,
        },
      });
    }
  }

  // 4. Create Initial Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@rbac.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@rbac.com',
      password: hashedPassword,
      role_id: roles.admin.id,
      status: 'active',
    },
  });

  // 5. Create Sample Leads
  const leadsData = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      source: 'Website',
      status: 'new',
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      source: 'Referral',
      status: 'contacted',
    },
    {
      first_name: 'Bob',
      last_name: 'Wilson',
      email: 'bob@example.com',
      source: 'AdCampaign',
      status: 'qualified',
    },
  ];

  for (const l of leadsData) {
    await prisma.lead.upsert({
      where: { id: leadsData.indexOf(l) + 1 }, // Using ID for upsert here since email isn't unique in schema currently
      update: {},
      create: l,
    });
  }

  // 6. Create Sample Tasks
  const tasksData = [
    {
      title: 'Follow up with John',
      description: 'Call John for initial consultation',
      status: 'pending',
      priority: 'high',
    },
    {
      title: 'Send proposal to Jane',
      description: 'Prepare and email the project proposal',
      status: 'in-progress',
      priority: 'medium',
    },
    {
      title: 'Update CRM records',
      description: 'Clean up old lead data',
      status: 'completed',
      priority: 'low',
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: tasksData.indexOf(t) + 1 },
      update: {},
      create: t,
    });
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
