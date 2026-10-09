import fs from "fs";
import path from "path";

// Cuid-like unique ID generator
export function createId(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

let dbInstance: any = null;

function getDb() {
  if (dbInstance) return dbInstance;

  try {
    // Nạp node:sqlite chuẩn xác mà không bị Turbopack/bundler can thiệp
    const g = globalThis as any;
    const nodeSqlite =
      (typeof process !== "undefined" && typeof (process as any).getBuiltinModule === "function"
        ? (process as any).getBuiltinModule("node:sqlite")
        : null) ||
      (typeof g.__non_webpack_require__ === "function"
        ? g.__non_webpack_require__("node:sqlite")
        : eval('require')("node:sqlite"));

    const { DatabaseSync } = nodeSqlite;
    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    
    // Đảm bảo thư mục prisma tồn tại
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'USER',
        status TEXT DEFAULT 'active',
        credits INTEGER DEFAULT 10,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Bot (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        description TEXT,
        systemPrompt TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Project (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        systemPrompt TEXT,
        icon TEXT DEFAULT '📁',
        color TEXT DEFAULT 'indigo',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Conversation (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        botId TEXT NOT NULL,
        projectId TEXT,
        title TEXT DEFAULT 'Cuộc trò chuyện mới',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (botId) REFERENCES Bot(id) ON DELETE CASCADE,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS Message (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES Conversation(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Post (
        id TEXT PRIMARY KEY,
        authorId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'prompt',
        categoryLabel TEXT DEFAULT 'Prompt AI',
        image TEXT,
        likes INTEGER DEFAULT 0,
        commentsCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Comment (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS PostReaction (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        type TEXT DEFAULT 'like',
        createdAt INTEGER NOT NULL,
        UNIQUE (postId, userId),
        FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS PaymentOrder (
        id TEXT PRIMARY KEY,
        orderCode INTEGER UNIQUE NOT NULL,
        userId TEXT NOT NULL,
        amount INTEGER NOT NULL,
        credits INTEGER NOT NULL,
        packageName TEXT,
        status TEXT DEFAULT 'PENDING',
        paymentMethod TEXT DEFAULT 'payos_vietqr',
        payosPaymentLinkId TEXT,
        transactionId TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ExploreSearch (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        normalizedQuery TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);
    return dbInstance;
  } catch (err) {
    console.error("[SQLiteDb] Lỗi khởi tạo node:sqlite:", err);
    throw err;
  }
}

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const num = Number(val);
  return isNaN(num) ? new Date(val) : new Date(num);
}

function toTimestamp(val: any): number {
  if (!val) return Date.now();
  if (val instanceof Date) return val.getTime();
  const num = Number(val);
  return isNaN(num) ? new Date(val).getTime() : num;
}

// ==================== USER ====================
export const user = {
  async findUnique({ where, select, include }: any = {}) {
    const db = getDb();
    let row: any = null;
    if (where?.id) {
      row = db.prepare("SELECT * FROM User WHERE id = ?").get(where.id);
    } else if (where?.email) {
      row = db.prepare("SELECT * FROM User WHERE lower(email) = lower(?)").get(where.email.trim());
    }
    if (!row) return null;
    return this._format(row, include, select);
  },

  async findFirst({ where, select, include }: any = {}) {
    const db = getDb();
    if (where?.OR && Array.isArray(where.OR)) {
      for (const cond of where.OR) {
        if (cond.id) {
          const found = await this.findUnique({ where: { id: cond.id }, select, include });
          if (found) return found;
        }
        if (cond.email) {
          const found = await this.findUnique({ where: { email: cond.email }, select, include });
          if (found) return found;
        }
      }
      return null;
    }
    return this.findUnique({ where, select, include });
  },

  async findMany({ where = {}, select, include, orderBy, skip, take }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM User";
    const params: any[] = [];

    if (where.OR && Array.isArray(where.OR)) {
      const conds: string[] = [];
      for (const cond of where.OR) {
        if (cond.name?.contains) {
          conds.push("name LIKE ?");
          params.push(`%${cond.name.contains}%`);
        }
        if (cond.email?.contains) {
          conds.push("email LIKE ?");
          params.push(`%${cond.email.contains}%`);
        }
      }
      if (conds.length) sql += " WHERE (" + conds.join(" OR ") + ")";
    }

    sql += " ORDER BY createdAt DESC";
    if (take) {
      sql += ` LIMIT ${Number(take)}`;
      if (skip) sql += ` OFFSET ${Number(skip)}`;
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include, select));
  },

  async count({ where }: any = {}) {
    const db = getDb();
    const res = db.prepare("SELECT count(*) as count FROM User").get();
    return res.count;
  },

  async create({ data, select, include }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      email: data.email.toLowerCase().trim(),
      name: data.name || data.email.split("@")[0],
      avatar: data.avatar || null,
      role: data.role || "USER",
      status: data.status || "active",
      credits: Number(data.credits ?? 20),
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };

    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(", ");
    db.prepare(`INSERT INTO User (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`)
      .run(...cols.map(c => (row as any)[c]));

    return this.findUnique({ where: { id }, select, include });
  },

  async update({ where, data, select, include }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("User không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];

    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === "object" && "increment" in (v as any)) {
        updates.push(`"${k}" = "${k}" + ?`);
        params.push((v as any).increment);
      } else if (v && typeof v === "object" && "decrement" in (v as any)) {
        updates.push(`"${k}" = "${k}" - ?`);
        params.push((v as any).decrement);
      } else if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }

    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE User SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id }, select, include });
  },

  async upsert({ where, update, create, select, include }: any) {
    const existing = await this.findUnique({ where });
    if (existing) {
      if (update && Object.keys(update).length > 0) {
        return this.update({ where: { id: existing.id }, data: update, select, include });
      }
      return existing;
    }
    return this.create({ data: create, select, include });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM User WHERE id = ?").run(existing.id);
    }
    return existing;
  },

  _format(row: any, include: any, select: any) {
    const db = getDb();
    const isHL = row.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";
    const res: any = {
      ...row,
      role: isHL ? "ADMIN" : (row.role || "USER"),
      credits: isHL ? 999999 : Number(row.credits || 0),
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };

    if (include?._count?.select) {
      res._count = {
        conversations: db.prepare("SELECT count(*) as count FROM Conversation WHERE userId = ?").get(row.id).count,
        posts: db.prepare("SELECT count(*) as count FROM Post WHERE authorId = ?").get(row.id).count,
      };
    }

    if (select) {
      const selected: any = {};
      for (const k of Object.keys(select)) {
        if (select[k]) selected[k] = res[k];
      }
      return selected;
    }

    return res;
  }
};

// ==================== BOT ====================
export const bot = {
  async findUnique({ where }: any) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM Bot WHERE id = ?").get(where.id);
    if (!row) return null;
    return { ...row, createdAt: toDate(row.createdAt), updatedAt: toDate(row.updatedAt) };
  },

  async findMany() {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM Bot ORDER BY createdAt DESC").all();
    return rows.map((r: any) => ({ ...r, createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt) }));
  },

  async update({ where, data }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("Bot không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }
    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE Bot SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id } });
  },

  async upsert({ where, update, create }: any) {
    const existing = await this.findUnique({ where });
    if (existing) {
      if (update && Object.keys(update).length > 0) {
        return this.update({ where: { id: existing.id }, data: update });
      }
      return existing;
    }
    const db = getDb();
    const now = Date.now();
    const row = {
      id: create.id,
      name: create.name,
      avatar: create.avatar || "",
      description: create.description || null,
      systemPrompt: create.systemPrompt || "",
      createdAt: toTimestamp(create.createdAt || now),
      updatedAt: toTimestamp(create.updatedAt || now),
    };
    db.prepare(`INSERT INTO Bot (id, name, avatar, description, systemPrompt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(row.id, row.name, row.avatar, row.description, row.systemPrompt, row.createdAt, row.updatedAt);
    return this.findUnique({ where: { id: create.id } });
  }
};

// ==================== CONVERSATION ====================
export const conversation = {
  async findUnique({ where, include }: any) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM Conversation WHERE id = ?").get(where.id);
    if (!row) return null;
    return this._format(row, include);
  },

  async findFirst({ where, include, orderBy }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Conversation";
    const params: any[] = [];
    const conds: string[] = [];
    if (where?.userId) {
      conds.push("userId = ?");
      params.push(where.userId);
    }
    if (where?.botId) {
      conds.push("botId = ?");
      params.push(where.botId);
    }
    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY updatedAt DESC LIMIT 1";

    const row = db.prepare(sql).get(...params);
    if (!row) return null;
    return this._format(row, include);
  },

  async findMany({ where = {}, include, orderBy, take, skip }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Conversation";
    const params: any[] = [];
    const conds: string[] = [];

    if (where.userId) {
      conds.push("userId = ?");
      params.push(where.userId);
    }
    if (where.botId) {
      conds.push("botId = ?");
      params.push(where.botId);
    }
    if (where.projectId) {
      conds.push("projectId = ?");
      params.push(where.projectId);
    }

    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY updatedAt DESC";
    if (take) {
      sql += ` LIMIT ${Number(take)}`;
      if (skip) sql += ` OFFSET ${Number(skip)}`;
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include));
  },

  async create({ data, include }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      userId: data.userId,
      botId: data.botId,
      projectId: data.projectId || null,
      title: data.title || "Cuộc trò chuyện mới",
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };

    db.prepare("INSERT INTO Conversation (id, userId, botId, projectId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(row.id, row.userId, row.botId, row.projectId, row.title, row.createdAt, row.updatedAt);

    return this.findUnique({ where: { id }, include });
  },

  async update({ where, data, include }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("Conversation không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }
    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE Conversation SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id }, include });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM Message WHERE conversationId = ?").run(existing.id);
      db.prepare("DELETE FROM Conversation WHERE id = ?").run(existing.id);
    }
    return existing;
  },

  _format(row: any, include: any) {
    const db = getDb();
    const res: any = {
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };

    if (include?.bot) {
      const bRow = db.prepare("SELECT * FROM Bot WHERE id = ?").get(row.botId);
      res.bot = bRow ? { ...bRow, createdAt: toDate(bRow.createdAt), updatedAt: toDate(bRow.updatedAt) } : null;
    }
    if (include?.project && row.projectId) {
      const pRow = db.prepare("SELECT * FROM Project WHERE id = ?").get(row.projectId);
      res.project = pRow ? project._format(pRow, include?.project?.include) : null;
    }
    if (include?.messages) {
      const msgs = db.prepare("SELECT * FROM Message WHERE conversationId = ? ORDER BY createdAt ASC").all(row.id);
      res.messages = msgs.map((m: any) => ({ ...m, createdAt: toDate(m.createdAt) }));
    }
    if (include?._count?.select?.messages) {
      res._count = {
        messages: db.prepare("SELECT count(*) as count FROM Message WHERE conversationId = ?").get(row.id).count,
      };
    }
    return res;
  }
};

// ==================== MESSAGE ====================
export const message = {
  async create({ data }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      conversationId: data.conversationId,
      sender: data.sender,
      content: data.content,
      createdAt: toTimestamp(data.createdAt || now),
    };

    db.prepare("INSERT INTO Message (id, conversationId, sender, content, createdAt) VALUES (?, ?, ?, ?, ?)")
      .run(row.id, row.conversationId, row.sender, row.content, row.createdAt);

    return { ...row, createdAt: toDate(row.createdAt) };
  },

  async findMany({ where = {}, orderBy, take }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Message";
    const params: any[] = [];
    if (where.conversationId) {
      sql += " WHERE conversationId = ?";
      params.push(where.conversationId);
    }
    sql += " ORDER BY createdAt ASC";
    if (take) sql += ` LIMIT ${Number(take)}`;

    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => ({ ...r, createdAt: toDate(r.createdAt) }));
  },

  async deleteMany({ where = {} }: any) {
    const db = getDb();
    if (where.conversationId) {
      const res = db.prepare("DELETE FROM Message WHERE conversationId = ?").run(where.conversationId);
      return { count: res.changes };
    }
    return { count: 0 };
  }
};

// ==================== PROJECT ====================
export const project = {
  async findUnique({ where, include }: any) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM Project WHERE id = ?").get(where.id);
    if (!row) return null;
    return this._format(row, include);
  },

  async findMany({ where = {}, include, orderBy }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Project";
    const params: any[] = [];
    if (where.userId) {
      sql += " WHERE userId = ?";
      params.push(where.userId);
    }
    sql += " ORDER BY updatedAt DESC";
    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include));
  },

  async create({ data }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      userId: data.userId,
      name: data.name,
      description: data.description || null,
      systemPrompt: data.systemPrompt || null,
      icon: data.icon || "📁",
      color: data.color || "indigo",
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };
    db.prepare("INSERT INTO Project (id, userId, name, description, systemPrompt, icon, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(row.id, row.userId, row.name, row.description, row.systemPrompt, row.icon, row.color, row.createdAt, row.updatedAt);
    return this.findUnique({ where: { id } });
  },

  async update({ where, data }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("Project không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }
    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE Project SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id } });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM Project WHERE id = ?").run(existing.id);
    }
    return existing;
  },

  _format(row: any, include: any) {
    const db = getDb();
    const res: any = {
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };
    if (include?.conversations) {
      const cRows = db.prepare("SELECT * FROM Conversation WHERE projectId = ? ORDER BY createdAt DESC").all(row.id);
      res.conversations = cRows.map((c: any) => conversation._format(c, include?.conversations?.include));
    }
    return res;
  }
};

// ==================== POST ====================
export const post = {
  async findUnique({ where, include }: any) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM Post WHERE id = ?").get(where.id);
    if (!row) return null;
    return this._format(row, include);
  },

  async findMany({ where = {}, include, orderBy, take, skip }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Post";
    const params: any[] = [];
    const conds: string[] = [];

    if (where.authorId) {
      conds.push("authorId = ?");
      params.push(where.authorId);
    }
    if (where.category) {
      conds.push("category = ?");
      params.push(where.category);
    }
    if (where.status) {
      conds.push("status = ?");
      params.push(where.status);
    }
    if (where.OR && Array.isArray(where.OR)) {
      const orConds: string[] = [];
      for (const cond of where.OR) {
        if (cond.title?.contains) {
          orConds.push("title LIKE ?");
          params.push(`%${cond.title.contains}%`);
        } else if (cond.content?.contains) {
          orConds.push("content LIKE ?");
          params.push(`%${cond.content.contains}%`);
        }
      }
      if (orConds.length > 0) {
        conds.push(`(${orConds.join(" OR ")})`);
      }
    }

    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY createdAt DESC";
    if (take) {
      sql += ` LIMIT ${Number(take)}`;
      if (skip) sql += ` OFFSET ${Number(skip)}`;
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include));
  },

  async create({ data, include }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      category: data.category || "prompt",
      categoryLabel: data.categoryLabel || "Prompt AI",
      image: data.image || null,
      likes: Number(data.likes || 0),
      commentsCount: Number(data.commentsCount || 0),
      status: data.status || "published",
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };

    const cols = Object.keys(row);
    db.prepare(`INSERT INTO Post (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .run(...cols.map(c => (row as any)[c]));

    return this.findUnique({ where: { id }, include });
  },

  async update({ where, data, include }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("Post không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === "object" && "increment" in (v as any)) {
        updates.push(`"${k}" = "${k}" + ?`);
        params.push((v as any).increment);
      } else if (v && typeof v === "object" && "decrement" in (v as any)) {
        updates.push(`"${k}" = "${k}" - ?`);
        params.push((v as any).decrement);
      } else if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }
    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE Post SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id }, include });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM Comment WHERE postId = ?").run(existing.id);
      db.prepare("DELETE FROM PostReaction WHERE postId = ?").run(existing.id);
      db.prepare("DELETE FROM Post WHERE id = ?").run(existing.id);
    }
    return existing;
  },

  _format(row: any, include: any) {
    const db = getDb();
    const res: any = {
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };

    if (include?.author) {
      const aRow = db.prepare("SELECT * FROM User WHERE id = ?").get(row.authorId);
      res.author = aRow ? user._format(aRow, include?.author?.include, include?.author?.select) : null;
    }
    if (include?.comments) {
      const cRows = db.prepare("SELECT * FROM Comment WHERE postId = ? ORDER BY createdAt ASC").all(row.id);
      res.comments = cRows.map((c: any) => comment._format(c, include?.comments?.include));
    }
    if (include?.reactions) {
      const rRows = db.prepare("SELECT * FROM PostReaction WHERE postId = ?").all(row.id);
      res.reactions = rRows.map((r: any) => ({ ...r, createdAt: toDate(r.createdAt) }));
    }
    if (include?._count) {
      res._count = {
        comments: db.prepare("SELECT count(*) as count FROM Comment WHERE postId = ?").get(row.id).count,
        reactions: db.prepare("SELECT count(*) as count FROM PostReaction WHERE postId = ?").get(row.id).count,
      };
    }
    return res;
  }
};

// ==================== COMMENT ====================
export const comment = {
  async findUnique({ where, include }: any) {
    const db = getDb();
    const row = db.prepare("SELECT * FROM Comment WHERE id = ?").get(where.id);
    if (!row) return null;
    return this._format(row, include);
  },

  async findMany({ where = {}, include, orderBy }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM Comment";
    const params: any[] = [];
    if (where.postId) {
      sql += " WHERE postId = ?";
      params.push(where.postId);
    }
    sql += " ORDER BY createdAt ASC";
    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include));
  },

  async count({ where = {} }: any = {}) {
    const db = getDb();
    let sql = "SELECT count(*) as count FROM Comment";
    const params: any[] = [];
    if (where.postId) {
      sql += " WHERE postId = ?";
      params.push(where.postId);
    }
    return db.prepare(sql).get(...params).count;
  },

  async create({ data, include }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      postId: data.postId,
      userId: data.userId,
      content: data.content,
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };

    db.prepare("INSERT INTO Comment (id, postId, userId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)")
      .run(row.id, row.postId, row.userId, row.content, row.createdAt, row.updatedAt);

    return this.findUnique({ where: { id }, include });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM Comment WHERE id = ?").run(existing.id);
    }
    return existing;
  },

  _format(row: any, include: any) {
    const db = getDb();
    const res: any = {
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };
    if (include?.user) {
      const uRow = db.prepare("SELECT * FROM User WHERE id = ?").get(row.userId);
      res.user = uRow ? user._format(uRow, include?.user?.include, include?.user?.select) : null;
    }
    if (include?.post) {
      const pRow = db.prepare("SELECT * FROM Post WHERE id = ?").get(row.postId);
      res.post = pRow ? post._format(pRow, include?.post?.include) : null;
    }
    return res;
  }
};

// ==================== POST REACTION ====================
export const postReaction = {
  async findUnique({ where }: any) {
    const db = getDb();
    let row: any = null;
    if (where?.postId_userId) {
      row = db.prepare("SELECT * FROM PostReaction WHERE postId = ? AND userId = ?").get(where.postId_userId.postId, where.postId_userId.userId);
    } else if (where?.id) {
      row = db.prepare("SELECT * FROM PostReaction WHERE id = ?").get(where.id);
    }
    if (!row) return null;
    return { ...row, createdAt: toDate(row.createdAt) };
  },

  async findMany({ where = {} }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM PostReaction";
    const params: any[] = [];
    if (where.postId) {
      sql += " WHERE postId = ?";
      params.push(where.postId);
    }
    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => ({ ...r, createdAt: toDate(r.createdAt) }));
  },

  async create({ data }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      postId: data.postId,
      userId: data.userId,
      type: data.type || "like",
      createdAt: toTimestamp(data.createdAt || now),
    };
    db.prepare("INSERT INTO PostReaction (id, postId, userId, type, createdAt) VALUES (?, ?, ?, ?, ?)")
      .run(row.id, row.postId, row.userId, row.type, row.createdAt);
    return { ...row, createdAt: toDate(row.createdAt) };
  },

  async update({ where, data }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("Reaction không tồn tại");
    db.prepare("UPDATE PostReaction SET type = ? WHERE id = ?").run(data.type, existing.id);
    return this.findUnique({ where: { id: existing.id } });
  },

  async upsert({ where, update, create }: any) {
    const existing = await this.findUnique({ where });
    if (existing) {
      return this.update({ where: { id: existing.id }, data: update });
    }
    return this.create({ data: create });
  },

  async delete({ where }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (existing) {
      db.prepare("DELETE FROM PostReaction WHERE id = ?").run(existing.id);
    }
    return existing;
  }
};

// ==================== PAYMENT ORDER ====================
export const paymentOrder = {
  async findUnique({ where, include }: any) {
    const db = getDb();
    let row: any = null;
    if (where?.orderCode !== undefined) {
      row = db.prepare("SELECT * FROM PaymentOrder WHERE orderCode = ?").get(where.orderCode);
    } else if (where?.id) {
      row = db.prepare("SELECT * FROM PaymentOrder WHERE id = ?").get(where.id);
    }
    if (!row) return null;
    return this._format(row, include);
  },

  async findMany({ where = {}, include, orderBy, take }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM PaymentOrder";
    const params: any[] = [];
    if (where.userId) {
      sql += " WHERE userId = ?";
      params.push(where.userId);
    }
    sql += " ORDER BY createdAt DESC";
    if (take) sql += ` LIMIT ${Number(take)}`;
    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => this._format(r, include));
  },

  async create({ data, include }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = Date.now();
    const row = {
      id,
      orderCode: Number(data.orderCode),
      userId: data.userId,
      amount: Number(data.amount || 0),
      credits: Number(data.credits || 0),
      packageName: data.packageName || null,
      status: data.status || "PENDING",
      paymentMethod: data.paymentMethod || "payos_vietqr",
      payosPaymentLinkId: data.payosPaymentLinkId || null,
      transactionId: data.transactionId || null,
      createdAt: toTimestamp(data.createdAt || now),
      updatedAt: toTimestamp(data.updatedAt || now),
    };

    const cols = Object.keys(row);
    db.prepare(`INSERT INTO PaymentOrder (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .run(...cols.map(c => (row as any)[c]));

    return this.findUnique({ where: { id }, include });
  },

  async update({ where, data, include }: any) {
    const db = getDb();
    const existing = await this.findUnique({ where });
    if (!existing) throw new Error("PaymentOrder không tồn tại");

    const updates: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        updates.push(`"${k}" = ?`);
        params.push(v);
      }
    }
    updates.push('"updatedAt" = ?');
    params.push(Date.now());
    params.push(existing.id);

    db.prepare(`UPDATE PaymentOrder SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    return this.findUnique({ where: { id: existing.id }, include });
  },

  async upsert({ where, update, create, include }: any) {
    const existing = await this.findUnique({ where });
    if (existing) {
      if (update && Object.keys(update).length > 0) {
        return this.update({ where: { id: existing.id }, data: update, include });
      }
      return existing;
    }
    return this.create({ data: create, include });
  },

  _format(row: any, include: any) {
    const db = getDb();
    const res: any = {
      ...row,
      createdAt: toDate(row.createdAt),
      updatedAt: toDate(row.updatedAt),
    };
    if (include?.user) {
      const uRow = db.prepare("SELECT * FROM User WHERE id = ?").get(row.userId);
      res.user = uRow ? user._format(uRow, include?.user?.include, include?.user?.select) : null;
    }
    return res;
  }
};

// ==================== EXPLORE SEARCH ====================
export const exploreSearch = {
  async create({ data }: any) {
    const db = getDb();
    const id = data.id || createId();
    const now = toTimestamp(data.createdAt || Date.now());
    const query = String(data.query || "").trim();
    const normalizedQuery = String(data.normalizedQuery || query.toLowerCase().replace(/[?!.,;:…]+$/, "").trim());

    db.prepare("INSERT INTO ExploreSearch (id, query, normalizedQuery, createdAt) VALUES (?, ?, ?, ?)")
      .run(id, query, normalizedQuery, now);

    return { id, query, normalizedQuery, createdAt: toDate(now) };
  },

  async findMany({ where = {}, orderBy, take }: any = {}) {
    const db = getDb();
    let sql = "SELECT * FROM ExploreSearch";
    const params: any[] = [];
    const conds: string[] = [];

    if (where.createdAt?.gte) {
      conds.push("createdAt >= ?");
      params.push(toTimestamp(where.createdAt.gte));
    }

    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY createdAt DESC";
    if (take) sql += ` LIMIT ${Number(take)}`;

    const rows = db.prepare(sql).all(...params);
    return rows.map((r: any) => ({
      ...r,
      createdAt: toDate(r.createdAt),
    }));
  },
};

// ==================== TRANSACTION HELPER ====================
export async function $transaction(arg: any) {
  if (typeof arg === "function") {
    return arg({
      user,
      bot,
      conversation,
      message,
      project,
      post,
      comment,
      postReaction,
      paymentOrder,
      exploreSearch,
    });
  }
  if (Array.isArray(arg)) {
    return Promise.all(arg);
  }
  return arg;
}

export const sqliteClient = {
  user,
  bot,
  conversation,
  message,
  project,
  post,
  comment,
  postReaction,
  paymentOrder,
  exploreSearch,
  $transaction,
};
