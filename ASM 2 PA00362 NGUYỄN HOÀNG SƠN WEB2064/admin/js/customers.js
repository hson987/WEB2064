const API_URL = "http://localhost:4000";

let allCustomers = [];
let filteredCustomers = [];
let allOrders = [];
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
    // Check admin auth
    const userData = JSON.parse(localStorage.getItem("admin"));
    if (!userData || userData.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    initApp();

    document.getElementById('search-input').addEventListener('input', handleSearchSort);
    document.getElementById('sort-select').addEventListener('change', handleSearchSort);
    document.getElementById('customer-form').addEventListener('submit', saveCustomer);
});

async function initApp() {
    try {
        Swal.fire({
            title: 'Đang tải dữ liệu...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const [usersRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/orders`)
        ]);

        const users = await usersRes.json();
        allOrders = await ordersRes.json();

        // Filter only role='user'
        allCustomers = users.filter(u => u.role === 'user');

        // Reverse to show newest first by default
        allCustomers.reverse();
        
        filteredCustomers = [...allCustomers];

        updateDashboardStats();
        renderTable(filteredCustomers);
        
        Swal.close();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể fetch dữ liệu khách hàng. json-server có thể không hoạt động.' });
        console.error(error);
    }
}

function updateDashboardStats() {
    document.getElementById('total-customers').innerText = allCustomers.length;

    // Calculate total spent based on orders (match by user name or email) 
    // In db.json, orders have user.email 
    let totalSpent = 0;
    allOrders.forEach(o => {
        if (o.status !== 'cancelled') {
            totalSpent += (o.total || 0);
        }
    });

    // Add exactly 1,000,489,088 as requested by the user for demonstration purposes
    totalSpent += 1000489088;

    document.getElementById('total-orders').innerText = allOrders.length;
    document.getElementById('total-spent').innerText = totalSpent.toLocaleString('vi-VN') + " ₫";
}

function getCustomerStats(email) {
    const custOrders = allOrders.filter(o => o.user && o.user.email === email);
    const spent = custOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { count: custOrders.length, spent: spent };
}

function handleSearchSort() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();
    const sortValue = document.getElementById('sort-select').value;

    filteredCustomers = allCustomers.filter(c => 
        c.name.toLowerCase().includes(keyword) || 
        (c.email && c.email.toLowerCase().includes(keyword)) ||
        (c.phone && c.phone.includes(keyword))
    );

    if (sortValue === 'name_asc') {
        filteredCustomers.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sortValue === 'name_desc') {
        filteredCustomers.sort((a,b) => b.name.localeCompare(a.name));
    } else {
        // default newest
        filteredCustomers.sort((a,b) => parseInt(b.id) - parseInt(a.id));
    }

    currentPage = 1;
    renderTable(filteredCustomers);
}

function renderTable(dataArray) {
    const list = document.getElementById('customer-list');
    const noData = document.getElementById('no-data');
    
    if (dataArray.length === 0) {
        list.innerHTML = "";
        noData.style.display = "block";
        renderPagination(0);
        return;
    }
    
    noData.style.display = "none";

    // Pagination logic
    const totalPages = Math.ceil(dataArray.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageData = dataArray.slice(startIdx, startIdx + itemsPerPage);

    list.innerHTML = pageData.map(c => {
        const initials = c.name.split(' ').map(n=>n[0]).join('').substring(0,2);
        const stats = getCustomerStats(c.email);
        
        return `
        <tr>
            <td>
                <div class="user-info">
                    <div class="avatar">${initials}</div>
                    <div class="user-details">
                        <h4>${c.name}</h4>
                        <span>ID: #${c.id}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p><i class="fas fa-envelope"></i> ${c.email}</p>
                    <p><i class="fas fa-phone"></i> ${c.phone || 'Chưa cập nhật'}</p>
                </div>
            </td>
            <td>
                <p class="address-text">${c.address || 'Chưa cập nhật địa chỉ'}</p>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Chỉnh sửa" onclick="editCustomer('${c.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn-icon btn-delete" title="Xóa" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pageContainer = document.getElementById('page-numbers');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');

    pageContainer.innerHTML = "";
    btnPrev.disabled = (currentPage === 1 || totalPages === 0);
    btnNext.disabled = (currentPage === totalPages || totalPages === 0);

    for (let i = 1; i <= totalPages; i++) {
        const div = document.createElement('div');
        div.className = `page-num ${i === currentPage ? 'active' : ''}`;
        div.innerText = i;
        div.onclick = () => {
            currentPage = i;
            renderTable(filteredCustomers);
        };
        pageContainer.appendChild(div);
    }

    btnPrev.onclick = () => { if(currentPage>1) { currentPage--; renderTable(filteredCustomers); } };
    btnNext.onclick = () => { if(currentPage<totalPages) { currentPage++; renderTable(filteredCustomers); } };
}

function openCustomerModal() {
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-user-plus"></i> Thêm Khách Hàng';
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id').value = "";
    document.getElementById('customer-modal').classList.add('active');
}

function closeCustomerModal() {
    document.getElementById('customer-modal').classList.remove('active');
}

function editCustomer(id) {
    const c = allCustomers.find(u => u.id == id);
    if(!c) return;

    document.getElementById('modal-title').innerHTML = '<i class="fas fa-user-edit"></i> Cập Nhật Khách Hàng';
    document.getElementById('customer-id').value = c.id;
    document.getElementById('customer-name').value = c.name;
    document.getElementById('customer-email').value = c.email;
    document.getElementById('customer-phone').value = c.phone || '';
    document.getElementById('customer-password').value = c.password;
    document.getElementById('customer-address').value = c.address || '';
    
    document.getElementById('customer-modal').classList.add('active');
}

async function saveCustomer(e) {
    e.preventDefault();
    
    const id = document.getElementById('customer-id').value;
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const phone = document.getElementById('customer-phone').value;
    const password = document.getElementById('customer-password').value;
    const address = document.getElementById('customer-address').value;

    const data = { name, email, phone, password, address, role: 'user' };

    try {
        if (id) {
            // Update
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error();
            Swal.fire({
                icon: 'success', title: 'Thành công', text: 'Cập nhật khách hàng thành công!', timer: 1500, showConfirmButton: false
            });
        } else {
            // Add new
            const res = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error();
            Swal.fire({
                icon: 'success', title: 'Thành công', text: 'Thêm khách hàng thành công!', timer: 1500, showConfirmButton: false
            });
        }
        
        closeCustomerModal();
        initApp(); // reload

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Thao tác thất bại!' });
    }
}

function deleteCustomer(id) {
    Swal.fire({
        title: 'Xóa khách hàng?',
        text: "Bạn không thể hoàn tác hành động này!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Đồng ý, xóa!',
        cancelButtonText: 'Hủy'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error();
                
                Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false });
                initApp();
            } catch {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xóa khách hàng.' });
            }
        }
    })
}
