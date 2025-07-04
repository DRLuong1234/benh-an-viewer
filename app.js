// Biến lưu trữ dữ liệu
let patientsData = [];
let dischargedPatientsData = [];

// Hàm tải dữ liệu từ file JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Sắp xếp toàn bộ dữ liệu ngay khi tải
        patientsData = sortPatientsByRoom(data);
        // dischargedPatientsData = data.filter(p => p.discharged); // Nếu có dữ liệu ra viện
        
        renderPatientList();
        renderDischargedList();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('patientList').innerHTML = 
            '<div class="alert alert-danger">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
}

// Hàm sắp xếp bệnh nhân theo buồng từ thấp đến cao
function sortPatientsByRoom(patients) {
    return patients.sort((a, b) => {
        // Trích xuất số từ tên buồng (ví dụ: "3A" → 3)
        const roomA = extractNumber(a.phong);
        const roomB = extractNumber(b.phong);
        
        // Sắp xếp theo buồng, nếu cùng buồng thì sắp xếp theo giường
        return roomA - roomB || extractNumber(a.giuong) - extractNumber(b.giuong);
    });
}

// Hàm trích xuất số từ chuỗi (ví dụ: "3A" → 3)
function extractNumber(str) {
    const num = parseInt(str.replace(/\D/g, '')) || 0;
    return num;
}

// Hàm hiển thị danh sách bệnh nhân đang điều trị (ĐÃ SẮP XẾP)
function renderPatientList(filter = '') {
    const container = document.getElementById('patientList');
    container.innerHTML = '';
    
    // Lọc theo từ khóa nếu có
    const filteredPatients = filter ? patientsData.filter(patient => {
        const searchTerm = filter.toLowerCase();
        return (
            patient.ma_benh_nhan.toLowerCase().includes(searchTerm) ||
            patient.ho_ten.toLowerCase().includes(searchTerm) ||
            patient.chan_doan.toLowerCase().includes(searchTerm) ||
            patient.phong.toLowerCase().includes(searchTerm) ||
            patient.giuong.toLowerCase().includes(searchTerm)
        );
    }) : patientsData;

    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Không tìm thấy bệnh nhân nào.</div>';
        return;
    }
    
    // Hiển thị từng bệnh nhân
    filteredPatients.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5>${patient.ho_ten}</h5>
                    <p class="mb-1"><strong>Mã BN:</strong> ${patient.ma_benh_nhan}</p>
                    <p class="mb-1"><strong>Tuổi/Giới tính:</strong> ${patient.tuoi}/${patient.gioi_tinh}</p>
                    <p class="mb-1"><strong>Chẩn đoán:</strong> ${patient.chan_doan}</p>
                </div>
                <div class="text-end">
                    <p class="mb-1"><strong>Buồng:</strong> <span class="badge bg-success">${patient.phong}</span></p>
                    <p class="mb-1"><strong>Giường:</strong> <span class="badge bg-primary">${patient.giuong}</span></p>
                    <p class="mb-1"><small>Vào viện: ${formatDate(patient.thoi_gian)}</small></p>
                    <button class="btn btn-sm btn-primary view-details" data-id="${patient.ma_benh_nhan}">
                        <i class="bi bi-file-earmark-text"></i> Chi tiết
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Thêm sự kiện click cho nút xem chi tiết
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            showPatientDetails(patientId);
        });
    });
}

// Hàm hiển thị chi tiết bệnh nhân
function showPatientDetails(patientId) {
    const patient = patientsData.find(p => p.ma_benh_nhan === patientId);
    if (!patient) return;
    
    // Điền thông tin cơ bản
    document.getElementById('modalMaBenhNhan').textContent = patient.ma_benh_nhan;
    document.getElementById('modalHoTen').textContent = patient.ho_ten;
    document.getElementById('modalTuoiGioiTinh').textContent = `${patient.tuoi} tuổi / ${patient.gioi_tinh}`;
    document.getElementById('modalKhoa').textContent = patient.khoa;
    document.getElementById('modalPhongGiuong').innerHTML = `
        <span class="badge bg-success">${patient.phong}</span> / 
        <span class="badge bg-primary">${patient.giuong}</span>
    `;
    document.getElementById('modalNgayVaoVien').textContent = formatDate(patient.thoi_gian);
    document.getElementById('modalChanDoan').textContent = patient.chan_doan;
    document.getElementById('modalChanDoanPhanBiet').textContent = patient.chan_doan_phan_biet || 'Không có';
    document.getElementById('modalXetNghiemMau').textContent = patient.xet_nghiem_mau || 'Không có';
    document.getElementById('modalXetNghiemHinhAnh').textContent = patient.xet_nghiem_hinh_anh || 'Không có';
    
    // Hiển thị timeline điều trị (đã sắp xếp)
    const timeline = document.getElementById('treatmentTimeline');
    timeline.innerHTML = '';
    
    if (patient.treatments?.length > 0) {
        // Sắp xếp treatments theo thời gian
        const sortedTreatments = [...patient.treatments].sort((a, b) => {
            const dateA = new Date(a.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + a.ngay_gio_y_lenh.split(' ')[0]);
            const dateB = new Date(b.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + b.ngay_gio_y_lenh.split(' ')[0]);
            return dateA - dateB;
        });
        
        sortedTreatments.forEach(treatment => {
            const [time, date] = treatment.ngay_gio_y_lenh.split(' ');
            const entry = document.createElement('div');
            entry.className = 'treatment-entry mb-3';
            entry.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">
                        <span class="badge bg-secondary">${treatment.to_so || '1'}</span>
                        ${time} ${date} (${getDayOfWeek(date)})
                    </h6>
                    <small class="text-muted">${treatment.bac_si_dieu_tri}</small>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Diễn biến:</strong></p>
                        <div class="bg-light p-2" style="white-space: pre-line;">${treatment.dien_bien || 'Không có'}</div>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Chỉ định:</strong></p>
                        <div class="bg-light p-2" style="white-space: pre-line;">${treatment.chi_dinh || 'Không có'}</div>
                    </div>
                </div>
            `;
            timeline.appendChild(entry);
        });
    } else {
        timeline.innerHTML = '<div class="alert alert-info">Không có dữ liệu điều trị.</div>';
    }
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('patientModal'));
    modal.show();
}

// Hàm định dạng ngày (dd/mm/yyyy → dd/mm/yyyy)
function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.split(' ')[0]; // Lấy phần ngày tháng
}

// Hàm chuyển đổi ngày thành thứ
function getDayOfWeek(dateStr) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
}

// Sự kiện tìm kiếm
document.getElementById('searchInput').addEventListener('input', function() {
    const searchTerm = this.value.trim();
    const activeTab = document.querySelector('.nav-link.active').id;
    
    if (activeTab === 'dang-dieu-tri-tab') {
        renderPatientList(searchTerm);
    } else {
        renderDischargedList(searchTerm);
    }
});

// Tải dữ liệu khi trang được load
document.addEventListener('DOMContentLoaded', loadData);