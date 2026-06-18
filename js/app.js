let data = {
    clients: [],
    leads: [],
    projects: [],
    quotations: [],
    payments: [],
    expenses: [],
    tasks: [],
    urgentAlerts: []
};

function loadData() {
    const storedData = localStorage.getItem('zosErpData');
    if (storedData) {
        data = JSON.parse(storedData);
    } else {
        initSampleData();
    }
}

function saveData() {
    localStorage.setItem('zosErpData', JSON.stringify(data));
}

function initSampleData() {
    // Start completely empty - no sample data!
    data.clients = [];
    data.leads = [];
    data.projects = [];
    data.quotations = [];
    data.payments = [];
    data.expenses = [];
    data.tasks = [];
    data.urgentAlerts = [];
    saveData();
}

function initNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(btn.dataset.section).classList.add('active');

            renderSection(btn.dataset.section);
        });
    });
}

function renderSection(section) {
    switch (section) {
        case 'dashboard': renderDashboard(); break;
        case 'clients': renderClients(); break;
        case 'leads': renderLeads(); break;
        case 'projects': renderProjects(); break;
        case 'quotations': renderQuotations(); break;
        case 'payments': renderPayments(); break;
        case 'tasks': renderTasks(); break;
    }
}

function renderDashboard() {
    const totalClients = data.clients.length;
    const activeProjects = data.projects.filter(p => p.progress < 100).length;
    const pendingPayments = data.payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const newLeads = data.leads.filter(l => l.stage === 'new').length;
    const revenueThisMonth = data.payments.filter(p => p.status === 'Paid' && p.paidDate.startsWith('2026-06')).reduce((sum, p) => sum + p.amount, 0);
    const tasksDueToday = data.tasks.filter(t => t.dueDate === '2026-06-18').length;

    document.getElementById('dashboardStats').innerHTML = `
        <div class="stat-card">
            <h4>Total Clients</h4>
            <p>${totalClients}</p>
        </div>
        <div class="stat-card">
            <h4>Active Projects</h4>
            <p>${activeProjects}</p>
        </div>
        <div class="stat-card">
            <h4>Pending Payments</h4>
            <p>₹${pendingPayments.toLocaleString()}</p>
        </div>
        <div class="stat-card">
            <h4>New Leads</h4>
            <p>${newLeads}</p>
        </div>
        <div class="stat-card">
            <h4>Revenue This Month</h4>
            <p>₹${revenueThisMonth.toLocaleString()}</p>
        </div>
        <div class="stat-card">
            <h4>Tasks Due Today</h4>
            <p>${tasksDueToday}</p>
        </div>
    `;
    
    // Add data management buttons
    let buttonsContainer = document.getElementById('dataButtons');
    if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'dataButtons';
        buttonsContainer.style.marginTop = '20px';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '10px';
        buttonsContainer.style.flexWrap = 'wrap';
        
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearDataBtn';
        clearBtn.className = 'btn-pink';
        clearBtn.style.background = '#dc143c';
        clearBtn.textContent = '🗑️ Clear All Data';
        clearBtn.onclick = clearAllData;
        buttonsContainer.appendChild(clearBtn);
        
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-pink';
        exportBtn.textContent = '💾 Export Data';
        exportBtn.onclick = exportData;
        buttonsContainer.appendChild(exportBtn);
        
        const importBtn = document.createElement('button');
        importBtn.className = 'btn-pink';
        importBtn.style.background = '#32cd32';
        importBtn.textContent = '📥 Import Data';
        importBtn.onclick = () => document.getElementById('importFile').click();
        buttonsContainer.appendChild(importBtn);
        
        // Hidden file input for import
        const fileInput = document.createElement('input');
        fileInput.id = 'importFile';
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.onchange = importData;
        buttonsContainer.appendChild(fileInput);
        
        document.getElementById('dashboard').insertBefore(buttonsContainer, document.getElementById('dashboardStats').nextSibling);
    }

    document.getElementById('todayTasks').innerHTML = data.tasks
        .filter(t => t.dueDate === '2026-06-18')
        .map(t => `
            <div class="list-item">
                <input type="checkbox" ${t.status === 'completed' ? 'checked' : ''} onchange="toggleTaskStatus('${t.id}')">
                <span>${t.title}</span>
            </div>
        `).join('') || '<p class="text-center">No tasks due today!</p>';

    // Add "Add Alert" button
    const addAlertBtn = document.createElement('button');
    addAlertBtn.className = 'btn-pink btn-small';
    addAlertBtn.textContent = '+ Add Urgent Alert';
    addAlertBtn.onclick = showAddAlertModal;
    document.getElementById('urgentAlerts').parentNode.insertBefore(addAlertBtn, document.getElementById('urgentAlerts'));
    
    // Render alerts
    document.getElementById('urgentAlerts').innerHTML = data.urgentAlerts.map(alert => `
        <div class="list-item">
            <span class="badge ${alert.priority === 'high' ? 'badge-danger' : 'badge-warning'}">⚠</span>
            <span>${alert.text}</span>
            <div style="margin-left: auto; display: flex; gap: 5px;">
                <button class="btn-pink btn-small" onclick="editAlert('${alert.id}')">Edit</button>
                <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteAlert('${alert.id}')">Delete</button>
            </div>
        </div>
    `).join('') || '<p class="text-center">No urgent alerts!</p>';
}

function clearAllData() {
    if (confirm('⚠️ Are you SURE you want to delete ALL data? This cannot be undone!')) {
        // Clear ALL localStorage items related to the app
        Object.keys(localStorage).forEach(key => {
            if (key.includes('zos')) {
                localStorage.removeItem(key);
            }
        });
        // Clear the in-memory data
        data = {
            clients: [],
            leads: [],
            projects: [],
            quotations: [],
            payments: [],
            expenses: [],
            tasks: [],
            urgentAlerts: []
        };
        // Reload to start fresh
        location.reload();
    }
}

function renderClients() {
    document.getElementById('clientsList').innerHTML = data.clients.map(client => `
        <div class="card">
            <h3>${client.name}</h3>
            <p><strong>Contact:</strong> ${client.contactPerson}</p>
            <p><strong>Phone:</strong> ${client.phone}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>WhatsApp:</strong> ${client.whatsapp}</p>
            <p><strong>Country:</strong> ${client.country}</p>
            <p><strong>Project Value:</strong> ₹${client.projectValue.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="badge badge-success">${client.status}</span></p>
            <p><strong>Notes:</strong> ${client.notes}</p>
            <h4 style="margin-top:15px; color:#ff1493;">Timeline</h4>
            ${client.timeline.map(t => `<p>• ${t.date}: ${t.event}</p>`).join('')}
            <div style="margin-top:15px;">
                <button class="btn-pink btn-small" onclick="editClient('${client.id}')">Edit</button>
                <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteClient('${client.id}')">Delete</button>
            </div>
        </div>
    `).join('') || '<p class="text-center" style="color:#ff69b4;">No clients yet!</p>';
}

function renderLeads() {
    const stages = ['new', 'contacted', 'interested', 'meeting', 'quotation', 'negotiation', 'won', 'lost'];
    stages.forEach(stage => {
        const leadsInStage = data.leads.filter(l => l.stage === stage);
        document.getElementById(`leads-${stage}`).innerHTML = leadsInStage.map(lead => {
            const stars = '⭐'.repeat(lead.score);
            return `
                <div class="lead-card">
                    <h5>${lead.name}</h5>
                    <p>${lead.contact}</p>
                    <div class="lead-score">${stars}</div>
                    <div style="margin-top:10px;">
                        <button class="btn-pink btn-small" onclick="moveLead('${lead.id}', 'prev')">←</button>
                        <button class="btn-pink btn-small" onclick="editLead('${lead.id}')">Edit</button>
                        <button class="btn-pink btn-small" onclick="deleteLead('${lead.id}')" style="background:#dc143c;">Delete</button>
                        <button class="btn-pink btn-small" onclick="moveLead('${lead.id}', 'next')">→</button>
                    </div>
                </div>
            `;
        }).join('');
    });
}

function renderProjects() {
    document.getElementById('projectsList').innerHTML = data.projects.map(project => `
        <div class="card">
            <h3>${project.name}</h3>
            <p><strong>Client:</strong> ${project.client}</p>
            <p><strong>Progress:</strong> ${project.progress}%</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width:${project.progress}%"></div>
            </div>
            <h4 style="margin-top:15px; color:#ff1493;">Tasks</h4>
            ${project.tasks.map(task => {
                const statusEmoji = task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '⏳' : '❌';
                return `<p>${statusEmoji} ${task.name}</p>`;
            }).join('')}
            <div style="margin-top:15px;">
                <button class="btn-pink btn-small" onclick="editProject('${project.id}')">Edit</button>
                <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteProject('${project.id}')">Delete</button>
            </div>
        </div>
    `).join('') || '<p class="text-center" style="color:#ff69b4;">No projects yet!</p>';
}

function renderQuotations() {
    document.getElementById('quotationsList').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.quotations.map(q => `
                    <tr>
                        <td>${q.id}</td>
                        <td>${q.client}</td>
                        <td>₹${q.amount.toLocaleString()}</td>
                        <td><span class="badge ${q.status === 'Accepted' ? 'badge-success' : 'badge-warning'}">${q.status}</span></td>
                        <td>${q.date}</td>
                        <td>
                            <button class="btn-pink btn-small" onclick="editQuotation('${q.id}')">Edit</button>
                            <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteQuotation('${q.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

let activeFinanceTab = 'income';

function renderPayments() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFinanceTab = btn.dataset.tab;
            renderFinanceContent();
        });
    });
    renderFinanceContent();
}

function renderFinanceContent() {
    let html = '';
    if (activeFinanceTab === 'income') {
        html = `
            <button class="btn-pink" onclick="showAddPaymentModal()">+ Add Payment</button>
            <table>
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Paid Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.payments.map(p => `
                        <tr>
                            <td>${p.client}</td>
                            <td>₹${p.amount.toLocaleString()}</td>
                            <td>${p.dueDate}</td>
                            <td>${p.paidDate || '-'}</td>
                            <td><span class="badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${p.status}</span></td>
                            <td>
                                <button class="btn-pink btn-small" onclick="editPayment('${p.id}')">Edit</button>
                                <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deletePayment('${p.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (activeFinanceTab === 'expenses') {
        html = `
            <button class="btn-pink" onclick="showAddExpenseModal()">+ Add Expense</button>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.expenses.map(e => `
                        <tr>
                            <td>${e.category}</td>
                            <td>₹${e.amount.toLocaleString()}</td>
                            <td>${e.date}</td>
                            <td>
                                <button class="btn-pink btn-small" onclick="editExpense('${e.id}')">Edit</button>
                                <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteExpense('${e.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (activeFinanceTab === 'profit') {
        const totalRevenue = data.payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Monthly Revenue</h4>
                    <p>₹${totalRevenue.toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h4>Monthly Expenses</h4>
                    <p>₹${totalExpenses.toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h4>Net Profit</h4>
                    <p style="color:${netProfit >= 0 ? '#32cd32' : '#dc143c'}">₹${netProfit.toLocaleString()}</p>
                </div>
            </div>
        `;
    }
    document.getElementById('financeContent').innerHTML = html;
}

function renderTasks() {
    document.getElementById('tasksList').innerHTML = data.tasks.map(task => {
        const priorityBadge = task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-info';
        return `
            <div class="card">
                <h3>${task.title}</h3>
                <p><strong>Due Date:</strong> ${task.dueDate}</p>
                <p><strong>Priority:</strong> <span class="badge ${priorityBadge}">${task.priority}</span></p>
                <p><strong>Status:</strong> <span class="badge ${task.status === 'completed' ? 'badge-success' : 'badge-warning'}">${task.status}</span></p>
                <div style="margin-top:15px;">
                    <button class="btn-pink btn-small" onclick="editTask('${task.id}')">Edit</button>
                    <button class="btn-pink btn-small" style="background:#dc143c;" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center" style="color:#ff69b4;">No tasks yet!</p>';
}

function showModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

function showAddClientModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add New Client</h2>
        <form onsubmit="addClient(event)">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="clientName" required>
            </div>
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" id="clientContact" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="clientPhone" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="clientEmail" required>
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="clientWhatsapp">
            </div>
            <div class="form-group">
                <label>Country</label>
                <input type="text" id="clientCountry" required>
            </div>
            <div class="form-group">
                <label>Project Value</label>
                <input type="number" id="clientProjectValue" required>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="clientNotes"></textarea>
            </div>
            <button type="submit" class="btn-pink">Add Client</button>
        </form>
    `);
}

function addClient(e) {
    e.preventDefault();
    const client = {
        id: Date.now().toString(),
        name: document.getElementById('clientName').value,
        contactPerson: document.getElementById('clientContact').value,
        phone: document.getElementById('clientPhone').value,
        email: document.getElementById('clientEmail').value,
        whatsapp: document.getElementById('clientWhatsapp').value,
        country: document.getElementById('clientCountry').value,
        projectValue: parseFloat(document.getElementById('clientProjectValue').value),
        status: 'Active',
        notes: document.getElementById('clientNotes').value,
        timeline: [{ date: new Date().toISOString().split('T')[0], event: 'Added to system' }]
    };
    data.clients.push(client);
    saveData();
    closeModal();
    renderClients();
}

function showAddLeadModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add New Lead</h2>
        <form onsubmit="addLead(event)">
            <div class="form-group">
                <label>Lead Name</label>
                <input type="text" id="leadName" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="leadEmail" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="leadPhone">
            </div>
            <div class="form-group">
                <label>Score (1-5)</label>
                <input type="number" id="leadScore" min="1" max="5" value="3" required>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="leadNotes"></textarea>
            </div>
            <button type="submit" class="btn-pink">Add Lead</button>
        </form>
    `);
}

function addLead(e) {
    e.preventDefault();
    const lead = {
        id: Date.now().toString(),
        name: document.getElementById('leadName').value,
        contact: document.getElementById('leadEmail').value,
        phone: document.getElementById('leadPhone').value,
        stage: 'new',
        score: parseInt(document.getElementById('leadScore').value),
        notes: document.getElementById('leadNotes').value
    };
    data.leads.push(lead);
    saveData();
    closeModal();
    renderLeads();
}

function moveLead(id, direction) {
    const stages = ['new', 'contacted', 'interested', 'meeting', 'quotation', 'negotiation', 'won', 'lost'];
    const lead = data.leads.find(l => l.id === id);
    const currentIndex = stages.indexOf(lead.stage);
    
    if (direction === 'next' && currentIndex < stages.length - 1) {
        lead.stage = stages[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
        lead.stage = stages[currentIndex - 1];
    }
    
    saveData();
    renderLeads();
}

function showAddProjectModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add New Project</h2>
        <form onsubmit="addProject(event)">
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" id="projectName" required>
            </div>
            <div class="form-group">
                <label>Client</label>
                <select id="projectClient" required>
                    ${data.clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Progress (%)</label>
                <input type="number" id="projectProgress" min="0" max="100" value="0" required>
            </div>
            <button type="submit" class="btn-pink">Add Project</button>
        </form>
    `);
}

function addProject(e) {
    e.preventDefault();
    const project = {
        id: Date.now().toString(),
        name: document.getElementById('projectName').value,
        client: document.getElementById('projectClient').value,
        progress: parseInt(document.getElementById('projectProgress').value),
        tasks: []
    };
    data.projects.push(project);
    saveData();
    closeModal();
    renderProjects();
}

function showAddQuotationModal() {
    const nextId = `ZOS-2026-${String(data.quotations.length + 1).padStart(3, '0')}`;
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Create New Quotation</h2>
        <form onsubmit="addQuotation(event)">
            <div class="form-group">
                <label>Quotation ID</label>
                <input type="text" id="quotationId" value="${nextId}" readonly>
            </div>
            <div class="form-group">
                <label>Client</label>
                <select id="quotationClient" required>
                    ${data.clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="quotationAmount" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="quotationStatus">
                    <option>Pending</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Create Quotation</button>
        </form>
    `);
}

function addQuotation(e) {
    e.preventDefault();
    const quotation = {
        id: document.getElementById('quotationId').value,
        client: document.getElementById('quotationClient').value,
        amount: parseFloat(document.getElementById('quotationAmount').value),
        status: document.getElementById('quotationStatus').value,
        date: new Date().toISOString().split('T')[0]
    };
    data.quotations.push(quotation);
    saveData();
    closeModal();
    renderQuotations();
}

function showAddTaskModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add New Task</h2>
        <form onsubmit="addTask(event)">
            <div class="form-group">
                <label>Task Title</label>
                <input type="text" id="taskTitle" required>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" id="taskDueDate" required>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="taskPriority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Add Task</button>
        </form>
    `);
}

function addTask(e) {
    e.preventDefault();
    const task = {
        id: Date.now().toString(),
        title: document.getElementById('taskTitle').value,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: 'pending'
    };
    data.tasks.push(task);
    saveData();
    closeModal();
    renderTasks();
}

function toggleTaskStatus(id) {
    const task = data.tasks.find(t => t.id === id);
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    saveData();
    renderDashboard();
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        data.clients = data.clients.filter(c => c.id !== id);
        saveData();
        renderClients();
    }
}

function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        data.leads = data.leads.filter(l => l.id !== id);
        saveData();
        renderLeads();
    }
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        data.projects = data.projects.filter(p => p.id !== id);
        saveData();
        renderProjects();
    }
}

function deleteQuotation(id) {
    if (confirm('Are you sure you want to delete this quotation?')) {
        data.quotations = data.quotations.filter(q => q.id !== id);
        saveData();
        renderQuotations();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        data.tasks = data.tasks.filter(t => t.id !== id);
        saveData();
        renderTasks();
    }
}

function deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment?')) {
        data.payments = data.payments.filter(p => p.id !== id);
        saveData();
        renderFinanceContent();
    }
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        data.expenses = data.expenses.filter(e => e.id !== id);
        saveData();
        renderFinanceContent();
    }
}

function editClient(id) {
    const client = data.clients.find(c => c.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Client</h2>
        <form onsubmit="updateClient(event, '${id}')">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="editClientName" value="${client.name}" required>
            </div>
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" id="editClientContact" value="${client.contactPerson}" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="editClientPhone" value="${client.phone}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="editClientEmail" value="${client.email}" required>
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="editClientWhatsapp" value="${client.whatsapp}">
            </div>
            <div class="form-group">
                <label>Country</label>
                <input type="text" id="editClientCountry" value="${client.country}" required>
            </div>
            <div class="form-group">
                <label>Project Value</label>
                <input type="number" id="editClientProjectValue" value="${client.projectValue}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editClientStatus">
                    <option value="Active" ${client.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${client.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="editClientNotes">${client.notes}</textarea>
            </div>
            <button type="submit" class="btn-pink">Update Client</button>
        </form>
    `);
}

function updateClient(e, id) {
    e.preventDefault();
    const client = data.clients.find(c => c.id === id);
    client.name = document.getElementById('editClientName').value;
    client.contactPerson = document.getElementById('editClientContact').value;
    client.phone = document.getElementById('editClientPhone').value;
    client.email = document.getElementById('editClientEmail').value;
    client.whatsapp = document.getElementById('editClientWhatsapp').value;
    client.country = document.getElementById('editClientCountry').value;
    client.projectValue = parseFloat(document.getElementById('editClientProjectValue').value);
    client.status = document.getElementById('editClientStatus').value;
    client.notes = document.getElementById('editClientNotes').value;
    saveData();
    closeModal();
    renderClients();
}

function editLead(id) {
    const lead = data.leads.find(l => l.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Lead</h2>
        <form onsubmit="updateLead(event, '${id}')">
            <div class="form-group">
                <label>Lead Name</label>
                <input type="text" id="editLeadName" value="${lead.name}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="editLeadEmail" value="${lead.contact}" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="editLeadPhone" value="${lead.phone}">
            </div>
            <div class="form-group">
                <label>Score (1-5)</label>
                <input type="number" id="editLeadScore" min="1" max="5" value="${lead.score}" required>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="editLeadNotes">${lead.notes}</textarea>
            </div>
            <button type="submit" class="btn-pink">Update Lead</button>
        </form>
    `);
}

function updateLead(e, id) {
    e.preventDefault();
    const lead = data.leads.find(l => l.id === id);
    lead.name = document.getElementById('editLeadName').value;
    lead.contact = document.getElementById('editLeadEmail').value;
    lead.phone = document.getElementById('editLeadPhone').value;
    lead.score = parseInt(document.getElementById('editLeadScore').value);
    lead.notes = document.getElementById('editLeadNotes').value;
    saveData();
    closeModal();
    renderLeads();
}

function editProject(id) {
    const project = data.projects.find(p => p.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Project</h2>
        <form onsubmit="updateProject(event, '${id}')">
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" id="editProjectName" value="${project.name}" required>
            </div>
            <div class="form-group">
                <label>Client</label>
                <select id="editProjectClient" required>
                    ${data.clients.map(c => `<option value="${c.name}" ${project.client === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Progress (%)</label>
                <input type="number" id="editProjectProgress" min="0" max="100" value="${project.progress}" required>
            </div>
            <button type="submit" class="btn-pink">Update Project</button>
        </form>
    `);
}

function updateProject(e, id) {
    e.preventDefault();
    const project = data.projects.find(p => p.id === id);
    project.name = document.getElementById('editProjectName').value;
    project.client = document.getElementById('editProjectClient').value;
    project.progress = parseInt(document.getElementById('editProjectProgress').value);
    saveData();
    closeModal();
    renderProjects();
}

function editQuotation(id) {
    const quotation = data.quotations.find(q => q.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Quotation</h2>
        <form onsubmit="updateQuotation(event, '${id}')">
            <div class="form-group">
                <label>Quotation ID</label>
                <input type="text" id="editQuotationId" value="${quotation.id}" readonly>
            </div>
            <div class="form-group">
                <label>Client</label>
                <select id="editQuotationClient" required>
                    ${data.clients.map(c => `<option value="${c.name}" ${quotation.client === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="editQuotationAmount" value="${quotation.amount}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editQuotationStatus">
                    <option value="Pending" ${quotation.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Accepted" ${quotation.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="Rejected" ${quotation.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Update Quotation</button>
        </form>
    `);
}

function updateQuotation(e, id) {
    e.preventDefault();
    const quotation = data.quotations.find(q => q.id === id);
    quotation.client = document.getElementById('editQuotationClient').value;
    quotation.amount = parseFloat(document.getElementById('editQuotationAmount').value);
    quotation.status = document.getElementById('editQuotationStatus').value;
    saveData();
    closeModal();
    renderQuotations();
}

function editTask(id) {
    const task = data.tasks.find(t => t.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Task</h2>
        <form onsubmit="updateTask(event, '${id}')">
            <div class="form-group">
                <label>Task Title</label>
                <input type="text" id="editTaskTitle" value="${task.title}" required>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" id="editTaskDueDate" value="${task.dueDate}" required>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="editTaskPriority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editTaskStatus">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Update Task</button>
        </form>
    `);
}

function updateTask(e, id) {
    e.preventDefault();
    const task = data.tasks.find(t => t.id === id);
    task.title = document.getElementById('editTaskTitle').value;
    task.dueDate = document.getElementById('editTaskDueDate').value;
    task.priority = document.getElementById('editTaskPriority').value;
    task.status = document.getElementById('editTaskStatus').value;
    saveData();
    closeModal();
    renderTasks();
    renderDashboard();
}

function showAddPaymentModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add Payment</h2>
        <form onsubmit="addPayment(event)">
            <div class="form-group">
                <label>Client</label>
                <select id="paymentClient" required>
                    ${data.clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="paymentAmount" required>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" id="paymentDueDate" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="paymentStatus">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Add Payment</button>
        </form>
    `);
}

function addPayment(e) {
    e.preventDefault();
    const payment = {
        id: Date.now().toString(),
        client: document.getElementById('paymentClient').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        dueDate: document.getElementById('paymentDueDate').value,
        paidDate: document.getElementById('paymentStatus').value === 'Paid' ? new Date().toISOString().split('T')[0] : '',
        status: document.getElementById('paymentStatus').value
    };
    data.payments.push(payment);
    saveData();
    closeModal();
    renderFinanceContent();
}

function editPayment(id) {
    const payment = data.payments.find(p => p.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Payment</h2>
        <form onsubmit="updatePayment(event, '${id}')">
            <div class="form-group">
                <label>Client</label>
                <select id="editPaymentClient" required>
                    ${data.clients.map(c => `<option value="${c.name}" ${payment.client === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="editPaymentAmount" value="${payment.amount}" required>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" id="editPaymentDueDate" value="${payment.dueDate}" required>
            </div>
            <div class="form-group">
                <label>Paid Date</label>
                <input type="date" id="editPaymentPaidDate" value="${payment.paidDate}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editPaymentStatus">
                    <option value="Pending" ${payment.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Paid" ${payment.status === 'Paid' ? 'selected' : ''}>Paid</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Update Payment</button>
        </form>
    `);
}

function updatePayment(e, id) {
    e.preventDefault();
    const payment = data.payments.find(p => p.id === id);
    payment.client = document.getElementById('editPaymentClient').value;
    payment.amount = parseFloat(document.getElementById('editPaymentAmount').value);
    payment.dueDate = document.getElementById('editPaymentDueDate').value;
    payment.paidDate = document.getElementById('editPaymentPaidDate').value;
    payment.status = document.getElementById('editPaymentStatus').value;
    saveData();
    closeModal();
    renderFinanceContent();
}

function showAddExpenseModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add Expense</h2>
        <form onsubmit="addExpense(event)">
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="expenseCategory" required>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="expenseAmount" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="expenseDate" required>
            </div>
            <button type="submit" class="btn-pink">Add Expense</button>
        </form>
    `);
}

function addExpense(e) {
    e.preventDefault();
    const expense = {
        id: Date.now().toString(),
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value
    };
    data.expenses.push(expense);
    saveData();
    closeModal();
    renderFinanceContent();
}

function editExpense(id) {
    const expense = data.expenses.find(e => e.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Expense</h2>
        <form onsubmit="updateExpense(event, '${id}')">
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="editExpenseCategory" value="${expense.category}" required>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="editExpenseAmount" value="${expense.amount}" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="editExpenseDate" value="${expense.date}" required>
            </div>
            <button type="submit" class="btn-pink">Update Expense</button>
        </form>
    `);
}

function updateExpense(e, id) {
    e.preventDefault();
    const expense = data.expenses.find(exp => exp.id === id);
    expense.category = document.getElementById('editExpenseCategory').value;
    expense.amount = parseFloat(document.getElementById('editExpenseAmount').value);
    expense.date = document.getElementById('editExpenseDate').value;
    saveData();
    closeModal();
    renderFinanceContent();
}

function showAddAlertModal() {
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Add Urgent Alert</h2>
        <form onsubmit="addAlert(event)">
            <div class="form-group">
                <label>Alert Text</label>
                <input type="text" id="alertText" required>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="alertPriority">
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Add Alert</button>
        </form>
    `);
}

function addAlert(e) {
    e.preventDefault();
    const alert = {
        id: Date.now().toString(),
        text: document.getElementById('alertText').value,
        priority: document.getElementById('alertPriority').value
    };
    data.urgentAlerts.push(alert);
    saveData();
    closeModal();
    renderSection('dashboard');
}

function editAlert(id) {
    const alert = data.urgentAlerts.find(a => a.id === id);
    showModal(`
        <h2 style="color:#ff1493; margin-bottom:20px;">Edit Urgent Alert</h2>
        <form onsubmit="updateAlert(event, '${id}')">
            <div class="form-group">
                <label>Alert Text</label>
                <input type="text" id="editAlertText" value="${alert.text}" required>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="editAlertPriority">
                    <option value="medium" ${alert.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${alert.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <button type="submit" class="btn-pink">Update Alert</button>
        </form>
    `);
}

function updateAlert(e, id) {
    e.preventDefault();
    const alert = data.urgentAlerts.find(a => a.id === id);
    alert.text = document.getElementById('editAlertText').value;
    alert.priority = document.getElementById('editAlertPriority').value;
    saveData();
    closeModal();
    renderSection('dashboard');
}

function deleteAlert(id) {
    if (confirm('Are you sure you want to delete this alert?')) {
        data.urgentAlerts = data.urgentAlerts.filter(a => a.id !== id);
        saveData();
        renderSection('dashboard');
    }
}

// Export all data as JSON file
function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zos-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            // Validate the imported data
            if (confirm('⚠️ This will replace all your current data! Are you sure?')) {
                data = importedData;
                saveData();
                location.reload();
            }
        } catch (error) {
            alert('❌ Invalid JSON file! Please select a valid ZOS data backup.');
        }
    };
    reader.readAsText(file);
}

// Check login status
function checkLogin() {
    if (localStorage.getItem('zosLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('zosLoggedIn');
    window.location.href = 'index.html';
}

// Add logout button listener
document.getElementById('logoutBtn').addEventListener('click', logout);

// Initialize
checkLogin();
loadData();
initNav();
renderSection('dashboard');
