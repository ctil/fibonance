-- Turso/libSQL schema for portfolio configurations

CREATE TABLE portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE stock_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    target_percentage INTEGER NOT NULL,
    description TEXT NOT NULL,
    alternatives TEXT,  -- JSON array, e.g., '["VOO","SPY"]'
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    UNIQUE(portfolio_id, symbol)
);

CREATE INDEX idx_stock_allocations_portfolio ON stock_allocations(portfolio_id);

-- Example seed data (matches hardcoded defaults)

-- Portfolio 1: No Bonds
INSERT INTO portfolios (name, description) VALUES ('No Bonds', 'Simple two-fund portfolio without bonds');
INSERT INTO stock_allocations (portfolio_id, symbol, target_percentage, description, sort_order)
VALUES
    (1, 'VTI', 80, 'Total Market Fund', 0),
    (1, 'VXUS', 20, 'International Fund', 1);

-- Portfolio 2: Indexes Only
INSERT INTO portfolios (name, description) VALUES ('Indexes only', 'Index funds with Bitcoin, no bonds');
INSERT INTO stock_allocations (portfolio_id, symbol, target_percentage, description, sort_order)
VALUES
    (2, 'VTI', 79, 'Total Market Fund', 0),
    (2, 'VXUS', 20, 'International Fund', 1),
    (2, 'FBTC', 1, 'Bitcoin ETF', 2);

-- Portfolio 3: Full Portfolio
INSERT INTO portfolios (name, description) VALUES ('Full Portfolio', 'Complete portfolio with bonds and Bitcoin');
INSERT INTO stock_allocations (portfolio_id, symbol, target_percentage, description, sort_order)
VALUES
    (3, 'VTI', 71, 'Total Market Fund', 0),
    (3, 'VXUS', 18, 'International Fund', 1),
    (3, 'BND', 10, 'Bond Fund', 2),
    (3, 'FBTC', 1, 'Bitcoin ETF', 3);
