// Biến lưu trữ dữ liệu
let patientsData = [];
let dischargedPatientsData = [];

// Hàm tải dữ liệu từ file JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Không tìm thấy data.json');
        const data = await response.json();
        
        // Lọc trùng lặp dựa trên ma_benh_nhan
        const seenIds = new Set();
        patientsData = (data.patients || []).filter(patient => {
            if (seenIds.has(patient.ma_benh_nhan)) return false;
            seenIds.add(patient.ma_benh_nhan);
            return true;
        });
        dischargedPatientsData = (data.discharged || []).filter(patient => {
            if (seenIds.has(patient.ma_benh_nhan)) return false;
            seenIds.add(patient.ma_benh_nhan);
            return true;
        });
        
        renderPatientList();
        renderDischargedList();
        attachViewDetailsEvents();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        const patientList = document.getElementById('patientList');
        const dischargedList = document.getElementById('dischargedList');
        if (patientList) {
            patientList.innerHTML = 
                '<div class="alert alert-danger">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
        }
        if (dischargedList) {
            dischargedList.innerHTML = 
                '<div class="alert alert-danger">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
        }
    }
}

// Hàm gắn sự kiện click cho các nút view-details
function attachViewDetailsEvents() {
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-details')) {
            const patientId = event.target.getAttribute('data-id');
            showPatientDetails(patientId);
        }
    });
}

// Hàm hiển thị danh sách bệnh nhân đang điều trị
function renderPatientList(filter = '') {
    const container = document.getElementById('patientList');
    if (!container) {
        console.error('Không tìm thấy phần tử với id="patientList"');
        return;
    }
    container.innerHTML = '';
    
    const filteredPatients = patientsData.filter(patient => {
        const searchTerm = filter.toLowerCase();
        return (
            (patient.ma_benh_nhan || '').toLowerCase().includes(searchTerm) ||
            (patient.ho_ten || '').toLowerCase().includes(searchTerm) ||
            (patient.chan_doan || '').toLowerCase().includes(searchTerm) ||
            (patient.phong || '').toLowerCase().includes(searchTerm) ||
            (patient.giuong || '').toLowerCase().includes(searchTerm)
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
                    <h6>${patient.ho_ten || 'Không có tên'}</h6>
                    <p class="mb-1"><strong>Mã BN:</strong> ${patient.ma_benh_nhan}</p>
                    <p class="mb-1"><strong>Tuổi/Giới tính:</strong> ${patient.tuoi}/${patient.gioi_tinh}</p>
                    <p class="mb-1"><strong>Chẩn đoán:</strong> ${patient.chan_doan}</p>
                </div>
                <div class="text-end">
                    <p class="mb-1"><strong>Phòng/Giường:</strong> ${patient.phong || 'Không có'}/${patient.giuong || 'Không có'}</p>
                    <p class="mb-1"><strong>Ngày vào viện:</strong> ${patient.thoi_gian.split(' ')[0]}</p>
                    <button class="btn btn-sm btn-primary view-details" data-id="${patient.ma_benh_nhan}">Xem chi tiết</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Hàm hiển thị danh sách bệnh nhân ra viện
function renderDischargedList(filter = '') {
    const container = document.getElementById('dischargedList');
    if (!container) {
        console.error('Không tìm thấy phần tử với id="dischargedList"');
        return;
    }
    container.innerHTML = '';
    
    const filteredPatients = dischargedPatientsData.filter(patient => {
        const searchTerm = filter.toLowerCase();
        return (
            (patient.ma_benh_nhan || '').toLowerCase().includes(searchTerm) ||
            (patient.ho_ten || '').toLowerCase().includes(searchTerm) ||
            (patient.chan_doan || '').toLowerCase().includes(searchTerm) ||
            (patient.phong || '').toLowerCase().includes(searchTerm) ||
            (patient.giuong || '').toLowerCase().includes(searchTerm)
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
                    <h6>${patient.ho_ten || 'Không có tên'}</h6>
                    <p class="mb-1"><strong>Mã BN:</strong> ${patient.ma_benh_nhan}</p>
                    <p class="mb-1"><strong>Tuổi/Giới tính:</strong> ${patient.tuoi}/${patient.gioi_tinh}</p>
                    <p class="mb-1"><strong>Chẩn đoán:</strong> ${patient.chan_doan}</p>
                </div>
                <div class="text-end">
                    <p class="mb-1"><strong>Phòng/Giường:</strong> ${patient.phong || 'Không có'}/${patient.giuong || 'Không có'}</p>
                    <p class="mb-1"><strong>Ngày vào viện:</strong> ${patient.thoi_gian.split(' ')[0]}</p>
                    <button class="btn btn-sm btn-primary view-details" data-id="${patient.ma_benh_nhan}">Xem chi tiết</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Hàm hiển thị chi tiết bệnh nhân trong modal
function showPatientDetails(patientId) {
    const patient = [...patientsData, ...dischargedPatientsData].find(p => p.ma_benh_nhan === patientId);
    if (!patient) {
        console.error('Không tìm thấy bệnh nhân với ID:', patientId);
        return;
    }
    
    // Điền thông tin chung của bệnh nhân
    document.getElementById('modalMaBenhNhan').textContent = patient.ma_benh_nhan || 'Không có';
    document.getElementById('modalHoTen').textContent = patient.ho_ten || 'Không có';
    document.getElementById('modalTuoiGioiTinh').textContent = `${patient.tuoi || 'Không có'} / ${patient.gioi_tinh || 'Không có'}`;
    document.getElementById('modalKhoa').textContent = patient.khoa || 'Không có';
    document.getElementById('modalPhongGiuong').textContent = `${patient.phong || 'Không có'} / ${patient.giuong || 'Không có'}`;
    document.getElementById('modalNgayVaoVien').textContent = patient.thoi_gian || 'Không có';
    document.getElementById('modalChanDoan').textContent = patient.chan_doan || 'Không có';

    const timeline = document.getElementById('treatmentTimeline');
    const treatmentSelect = document.getElementById('treatmentSelect');
    const testSelect = document.getElementById('testSelect');
    const testResults = document.getElementById('testResults');
    timeline.innerHTML = '';
    
    // Xử lý dữ liệu điều trị
    const newTreatmentSelect = treatmentSelect.cloneNode(true);
    treatmentSelect.parentNode.replaceChild(newTreatmentSelect, treatmentSelect);
    
    if (patient.treatments && patient.treatments.length > 0) {
        const sortedTreatments = [...patient.treatments].sort((a, b) => {
            const dateA = new Date(a.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + a.ngay_gio_y_lenh.split(' ')[0]);
            const dateB = new Date(b.ngay_gio_y_lenh.split(' ')[1].split('/').reverse().join('-') + ' ' + b.ngay_gio_y_lenh.split(' ')[0]);
            return dateA - dateB;
        });

        const firstTreatment = sortedTreatments[0];
        const [firstTime, firstDate] = firstTreatment.ngay_gio_y_lenh.split(' ');
        const firstDayOfWeek = getDayOfWeek(firstDate);
        const entry = document.createElement('div');
        entry.className = 'treatment-entry mb-3';
        entry.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">${firstTime} ${firstDate} (${firstDayOfWeek})</h6>
                <small class="text-muted">${firstTreatment.bac_si_dieu_tri || 'Không có'}</small>
            </div>
            <div class="row">
                <div class="col-12">
                    <p class="mb-1"><strong>Diễn biến (Tóm tắt):</strong></p>
                    <div class="bg-light p-2" style="white-space: pre-line;">
                        ${firstTreatment.dien_bien || 'Không có'}
                    </div>
                </div>
            </div>
        `;
        timeline.appendChild(entry);

        if (newTreatmentSelect) {
            newTreatmentSelect.innerHTML = '<option value="">Chọn ngày y lệnh</option>';
            sortedTreatments.forEach(treatment => {
                const [tTime, tDate] = treatment.ngay_gio_y_lenh.split(' ');
                const tDayOfWeek = getDayOfWeek(tDate);
                const option = document.createElement('option');
                option.value = treatment.ngay_gio_y_lenh;
                option.textContent = `${tTime} ${tDate} (${tDayOfWeek})`;
                newTreatmentSelect.appendChild(option);
            });

            newTreatmentSelect.addEventListener('change', function() {
                const selectedDate = this.value;
                timeline.innerHTML = '';
                if (selectedDate) {
                    const selectedTreatment = sortedTreatments.find(t => t.ngay_gio_y_lenh === selectedDate);
                    if (selectedTreatment) {
                        const [sTime, sDate] = selectedTreatment.ngay_gio_y_lenh.split(' ');
                        const sDayOfWeek = getDayOfWeek(sDate);
                        const detailEntry = document.createElement('div');
                        detailEntry.className = 'treatment-entry mb-3';
                        detailEntry.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="mb-0">${sTime} ${sDate} (${sDayOfWeek})</h6>
                                <small class="text-muted">${selectedTreatment.bac_si_dieu_tri || 'Không có'}</small>
                            </div>
                            <div class="row">
                                <div class="col-md-6 col-12">
                                    <p class="mb-1"><strong>Diễn biến:</strong></p>
                                    <div class="bg-light p-2" style="white-space: pre-line;">${selectedTreatment.dien_bien || 'Không có'}</div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <p class="mb-1"><strong>Chỉ định:</strong></p>
                                    <div class="bg-light p-2" style="white-space: pre-line;">${selectedTreatment.chi_dinh || 'Không có'}</div>
                                </div>
                            </div>
                        `;
                        timeline.appendChild(detailEntry);
                    }
                } else {
                    const firstTreatment = sortedTreatments[0];
                    const [firstTime, firstDate] = firstTreatment.ngay_gio_y_lenh.split(' ');
                    const firstDayOfWeek = getDayOfWeek(firstDate);
                    const entry = document.createElement('div');
                    entry.className = 'treatment-entry mb-3';
                    entry.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="mb-0">${firstTime} ${firstDate} (${firstDayOfWeek})</h6>
                            <small class="text-muted">${firstTreatment.bac_si_dieu_tri || 'Không có'}</small>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <p class="mb-1"><strong>Diễn biến (Tóm tắt):</strong></p>
                                <div class="bg-light p-2" style="white-space: pre-line;">
                                    ${firstTreatment.dien_bien || 'Không có'}
                                </div>
                            </div>
                        </div>
                    `;
                    timeline.appendChild(entry);
                }
            });
        }
    } else {
        timeline.innerHTML = '<div class="alert alert-info">Không có dữ liệu điều trị.</div>';
    }

    // Xử lý dữ liệu xét nghiệm
    if (testSelect && testResults) {
        testSelect.innerHTML = '<option value="">Chọn ngày xét nghiệm</option>';
        if (patient.tests && patient.tests.length > 0) {
            const sortedTests = [...patient.tests].sort((a, b) => {
                const dateA = new Date(a.ngay_xet_nghiem.split('/').reverse().join('-'));
                const dateB = new Date(b.ngay_xet_nghiem.split('/').reverse().join('-'));
                return dateA - dateB;
            });

            sortedTests.forEach(test => {
                const tDayOfWeek = getDayOfWeek(test.ngay_xet_nghiem);
                const option = document.createElement('option');
                option.value = test.ngay_xet_nghiem;
                option.textContent = `${test.ngay_xet_nghiem} (${tDayOfWeek})`;
                testSelect.appendChild(option);
            });

            // Hiển thị dữ liệu xét nghiệm của ngày đầu tiên mặc định
            const firstTest = sortedTests[0];
            testResults.innerHTML = `
                <p><strong>Xét nghiệm máu:</strong> <span id="modalXetNghiemMau">${firstTest.xet_nghiem_mau || 'Không có'}</span></p>
                <p><strong>Xét nghiệm hình ảnh:</strong> <span id="modalXetNghiemHinhAnh">${firstTest.xet_nghiem_hinh_anh || 'Không có'}</span></p>
            `;

            testSelect.addEventListener('change', function() {
                const selectedDate = this.value;
                testResults.innerHTML = '';
                if (selectedDate) {
                    const selectedTest = sortedTests.find(t => t.ngay_xet_nghiem === selectedDate);
                    if (selectedTest) {
                        testResults.innerHTML = `
                            <p><strong>Xét nghiệm máu:</strong> <span id="modalXetNghiemMau">${selectedTest.xet_nghiem_mau || 'Không có'}</span></p>
                            <p><strong>Xét nghiệm hình ảnh:</strong> <span id="modalXetNghiemHinhAnh">${selectedTest.xet_nghiem_hinh_anh || 'Không có'}</span></p>
                        `;
                    }
                } else {
                    // Mặc định hiển thị dữ liệu xét nghiệm đầu tiên
                    testResults.innerHTML = `
                        <p><strong>Xét nghiệm máu:</strong> <span id="modalXetNghiemMau">${firstTest.xet_nghiem_mau || 'Không có'}</span></p>
                        <p><strong>Xét nghiệm hình ảnh:</strong> <span id="modalXetNghiemHinhAnh">${firstTest.xet_nghiem_hinh_anh || 'Không có'}</span></p>
                    `;
                }
            });
        } else {
            testResults.innerHTML = '<div class="alert alert-info">Không có dữ liệu xét nghiệm.</div>';
        }
    } else {
        console.error('Không tìm thấy phần tử testSelect hoặc testResults');
    }

    // Hiển thị modal
    const modalElement = document.getElementById('patientModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Xóa dữ liệu khi modal đóng
    modalElement.addEventListener('hidden.bs.modal', function() {
        timeline.innerHTML = '';
        newTreatmentSelect.innerHTML = '<option value="">Chọn ngày y lệnh</option>';
        if (testResults) {
            testResults.innerHTML = '<div class="alert alert-info">Không có dữ liệu xét nghiệm.</div>';
        }
        if (testSelect) {
            testSelect.innerHTML = '<option value="">Chọn ngày xét nghiệm</option>';
        }
        modal.dispose();
    }, { once: true });
}

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