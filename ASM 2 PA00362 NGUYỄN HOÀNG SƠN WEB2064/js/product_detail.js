//gốc API
const API_URL = "http://localhost:4000";

//lấy id sản phẩm từ url
function getProductIdByUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

//load trang chi tiết sản phẩm
async function loadProductDetail(){
    //lấy id của sản phẩm
    const id = getProductIdByUrl();
    if(!id){
        return;
    }

    //xử lý và hiển thị sản phẩm và ảnh liên quan
    try{
        //fetch sản phẩm
        let res = await fetch(`${API_URL}/products/${id}`);
        let product = await res.json();

        //fetch variant theo product_id
        let variantRes = await fetch(`${API_URL}/product_variants?product_id=${id}`);
        let variants = await variantRes.json();
        console.log(variants);

        let detailDiv = document.getElementById("product-detail");
        detailDiv.innerHTML = `
            <img src="../images/${product.image}" alt="${product.name}">
            <div class="pd-info">
                <h2>${product.name}</h2>
                <p>${product.detail}</p>

                <label for="variant"><strong>Chọn phiên bản:</strong></label>
                <select id="variant">
                    ${variants.map(v => `
                        <option value="${v.id}" data-price="${v.price}" data-name="${v.variant_name}">
                            ${v.variant_name} - ${v.price.toLocaleString()} VND (Còn ${v.quantity})
                        </option>
                    `).join("")}
                </select>
                    
                <button onclick="addToCart(${product.id}, '${product.name}', '${product.image}', '${product.detail}')">
                    🛒 Thêm vào giỏ hàng
                </button>
            </div>
        `;
    }
    catch(err){
        console.log("Lỗi load sản phẩm chi tiết !", err);
    }
}

//thêm sản phẩm vào giỏ
function addToCart(productId, name, image, detail){

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
        alert("Vui lòng đăng nhập để tiếp tục!");
        window.location.href = "login.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    //truy cập đến lựa chọn size
    let variantSelect = document.getElementById("variant");
    let variantId = parseInt(variantSelect.value);

    //lấy ra tên và size được chọn
    let variantName = variantSelect.options[variantSelect.selectedIndex].dataset.name;
    let price = parseInt(variantSelect.options[variantSelect.selectedIndex].dataset.price);

    //kiểm tra đã có sản phẩm hay variant này trong giỏ hàng hay không?
    let item = cart.find(i => i.productId === productId && i.variantId === variantId);
    if(item){
        item.quantity++;
    }
    else{
        cart.push({
            productId,
            name,
            image,
            detail,
            variantId: variantId,
            variant: variantName,
            price,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng !");
}

loadProductDetail();