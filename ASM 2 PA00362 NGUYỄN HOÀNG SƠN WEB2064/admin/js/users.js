const API_URL = "http://localhost:4000";

let allEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
const itemsPerPage = 5;

document.addEventListener('DOMContentLoaded', () => {
    // Check admin auth
    const userData = JSON.parse(localStorage.getItem("admin"));
    if (!userData || userData.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    initApp();

    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('employee-form').addEventListener('submit', saveEmployee);
});

async function initApp() {
    try {
        Swal.fire({
            title: 'Đang tải dữ liệu...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();

        // Filter only role='admin'
        allEmployees = users.filter(u => u.role === 'admin');
        
        // Reverse to show newest first by default if no ID sorting logic
        allEmployees.sort((a,b) => parseInt(a.id) - parseInt(b.id)); // Sort ascending ID
        
        filteredEmployees = [...allEmployees];

        renderTable(filteredEmployees);
        Swal.close();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể fetch dữ liệu nhân viên. json-server có thể không hoạt động.' });
        console.error(error);
    }
}

function handleSearch() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();

    filteredEmployees = allEmployees.filter(e => 
        e.name.toLowerCase().includes(keyword) || 
        (e.email && e.email.toLowerCase().includes(keyword)) ||
        (e.position && e.position.toLowerCase().includes(keyword)) ||
        (e.department && e.department.toLowerCase().includes(keyword))
    );

    currentPage = 1;
    renderTable(filteredEmployees);
}

function renderTable(dataArray) {
    const list = document.getElementById('employee-list');
    const noData = document.getElementById('no-data');
    
    if (dataArray.length === 0) {
        list.innerHTML = "";
        noData.style.display = "block";
        renderPagination(0, 0);
        return;
    }
    
    noData.style.display = "none";

    // Pagination logic
    const totalPages = Math.ceil(dataArray.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageData = dataArray.slice(startIdx, startIdx + itemsPerPage);

    list.innerHTML = pageData.map((emp, index) => {
        const orderNum = startIdx + index + 1;
        const avatar = emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`;
        const position = emp.position || 'Nhân viên';
        const department = emp.department || 'Đang cập nhật';
        const status = emp.status || 'active';
        const statusText = status === 'active' ? 'Hoạt động' : 'Đã nghỉ';
        const idPre = `NV${emp.id.padStart(4, '0')}`;
        
        return `
        <tr>
            <td style="font-weight: 500">${orderNum}</td>
            <td class="emp-id">${idPre}</td>
            <td>
                <div class="employee-info">
                    <img src="${avatar}" alt="avatar">
                    <span>${emp.name}</span>
                    <span class="employee-email">${emp.email}</span>
                </div>
            </td>
            <td>${position}</td>
            <td>${department}</td>
            <td>
                <div class="emp-status ${status}">${statusText}</div>
            </td>
            <td>
                <div class="action-group">
                    <button class="btn-sm btn-view" title="Xem/Sửa chi tiết" onclick="editEmployee('${emp.id}')">Xem/Sửa</button>
                    <button class="btn-sm btn-delete" title="Xóa" onclick="deleteEmployee('${emp.id}')">Xóa</button>
                </div>
                <button class="btn-sm btn-contract" onclick="mockContract('${emp.name}')">Quản lý hợp đồng</button>
            </td>
        </tr>
    `}).join('');

    renderPagination(totalPages, dataArray.length);
}

function renderPagination(totalPages, totalItems) {
    const infoContainer = document.getElementById('pagination-info');
    const pageContainer = document.getElementById('page-numbers');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');

    if (totalItems === 0) {
        infoContainer.innerText = `Showing 0 entries`;
    } else {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, totalItems);
        infoContainer.innerText = `Showing ${start} to ${end} of ${totalItems} entries`;
    }

    pageContainer.innerHTML = "";
    btnPrev.disabled = (currentPage === 1 || totalPages === 0);
    btnNext.disabled = (currentPage === totalPages || totalPages === 0);

    for (let i = 1; i <= totalPages; i++) {
        const div = document.createElement('div');
        div.className = `page-num ${i === currentPage ? 'active' : ''}`;
        div.innerText = i;
        div.onclick = () => {
            currentPage = i;
            renderTable(filteredEmployees);
        };
        pageContainer.appendChild(div);
    }

    btnPrev.onclick = () => { if(currentPage>1) { currentPage--; renderTable(filteredEmployees); } };
    btnNext.onclick = () => { if(currentPage<totalPages) { currentPage++; renderTable(filteredEmployees); } };
}

function openEmployeeModal() {
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-user-plus"></i> Thêm Nhân Viên';
    document.getElementById('employee-form').reset();
    document.getElementById('employee-id').value = "";
    document.getElementById('employee-modal').classList.add('active');
}

function closeEmployeeModal() {
    document.getElementById('employee-modal').classList.remove('active');
}

function editEmployee(id) {
    const e = allEmployees.find(u => u.id == id);
    if(!e) return;

    document.getElementById('modal-title').innerHTML = '<i class="fas fa-user-edit"></i> Cập Nhật Nhân Viên';
    document.getElementById('employee-id').value = e.id;
    document.getElementById('employee-name').value = e.name;
    document.getElementById('employee-email').value = e.email;
    document.getElementById('employee-department').value = e.department || 'Kinh doanh';
    document.getElementById('employee-position').value = e.position || '';
    document.getElementById('employee-status').value = e.status || 'active';
    document.getElementById('employee-password').value = e.password;
    
    document.getElementById('employee-modal').classList.add('active');
}

async function saveEmployee(e) {
    e.preventDefault();
    
    const id = document.getElementById('employee-id').value;
    const name = document.getElementById('employee-name').value;
    const email = document.getElementById('employee-email').value;
    const department = document.getElementById('employee-department').value;
    const position = document.getElementById('employee-position').value;
    const status = document.getElementById('employee-status').value;
    const password = document.getElementById('employee-password').value;

    const data = { 
        name, email, password, department, position, status,
        role: 'admin', 
        phone: '', 
        address: ''
    };

    try {
        if (id) {
            // Update retain old fields like avatar if exists
            const existing = allEmployees.find(u => u.id == id);
            if (existing) {
                data.avatar = existing.avatar;
            }

            const res = await fetch(`${API_URL}/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error();
            Swal.fire({
                icon: 'success', title: 'Thành công', text: 'Cập nhật nhân viên thành công!', timer: 1500, showConfirmButton: false
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
                icon: 'success', title: 'Thành công', text: 'Thêm nhân viên thành công!', timer: 1500, showConfirmButton: false
            });
        }
        
        closeEmployeeModal();
        initApp(); // reload

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Thao tác thất bại!' });
    }
}

function deleteEmployee(id) {
    // Only 1 user can't be deleted so we don't lock out 
    if (id === "2" || id === 2) {
        Swal.fire('Cảnh báo', 'Không thể xóa Giám đốc mặc định của hệ thống.', 'warning');
        return;
    }

    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Bạn đang chuẩn bị xóa nhân viên khỏi hệ thống!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error();
                
                Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false });
                initApp();
            } catch {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xóa nhân viên.' });
            }
        }
    })
}

function mockExport(type) {
    Swal.fire({
        icon: 'info',
        title: `Đang xuất file ${type}...`,
        text: 'Tính năng báo cáo và xuất file đang được phát triển.',
        timer: 2000,
        showConfirmButton: false
    });
}

function mockContract(name) {
    Swal.fire({
        title: `Quản lý hợp đồng`,
        html: `Đang tải hợp đồng của nhân viên <b>${name}</b>... <br><br>Tính năng này đang được khóa trên môi trường demo.`,
        icon: 'info',
        confirmButtonText: 'Đóng'
    });
}