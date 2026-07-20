<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ page import="java.util.List" %>
<%@ page import="com.company.hr.model.Employee" %>
<%@ page import="com.company.hr.model.Department" %>

<portlet:defineObjects />

<%
    Employee employee = (Employee) request.getAttribute("employee");
    List<Department> departments = (List<Department>) request.getAttribute("departments");
    String error = (String) request.getAttribute("error");
    String message = (String) request.getAttribute("message");
    if (employee == null) employee = new Employee();
    boolean editing = employee.getId() > 0;
%>

<div class="emp-portal">
    <h2><%= editing ? "Edit Employee" : "Add Employee" %></h2>

    <% if (message != null && message.length() > 0) { %>
        <div class="emp-msg"><%= message %></div>
    <% } %>
    <% if (error != null) { %>
        <div class="emp-err"><%= error %></div>
    <% } %>

    <portlet:actionURL var="saveURL" />
    <form action="<%= saveURL %>" method="post" class="emp-form">
        <input type="hidden" name="<portlet:namespace />employeeId" value="<%= employee.getId() %>" />

        <table cellpadding="6" cellspacing="0">
            <tr>
                <td>Employee Code *</td>
                <td><input type="text" name="<portlet:namespace />empCode" value="<%= nullToEmpty(employee.getEmpCode()) %>" required /></td>
            </tr>
            <tr>
                <td>First Name *</td>
                <td><input type="text" name="<portlet:namespace />firstName" value="<%= nullToEmpty(employee.getFirstName()) %>" required /></td>
            </tr>
            <tr>
                <td>Last Name *</td>
                <td><input type="text" name="<portlet:namespace />lastName" value="<%= nullToEmpty(employee.getLastName()) %>" required /></td>
            </tr>
            <tr>
                <td>Email *</td>
                <td><input type="text" name="<portlet:namespace />email" value="<%= nullToEmpty(employee.getEmail()) %>" required /></td>
            </tr>
            <tr>
                <td>Phone</td>
                <td><input type="text" name="<portlet:namespace />phone" value="<%= nullToEmpty(employee.getPhone()) %>" /></td>
            </tr>
            <tr>
                <td>Department</td>
                <td>
                    <select name="<portlet:namespace />departmentId">
                        <option value="0">-- Select --</option>
                        <% if (departments != null) {
                            for (Department d : departments) { %>
                                <option value="<%= d.getId() %>" <%= employee.getDepartmentId() == d.getId() ? "selected" : "" %>>
                                    <%= d.getName() %>
                                </option>
                        <%  }
                           } %>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Job Title</td>
                <td><input type="text" name="<portlet:namespace />jobTitle" value="<%= nullToEmpty(employee.getJobTitle()) %>" /></td>
            </tr>
            <tr>
                <td>Status</td>
                <td>
                    <select name="<portlet:namespace />status">
                        <option value="ACTIVE" <%= "ACTIVE".equals(employee.getStatus()) || employee.getStatus() == null ? "selected" : "" %>>ACTIVE</option>
                        <option value="INACTIVE" <%= "INACTIVE".equals(employee.getStatus()) ? "selected" : "" %>>INACTIVE</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Hire Date</td>
                <td><input type="text" name="<portlet:namespace />hireDate" value="<%= nullToEmpty(employee.getHireDate()) %>" placeholder="YYYY-MM-DD" /></td>
            </tr>
            <tr>
                <td colspan="2">
                    <button type="submit"><%= editing ? "Update" : "Create" %></button>
                </td>
            </tr>
        </table>
    </form>
</div>

<%!
    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
%>