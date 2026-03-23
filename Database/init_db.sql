/*
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
    Stock INTEGER NOT NULL CHECK (Stock >= 0),
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id)
);

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
*/