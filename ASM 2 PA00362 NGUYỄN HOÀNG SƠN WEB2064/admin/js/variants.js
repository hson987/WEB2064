const API_PRODUCTS = "http://localhost:4000/products";
const API_VARIANTS = "http://localhost:4000/product_variants";

const variantForm = document.getElementById("variant-form");
const variantList = document.getElementById("variant-list");
const variantProductName = document.getElementById("variant-product-name");
const btnBack = document.getElementById("btn-back");

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("product_id");

// ========================== LOAD TÊN SẢN PHẨM ==========================
async function loadProductName() {
    const res = await fetch(`${API_PRODUCTS}/${productId}`);
    const product = await res.json();
    variantProductName.textContent = product.name;
    document.getElementById("variant-product-id").value = product.id;
}

// ========================== LOAD BIẾN THỂ ==========================
async function loadVariants() {
    const res = await fetch(`${API_VARIANTS}?product_id=${productId}`);
    const data = await res.json();

    variantList.innerHTML = data.map(v => `
        <tr>
            <td>${v.variant_name}</td>
            <td>${Number(v.price).toLocaleString()}đ</td>
            <td>${v.quantity}</td>
            <td>
                <button class="btn btn-edit" onclick="editVariant('${v.id}')">Sửa</button>
                <button class="btn btn-delete" onclick="deleteVariant('${v.id}')">Xóa</button>
            </td>
        </tr>
    `).join("");
}

// ========================== THÊM BIẾN THỂ ==========================
async function addVariant(formData) {
    const imageFile = formData.get("variant-image");
    const imageName = imageFile && imageFile.name ? imageFile.name : "default.jpg";

    const newVariant = {
        product_id: Number(productId),
        variant_name: formData.get("variant-name"),
        price: Number(formData.get("variant-price")),
        quantity: Number(formData.get("variant-qty")),
        image: imageName
    };

    await fetch(API_VARIANTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariant)
    });

    alert("✅ Đã thêm biến thể!");
    loadVariants();
}

// ========================== SỬA BIẾN THỂ ==========================
async function editVariant(id) {
    const res = await fetch(`${API_VARIANTS}/${id}`);
    const variant = await res.json();

    document.getElementById("variant-id").value = variant.id;
    document.getElementById("variant-name").value = variant.variant_name;
    document.getElementById("variant-price").value = variant.price;
    document.getElementById("variant-qty").value = variant.quantity;

    document.getElementById("variant-image").value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ========================== CẬP NHẬT BIẾN THỂ ==========================
async function updateVariant(id, formData) {
    const oldRes = await fetch(`${API_VARIANTS}/${id}`);
    const oldVariant = await oldRes.json();

    const imageFile = formData.get("variant-image");
    const imageName = imageFile && imageFile.name ? imageFile.name : oldVariant.image;

    const updatedVariant = {
        product_id: Number(productId),
        variant_name: formData.get("variant-name"),
        price: Number(formData.get("variant-price")),
        quantity: Number(formData.get("variant-qty")),
        image: imageName
    };

    await fetch(`${API_VARIANTS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVariant)
    });

    alert("✏️ Cập nhật biến thể thành công!");
    loadVariants();
}

// ========================== XÓA BIẾN THỂ ==========================
async function deleteVariant(id) {
    if (confirm("Bạn có chắc muốn xóa biến thể này không?")) {
        await fetch(`${API_VARIANTS}/${id}`, { method: "DELETE" });
        alert("🗑 Đã xóa biến thể!");
        loadVariants();
    }
}

// ========================== SUBMIT FORM ==========================
variantForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(variantForm);
    const id = document.getElementById("variant-id").value;

    if (id) {
        await updateVariant(id, formData);
    } else {
        await addVariant(formData);
    }

    variantForm.reset();
});

// ========================== QUAY LẠI ==========================
btnBack.addEventListener("click", () => {
    window.history.back();
});

// ========================== KHỞI CHẠY ==========================
loadProductName();
loadVariants();