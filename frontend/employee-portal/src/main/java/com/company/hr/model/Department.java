package com.company.hr.model;

import java.io.Serializable;

/**
 * Department DTO / summary row.
 */
public class Department implements Serializable {

    private static final long serialVersionUID = 1L;

    private long id;
    private String code;
    private String name;
    private String description;
    private int employeeCount;
    private int activeCount;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(int employeeCount) { this.employeeCount = employeeCount; }

    public int getActiveCount() { return activeCount; }
    public void setActiveCount(int activeCount) { this.activeCount = activeCount; }
}