//đường dẫn db
const API_URL = "http://localhost:4000/users";

// Tự động điền dữ liệu để test nhanh
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('email').value = "dinhtu2009199998@gmail.com";
    document.getElementById('password').value = "admin1234";
});

//khi người dùng đăng nhập
document.getElementById("login-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    //nhận thông tin từ form
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    //kiểm tra hợp lệ
    try {
        //lấy dữ liệu
        const res = await fetch(`${API_URL}`);
        if (!res.ok) throw new Error("Server response not ok");
        const users = await res.json();

        //tìm tài khoản admin
        const admin = users.find(u => u.email === email && u.password === password && u.role === "admin");

        //nếu tìm được thì lưu vào phiên local
        if (admin) {
            localStorage.setItem("admin", JSON.stringify(admin));
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                text: 'Chào mừng bạn đến với trang quản trị.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
            });
            return;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Bạn điền sai thông tin email hoặc mật khẩu!'
            });
            return;
        }
    }
    catch (err) {
        console.log("Lỗi khi kiểm tra đăng nhập bằng API !", err);
        // Fallback login in case JSON server is not running
        if (email === "dinhtu2009199998@gmail.com" && password === "admin1234") {
            const fallbackAdmin = {
                name: "Nguyễn Đình Tú",
                email: "dinhtu2009199998@gmail.com",
                role: "admin"
            };
            localStorage.setItem("admin", JSON.stringify(fallbackAdmin));
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                text: '(Chế độ Offline) Chào mừng bạn đến với trang quản trị.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi máy chủ',
                text: 'Không thể kết nối đến máy chủ và sai tài khoản Offline!'
            });
        }
    }
});