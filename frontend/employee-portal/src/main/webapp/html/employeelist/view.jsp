<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ page import="java.util.List" %>
<%@ page import="com.company.hr.model.Employee" %>
<%@ page import="com.company.hr.model.Department" %>

<portlet:defineObjects />

<%
    List<Employee> employees = (List<Employee>) request.getAttribute("employees");
    List<Department> departments = (List<Department>) request.getAttribute("departments");
    String q = (String) request.getAttribute("q");
    Long deptId = (Long) request.getAttribute("deptId");
    String error = (String) request.getAttribute("error");
    String message = (String) request.getAttribute("message");
    if (q == null) q = "";
    if (deptId == null) deptId = Long.valueOf(0);
%>

<div class="emp-portal">
    <h2>Employee List</h2>

    <% if (message != null && message.length() > 0) { %>
        <div class="emp-msg"><%= message %></div>
    <% } %>
    <% if (error != null) { %>
        <div class="emp-err"><%= error %></div>
    <% } %>

    <portlet:renderURL var="searchURL" />
    <form action="<%= searchURL %>" method="get" class="emp-filter">
        <input type="hidden" name="p_p_id" value="<%= renderResponse.getNamespace().replace("_", "") %>" />
        <label>Search:
            <input type="text" name="<portlet:namespace />q" value="<%= q %>" />
        </label>
        <label>Department:
            <select name="<portlet:namespace />deptId">
                <option value="0">All</option>
                <% if (departments != null) {
                    for (Department d : departments) { %>
                        <option value="<%= d.getId() %>" <%= deptId.longValue() == d.getId() ? "selected" : "" %>>
                            <%= d.getName() %>
                        </option>
                <%  }
                   } %>
            </select>
        </label>
        <button type="submit">Filter</button>
    </form>

    <table class="emp-table" cellpadding="4" cellspacing="0" border="1" width="100%">
        <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        <% if (employees == null || employees.isEmpty()) { %>
            <tr><td colspan="7">No employees found.</td></tr>
        <% } else {
            for (Employee e : employees) { %>
            <tr>
                <td><%= e.getEmpCode() %></td>
                <td><%= e.getFullName() %></td>
                <td><%= e.getEmail() %></td>
                <td><%= e.getDepartmentName() %></td>
                <td><%= e.getJobTitle() %></td>
                <td><%= e.getStatus() %></td>
                <td>
                    <portlet:actionURL var="deleteURL">
                        <portlet:param name="actionName" value="delete" />
                        <portlet:param name="employeeId" value="<%= String.valueOf(e.getId()) %>" />
                        <portlet:param name="q" value="<%= q %>" />
                        <portlet:param name="deptId" value="<%= String.valueOf(deptId) %>" />
                    </portlet:actionURL>
                    <a href="<%= deleteURL %>" onclick="return confirm('Delete this employee?');">Delete</a>
                </td>
            </tr>
        <%  }
           } %>
        </tbody>
    </table>
</div>