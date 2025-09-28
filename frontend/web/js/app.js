// Datos de usuarios de ejemplo
const users = {
    admin: { name: "Administrador", avatar: "A" },
    resident: { name: "María González", avatar: "M" },
    maintenance: { name: "Juan Pérez", avatar: "J" }
};

// Menús para cada rol
const menus = {
    admin: [
        { icon: "fas fa-tachometer-alt", text: "Dashboard", panel: "admin-panel" },
        { icon: "fas fa-users", text: "Propietarios", panel: "admin-panel" },
        { icon: "fas fa-file-invoice-dollar", text: "Expensas", panel: "admin-panel" },
        { icon: "fas fa-tools", text: "Mantenimiento", panel: "admin-panel" },
        { icon: "fas fa-chart-bar", text: "Reportes", panel: "admin-panel" },
        { icon: "fas fa-cog", text: "Configuración", panel: "admin-panel" }
    ],
    resident: [
        { icon: "fas fa-tachometer-alt", text: "Mi Dashboard", panel: "resident-panel" },
        { icon: "fas fa-file-invoice-dollar", text: "Mis Expensas", panel: "resident-panel" },
        { icon: "fas fa-tools", text: "Solicitar Mantenimiento", panel: "resident-panel" },
        { icon: "fas fa-calendar-alt", text: "Reservas", panel: "resident-panel" },
        { icon: "fas fa-comments", text: "Comunicados", panel: "resident-panel" }
    ],
    maintenance: [
        { icon: "fas fa-tachometer-alt", text: "Dashboard", panel: "maintenance-panel" },
        { icon: "fas fa-clipboard-list", text: "Tickets", panel: "maintenance-panel" },
        { icon: "fas fa-tools", text: "Inventario", panel: "maintenance-panel" },
        { icon: "fas fa-calendar", text: "Calendario", panel: "maintenance-panel" },
        { icon: "fas fa-chart-bar", text: "Reportes", panel: "maintenance-panel" }
    ]
};

// Estado de la aplicación
let currentUser = null;
let currentRole = "admin";

// Elementos DOM
const loginScreen = document.getElementById('login-screen');
const app = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const roleOptions = document.querySelectorAll('.role-option');
const sidebarMenu = document.getElementById('sidebar-menu');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const headerUserAvatar = document.getElementById('header-user-avatar');
const headerUserName = document.getElementById('header-user-name');
const pageTitle = document.getElementById('page-title');
const logoutBtn = document.getElementById('logout-btn');
const panels = document.querySelectorAll('.panel');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Selección de rol
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            roleOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            currentRole = this.getAttribute('data-role');
        });
    });

    // Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        handleLogout();
    });

    // Inicializar con datos por defecto
    loadDefaultData();
}

function handleLogin() {
    // Simular autenticación
    currentUser = users[currentRole];
    
    // Actualizar interfaz según el rol
    updateInterfaceForRole();
    
    // Mostrar aplicación y ocultar login
    loginScreen.style.display = 'none';
    app.style.display = 'flex';
    
    // Aplicar clase de rol al body
    document.body.className = `role-${currentRole}`;
}

function handleLogout() {
    // Mostrar login y ocultar aplicación
    app.style.display = 'none';
    loginScreen.style.display = 'flex';
    
    // Resetear clase de rol
    document.body.className = '';
    
    // Resetear datos
    currentUser = null;
    currentRole = "admin";
    
    // Resetear selección de rol
    roleOptions.forEach(o => o.classList.remove('selected'));
    roleOptions[0].classList.add('selected');
}

function updateInterfaceForRole() {
    if (!currentUser) return;
    
    // Actualizar información del usuario
    userAvatar.textContent = currentUser.avatar;
    userName.textContent = currentUser.name;
    userRole.textContent = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
    
    headerUserAvatar.textContent = currentUser.avatar;
    headerUserName.textContent = currentUser.name;
    
    // Actualizar menú
    updateSidebarMenu();
    
    // Actualizar contenido del panel
    updatePanelContent();
}

function updateSidebarMenu() {
    sidebarMenu.innerHTML = '';
    menus[currentRole].forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <i class="${item.icon}"></i>
            <span>${item.text}</span>
        `;
        menuItem.addEventListener('click', function() {
            // Actualizar título de página
            pageTitle.textContent = `${item.text} del Consorcio`;
            
            // Marcar elemento activo
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar panel correspondiente
            showPanel(item.panel);
        });
        sidebarMenu.appendChild(menuItem);
    });
    
    // Activar primer elemento del menú
    const firstMenuItem = sidebarMenu.querySelector('.menu-item');
    if (firstMenuItem) {
        firstMenuItem.classList.add('active');
        pageTitle.textContent = `${menus[currentRole][0].text} del Consorcio`;
        showPanel(menus[currentRole][0].panel);
    }
}

function updatePanelContent() {
    // Limpiar paneles
    panels.forEach(panel => {
        panel.innerHTML = '';
    });
    
    // Cargar contenido según el rol
    switch(currentRole) {
        case 'admin':
            loadAdminPanel();
            break;
        case 'resident':
            loadResidentPanel();
            break;
        case 'maintenance':
            loadMaintenancePanel();
            break;
    }
}

function loadAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.innerHTML = `
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Propietarios Activos</div>
                    <div class="card-icon" style="background: #3498db;">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="card-value">24</div>
                <div class="card-change positive">+2 este mes</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Expensas Cobradas</div>
                    <div class="card-icon" style="background: #2ecc71;">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="card-value">$85,430</div>
                <div class="card-change positive">92% del total</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Gastos del Mes</div>
                    <div class="card-icon" style="background: #f39c12;">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                </div>
                <div class="card-value">$42,150</div>
                <div class="card-change negative">+5% vs mes anterior</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Tickets Abiertos</div>
                    <div class="card-icon" style="background: #e74c3c;">
                        <i class="fas fa-tools"></i>
                    </div>
                </div>
                <div class="card-value">7</div>
                <div class="card-change negative">+2 esta semana</div>
            </div>
        </div>
        
        <div class="modules-section">
            <h2 class="section-title">
                <i class="fas fa-users"></i>
                Gestión de Propietarios
            </h2>
            <div class="table-container">
                <div class="table-header">
                    <h3>Lista de Propietarios</h3>
                    <button class="btn" style="width: auto; padding: 8px 15px;">
                        <i class="fas fa-plus"></i> Agregar Propietario
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Departamento</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>María González</td>
                            <td>4B</td>
                            <td>11-2345-6789</td>
                            <td>maria.gonzalez@email.com</td>
                            <td><span class="badge badge-success">Al día</span></td>
                            <td>
                                <i class="fas fa-edit" style="color: #3498db; cursor: pointer;"></i>
                                <i class="fas fa-trash" style="color: #e74c3c; margin-left: 10px; cursor: pointer;"></i>
                            </td>
                        </tr>
                        <tr>
                            <td>Carlos López</td>
                            <td>7C</td>
                            <td>11-3456-7890</td>
                            <td>carlos.lopez@email.com</td>
                            <td><span class="badge badge-success">Al día</span></td>
                            <td>
                                <i class="fas fa-edit" style="color: #3498db; cursor: pointer;"></i>
                                <i class="fas fa-trash" style="color: #e74c3c; margin-left: 10px; cursor: pointer;"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function loadResidentPanel() {
    const residentPanel = document.getElementById('resident-panel');
    residentPanel.innerHTML = `
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Mi Saldo Actual</div>
                    <div class="card-icon" style="background: #2ecc71;">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="card-value">$5,240</div>
                <div class="card-change positive">Al día</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Próxima Expensa</div>
                    <div class="card-icon" style="background: #f39c12;">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
                <div class="card-value">15 Agosto</div>
                <div class="card-change">Vence el 05/09</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Tickets Activos</div>
                    <div class="card-icon" style="background: #3498db;">
                        <i class="fas fa-tools"></i>
                    </div>
                </div>
                <div class="card-value">2</div>
                <div class="card-change">1 en proceso</div>
            </div>
        </div>

        <div class="modules-section">
            <h2 class="section-title">
                <i class="fas fa-file-invoice-dollar"></i>
                Mis Expensas
            </h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Monto</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Agosto 2023</td>
                            <td>$24,500</td>
                            <td>05/09/2023</td>
                            <td><span class="badge badge-warning">Pendiente</span></td>
                            <td><button class="btn" style="width: auto; padding: 5px 10px; font-size: 0.8rem;">Pagar</button></td>
                        </tr>
                        <tr>
                            <td>Julio 2023</td>
                            <td>$24,000</td>
                            <td>05/08/2023</td>
                            <td><span class="badge badge-success">Pagado</span></td>
                            <td><button class="btn" style="width: auto; padding: 5px 10px; font-size: 0.8rem;" disabled>Descargar</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function loadMaintenancePanel() {
    const maintenancePanel = document.getElementById('maintenance-panel');
    maintenancePanel.innerHTML = `
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Tickets Activos</div>
                    <div class="card-icon" style="background: #f39c12;">
                        <i class="fas fa-tools"></i>
                    </div>
                </div>
                <div class="card-value">7</div>
                <div class="card-change negative">+2 esta semana</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">En Proceso</div>
                    <div class="card-icon" style="background: #3498db;">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                </div>
                <div class="card-value">3</div>
                <div class="card-change">Sin cambios</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Completados</div>
                    <div class="card-icon" style="background: #2ecc71;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="card-value">12</div>
                <div class="card-change positive">Este mes</div>
            </div>
        </div>

        <div class="modules-section">
            <h2 class="section-title">
                <i class="fas fa-clipboard-list"></i>
                Tickets de Mantenimiento
            </h2>
            <div class="table-container">
                <div class="table-header">
                    <h3>Tickets Activos</h3>
                    <button class="btn" style="width: auto; padding: 8px 15px;">
                        <i class="fas fa-plus"></i> Nuevo Ticket
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Departamento</th>
                            <th>Problema</th>
                            <th>Fecha</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#1245</td>
                            <td>4B</td>
                            <td>Fuga de agua en baño</td>
                            <td>15/08/2023</td>
                            <td><span class="badge badge-danger">Alta</span></td>
                            <td><span class="badge badge-warning">En proceso</span></td>
                            <td>
                                <i class="fas fa-edit" style="color: #3498db; cursor: pointer;"></i>
                                <i class="fas fa-check" style="color: #2ecc71; margin-left: 10px; cursor: pointer;"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showPanel(panelId) {
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(panelId).classList.add('active');
}

function loadDefaultData() {
    // Inicializar con datos por defecto
    currentRole = "admin";
    roleOptions[0].classList.add('selected');
}

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});