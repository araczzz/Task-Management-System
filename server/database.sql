-- Create Database
CREATE DATABASE IF NOT EXISTS nodelogin2;
USE nodelogin2;

-- Create Table `accounts`
CREATE TABLE IF NOT EXISTS accounts (
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NULL,
    email VARCHAR(100) NULL,
    groupName VARCHAR(255) NULL,
    isActive VARCHAR(50) NOT NULL,
    PRIMARY KEY (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Create Table `application`
CREATE TABLE IF NOT EXISTS application (
    App_Acronym VARCHAR(50) NOT NULL,
    App_Description LONGTEXT NOT NULL,
    App_Rnumber BIGINT NOT NULL,
    App_startDate DATE NULL,
    App_endDate DATE NULL,
    App_permit_Create VARCHAR(100) NULL,
    App_permit_Open VARCHAR(100) NULL,
    App_permit_toDoList VARCHAR(100) NULL,
    App_permit_Doing VARCHAR(100) NULL,
    App_permit_Done VARCHAR(100) NULL,
    created_date DATETIME NOT NULL,
    PRIMARY KEY (App_Acronym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table `groupdescription`
CREATE TABLE IF NOT EXISTS groupdescription (
    groupName VARCHAR(100) NOT NULL,
    groupDescription LONGTEXT NULL,
    PRIMARY KEY (groupName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table `usergroup`
CREATE TABLE IF NOT EXISTS usergroup (
    username VARCHAR(50) NOT NULL,
    groupName VARCHAR(100) NOT NULL,
    CONSTRAINT UserGroupCompositeKey PRIMARY KEY (groupName, username),
    FOREIGN KEY (username) REFERENCES accounts (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table `plan`
CREATE TABLE IF NOT EXISTS plan (
    Plan_MVP_name VARCHAR(100) NOT NULL,
    Plan_startDate DATE NOT NULL,
    Plan_endDate DATE NOT NULL,
    Plan_app_Acronym VARCHAR(100) NOT NULL,
    created_date DATETIME NOT NULL,
    Plan_colour VARCHAR(100) NULL,
    PRIMARY KEY (Plan_MVP_name),
    FOREIGN KEY (Plan_app_Acronym) REFERENCES application (App_Acronym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table `task`
CREATE TABLE IF NOT EXISTS task (
    Task_name VARCHAR(100) NOT NULL,
    Task_description LONGTEXT NULL,
    Task_notes LONGTEXT NULL,
    Task_id VARCHAR(255) NOT NULL,
    Task_plan VARCHAR(100) NULL,
    Task_app_Acronym VARCHAR(50) NOT NULL,
    Task_state VARCHAR(50) NULL,
    Task_creator VARCHAR(100) NULL,
    Task_owner VARCHAR(100) NULL,
    Task_createDate DATETIME NOT NULL DEFAULT NOW(),
    Task_colour VARCHAR(50) NULL,
    PRIMARY KEY (Task_name),
    FOREIGN KEY (Task_app_Acronym) REFERENCES application (App_Acronym),
    FOREIGN KEY (Task_plan) REFERENCES plan (Plan_MVP_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table `tasknotes`
CREATE TABLE IF NOT EXISTS tasknotes (
    Task_name VARCHAR(100) NOT NULL,
    Task_notes VARCHAR(255) NOT NULL,
    updated_date DATETIME NOT NULL DEFAULT NOW(),
    Task_owner VARCHAR(100) NOT NULL,
    Task_state VARCHAR(50) NOT NULL,
    PRIMARY KEY (updated_date),
    FOREIGN KEY (Task_name) REFERENCES task (Task_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO groupdescription VALUES ("Admin", "");
INSERT INTO groupdescription VALUES ("Project Lead", "");
INSERT INTO groupdescription VALUES ("Project Manager", "");
INSERT INTO groupdescription VALUES ("Team Member", "");

-- Create Default Accounts
-- UserGroups: Admin, Project Lead, Project Manager, Team Member
-- Password is "Password0!"
INSERT INTO accounts VALUES ("admin", "$2a$10$hQyX78Qdrd.3Upa8hDgjKO2zqKOOEFB8y6h1jHr8pxngu0ge4Uv8i", "admin@email.com", "Admin","Active");
INSERT INTO accounts VALUES ("projectlead", "$2a$10$hQyX78Qdrd.3Upa8hDgjKO2zqKOOEFB8y6h1jHr8pxngu0ge4Uv8i", "projectlead@email.com", "Project Lead","Active");
INSERT INTO accounts VALUES ("projectmanager", "$2a$10$hQyX78Qdrd.3Upa8hDgjKO2zqKOOEFB8y6h1jHr8pxngu0ge4Uv8i", "projectmanager@email.com", "Project Manager","Active");
INSERT INTO accounts VALUES ("teammember", "$2a$10$hQyX78Qdrd.3Upa8hDgjKO2zqKOOEFB8y6h1jHr8pxngu0ge4Uv8i", "teammember@email.com", "Team Member","Active");

INSERT INTO usergroup VALUES ("admin", "Admin");
INSERT INTO usergroup VALUES ("projectlead", "Project Lead");
INSERT INTO usergroup VALUES ("projectmanager", "Project Manager");
INSERT INTO usergroup VALUES ("teammember", "Team Member");

INSERT INTO application (App_Acronym, App_Description, App_Rnumber, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, created_date) VALUES ("App 1", "This is my first application", 1, "Project Lead", "Project Manager", "Team Member", "Team Member", "Project Lead", now());

-- Create Non Root User With Limited Permissions
USE mysql;
CREATE USER 'default'@'%' IDENTIFIED BY 'default123';
GRANT INSERT, SELECT, UPDATE on nodelogin2.* TO 'default'@'%';

-- When we grant some privileges for a user, running this command flush privileges will reload
-- the grant tables in the mysql database enabling the changes to take effect without reloading
-- or restarting mysql service.
FLUSH PRIVILEGES;

