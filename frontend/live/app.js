(function () {
  const API_BASE = 'http://localhost:8088/api';
  const API_KEY = 'EMP-PORTAL-LEGACY-KEY-2014';

  const els = {
    globalMsg: document.getElementById('globalMsg'),
    globalErr: document.getElementById('globalErr'),
    tabs: Array.from(document.querySelectorAll('.tab')),
    panels: {
      list: document.getElementById('panel-list'),
      form: document.getElementById('panel-form'),
      summary: document.getElementById('panel-summary')
    },
    filterForm: document.getElementById('filterForm'),
    q: document.getElementById('q'),
    deptFilter: document.getElementById('deptFilter'),
    employeeRows: document.getElementById('employeeRows'),
    employeeForm: document.getElementById('employeeForm'),
    formTitle: document.getElementById('formTitle'),
    saveBtn: document.getElementById('saveBtn'),
    resetFormBtn: document.getElementById('resetFormBtn'),
    employeeId: document.getElementById('employeeId'),
    empCode: document.getElementById('empCode'),
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    departmentId: document.getElementById('departmentId'),
    jobTitle: document.getElementById('jobTitle'),
    status: document.getElementById('status'),
    hireDate: document.getElementById('hireDate'),
    summaryRows: document.getElementById('summaryRows')
  };

  function showMsg(text) {
    els.globalErr.hidden = true;
    els.globalMsg.hidden = !text;
    els.globalMsg.textContent = text || '';
  }

  function showErr(text) {
    els.globalMsg.hidden = true;
    els.globalErr.hidden = !text;
    els.globalErr.textContent = text || '';
  }

  async function api(path, options) {
    const opts = options || {};
    const headers = Object.assign({
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }, opts.headers || {});
    const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers: headers }));
    const data = await res.json().catch(function () { return null; });
    if (!res.ok || (data && data.success === false)) {
      throw new Error((data && data.error) || ('HTTP ' + res.status));
    }
    return data;
  }

  function switchTab(name) {
    els.tabs.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
    });
    Object.keys(els.panels).forEach(function (key) {
      els.panels[key].hidden = key !== name;
    });
    if (name === 'list') loadEmployees();
    if (name === 'summary') loadSummary();
  }

  function fillDeptSelects(departments) {
    const options = ['<option value="0">All</option>'].concat(
      departments.map(function (d) {
        return '<option value="' + d.id + '">' + escapeHtml(d.name) + '</option>';
      })
    );
    const formOptions = ['<option value="0">-- Select --</option>'].concat(
      departments.map(function (d) {
        return '<option value="' + d.id + '">' + escapeHtml(d.name) + '</option>';
      })
    );
    els.deptFilter.innerHTML = options.join('');
    els.departmentId.innerHTML = formOptions.join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadDepartments() {
    const data = await api('/departments.php');
    fillDeptSelects(data.data || []);
  }

  async function loadEmployees() {
    const q = els.q.value.trim();
    const dept = els.deptFilter.value;
    let path = '/employees.php?';
    const params = [];
    if (q) params.push('q=' + encodeURIComponent(q));
    if (dept && dept !== '0') params.push('dept=' + encodeURIComponent(dept));
    path += params.join('&');

    els.employeeRows.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';
    try {
      const data = await api(path);
      const rows = data.data || [];
      if (!rows.length) {
        els.employeeRows.innerHTML = '<tr><td colspan="7">No employees found.</td></tr>';
        return;
      }
      els.employeeRows.innerHTML = rows.map(function (e) {
        const name = escapeHtml((e.first_name || '') + ' ' + (e.last_name || ''));
        return (
          '<tr>' +
          '<td>' + escapeHtml(e.emp_code) + '</td>' +
          '<td>' + name + '</td>' +
          '<td>' + escapeHtml(e.email) + '</td>' +
          '<td>' + escapeHtml(e.department_name) + '</td>' +
          '<td>' + escapeHtml(e.job_title) + '</td>' +
          '<td>' + escapeHtml(e.status) + '</td>' +
          '<td>' +
          '<button type="button" class="linkish" data-edit="' + e.id + '">Edit</button>' +
          '<button type="button" class="linkish" data-del="' + e.id + '">Delete</button>' +
          '</td>' +
          '</tr>'
        );
      }).join('');
    } catch (err) {
      els.employeeRows.innerHTML = '<tr><td colspan="7">' + escapeHtml(err.message) + '</td></tr>';
      showErr(err.message);
    }
  }

  async function loadSummary() {
    els.summaryRows.innerHTML = '<tr><td colspan="4">Loading…</td></tr>';
    try {
      const data = await api('/departments.php?summary=1');
      const rows = data.data || [];
      if (!rows.length) {
        els.summaryRows.innerHTML = '<tr><td colspan="4">No department data.</td></tr>';
        return;
      }
      els.summaryRows.innerHTML = rows.map(function (d) {
        return (
          '<tr>' +
          '<td>' + escapeHtml(d.code) + '</td>' +
          '<td>' + escapeHtml(d.name) + '</td>' +
          '<td>' + escapeHtml(d.employee_count) + '</td>' +
          '<td>' + escapeHtml(d.active_count) + '</td>' +
          '</tr>'
        );
      }).join('');
    } catch (err) {
      els.summaryRows.innerHTML = '<tr><td colspan="4">' + escapeHtml(err.message) + '</td></tr>';
      showErr(err.message);
    }
  }

  function resetForm() {
    els.employeeId.value = '0';
    els.empCode.value = '';
    els.firstName.value = '';
    els.lastName.value = '';
    els.email.value = '';
    els.phone.value = '';
    els.departmentId.value = '0';
    els.jobTitle.value = '';
    els.status.value = 'ACTIVE';
    els.hireDate.value = '';
    els.formTitle.textContent = 'Add Employee';
    els.saveBtn.textContent = 'Create';
  }

  async function editEmployee(id) {
    try {
      const data = await api('/employees.php?id=' + encodeURIComponent(id));
      const e = data.data;
      els.employeeId.value = e.id;
      els.empCode.value = e.emp_code || '';
      els.firstName.value = e.first_name || '';
      els.lastName.value = e.last_name || '';
      els.email.value = e.email || '';
      els.phone.value = e.phone || '';
      els.departmentId.value = e.department_id || '0';
      els.jobTitle.value = e.job_title || '';
      els.status.value = e.status || 'ACTIVE';
      els.hireDate.value = e.hire_date || '';
      els.formTitle.textContent = 'Edit Employee';
      els.saveBtn.textContent = 'Update';
      switchTab('form');
    } catch (err) {
      showErr(err.message);
    }
  }

  async function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    try {
      await api('/employees.php?id=' + encodeURIComponent(id), { method: 'DELETE' });
      showMsg('Employee deleted');
      loadEmployees();
    } catch (err) {
      showErr(err.message);
    }
  }

  els.tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  els.filterForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    loadEmployees();
  });

  els.employeeRows.addEventListener('click', function (ev) {
    const editId = ev.target.getAttribute('data-edit');
    const delId = ev.target.getAttribute('data-del');
    if (editId) editEmployee(editId);
    if (delId) deleteEmployee(delId);
  });

  els.resetFormBtn.addEventListener('click', function () {
    resetForm();
    showMsg('');
    showErr('');
  });

  els.employeeForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const id = parseInt(els.employeeId.value, 10) || 0;
    const body = {
      emp_code: els.empCode.value.trim(),
      first_name: els.firstName.value.trim(),
      last_name: els.lastName.value.trim(),
      email: els.email.value.trim(),
      phone: els.phone.value.trim(),
      department_id: parseInt(els.departmentId.value, 10) || 0,
      job_title: els.jobTitle.value.trim(),
      status: els.status.value,
      hire_date: els.hireDate.value.trim() || undefined
    };

    try {
      if (id > 0) {
        body.id = id;
        await api('/employees.php', { method: 'PUT', body: JSON.stringify(body) });
        showMsg('Employee updated');
      } else {
        await api('/employees.php', { method: 'POST', body: JSON.stringify(body) });
        showMsg('Employee created');
        resetForm();
      }
      switchTab('list');
    } catch (err) {
      showErr(err.message);
    }
  });

  (async function init() {
    try {
      await loadDepartments();
      await loadEmployees();
      showMsg('Connected to PHP API at ' + API_BASE);
    } catch (err) {
      showErr('Could not reach API: ' + err.message);
    }
  })();
})();
