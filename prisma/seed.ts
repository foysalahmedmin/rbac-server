import { PrismaPg } from '@prisma/adapter-pg';
import { Permission, PrismaClient, Role } from '@prisma/client';
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
  const permissionsData = [
    { name: 'View Dashboard', slug: 'view_dashboard', module: 'dashboard' },
    { name: 'Manage Users', slug: 'manage_users', module: 'users' },
    { name: 'Manage Roles', slug: 'manage_roles', module: 'roles' },
    { name: 'View Reports', slug: 'view_reports', module: 'reports' },
    { name: 'Manage Leads', slug: 'manage_leads', module: 'leads' },
    { name: 'Manage Tasks', slug: 'manage_tasks', module: 'tasks' },
    { name: 'View Audit Logs', slug: 'view_audit_logs', module: 'audit_logs' },
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
