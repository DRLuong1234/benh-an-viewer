// Biến lưu trữ dữ liệu
let patientsData = [];
let dischargedPatientsData = [];

// Hàm tải dữ liệu từ file JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Phân loại bệnh nhân đang điều trị và ra viện
        patientsData = data; // Tạm thời coi tất cả là đang điều trị
        dischargedPatientsData = []; // Nếu có trường discharged, có thể lọc: data.filter(p => p.discharged)
        
        renderPatientList();
        renderDischargedList();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('patientList').innerHTML = 
            '<div class="alert alert-danger">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
}

// Hàm hiển thị danh sách bệnh nhân đang điều trị
function renderPatientList(filter = '') {
    const container = document.getElementById('patientList');
    container.innerHTML = '';
    
    const filteredPatients = patientsData.filter(patient => {
        const searchTerm = filter.toLowerCase();
        return (
            patient.ma_benh_nhan.toLowerCase().includes(searchTerm) ||
            patient.ho_ten.toLowerCase().includes(searchTerm) ||
            patient.chan_doan.toLowerCase().includes(searchTerm) ||
            patient.phong.toLowerCase().includes(searchTerm) ||
            patient.giuong.toLowerCase().includes(searchTerm)
        );
    });
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Không tìm thấy bệnh nhân nào.</div>';
        return;
    }
    
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
                    <p class="mb-1"><strong>Phòng/Giường:</strong> ${patient.phong}/${patient.giuong}</p>
                    <p class="mb-1"><strong>Ngày vào viện:</strong> ${patient.thoi_gian.split(' ')[0]}</p>
                    <button class="btn btn-sm btn-primary view-details" data-id="${patient.ma_benh_nhan}">Xem chi tiết</button>
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

// Hàm hiển thị danh sách bệnh nhân ra viện
function renderDischargedList(filter = '') {
    const container = document.getElementById('dischargedList');
    container.innerHTML = '';
    
    const filteredPatients = dischargedPatientsData.filter(patient => {
        const searchTerm = filter.toLowerCase();
        return (
            patient.ma_benh_nhan.toLowerCase().includes(searchTerm) ||
            patient.ho_ten.toLowerCase().includes(searchTerm) ||
            patient.chan_doan.toLowerCase().includes(searchTerm) ||
            patient.phong.toLowerCase().includes(searchTerm) ||
            patient.giuong.toLowerCase().includes(searchTerm)
        );
    });
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Không có bệnh nhân ra viện.</div>';
        return;
    }
    
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
                    <p class="mb-1"><strong>Phòng/Giường:</strong> ${patient.phong}/${patient.giuong}</p>
                    <p class="mb-1"><strong>Ngày vào viện:</strong> ${patient.thoi_gian.split(' ')[0]}</p>
                    <button class="btn btn-sm btn-primary view-details" data-id="${patient.ma_benh_nhan}">Xem chi tiết</button>
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

// Hàm hiển thị chi tiết bệnh nhân trong modal
function showPatientDetails(patientId) {
    const patient = [...patientsData, ...dischargedPatientsData].find(p => p.ma_benh_nhan === patientId);
    if (!patient) return;
    
    // Điền thông tin cơ bản
    document.getElementById('modalMaBenhNhan').textContent = patient.ma_benh_nhan;
    document.getElementById('modalHoTen').textContent = patient.ho_ten;
    document.getElementById('modalTuoiGioiTinh').textContent = `${patient.tuoi} tuổi / ${patient.gioi_tinh}`;
    document.getElementById('modalKhoa').textContent = patient.khoa;
    document.getElementById('modalPhongGiuong').textContent = `${patient.phong} / ${patient.giuong}`;
    document.getElementById('modalNgayVaoVien').textContent = patient.thoi_gian;
    document.getElementById('modalChanDoan').textContent = patient.chan_doan;

    // Tab Diễn biến điều trị
    const timeline = document.getElementById('treatmentTimeline');
    const fullTreatmentDetails = document.getElementById('fullTreatmentDetails');
    timeline.innerHTML = '';
    fullTreatmentDetails.innerHTML = '';
    
    if (patient.treatments && patient.treatments.length > 0) {
        // Sắp xếp theo thời gian
        const sortedTreatments = [...patient.treatments].sort((a, b) => {
            const dateA = new Date(a.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + a.ngay_gio_y_lenh.split(' ')[0]);
            const dateB = new Date(b.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + b.ngay_gio_y_lenh.split(' ')[0]);
            return dateA - dateB;
        });
        
        // Hiển thị tóm tắt (ngày gần nhất)
        const latestTreatment = sortedTreatments[sortedTreatments.length - 1];
        const [time, date] = latestTreatment.ngay_gio_y_lenh.split(' ');
        const dayOfWeek = getDayOfWeek(date);
        
        const entry = document.createElement('div');
        entry.className = 'treatment-entry mb-3';
        entry.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">${time} ${date} (${dayOfWeek}) - Tờ số: ${latestTreatment.to_so || '1'}</h6>
                <small class="text-muted">${latestTreatment.bac_si_dieu_tri}</small>
            </div>
            <div class="row">
                <div class="col-12">
                    <p class="mb-1"><strong>Diễn biến (Tóm tắt):</strong></p>
                    <div class="bg-light p-2" style="white-space: pre-line;">
                        ${truncateText(latestTreatment.dien_bien || 'Không có', 100)}
                    </div>
                </div>
            </div>
        `;
        timeline.appendChild(entry);

        // Hiển thị chi tiết đầy đủ
        sortedTreatments.forEach(treatment => {
            const [tTime, tDate] = treatment.ngay_gio_y_lenh.split(' ');
            const tDayOfWeek = getDayOfWeek(tDate);
            const detailEntry = document.createElement('div');
            detailEntry.className = 'treatment-entry mb-3';
            detailEntry.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">${tTime} ${tDate} (${tDayOfWeek}) - Tờ số: ${treatment.to_so || '1'}</h6>
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
            fullTreatmentDetails.appendChild(detailEntry);
        });
    } else {
        timeline.innerHTML = '<div class="alert alert-info">Không có dữ liệu điều trị.</div>';
        fullTreatmentDetails.innerHTML = '<div class="alert alert-info">Không có dữ liệu điều trị.</div>';
    }

    // Tab Xét nghiệm
    document.getElementById('modalXetNghiemMau').textContent = truncateText(patient.xet_nghiem_mau || 'Không có', 50);
    document.getElementById('modalXetNghiemHinhAnh').textContent = truncateText(patient.xet_nghiem_hinh_anh || 'Không có', 50);
    document.getElementById('fullXetNghiemMau').textContent = patient.xet_nghiem_mau || 'Không có';
    document.getElementById('fullXetNghiemHinhAnh').textContent = patient.xet_nghiem_hinh_anh || 'Không có';

    // Reset trạng thái hiển thị chi tiết
    document.getElementById('treatmentDetails').style.display = 'none';
    document.getElementById('testDetails').style.display = 'none';

    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('patientModal'));
    modal.show();
}

// Gắn sự kiện ủy quyền cho modal
document.addEventListener('DOMContentLoaded', () => {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('view-treatment-details')) {
                const details = document.getElementById('treatmentDetails');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            } else if (event.target.classList.contains('view-test-details')) {
                const details = document.getElementById('testDetails');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
});

// Hàm rút gọn văn bản
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

// Sự kiện khi chuyển tab
document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        if (this.id === 'dang-dieu-tri-tab') {
            renderPatientList();
        } else {
            renderDischargedList();
        }
    });
});

// Tải dữ liệu khi trang được load
document.addEventListener('DOMContentLoaded', loadData);