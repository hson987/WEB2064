const fs = require('fs');
const dbPath = 'c:/xampp/htdocs/ASM 2 PA00362 NGUYỄN HOÀNG SƠN WEB2064/db.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Enhance existing admin
data.users.forEach(u => {
    if (u.role === 'admin' && u.id === '2') {
        u.position = 'Giám đốc';
        u.department = 'Ban Giám Đốc';
        u.status = 'active';
        u.avatar = 'https://i.pravatar.cc/150?u=2';
    }
});

// Generate 15 more employees
const newAdmins = [
    { name: 'Trần Minh Tài', email: 'tai.tran@cnsg.vn', password: '123', phone: '0987654321', address: 'Quận 1, TP HCM', role: 'admin', position: 'Trưởng Phòng', department: 'Kinh doanh', status: 'active' },
    { name: 'Lê Văn Tú', email: 'tu.le@cnsg.vn', password: '123', phone: '0912123123', address: 'Quận 2, TP HCM', role: 'admin', position: 'Nhân viên', department: 'Kinh doanh', status: 'active' },
    { name: 'Bùi Đặng Phương Thanh', email: 'thanh.bui@cnsg.vn', password: '123', phone: '0933333333', address: 'Quận 3, TP HCM', role: 'admin', position: 'Phó Phòng', department: 'Nhân sự', status: 'active' },
    { name: 'Vũ Hải Yến', email: 'yen.vu@cnsg.vn', password: '123', phone: '0944444444', address: 'Quận 4, TP HCM', role: 'admin', position: 'Nhân viên Lễ tân', department: 'Nhân sự', status: 'active' },
    { name: 'Trịnh Cường', email: 'cuong.trinh@cnsg.vn', password: '123', phone: '0955555555', address: 'Quận 5, TP HCM', role: 'admin', position: 'Kế toán viên', department: 'Kế toán', status: 'inactive' },
    { name: 'Ngô Tấn Tài', email: 'tai.ngo@cnsg.vn', password: '123', phone: '0966666666', address: 'Quận 6, TP HCM', role: 'admin', position: 'Trưởng Phòng', department: 'Kỹ thuật', status: 'active' },
    { name: 'Hoàng Kim Dung', email: 'dung.hoang@cnsg.vn', password: '123', phone: '0977777777', address: 'Quận 7, TP HCM', role: 'admin', position: 'Kỹ sư phần mềm', department: 'Kỹ thuật', status: 'active' },
    { name: 'Đỗ Tiến Minh', email: 'minh.do@cnsg.vn', password: '123', phone: '0988888888', address: 'Quận 8, TP HCM', role: 'admin', position: 'Chuyên viên IT', department: 'Kỹ thuật', status: 'inactive' },
    { name: 'Đinh Tuấn Anh', email: 'anh.dinh@cnsg.vn', password: '123', phone: '0999999999', address: 'Quận 9, TP HCM', role: 'admin', position: 'Trưởng nhóm', department: 'Marketing', status: 'active' },
    { name: 'Lý Nhược Đồng', email: 'dong.ly@cnsg.vn', password: '123', phone: '0911111111', address: 'Quận 10, TP HCM', role: 'admin', position: 'Chuyên viên SEO', department: 'Marketing', status: 'active' },
    { name: 'Đặng Vân Trang', email: 'trang.dang@cnsg.vn', password: '123', phone: '0922222222', address: 'Quận 1, TP HCM', role: 'admin', position: 'Trưởng Phòng', department: 'Kế toán', status: 'active' },
    { name: 'Vương Bảo Lâm', email: 'lam.vuong@cnsg.vn', password: '123', phone: '0912111222', address: 'Thủ Đức, TP HCM', role: 'admin', position: 'Bảo vệ', department: 'Hành chính', status: 'active' },
    { name: 'Thái Hòa', email: 'hoa.thai@cnsg.vn', password: '123', phone: '0922333444', address: 'Quận 3, TP HCM', role: 'admin', position: 'Nhân viên thị trường', department: 'Kinh doanh', status: 'inactive' },
    { name: 'Châu Tinh Trì', email: 'tri.chau@cnsg.vn', password: '123', phone: '0944555666', address: 'Tân Bình, TP HCM', role: 'admin', position: 'Cố vấn cấp cao', department: 'Ban Giám Đốc', status: 'active' },
    { name: 'Mai Văn Dũng', email: 'dung.mai@cnsg.vn', password: '123', phone: '0933444555', address: 'Bình Thạnh, TP HCM', role: 'admin', position: 'Tester', department: 'Kỹ thuật', status: 'active' }
];

let maxId = Math.max(...data.users.map(u => parseInt(u.id) || 0));
newAdmins.forEach((adm, index) => {
    maxId++;
    adm.id = String(maxId);
    adm.avatar = `https://i.pravatar.cc/150?u=${adm.email}`;
    data.users.push(adm);
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Added 15 new employees to db.json');
