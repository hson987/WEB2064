const API_ORDERS = "http://localhost:4000/orders";

// Lấy ID từ URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

if (!orderId) {
    document.getElementById("order-container").innerHTML = "<p>Không tìm thấy mã đơn hàng.</p>";
} else {
    loadOrderDetail(orderId);
}

//hàm lấy thông tin đơn hàng
async function loadOrderDetail(id) {
    try {
        const res = await fetch(`${API_ORDERS}/${id}`);
        const order = await res.json();
        
        if (!order.id) {
            document.getElementById("order-container").innerHTML = "<p>Đơn hàng không tồn tại.</p>";
            return;
        }

        renderOrderDetail(order);
    } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        document.getElementById("order-container").innerHTML = "<p>Lỗi khi tải dữ liệu đơn hàng.</p>";
    }
}

//hàm hiển thị đơn hàng và thông tin đã lấy được
function renderOrderDetail(order) {
    const container = document.getElementById("order-container");

    container.innerHTML = `
        <div class="order-header">
            <div>
                <h2>🧾 Đơn hàng #${order.id}</h2>
                <p>Ngày đặt: ${new Date(order.create_at).toLocaleString("vi-VN")}</p>
            </div>
            <div>
                <label>Trạng thái: </label>
                <select id="order-status" onchange="updateStatus('${order.id}')">
                    <option value="pending" ${order.status === "pending" ? "selected" : ""}>Chờ xử lý</option>
                    <option value="shipping" ${order.status === "shipping" ? "selected" : ""}>Đang giao</option>
                    <option value="completed" ${order.status === "completed" ? "selected" : ""}>Hoàn thành</option>
                    <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Đã hủy</option>
                </select>
            </div>
        </div>

        <div class="order-info">
            <h3>👤 Thông tin khách hàng</h3>
            <p><strong>Họ tên:</strong> ${order.user.name}</p>
            <p><strong>Điện thoại:</strong> ${order.user.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.user.address}</p>
        </div>

        <div class="order-items">
            <h3>📦 Sản phẩm</h3>
            ${order.items.map(item => `
                <div class="item">
                    <img src="../images/${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${item.detail}</p>
                        <p>Biến thể: <strong>${item.variant}</strong></p>
                        <p>Giá: ${item.price.toLocaleString("vi-VN")}đ × ${item.quantity}</p>
                    </div>
                </div>
            `).join("")}
        </div>
            
        <div class="order-total">
            Tổng tiền: ${order.total.toLocaleString("vi-VN")}đ
        </div>
            
        <button onclick="backToList()">⬅ Quay lại danh sách</button>
    `;
}

//hàm cập nhật trạng thái đơn hàng
async function updateStatus(id) {
    const newStatus = document.getElementById("order-status").value;
    try {
        await fetch(`${API_ORDERS}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        alert("Cập nhật trạng thái thành công!");
    } catch (err) {
        alert("Lỗi khi cập nhật trạng thái!");
        console.error(err);
    }
}

//hàm quay lại danh sách đơn hàng
function backToList() {
    window.location.href = "orders.html";
}