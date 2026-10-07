import { sqliteClient } from "./sqliteDb";

// Export direct high-performance SQLite client compatible with Prisma API.
// Eliminates all Rust binary dependencies, engine timeouts, and glibc issues on shared cPanel hosting.
export const prisma: any = sqliteClient;
export default prisma;
