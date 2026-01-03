CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    pix_key TEXT
);

CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY, 
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, 
    title TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    initial_value REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id TEXT NOT NULL,
    expected_value REAL NOT NULL,
    amount_spent REAL DEFAULT 0,
    due_date TEXT,
    paid_at TEXT,
    is_paid INTEGER DEFAULT 0,
    FOREIGN KEY(challenge_id) REFERENCES challenges(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total_amount REAL NOT NULL,
    installments_count INTEGER DEFAULT 1,
    purchase_date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS expense_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id TEXT NOT NULL,
    installment_number INTEGER,
    amount REAL NOT NULL,
    due_date TEXT,
    is_paid INTEGER DEFAULT 0,
    paid_at TEXT,
    FOREIGN KEY(expense_id) REFERENCES expenses(id)
);

CREATE TABLE IF NOT EXISTS incomes (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);