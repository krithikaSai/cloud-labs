CREATE DATABASE company;
USE company;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    role VARCHAR(50),
    salary DECIMAL(10,2)
);

INSERT INTO employees (name, role, salary) VALUES
('Krithika Sai', 'Developer', 75000.00),
('Aditi Balaji', 'Designer', 75000.00),
('Bharath Kumar', 'Manager', 80000.00);

SELECT * FROM employees;
