package com.company.hr.client;

import com.company.hr.model.Department;
import com.company.hr.model.Employee;
import com.company.hr.util.PortletConfig;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

/**
 * Legacy HTTP client that calls the PHP backend APIs.
 * Uses HttpURLConnection + lightweight JSON parsing (no modern frameworks).
 */
public class PhpApiClient {

    public List<Employee> listEmployees(String query, Long deptId) throws Exception {
        StringBuilder url = new StringBuilder(PortletConfig.getApiBaseUrl())
                .append("/employees.php?");
        if (query != null && query.trim().length() > 0) {
            url.append("q=").append(URLEncoder.encode(query.trim(), "UTF-8")).append("&");
        }
        if (deptId != null && deptId.longValue() > 0) {
            url.append("dept=").append(deptId.longValue()).append("&");
        }
        String json = httpGet(url.toString());
        return parseEmployeeList(json);
    }

    public Employee getEmployee(long id) throws Exception {
        String url = PortletConfig.getApiBaseUrl() + "/employees.php?id=" + id;
        String json = httpGet(url);
        return parseEmployee(extractObject(json, "data"));
    }

    public long createEmployee(Employee emp) throws Exception {
        String body = employeeToJson(emp, false);
        String json = httpWrite("POST", PortletConfig.getApiBaseUrl() + "/employees.php", body);
        return extractLong(json, "id");
    }

    public void updateEmployee(Employee emp) throws Exception {
        String body = employeeToJson(emp, true);
        httpWrite("PUT", PortletConfig.getApiBaseUrl() + "/employees.php", body);
    }

    public void deleteEmployee(long id) throws Exception {
        httpWrite("DELETE", PortletConfig.getApiBaseUrl() + "/employees.php?id=" + id, null);
    }

    public List<Department> listDepartments() throws Exception {
        String json = httpGet(PortletConfig.getApiBaseUrl() + "/departments.php");
        return parseDepartmentList(json, false);
    }

    public List<Department> departmentSummary() throws Exception {
        String json = httpGet(PortletConfig.getApiBaseUrl() + "/departments.php?summary=1");
        return parseDepartmentList(json, true);
    }

    // --- HTTP ---

    private String httpGet(String urlStr) throws Exception {
        HttpURLConnection conn = open(urlStr, "GET");
        int code = conn.getResponseCode();
        String body = readStream(code >= 400 ? conn.getErrorStream() : conn.getInputStream());
        if (code >= 400) {
            throw new Exception("PHP API GET failed (" + code + "): " + body);
        }
        return body;
    }

    private String httpWrite(String method, String urlStr, String jsonBody) throws Exception {
        HttpURLConnection conn = open(urlStr, method);
        if (jsonBody != null) {
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            OutputStream os = conn.getOutputStream();
            os.write(jsonBody.getBytes("UTF-8"));
            os.flush();
            os.close();
        }
        int code = conn.getResponseCode();
        String body = readStream(code >= 400 ? conn.getErrorStream() : conn.getInputStream());
        if (code >= 400) {
            throw new Exception("PHP API " + method + " failed (" + code + "): " + body);
        }
        return body;
    }

    private HttpURLConnection open(String urlStr, String method) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setConnectTimeout(PortletConfig.getConnectTimeout());
        conn.setReadTimeout(PortletConfig.getReadTimeout());
        conn.setRequestProperty("X-API-Key", PortletConfig.getApiKey());
        conn.setRequestProperty("Accept", "application/json");
        return conn;
    }

    private String readStream(InputStream in) throws Exception {
        if (in == null) {
            return "";
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        return sb.toString();
    }

    // --- minimal JSON helpers (legacy style, no Jackson/Gson required) ---

    private String employeeToJson(Employee e, boolean includeId) {
        StringBuilder sb = new StringBuilder("{");
        if (includeId) {
            sb.append("\"id\":").append(e.getId()).append(",");
        }
        sb.append("\"emp_code\":\"").append(esc(e.getEmpCode())).append("\",");
        sb.append("\"first_name\":\"").append(esc(e.getFirstName())).append("\",");
        sb.append("\"last_name\":\"").append(esc(e.getLastName())).append("\",");
        sb.append("\"email\":\"").append(esc(e.getEmail())).append("\",");
        sb.append("\"phone\":\"").append(esc(e.getPhone())).append("\",");
        sb.append("\"department_id\":").append(e.getDepartmentId()).append(",");
        sb.append("\"job_title\":\"").append(esc(e.getJobTitle())).append("\",");
        sb.append("\"status\":\"").append(esc(e.getStatus())).append("\",");
        sb.append("\"hire_date\":\"").append(esc(e.getHireDate())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    private String esc(String v) {
        if (v == null) {
            return "";
        }
        return v.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private List<Employee> parseEmployeeList(String json) {
        List<Employee> list = new ArrayList<Employee>();
        String data = extractArray(json, "data");
        if (data == null) {
            return list;
        }
        List<String> objects = splitObjects(data);
        for (int i = 0; i < objects.size(); i++) {
            list.add(parseEmployee(objects.get(i)));
        }
        return list;
    }

    private Employee parseEmployee(String obj) {
        Employee e = new Employee();
        if (obj == null) {
            return e;
        }
        e.setId(getLong(obj, "id"));
        e.setEmpCode(getString(obj, "emp_code"));
        e.setFirstName(getString(obj, "first_name"));
        e.setLastName(getString(obj, "last_name"));
        e.setEmail(getString(obj, "email"));
        e.setPhone(getString(obj, "phone"));
        e.setDepartmentId(getLong(obj, "department_id"));
        e.setDepartmentName(getString(obj, "department_name"));
        e.setJobTitle(getString(obj, "job_title"));
        e.setStatus(getString(obj, "status"));
        e.setHireDate(getString(obj, "hire_date"));
        return e;
    }

    private List<Department> parseDepartmentList(String json, boolean summary) {
        List<Department> list = new ArrayList<Department>();
        String data = extractArray(json, "data");
        if (data == null) {
            return list;
        }
        List<String> objects = splitObjects(data);
        for (int i = 0; i < objects.size(); i++) {
            String obj = objects.get(i);
            Department d = new Department();
            d.setId(getLong(obj, "id"));
            d.setCode(getString(obj, "code"));
            d.setName(getString(obj, "name"));
            d.setDescription(getString(obj, "description"));
            if (summary) {
                d.setEmployeeCount((int) getLong(obj, "employee_count"));
                d.setActiveCount((int) getLong(obj, "active_count"));
            }
            list.add(d);
        }
        return list;
    }

    private String extractObject(String json, String key) {
        String marker = "\"" + key + "\":";
        int idx = json.indexOf(marker);
        if (idx < 0) {
            return null;
        }
        idx = json.indexOf('{', idx);
        if (idx < 0) {
            return null;
        }
        return extractBalanced(json, idx, '{', '}');
    }

    private String extractArray(String json, String key) {
        String marker = "\"" + key + "\":";
        int idx = json.indexOf(marker);
        if (idx < 0) {
            return null;
        }
        idx = json.indexOf('[', idx);
        if (idx < 0) {
            return null;
        }
        return extractBalanced(json, idx, '[', ']');
    }

    private long extractLong(String json, String key) {
        return getLong(json, key);
    }

    private String extractBalanced(String s, int start, char open, char close) {
        int depth = 0;
        boolean inString = false;
        for (int i = start; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"' && (i == 0 || s.charAt(i - 1) != '\\')) {
                inString = !inString;
            }
            if (!inString) {
                if (c == open) {
                    depth++;
                } else if (c == close) {
                    depth--;
                    if (depth == 0) {
                        return s.substring(start, i + 1);
                    }
                }
            }
        }
        return null;
    }

    private List<String> splitObjects(String arrayBody) {
        List<String> list = new ArrayList<String>();
        String inner = arrayBody;
        if (inner.startsWith("[")) {
            inner = inner.substring(1, inner.length() - 1).trim();
        }
        int i = 0;
        while (i < inner.length()) {
            while (i < inner.length() && (inner.charAt(i) == ',' || Character.isWhitespace(inner.charAt(i)))) {
                i++;
            }
            if (i >= inner.length()) {
                break;
            }
            if (inner.charAt(i) == '{') {
                String obj = extractBalanced(inner, i, '{', '}');
                if (obj != null) {
                    list.add(obj);
                    i += obj.length();
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return list;
    }

    private String getString(String obj, String key) {
        String marker = "\"" + key + "\":";
        int idx = obj.indexOf(marker);
        if (idx < 0) {
            return "";
        }
        idx += marker.length();
        while (idx < obj.length() && Character.isWhitespace(obj.charAt(idx))) {
            idx++;
        }
        if (idx < obj.length() && obj.charAt(idx) == 'n') {
            return "";
        }
        if (idx >= obj.length() || obj.charAt(idx) != '"') {
            return "";
        }
        idx++;
        StringBuilder sb = new StringBuilder();
        while (idx < obj.length()) {
            char c = obj.charAt(idx);
            if (c == '\\' && idx + 1 < obj.length()) {
                sb.append(obj.charAt(idx + 1));
                idx += 2;
                continue;
            }
            if (c == '"') {
                break;
            }
            sb.append(c);
            idx++;
        }
        return sb.toString();
    }

    private long getLong(String obj, String key) {
        String marker = "\"" + key + "\":";
        int idx = obj.indexOf(marker);
        if (idx < 0) {
            return 0L;
        }
        idx += marker.length();
        while (idx < obj.length() && Character.isWhitespace(obj.charAt(idx))) {
            idx++;
        }
        StringBuilder sb = new StringBuilder();
        while (idx < obj.length()) {
            char c = obj.charAt(idx);
            if ((c >= '0' && c <= '9') || c == '-') {
                sb.append(c);
                idx++;
            } else {
                break;
            }
        }
        if (sb.length() == 0) {
            return 0L;
        }
        try {
            return Long.parseLong(sb.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}