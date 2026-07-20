package com.company.hr.portlet;

import com.company.hr.client.PhpApiClient;
import com.company.hr.model.Department;

import java.io.IOException;
import java.util.List;

import javax.portlet.GenericPortlet;
import javax.portlet.PortletException;
import javax.portlet.PortletRequestDispatcher;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;

/**
 * Screen 3: Department Summary (headcount)
 */
public class DepartmentSummaryPortlet extends GenericPortlet {

    @Override
    public void doView(RenderRequest request, RenderResponse response)
            throws IOException, PortletException {

        String error = null;
        List<Department> summary = null;

        try {
            summary = new PhpApiClient().departmentSummary();
        } catch (Exception e) {
            error = "Unable to load department summary: " + e.getMessage();
        }

        request.setAttribute("summary", summary);
        request.setAttribute("error", error);

        include(getInitParameter("view-template"), request, response);
    }

    private void include(String path, RenderRequest request, RenderResponse response)
            throws IOException, PortletException {
        PortletRequestDispatcher dispatcher = getPortletContext().getRequestDispatcher(path);
        dispatcher.include(request, response);
    }
}