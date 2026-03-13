import { PrismaPg } from '@prisma/adapter-pg';
import pkg from '@prisma/client';
import { Pool } from 'pg';
import { userStorage } from '../utils/async-storage';

const { PrismaClient } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const client = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);

        const writeOperations = [
          'create',
          'update',
          'delete',
          'upsert',
          'createMany',
          'updateMany',
          'deleteMany',
        ];

        if (writeOperations.includes(operation)) {
          const userId = userStorage.getStore()?.id;

          if (userId) {
            const anyArgs = args as any;
            const anyResult = result as any;

            // Log the action asynchronously to not block the main request
            prisma.auditLog
              .create({
                data: {
                  user_id: userId,
                  action: operation.toUpperCase(),
                  resource: model,
                  resource_id: anyArgs.where?.id
                    ? String(anyArgs.where.id)
                    : anyResult?.id
                      ? String(anyResult.id)
                      : undefined,
                  details: anyArgs.data || anyArgs,
                },
              })
              .catch((err) => {
                // Using a simple check to avoid logging the audit log creation itself if it fails
                if (model !== 'AuditLog') {
                  console.error('Failed to create audit log:', err);
                }
              });
          }
        }

        return result;
      },
    },
  },
});
