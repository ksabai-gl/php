-- Employee Portal schema (MySQL 5.6 / 5.7 compatible)
-- Run as root: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS employee_portal
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;

USE employee_portal;

-- Create app user (ignore error if user already exists on older MySQL)
GRANT ALL PRIVILEGES ON employee_portal.* TO 'emp_user'@'localhost' IDENTIFIED BY 'emp_pass';
FLUSH PRIVILEGES;

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(20)  NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_dept_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE employees (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  emp_code      VARCHAR(20)  NOT NULL,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL,
  phone         VARCHAR(40)  DEFAULT NULL,
  department_id INT UNSIGNED DEFAULT NULL,
  job_title     VARCHAR(100) DEFAULT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  hire_date     DATE         DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_emp_code (emp_code),
  UNIQUE KEY uk_emp_email (email),
  KEY idx_emp_dept (department_id),
  CONSTRAINT fk_emp_dept FOREIGN KEY (department_id)
    REFERENCES departments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;