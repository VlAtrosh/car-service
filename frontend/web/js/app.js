const API_URL = 'http://localhost:8000/api/v1';
let authToken = localStorage.getItem('token') || null;
let currentUser = null;

// DOM элементы
const loginModal = document.getElementById('login-modal');
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const userNameSpan = document.getElementById('user-name');
const userRoleSpan = document.getElementById('user-role');
const logoutBtn = document.getElementById('logout-btn');
const createOrderBtn = document.getElementById('create-order-btn');

// ========== АВТОРИЗАЦИЯ ==========
function checkAuth() {
    if (authToken) {
        fetchUserInfo();
        loginModal.style.display = 'none';
    } else {
        loginModal.style.display = 'flex';
    }
}

async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/user/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            userNameSpan.textContent = user.name;
            userRoleSpan.textContent = user.role;
            loadPage('orders');
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('token');
    currentUser = null;
    userNameSpan.textContent = 'Не авторизован';
    loginModal.style.display = 'flex';
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        method, headers, body: body ? JSON.stringify(body) : null
    });
    if (response.status === 401) logout();
    return response;
}

// ========== СТРАНИЦЫ ==========
async function loadOrders() {
    pageTitle.textContent = 'Заказ-наряды';
    contentArea.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await apiRequest('/order/orders');
        if (response.ok) {
            const orders = await response.json();
            if (orders.length === 0) {
                contentArea.innerHTML = '<div class="loading">Нет заказов. Создайте первый заказ.</div>';
            } else {
                contentArea.innerHTML = orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-number">${order.number}</span>
                            <span class="order-status status-${order.status}">${order.status}</span>
                        </div>
                        <div class="order-car">🚗 ${order.car_info}</div>
                        <div class="order-total">💰 ${order.total || 0} руб.</div>
                        <div style="font-size: 12px; color: #888; margin-top: 8px;">ID: ${order.id}</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        contentArea.innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

async function loadClients() {
    pageTitle.textContent = 'Клиенты';
    contentArea.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await apiRequest('/user/list');
        if (response.ok) {
            const clients = await response.json();
            if (clients.length === 0) {
                contentArea.innerHTML = '<div class="loading">Нет клиентов</div>';
            } else {
                contentArea.innerHTML = clients.map(client => `
                    <div class="client-card">
                        <div>
                            <div class="client-name">${client.name}</div>
                            <div class="client-phone">📞 ${client.phone}</div>
                            <div style="font-size: 12px; color: #888;">${client.email}</div>
                        </div>
                        <div><span class="order-status">${client.role}</span></div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        contentArea.innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

async function loadCars() {
    pageTitle.textContent = 'Автомобили';
    contentArea.innerHTML = `
        <div class="loading">Информация об автомобилях будет доступна после добавления в заказах</div>
        <div style="margin-top: 20px;">
            <div class="car-card">
                <div>
                    <div class="car-name">Toyota Camry</div>
                    <div class="car-plate">A123BC 777</div>
                </div>
                <span class="order-status">ID: client1</span>
            </div>
            <div class="car-card">
                <div>
                    <div class="car-name">BMW X5</div>
                    <div class="car-plate">X777XX 199</div>
                </div>
                <span class="order-status">ID: client2</span>
            </div>
        </div>
    `;
}

async function loadReference() {
    pageTitle.textContent = 'Справочники';
    contentArea.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const [worksResp, partsResp] = await Promise.all([
            apiRequest('/reference/works'),
            apiRequest('/reference/parts')
        ]);
        
        let worksHtml = '<h3 style="margin-bottom: 15px;">🔧 Работы</h3>';
        let partsHtml = '<h3 style="margin-bottom: 15px; margin-top: 30px;">🔩 Запчасти</h3>';
        
        if (worksResp.ok) {
            const works = await worksResp.json();
            worksHtml += '<div class="data-table"><table class="data-table"><thead><tr><th>Название</th><th>Цена/час</th></tr></thead><tbody>';
            worksHtml += works.map(w => `<tr><td>${w.name}</td><td>${w.price_per_hour} руб.</td></tr>`).join('');
            worksHtml += '</tbody></table></div>';
        }
        
        if (partsResp.ok) {
            const parts = await partsResp.json();
            partsHtml += '<div class="data-table"><table class="data-table"><thead><tr><th>Название</th><th>Артикул</th><th>Цена</th></tr></thead><tbody>';
            partsHtml += parts.map(p => `<tr><td>${p.name}</td><td>${p.article}</td><td>${p.price} руб.</td></tr>`).join('');
            partsHtml += '</tbody></table></div>';
        }
        
        contentArea.innerHTML = `<div style="background: white; padding: 20px; border-radius: 12px;">${worksHtml}${partsHtml}</div>`;
    } catch (error) {
        contentArea.innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

async function loadReports() {
    pageTitle.textContent = 'Отчёты';
    contentArea.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px;">
            <h3>Отчёт по выручке</h3>
            <div class="form-group">
                <label>Дата от:</label>
                <input type="date" id="report-from" value="2026-01-01">
            </div>
            <div class="form-group">
                <label>Дата до:</label>
                <input type="date" id="report-to" value="2026-12-31">
            </div>
            <button id="get-report-btn" class="btn">Сформировать отчёт</button>
            <div id="report-result" style="margin-top: 20px;"></div>
        </div>
    `;
    
    document.getElementById('get-report-btn').addEventListener('click', async () => {
        const from = document.getElementById('report-from').value;
        const to = document.getElementById('report-to').value;
        const response = await apiRequest(`/report/revenue?from_date=${from}&to_date=${to}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('report-result').innerHTML = `
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
                    <div style="font-size: 24px;">💰 Выручка: ${data.total_revenue} руб.</div>
                    <div>📊 Заказов: ${data.orders_count}</div>
                    <div>📈 Средний чек: ${data.avg_check} руб.</div>
                </div>
            `;
        }
    });
}

function loadSettings() {
    pageTitle.textContent = 'Настройки';
    contentArea.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px;">
            <h3>Профиль пользователя</h3>
            <div><strong>Имя:</strong> ${currentUser?.name || '-'}</div>
            <div><strong>Email:</strong> ${currentUser?.email || '-'}</div>
            <div><strong>Роль:</strong> ${currentUser?.role || '-'}</div>
            <hr style="margin: 20px 0;">
            <h3>О системе</h3>
            <div>Версия: 1.0.0</div>
            <div>API: ${API_URL}</div>
        </div>
    `;
}

// ========== НАВИГАЦИЯ ==========
const pages = {
    orders: loadOrders,
    clients: loadClients,
    cars: loadCars,
    reference: loadReference,
    reports: loadReports,
    settings: loadSettings
};

function loadPage(pageName) {
    if (pages[pageName]) {
        pages[pageName]();
    }
}

// Обработчики меню
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const page = item.dataset.page;
        loadPage(page);
    });
});

// Создать заказ
createOrderBtn.addEventListener('click', () => {
    const carInfo = prompt('Введите информацию об автомобиле (марка, модель, год):');
    if (carInfo && currentUser) {
        apiRequest('/order/create', 'POST', {
            client_id: currentUser.id,
            car_info: carInfo
        }).then(async response => {
            if (response.ok) {
                alert('Заказ создан!');
                loadPage('orders');
                document.querySelector('.nav-item[data-page="orders"]').classList.add('active');
            } else {
                alert('Ошибка создания заказа');
            }
        });
    }
});

// Выход
logoutBtn.addEventListener('click', logout);

// ========== АВТОРИЗАЦИЯ ==========
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (response.ok) {
        const data = await response.json();
        authToken = data.access_token;
        localStorage.setItem('token', authToken);
        await fetchUserInfo();
        loginModal.style.display = 'none';
    } else {
        document.getElementById('login-error').textContent = 'Неверный email или пароль';
    }
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role: 'client' })
    });
    if (response.ok) {
        document.getElementById('login-error').textContent = 'Регистрация успешна! Теперь войдите.';
    } else {
        document.getElementById('login-error').textContent = 'Ошибка регистрации';
    }
});

// Запуск
checkAuth();