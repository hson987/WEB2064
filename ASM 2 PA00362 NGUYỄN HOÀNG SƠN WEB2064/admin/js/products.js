//truy cập db.json
const API_PRODUCTS = "http://localhost:4000/products";
const API_CATEGORIES = "http://localhost:4000/categories";
const API_VARIANTS = "http://localhost:4000/product_variants";

//truy cập đến id chọn danh mục và danh sách sản phẩm
const categorySelect = document.getElementById("product-category");
const productList = document.getElementById("product-list");
const form = document.getElementById("product-form");

//hàm lấy danh sách danh mục để chọn
async function loadCategories(){
    const res = await fetch(`${API_CATEGORIES}`);
    const data = await res.json();

    categorySelect.innerHTML = data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

//hàm hiển thị danh sách sản phẩm
async function loadProducts() {
    //xét đăng nhập
    const userData = JSON.parse(localStorage.getItem("admin"));

    if (!userData || userData.role !== "admin") {
        alert("⚠️ Bạn không có quyền truy cập trang này!");
        window.location.href = "login.html";
    }

    //lấy dữ liệu sản phẩm trong db.json
    const res = await fetch(API_PRODUCTS);
    const data = await res.json();
    productList.innerHTML = data.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.image && p.image.startsWith('data:') ? p.image : '../images/' + p.image}" width="60" height="60" style="object-fit: cover; border-radius: 8px;"></td>
            <td>${p.name}</td>
            <td>${p.cate_id}</td>
            <td>${p.price.toLocaleString()}đ</td>
            <td>${p.detail}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct('${p.id}')">Sửa</button>
                <button class="btn btn-delete" onclick="deleteProduct('${p.id}')">Xóa</button>
                <button class="action-btn variant" onclick="openVariantPage('${p.id}')">Biến thể</button>
            </td>
        </tr>
    `).join("");
}

//hàm chuyển đổi file ảnh sang dạng base64 để lưu thẳng vào json-server thay vì tải file lên
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.size) return resolve("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

//hàm thêm sản phẩm
async function addProduct(formData) {
    const imageFile = formData.get("image");
    let imageValue = "default.jpg"; // fallback

    // Nếu người dùng có upload file ảnh thì chuyển qua chuỗi base64
    if (imageFile && imageFile.size > 0) {
        imageValue = await fileToBase64(imageFile);
    } else if (imageFile && imageFile.name) {
        imageValue = imageFile.name;
    }

    const newProduct = {
        name: formData.get("name"),
        cate_id: formData.get("cate_id"),
        price: Number(formData.get("price")),
        detail: formData.get("detail"),
        image: imageValue,
    };

    const res = await fetch(API_PRODUCTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
    });

    alert("✅ Thêm sản phẩm thành công!");
}

//hàm sửa sản phẩm
async function editProduct(id){
    const res = await fetch(`${API_PRODUCTS}/${id}`);
    const product = await res.json();

    //đưa dữ liệu vào form để chỉnh sửa
    form.elements["id"].value = product.id;
    form.elements["name"].value = product.name;
    form.elements["cate_id"].value = product.cate_id;
    form.elements["price"].value = product.price;
    form.elements["detail"].value = product.detail;

    //cuộn lên đầu trang
    window.scrollTo({top: 0 , behavior: "smooth"});
}

//khi nhấn nút sửa thì cập nhật
async function updateProduct(id, formData){
    // Lấy thông tin sản phẩm hiện tại (để giữ ảnh cũ nếu không đổi)
    const oldRes = await fetch(`${API_PRODUCTS}/${id}`);
    const oldProduct = await oldRes.json();

    // Lấy ảnh người dùng vừa chọn
    const imageFile = formData.get("image");
    let imageValue = oldProduct.image || "default.jpg";

    // Nếu người dùng chọn ảnh mới → chuyển ảnh thành base64 thay thế ảnh cũ
    if (imageFile && imageFile.size > 0) {
        imageValue = await fileToBase64(imageFile);
    }

    //tạo 1 object chứa các thông tin mới
    const updateProduct = {
        name: formData.get("name"),
        cate_id: formData.get("cate_id"),
        price: Number(formData.get("price")),
        detail: formData.get("detail"),
        image: imageValue
    }

    //tạo phương thức cập nhật put
    await fetch(`${API_PRODUCTS}/${id}`,{
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(updateProduct)
    });

    alert("Cập nhật sản phẩm thành công !");
}

//khi nhấn nút ở form
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    //tạo đối tượng để gọi hàm xử lý form và lấy id ẩn trong form
    const formData = new FormData(form);
    const id = form.elements["id"].value;

    //xét trường hợp id có hoặc không trong form
    if(id){
        //nếu có id thì cập nhật
        await updateProduct(id, formData);
    }
    else{
        //nếu không có id thì thêm mới
        await addProduct(formData);
    }
    form.reset();
    loadProducts();
});

//hàm xoá sản phẩm
async function deleteProduct(id) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
        await fetch(`${API_PRODUCTS}/${id}`, { method: "DELETE" });
        alert("🗑 Xóa sản phẩm thành công!");
        loadProducts();
    }
}

//hàm chuyển trang để quản lý biến thể
function openVariantPage(productId) {
    window.location.href = `variants.html?product_id=${productId}`;
}

//chạy hàm để hiển thị ngay
loadCategories();
loadProducts();

//hàm đăng xuất tài khoản admin
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("admin");
    alert("Đăng xuất thành công!");
    window.location.href = "login.html";
});
