import seedUsers from './user.seed';
import seedRoles from './role.seed';
import seedPermissions from './permission.seed';
import logger from '../../utils/logger.util';

/**
 * @name seedData
 * @description Seeds all collections in the database in the correct order:
 * 1. Roles (must be first - other seeds depend on roles)
 * 2. Permissions (must be second - users depend on permissions)
 * 3. Users (must be last - depends on roles and permissions)
 *
 * Seeding is conditional:
 * - Only runs if ENABLE_SEEDING=true (required in all environments)
 * - Individual seed functions have built-in safety checks:
 *   - Roles: Only seeds if no roles exist
 *   - Permissions: Uses upsert (safe to rerun)
 *   - Users: Only seeds if superadmin doesn't exist
 *
 * @async
 * @function seedData
 * @returns {Promise<void>}
 * @throws {Error} If any of the seeding operations fail
 */
const seedData = async (): Promise<void> => {
    // Only seed if explicitly enabled
    if (process.env.ENABLE_SEEDING !== 'true') {
        logger.log({
            type: 'info',
            data: 'Seeding disabled. Set ENABLE_SEEDING=true in .env to enable.',
        });
        return;
    }
    logger.log({
        type: 'info',
        data: 'Starting database seeding...',
    });

    // Seed in correct order (dependencies first)
    await seedRoles();
    await seedPermissions();
    await seedUsers();

    logger.log({
        type: 'success',
        data: 'Database seeding completed successfully.',
    });
};

export default seedData;
