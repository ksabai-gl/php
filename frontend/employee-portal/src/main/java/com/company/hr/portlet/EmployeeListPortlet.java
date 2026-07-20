package com.company.hr.portlet;

import com.company.hr.client.PhpApiClient;
import com.company.hr.model.Department;
import com.company.hr.model.Employee;
import com.liferay.portal.kernel.util.ParamUtil;

import java.io.IOException;
import java.util.List;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.GenericPortlet;
import javax.portlet.PortletException;
import javax.portlet.PortletRequestDispatcher;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;

/**
 * Screen 1: Employee List
 */
public class EmployeeListPortlet extends GenericPortlet {

    @Override
    public void doView(RenderRequest request, RenderResponse response)
            throws IOException, PortletException {

        String query = ParamUtil.getString(request, "q", "");
        long deptId = ParamUtil.getLong(request, "deptId", 0L);
        String error = null;
        List<Employee> employees = null;
        List<Department> departments = null;

        try {
            PhpApiClient client = new PhpApiClient();
            employees = client.listEmployees(query, deptId > 0 ? Long.valueOf(deptId) : null);
            departments = client.listDepartments();
        } catch (Exception e) {
            error = "Unable to load employees from PHP API: " + e.getMessage();
        }

        request.setAttribute("employees", employees);
        request.setAttribute("departments", departments);
        request.setAttribute("q", query);
        request.setAttribute("deptId", Long.valueOf(deptId));
        request.setAttribute("error", error);
        request.setAttribute("message", request.getParameter("message"));

        include(getInitParameter("view-template"), request, response);
    }

    @Override
    public void processAction(ActionRequest request, ActionResponse response)
            throws IOException, PortletException {

        String action = ParamUtil.getString(request, "actionName", "");
        if ("delete".equals(action)) {
            long id = ParamUtil.getLong(request, "employeeId", 0L);
            try {
                new PhpApiClient().deleteEmployee(id);
                response.setRenderParameter("message", "Employee deleted.");
            } catch (Exception e) {
                response.setRenderParameter("message", "Delete failed: " + e.getMessage());
            }
        }

        response.setRenderParameter("q", ParamUtil.getString(request, "q", ""));
        response.setRenderParameter("deptId", ParamUtil.getString(request, "deptId", "0"));
    }

    private void include(String path, RenderRequest request, RenderResponse response)
            throws IOException, PortletException {
        PortletRequestDispatcher dispatcher = getPortletContext().getRequestDispatcher(path);
        dispatcher.include(request, response);
    }
}