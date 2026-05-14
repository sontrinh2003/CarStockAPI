
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS Dealers;

CREATE TABLE Dealers (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL
);

CREATE TABLE Cars (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    DealerId INTEGER NOT NULL,
    Make TEXT NOT NULL,
    Model TEXT NOT NULL,
    Year INTEGER NOT NULL,
    Price REAL NOT NULL DEFAULT 0,
    Stock INTEGER NOT NULL CHECK (Stock >= 0),
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id)
);
 
-- Customers table (dealer-scoped, matches JWT auth pattern)
CREATE TABLE IF NOT EXISTS Customers (
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    DealerId  INTEGER NOT NULL,
    Name      TEXT    NOT NULL,
    Email     TEXT    NOT NULL,
    Phone     TEXT    NOT NULL DEFAULT '',
    CreatedAt TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id)
);
 
-- Sales table (atomic with car stock — use a transaction when inserting)
CREATE TABLE IF NOT EXISTS Sales (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    DealerId   INTEGER NOT NULL,
    CarId      INTEGER NOT NULL,
    CustomerId INTEGER NOT NULL,
    SaleAmount REAL    NOT NULL,
    SaleDate   TEXT    NOT NULL DEFAULT (datetime('now')),
    Status     TEXT    NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (DealerId)   REFERENCES Dealers(Id),
    FOREIGN KEY (CarId)      REFERENCES Cars(Id),
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
 
-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_customers_dealer ON Customers(DealerId);
CREATE INDEX IF NOT EXISTS idx_sales_dealer      ON Sales(DealerId);
CREATE INDEX IF NOT EXISTS idx_sales_date        ON Sales(SaleDate DESC);

INSERT INTO Dealers (Name, Username, PasswordHash) VALUES
('City Motors', 'citymotors', 'password1'),
('Premium Autos', 'premiumautos', 'password2');

INSERT INTO Cars (DealerId, Make, Model, Year, Stock) VALUES
(1, 'Audi', 'A4', 2018, 5),
(1, 'Toyota', 'Corolla', 2020, 10),
(1, 'BMW', '320i', 2019, 3);

INSERT INTO Cars (DealerId, Make, Model, Year, Stock) VALUES
(2, 'Mercedes-Benz', 'C200', 2021, 4),
(2, 'Tesla', 'Model 3', 2022, 6),
(2, 'Honda', 'Civic', 2017, 8);