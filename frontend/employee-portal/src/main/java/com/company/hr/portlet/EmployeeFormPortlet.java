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
 * Screen 2: Employee Add / Edit Form
 */
public class EmployeeFormPortlet extends GenericPortlet {

    @Override
    public void doView(RenderRequest request, RenderResponse response)
            throws IOException, PortletException {

        long employeeId = ParamUtil.getLong(request, "employeeId", 0L);
        String error = null;
        Employee employee = new Employee();
        List<Department> departments = null;

        try {
            PhpApiClient client = new PhpApiClient();
            departments = client.listDepartments();
            if (employeeId > 0) {
                employee = client.getEmployee(employeeId);
            }
        } catch (Exception e) {
            error = "Unable to load form data: " + e.getMessage();
        }

        request.setAttribute("employee", employee);
        request.setAttribute("departments", departments);
        request.setAttribute("error", error);
        request.setAttribute("message", request.getParameter("message"));

        include(getInitParameter("view-template"), request, response);
    }

    @Override
    public void processAction(ActionRequest request, ActionResponse response)
            throws IOException, PortletException {

        Employee emp = new Employee();
        emp.setId(ParamUtil.getLong(request, "employeeId", 0L));
        emp.setEmpCode(ParamUtil.getString(request, "empCode"));
        emp.setFirstName(ParamUtil.getString(request, "firstName"));
        emp.setLastName(ParamUtil.getString(request, "lastName"));
        emp.setEmail(ParamUtil.getString(request, "email"));
        emp.setPhone(ParamUtil.getString(request, "phone"));
        emp.setDepartmentId(ParamUtil.getLong(request, "departmentId", 0L));
        emp.setJobTitle(ParamUtil.getString(request, "jobTitle"));
        emp.setStatus(ParamUtil.getString(request, "status", "ACTIVE"));
        emp.setHireDate(ParamUtil.getString(request, "hireDate"));

        try {
            PhpApiClient client = new PhpApiClient();
            if (emp.getId() > 0) {
                client.updateEmployee(emp);
                response.setRenderParameter("message", "Employee updated.");
                response.setRenderParameter("employeeId", String.valueOf(emp.getId()));
            } else {
                long newId = client.createEmployee(emp);
                response.setRenderParameter("message", "Employee created.");
                response.setRenderParameter("employeeId", String.valueOf(newId));
            }
        } catch (Exception e) {
            response.setRenderParameter("message", "Save failed: " + e.getMessage());
            if (emp.getId() > 0) {
                response.setRenderParameter("employeeId", String.valueOf(emp.getId()));
            }
        }
    }

    private void include(String path, RenderRequest request, RenderResponse response)
            throws IOException, PortletException {
        PortletRequestDispatcher dispatcher = getPortletContext().getRequestDispatcher(path);
        dispatcher.include(request, response);
    }
}