/** API на том же origin, что и страница (запуск через uvicorn). */
const API_URL = `${window.location.origin}/api/v1`;

const STATUS_LABELS = {
    accepted: "Принят",
    diagnostics: "Диагностика",
    waiting_approval: "Согласование",
    in_progress: "В работе",
    ready: "Готов к выдаче",
    completed: "Выдан",
};

let authToken = localStorage.getItem("token") || null;
let currentUser = null;
let lastOrders = [];

const loginModal = document.getElementById("login-modal");
const userInfoSpan = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");
const pageTitle = document.getElementById("page-title");
const pageDesc = document.getElementById("page-desc");
const ordersCountEl = document.getElementById("orders-count");
const detailEmpty = document.getElementById("detail-empty");
const detailBody = document.getElementById("detail-body");

function escapeHtml(s) {
    if (s == null) return "";
    const d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
}

function statusLabel(code) {
    return STATUS_LABELS[code] || code || "—";
}

function setTopbarFromTab(btn) {
    if (!btn || !pageTitle || !pageDesc) return;
    const t = btn.dataset.title;
    const d = btn.dataset.desc;
    if (t) pageTitle.textContent = t;
    if (d) pageDesc.textContent = d;
}

function checkAuth() {
    if (authToken) {
        fetchUserInfo();
        loginModal.style.display = "none";
    } else {
        loginModal.style.display = "flex";
    }
}

async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/user/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            userInfoSpan.textContent = `${user.name} · ${user.role}`;
            logoutBtn.hidden = false;
            loginModal.style.display = "none";
        } else {
            logout();
        }
    } catch (error) {
        console.error("Ошибка:", error);
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("token");
    userInfoSpan.textContent = "Не авторизован";
    logoutBtn.hidden = true;
    loginModal.style.display = "flex";
}

async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (response.status === 401) {
        logout();
        throw new Error("Не авторизован");
    }
    return response;
}

function setDetailVisible(hasOrder) {
    if (detailEmpty && detailBody) {
        detailEmpty.hidden = hasOrder;
        detailBody.hidden = !hasOrder;
    }
}

function showOrderDetails(order) {
    if (!order) {
        document.getElementById("detail-number").textContent = "—";
        document.getElementById("detail-total-sum").textContent = "—";
        document.getElementById("detail-car").textContent = "—";
        document.getElementById("detail-client").textContent = "—";
        document.getElementById("detail-status").textContent = "—";
        document.getElementById("detail-created").textContent = "—";
        setDetailVisible(false);
        return;
    }
    setDetailVisible(true);
    document.getElementById("detail-number").textContent = order.number;
    document.getElementById("detail-total-sum").textContent = `${Number(order.total || 0).toLocaleString("ru-RU")} ₽`;
    document.getElementById("detail-car").textContent = order.car_info;
    document.getElementById("detail-client").textContent = order.client_id;
    document.getElementById("detail-status").textContent = statusLabel(order.status);
    document.getElementById("detail-created").textContent = order.created_at || "—";
}

async function loadOrders() {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = '<div class="loading">Загрузка…</div>';
    if (ordersCountEl) ordersCountEl.textContent = "…";

    try {
        const response = await apiRequest("/order/orders");
        if (response.ok) {
            const orders = await response.json();
            lastOrders = orders;
            if (ordersCountEl) ordersCountEl.textContent = String(orders.length);

            if (orders.length === 0) {
                ordersList.innerHTML = '<div class="empty-hint">Пока нет заказов. Создайте первый во вкладке «Создать заказ».</div>';
                showOrderDetails(null);
                return;
            }

            ordersList.innerHTML = orders
                .map(
                    (order) => `
                <div class="order-item" data-order-id="${escapeHtml(order.id)}">
                    <div class="order-item-top">
                        <strong>${escapeHtml(order.number)}</strong>
                        <span class="order-status status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
                    </div>
                    <div class="order-car">${escapeHtml(order.car_info)}</div>
                    <div class="order-meta-row">
                        <span class="order-sum">${Number(order.total || 0).toLocaleString("ru-RU")} ₽</span>
                        <span class="order-id">${escapeHtml(order.id)}</span>
                    </div>
                </div>
            `
                )
                .join("");

            bindOrderSelection();
            selectOrderById(orders[0].id);
        } else {
            ordersList.innerHTML = '<div class="empty-hint">Не удалось загрузить заказы.</div>';
            showOrderDetails(null);
            if (ordersCountEl) ordersCountEl.textContent = "—";
        }
    } catch (error) {
        ordersList.innerHTML = '<div class="empty-hint">Нет связи с сервером. Запустите API (uvicorn).</div>';
        showOrderDetails(null);
        if (ordersCountEl) ordersCountEl.textContent = "—";
    }
}

function selectOrderById(orderId) {
    const order = lastOrders.find((o) => o.id === orderId) || null;
    showOrderDetails(order);
    document.querySelectorAll(".order-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.orderId === orderId);
    });
}

function bindOrderSelection() {
    document.querySelectorAll(".order-item").forEach((item) => {
        item.addEventListener("click", () => selectOrderById(item.dataset.orderId));
    });
}

async function createOrder(clientId, carInfo) {
    return apiRequest("/order/create", "POST", {
        client_id: clientId,
        car_info: carInfo,
    });
}

async function loadReference() {
    const worksList = document.getElementById("works-list");
    const partsList = document.getElementById("parts-list");
    worksList.innerHTML = '<div class="loading">Загрузка…</div>';
    partsList.innerHTML = '<div class="loading">Загрузка…</div>';

    try {
        const response = await apiRequest("/reference/works");
        if (response.ok) {
            const works = await response.json();
            worksList.innerHTML = works
                .map(
                    (work) => `
                <div class="work-item">
                    <span class="price-tag">${Number(work.price_per_hour).toLocaleString("ru-RU")} ₽/ч</span>
                    <strong>${escapeHtml(work.name)}</strong>
                    <small>ID: ${escapeHtml(work.id)}</small>
                </div>
            `
                )
                .join("");
        } else worksList.innerHTML = '<div class="empty-hint">Ошибка загрузки работ</div>';
    } catch {
        worksList.innerHTML = '<div class="empty-hint">Ошибка загрузки работ</div>';
    }

    try {
        const response = await apiRequest("/reference/parts");
        if (response.ok) {
            const parts = await response.json();
            partsList.innerHTML = parts
                .map(
                    (part) => `
                <div class="part-item">
                    <span class="price-tag">${Number(part.price).toLocaleString("ru-RU")} ₽</span>
                    <strong>${escapeHtml(part.name)}</strong>
                    <small>Артикул ${escapeHtml(part.article)} · ${escapeHtml(part.id)}</small>
                </div>
            `
                )
                .join("");
        } else partsList.innerHTML = '<div class="empty-hint">Ошибка загрузки запчастей</div>';
    } catch {
        partsList.innerHTML = '<div class="empty-hint">Ошибка загрузки запчастей</div>';
    }
}

async function loadReport(fromDate, toDate) {
    const box = document.getElementById("report-result");
    box.innerHTML = '<div class="loading">Формируем…</div>';
    try {
        const response = await apiRequest(`/report/revenue?from_date=${encodeURIComponent(fromDate)}&to_date=${encodeURIComponent(toDate)}`);
        if (response.ok) {
            const report = await response.json();
            box.innerHTML = `
                <div class="report-result">
                    <div class="period">Период: ${escapeHtml(report.from_date)} — ${escapeHtml(report.to_date)}</div>
                    <div class="big-num">${Number(report.total_revenue).toLocaleString("ru-RU")} ₽</div>
                    <div class="stats">
                        <span>Заказов: <strong>${escapeHtml(String(report.orders_count))}</strong></span>
                        <span>Средний чек: <strong>${Number(report.avg_check).toLocaleString("ru-RU")} ₽</strong></span>
                    </div>
                </div>`;
        } else {
            box.innerHTML = '<p class="error-message">Не удалось построить отчёт</p>';
        }
    } catch {
        box.innerHTML = '<p class="error-message">Ошибка запроса</p>';
    }
}

async function registerUser(name, phone, email, password) {
    return fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            phone,
            email,
            password,
            role: "client",
        }),
    });
}

async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        authToken = data.access_token;
        localStorage.setItem("token", authToken);
        await fetchUserInfo();
        return true;
    }
    return false;
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
        document.getElementById(`tab-${tabId}`).classList.add("active");
        setTopbarFromTab(btn);

        if (tabId === "orders") loadOrders();
        if (tabId === "reference") loadReference();
    });
});

document.getElementById("create-order-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const clientId = document.getElementById("client-id").value;
    const carInfo = document.getElementById("car-info").value;
    const result = document.getElementById("create-result");

    const response = await createOrder(clientId, carInfo);
    if (response.ok) {
        const order = await response.json();
        result.innerHTML = `<div class="flash-success">Заказ создан: ${escapeHtml(order.order_number)}</div>`;
        document.getElementById("create-order-form").reset();
        loadOrders();
    } else {
        const error = await response.text();
        result.innerHTML = `<div class="error-message">${escapeHtml(error)}</div>`;
    }
});

document.getElementById("get-report-btn").addEventListener("click", () => {
    loadReport(document.getElementById("report-from").value, document.getElementById("report-to").value);
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("login-error").textContent = "";
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const success = await loginUser(email, password);
    if (!success) document.getElementById("login-error").textContent = "Неверный email или пароль";
});

document.getElementById("register-btn").addEventListener("click", async () => {
    const name = document.getElementById("register-name").value;
    const phone = document.getElementById("register-phone").value;
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const err = document.getElementById("login-error");

    if (!name || !phone || !email || !password) {
        err.textContent = "Заполните все поля для регистрации";
        return;
    }

    const response = await registerUser(name, phone, email, password);
    if (response.ok) {
        err.textContent = "Регистрация успешна. Теперь войдите.";
        document.getElementById("register-name").value = "";
        document.getElementById("register-phone").value = "";
    } else {
        err.textContent = "Ошибка регистрации";
    }
});

logoutBtn.addEventListener("click", () => logout());

checkAuth();

const initialTab = document.querySelector(".tab-btn.active");
setTopbarFromTab(initialTab);
if (initialTab && initialTab.dataset.tab === "orders") loadOrders();

setInterval(() => {
    const active = document.querySelector(".tab-btn.active");
    if (active && active.dataset.tab === "orders") loadOrders();
}, 15000);
