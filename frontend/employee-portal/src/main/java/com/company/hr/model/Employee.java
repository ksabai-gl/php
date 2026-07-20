package com.company.hr.model;

import java.io.Serializable;

/**
 * Simple employee DTO used by Liferay portlets.
 */
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    private long id;
    private String empCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private long departmentId;
    private String departmentName;
    private String jobTitle;
    private String status;
    private String hireDate;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getEmpCode() { return empCode; }
    public void setEmpCode(String empCode) { this.empCode = empCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public long getDepartmentId() { return departmentId; }
    public void setDepartmentId(long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHireDate() { return hireDate; }
    public void setHireDate(String hireDate) { this.hireDate = hireDate; }

    public String getFullName() {
        return (firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName);
    }
}