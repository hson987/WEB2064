//khai báo đường dẫn json
const API_URL = "http://localhost:4000/users";

//nếu form đăng nhập được gửi đi
document.getElementById("login-form").addEventListener("submit", async function(e) {
    //ngăn gửi mặc định
    e.preventDefault();

    //lấy thông tin từ người dùng nhập vào
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    //lấy dữ liệu trả về từ json
    const res = await fetch(`${API_URL}?email=${email}&password=${password}`);
    const users = await res.json();

    if(users.length === 0){
        alert("Sai email hoặc mật khẩu !");
        return;
    }

    //lấy dòng tìm được đầu tiên và lưu dữ liệu vào local 
    const user = users[0];
    localStorage.setItem("user",JSON.stringify(user));

    //phân quyền
    if(user.role === "admin"){
        window.location.href = "../admin/index.html";
        alert("Chào mừng bạn đến với trang chủ admin !");
    }
    else{
        window.location.href = "index.html"
        alert("Đăng nhập thành công !");
    }
});