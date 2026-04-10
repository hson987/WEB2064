const API_ORDERS = "http://localhost:4000/orders";

    async function loadOrders() {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) {
            alert("Vui lòng đăng nhập để tiếp tục!");
            window.location.href = "login.html";
            return;
        }

        try {
            const res = await fetch(API_ORDERS);
            const orders = await res.json();
            
            const list = document.getElementById("order-list");
            
            if (orders.length === 0) {
                list.innerHTML = `<p>Chưa có đơn hàng nào.</p>`;
                return;
            }

            list.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <h3>🧾 Mã đơn: <span class="order-id">${order.id}</span></h3>
                            <p>Ngày đặt: ${new Date(order.create_at).toLocaleString("vi-VN")}</p>
                            <p>Trạng thái: <span class="status ${order.status}">${order.status}</span></p>
                        </div>
                        <div class="order-total">
                            Tổng tiền: <strong>${order.total.toLocaleString("vi-VN")}đ</strong>
                        </div>
                    </div>

                    <div class="user-info">
                        <p>👤 ${order.user.name}</p>
                        <p>📞 ${order.user.phone}</p>
                        <p>🏠 ${order.user.address}</p>
                    </div>

                    <div class="order-items">
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
                </div>
            `).join("");

        } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        }
    }

    loadOrders();