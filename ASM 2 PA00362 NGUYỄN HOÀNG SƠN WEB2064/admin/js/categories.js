const API_URL = "http://localhost:4000/categories";
const form = document.getElementById("category-form");
const nameInput = document.getElementById("name");
const idInput = document.getElementById("id");
const tbody = document.getElementById("category-list");

// hàm hiển thị danh mục sản phẩm
async function loadCategories() {
    //xét đăng nhập
    const userData = JSON.parse(localStorage.getItem("admin"));

    if (!userData || userData.role !== "admin") {
        alert("⚠️ Bạn không có quyền truy cập trang này!");
        window.location.href = "login.html";
    }

    const res = await fetch(API_URL);
    const data = await res.json();

    tbody.innerHTML = data.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>
                <button class="edit-btn" onclick="editCategory('${cat.id}')">Sửa</button>
                <button class="delete-btn" onclick="deleteCategory('${cat.id}')">Xóa</button>
            </td>
        </tr>
    `).join('');
}
loadCategories();

//hàm thêm và sửa danh mục
form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    //lấy các giá trị từ form nhập vào
    const id = idInput.value.trim();
    const newCategories = {name: nameInput.value.trim()} ;

    if(!newCategories.name){
        alert("Vui lòng nhập tên danh mục !");
        return;
    }

    //xét cập nhật hoặc thêm mới
    if(id){
        //nếu trùng id thì cập nhật
        await fetch(`${API_URL}/${id}`,{
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(newCategories)
        });

        alert("Cập nhật danh mục thành công !");
    }
    else{
        //nếu không tồn tại id thì thêm mới
        await fetch(`${API_URL}`,{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(newCategories)
        });

        alert("Thêm danh mục mới thành công !");
    }

    //cập nhật lại form và hiển thị lại danh mục
    form.reset();
    idInput.value = "";
    loadCategories();
});

//hàm sửa danh mục
async function editCategory(id){
    const res = await fetch(`${API_URL}/${id}`);
    const cat = await res.json();

    //gán kết quả nhận được vào form để chỉnh sửa ngay
    idInput.value = cat.id;
    nameInput.value = cat.name;

    nameInput.focus();
}

//hàm xoá danh mục
async function deleteCategory(id){
    if(confirm("Bạn có chắc chắn muốn xoá danh mục này không ?")){
        await fetch(`${API_URL}/${id}`, {method: "DELETE"});
        loadCategories();
    }
}

//hàm đăng xuất tài khoản admin
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("admin");
    alert("Đăng xuất thành công!");
    window.location.href = "login.html";
});
