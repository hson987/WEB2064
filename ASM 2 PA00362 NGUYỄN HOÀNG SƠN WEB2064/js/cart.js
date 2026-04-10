//js/cart.js
//khai báo đường dẫn api
const API_URL = "http://localhost:4000/products";

//hiển thị giỏ hàng
async function loadCart(){

    //xét phiên của người dùng
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
        alert("Vui lòng đăng nhập để tiếp tục!");
        window.location.href = "login.html";
        return;
    }

    //lấy thông tin từ local
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let tbody = document.getElementById("cart-items");
    let total = 0;

    tbody.innerHTML = "";

    //lặp để hiển thị thông tin giỏ hàng
    for(let item of cart){
        let subtotal = item.price * item.quantity;
        total += subtotal;

        tbody.innerHTML += `
            <tr>
                <td><img src="../images/${item.image}" alt="${item.name}"></td>
                <td>
                    <strong>${item.name}</strong><br>
                    <small>${item.detail}</small><br>
                    <em>${item.variant}</em>
                </td>
                <td>${item.price.toLocaleString()} VND</td>
                <td>
                    <button class="qty-btn" onclick="updateQuantity(${item.productId}, '${item.variantId}', -1)">-</button>
                    ${item.quantity}
                    <button class="qty-btn" onclick="updateQuantity(${item.productId}, '${item.variantId}', 1)">+</button>
                </td>
                <td>${subtotal.toLocaleString()} VND</td>
                <td>
                    <button class="remove-btn" onclick="removeItem(${item.productId}, '${item.variantId}')">Xóa</button>
                </td>
            </tr>
        `;
    }

    //hiển thị tổng tiền
    document.getElementById("total").innerText = total.toLocaleString();
}

//hàm cập nhật số lượng
function updateQuantity(productId, variantId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(i => i.productId === productId && i.variantId == variantId);
    if(item){
        item.quantity += change;

        //đảm bảo loại bỏ hoàn toàn sản phẩm
        if(item.quantity <= 0){
            cart = cart.filter(i => !(i.productId === productId && i.variantId == variantId));
        }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

//hàm xoá sản phẩm trong giỏ hàng
function removeItem(productId, variantId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(i => !(i.productId === productId && i.variantId == variantId));
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

loadCart();