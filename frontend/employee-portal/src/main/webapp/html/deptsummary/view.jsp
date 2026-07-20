<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ page import="java.util.List" %>
<%@ page import="com.company.hr.model.Department" %>

<portlet:defineObjects />

<%
    List<Department> summary = (List<Department>) request.getAttribute("summary");
    String error = (String) request.getAttribute("error");
%>

<div class="emp-portal">
    <h2>Department Summary</h2>

    <% if (error != null) { %>
        <div class="emp-err"><%= error %></div>
    <% } %>

    <table class="emp-table" cellpadding="4" cellspacing="0" border="1" width="100%">
        <thead>
            <tr>
                <th>Code</th>
                <th>Department</th>
                <th>Total Employees</th>
                <th>Active</th>
            </tr>
        </thead>
        <tbody>
        <% if (summary == null || summary.isEmpty()) { %>
            <tr><td colspan="4">No department data.</td></tr>
        <% } else {
            for (Department d : summary) { %>
            <tr>
                <td><%= d.getCode() %></td>
                <td><%= d.getName() %></td>
                <td><%= d.getEmployeeCount() %></td>
                <td><%= d.getActiveCount() %></td>
            </tr>
        <%  }
           } %>
        </tbody>
    </table>
</div>