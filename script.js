let users = JSON.parse(localStorage.getItem('users')) || [];
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let currentUser = null;

function login() {
  const id = document.getElementById('loginId').value;
  const password = document.getElementById('loginPassword').value;
  const user = users.find(user => user.id === id && user.password === password);
  if (user) {
    currentUser = user;
    if (id === 'admin' && password === 'admin') {
      showAdminPage();
    } else {
      showUserPage();
    }
  } else {
    document.getElementById('loginMessage').textContent = 'رقم الهوية أو كلمة المرور غير صحيحة.';
  }
}

function showRegisterPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = 'block';
}

function register() {
  const id = document.getElementById('registerId').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value;
  const nationality = document.getElementById('registerNationality').value;
  const dob = document.getElementById('registerDob').value;
  if (users.some(user => user.id === id)) {
    document.getElementById('registerMessage').textContent = 'رقم الهوية مسجل مسبقًا.';
  } else {
    users.push({ id, password, phone, nationality, dob });
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('registerMessage').textContent = 'تم إنشاء الحساب بنجاح.';
    showLoginPage();
  }
}

function showLoginPage() {
  document.getElementById('registerPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'block';
}

function showUserPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('userPage').style.display = 'block';
  document.getElementById('username').textContent = currentUser.id;
}

function showCreateRequestPage() {
  document.getElementById('myRequestsPage').style.display = 'none';
  document.getElementById('createRequestPage').style.display = 'block';
}

function submitRequest() {
  const userId = document.getElementById('requestUserId').value;
  const details = document.getElementById('requestDetails').value;
  const file = document.getElementById('requestFile').files[0];

  if (userId !== currentUser.id) {
    document.getElementById('requestMessage').textContent = 'رقم الهوية غير صحيح.';
    return;
  }

  if (details) {
    const request = { id: requests.length + 1, userId, details, file: file ? file.name : null, status: 'قيد المراجعة' };
    requests.push(request);
    localStorage.setItem('requests', JSON.stringify(requests));
    document.getElementById('requestMessage').textContent = 'تم إرسال الطلب بنجاح.';
  } else {
    document.getElementById('requestMessage').textContent = 'الرجاء إدخال تفاصيل الطلب.';
  }
}

function showMyRequestsPage() {
  document.getElementById('createRequestPage').style.display = 'none';
  document.getElementById('myRequestsPage').style.display = 'block';
  const userRequests = requests.filter(request => request.userId === currentUser.id);
  const requestsList = document.getElementById('requestsList');
  requestsList.innerHTML = userRequests.map(request => `
    <li>
      <strong>رقم الطلب:</strong> ${request.id}<br>
      <strong>التفاصيل:</strong> ${request.details}<br>
      <strong>الحالة:</strong> ${request.status}<br>
      ${request.status === 'مكتمل' ? `
        <strong>التقييم:</strong>
        <select onchange="rateRequest(${request.id}, this.value)">
          <option value="1">1 نجمة</option>
          <option value="2">2 نجوم</option>
          <option value="3">3 نجوم</option>
          <option value="4">4 نجوم</option>
          <option value="5">5 نجوم</option>
        </select>
      ` : ''}
    </li>
  `).join('');
}

function rateRequest(requestId, rating) {
  const request = requests.find(req => req.id === requestId);
  if (request) {
    request.rating = rating;
    localStorage.setItem('requests', JSON.stringify(requests));
    showMyRequestsPage();
  }
}

function showAdminPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
  showAllRequestsPage();
}

function showAllRequestsPage() {
  document.getElementById('statisticsPage').style.display = 'none';
  document.getElementById('allRequestsPage').style.display = 'block';
  const allRequestsList = document.getElementById('allRequestsList');
  allRequestsList.innerHTML = requests.map(request => `
    <li>
      <strong>رقم الطلب:</strong> ${request.id}<br>
      <strong>رقم الهوية:</strong> ${request.userId}<br>
      <strong>التفاصيل:</strong> ${request.details}<br>
      <strong>الحالة:</strong> 
      <select onchange="updateRequestStatus(${request.id}, this.value)">
        <option value="قيد المراجعة" ${request.status === 'قيد المراجعة' ? 'selected' : ''}>قيد المراجعة</option>
        <option value="مكتمل" ${request.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
        <option value="مرفوض" ${request.status === 'مرفوض' ? 'selected' : ''}>مرفوض</option>
      </select><br>
      <button onclick="deleteRequest(${request.id})">حذف</button>
    </li>
  `).join('');
}

function updateRequestStatus(requestId, newStatus) {
  const request = requests.find(req => req.id === requestId);
  if (request) {
    request.status = newStatus;
    localStorage.setItem('requests', JSON.stringify(requests));
    showAllRequestsPage();
    if (currentUser && currentUser.id === request.userId) {
      alert(`تم تحديث حالة طلبك رقم ${request.id} إلى "${newStatus}".`);
    }
  }
}

function deleteRequest(requestId) {
  requests = requests.filter(request => request.id !== requestId);
  localStorage.setItem('requests', JSON.stringify(requests));
  showAllRequestsPage();
}

function searchRequests() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredRequests = requests.filter(request => 
    request.userId.toLowerCase().includes(searchTerm) || 
    request.id.toString().includes(searchTerm)
  );
  const allRequestsList = document.getElementById('allRequestsList');
  allRequestsList.innerHTML = filteredRequests.map(request => `
    <li>
      <strong>رقم الطلب:</strong> ${request.id}<br>
      <strong>رقم الهوية:</strong> ${request.userId}<br>
      <strong>التفاصيل:</strong> ${request.details}<br>
      <strong>الحالة:</strong> ${request.status}<br>
      <button onclick="deleteRequest(${request.id})">حذف</button>
    </li>
  `).join('');
}

function showStatisticsPage() {
  document.getElementById('allRequestsPage').style.display = 'none';
  document.getElementById('statisticsPage').style.display = 'block';
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'قيد المراجعة').length;
  const completedRequests = requests.filter(req => req.status === 'مكتمل').length;
  const rejectedRequests = requests.filter(req => req.status === 'مرفوض').length;
  document.getElementById('totalRequests').textContent = totalRequests;
  document.getElementById('pendingRequests').textContent = pendingRequests;
  document.getElementById('completedRequests').textContent = completedRequests;
  document.getElementById('rejectedRequests').textContent = rejectedRequests;
}

function exportToExcel() {
  const data = requests.map(req => [req.id, req.userId, req.details, req.status]);
  const ws = XLSX.utils.aoa_to_sheet([['رقم الطلب', 'رقم الهوية', 'التفاصيل', 'الحالة'], ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الطلبات');
  XLSX.writeFile(wb, 'الطلبات.xlsx');
}

function logout() {
  currentUser = null;
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('userPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'none';
  document.getElementById('loginId').value = '';
  document.getElementById('loginPassword').value = '';
}

function forgotPassword() {
  alert('الرجاء التواصل مع الدعم الفني لاستعادة كلمة المرور.');
}
