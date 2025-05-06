document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const studentForm = document.getElementById("studentForm");
  const studentList = document.getElementById("studentList");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const exportCSVButton = document.getElementById("exportCSV");
  const backupJSONButton = document.getElementById("backupJSON");
  const restoreJSONInput = document.getElementById("restoreJSON");
  const importCSVInput = document.getElementById("importCSV");

  const searchName = document.getElementById("searchName");
  const searchPhone = document.getElementById("searchPhone");
  const searchGroup = document.getElementById("searchGroup");
  const searchStatus = document.getElementById("searchStatus");
  const searchDate = document.getElementById("searchDate");

  // Modal elements
  const studentModal = document.getElementById("studentModal");
  const modalTitle = document.getElementById("modalTitle");
  const editStudentForm = document.getElementById("editStudentForm");
  const editName = document.getElementById("editName");
  const editPhone = document.getElementById("editPhone");
  const editGroup = document.getElementById("editGroup");
  const editDate = document.getElementById("editDate");
  const editStatus = document.getElementById("editStatus");
  const cancelEdit = document.getElementById("cancelEdit");

  // Status configuration: icon and color classes for each status
  const statusConfig = {
    "Called": {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.91 1.39l1.21 3.63a2 2 0 01-.45 2.03l-2.18 2.18a11.05 11.05 0 005.52 5.52l2.18-2.18a2 2 0 012.03-.45l3.63 1.21a2 2 0 011.39 1.91V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />
             </svg>`,
      classes: "bg-blue-100 border border-blue-500 text-blue-800"
    },
    "Follow-Up Needed": {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
             </svg>`,
      classes: "bg-red-100 border border-red-500 text-red-800"
    },
    "Agreed": {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
             </svg>`,
      classes: "bg-green-100 border border-green-500 text-green-800"
    },
    "Confirmed": {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10zm-1.293-4.707l6-6a1 1 0 00-1.414-1.414L10.5 13.586l-1.793-1.793a1 1 0 10-1.414 1.414l2.5 2.5a1 1 0 001.414 0z"/>
             </svg>`,
      classes: "bg-yellow-100 border border-yellow-500 text-yellow-800"
    },
    "Paid": {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.209 0-4 1.791-4 4h8c0-2.209-1.791-4-4-4zM12 16a4 4 0 104-4h-4v4z" />
             </svg>`,
      classes: "bg-indigo-100 border border-indigo-500 text-indigo-800"
    }
  };

  // Initialize students from localStorage
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let editingIndex = null;

  // Chart variables (Status, Group, Department)
  let statusChart, groupChart, deptChart;
  const ctxStatus = document.getElementById("statusChart").getContext("2d");
  const ctxGroup = document.getElementById("groupChart").getContext("2d");
  const ctxDept = document.getElementById("deptChart").getContext("2d");

  // Save students and update charts
  const saveStudents = () => {
    localStorage.setItem("students", JSON.stringify(students));
    updateCharts();
  };

  // Debounce helper for filtering
  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    }
  };

  // Render the student grid (as responsive cards)
  const renderStudents = () => {
    const filterName = searchName.value.toLowerCase();
    const filterPhone = searchPhone.value.toLowerCase();
    const filterGroup = searchGroup.value.toLowerCase();
    const filterStatus = searchStatus.value;
    const filterDate = searchDate.value;

    studentList.innerHTML = "";
    students.forEach((student, index) => {
      // Apply search filters
      if (
        (filterName && !student.name.toLowerCase().includes(filterName)) ||
        (filterPhone && !student.phone.toLowerCase().includes(filterPhone)) ||
        (filterGroup && !student.group.toLowerCase().includes(filterGroup)) ||
        (filterStatus && student.status !== filterStatus) ||
        (filterDate && student.date !== filterDate)
      ) {
        return;
      }

      const config = statusConfig[student.status] || { icon: '', classes: 'bg-gray-100 border border-gray-300 text-gray-900' };

      const card = document.createElement("div");
      card.className = `p-6 border-l-4 ${config.classes} dark:bg-gray-800 shadow hover:shadow-lg transition-all rounded-xl`;
      card.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold">${student.name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">Phone: ${student.phone}</p>
          </div>
          <div class="flex items-center">
            ${config.icon}
            <span class="ml-1 text-sm font-medium">${student.status}</span>
          </div>
        </div>
        <div class="mt-4 text-sm">
          <p><span class="font-medium">Group:</span> ${student.group}</p>
          <p><span class="font-medium">Date:</span> ${student.date}</p>
        </div>
        <div class="mt-4 flex space-x-2">
          <button onclick="openEditModal(${index})" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring">Edit</button>
          <button onclick="deleteStudent(${index})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 focus:outline-none focus:ring">Delete</button>
        </div>
      `;
      studentList.appendChild(card);
    });
  };

  // Add new student record
  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const group = document.getElementById("group").value.trim();
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;
    if (name && phone && group && date) {
      const newStudent = { name, phone, group, date, status };
      students.push(newStudent);
      saveStudents();
      renderStudents();
      studentForm.reset();
    }
  });

  // Delete a student record
  window.deleteStudent = (index) => {
    students.splice(index, 1);
    saveStudents();
    renderStudents();
  };

  // Open edit modal
  window.openEditModal = (index) => {
    editingIndex = index;
    const student = students[index];
    modalTitle.textContent = `Edit: ${student.name}`;
    editName.value = student.name;
    editPhone.value = student.phone;
    editGroup.value = student.group;
    editDate.value = student.date;
    editStatus.value = student.status;
    studentModal.classList.remove("hidden");
  };

  // Close modal
  const closeModal = () => {
    studentModal.classList.add("hidden");
    editingIndex = null;
  };

  // Save edits
  editStudentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      students[editingIndex] = {
        name: editName.value.trim(),
        phone: editPhone.value.trim(),
        group: editGroup.value.trim(),
        date: editDate.value,
        status: editStatus.value
      };
      saveStudents();
      renderStudents();
      closeModal();
    }
  });
  cancelEdit.addEventListener("click", closeModal);

  // Apply debounced filtering
  const handleSearch = debounce(renderStudents, 300);
  searchName.addEventListener("input", handleSearch);
  searchPhone.addEventListener("input", handleSearch);
  searchGroup.addEventListener("input", handleSearch);
  searchStatus.addEventListener("change", handleSearch);
  searchDate.addEventListener("change", handleSearch);

  // CSV Export
  exportCSVButton.addEventListener("click", () => {
    let csvContent = "data:text/csv;charset=utf-8,Name,Phone,Group,Date,Status\n";
    students.forEach(student => {
      const row = [student.name, student.phone, student.group, student.date, student.status].join(",");
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Backup JSON Export
  backupJSONButton.addEventListener("click", () => {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Restore JSON Import
  restoreJSONInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          students = data;
          saveStudents();
          renderStudents();
          updateCharts();
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Error parsing JSON.");
      }
    };
    reader.readAsText(file);
  });

  // CSV Import – parse CSV with expected header row "Name,Phone,Group,Date,Status"
  importCSVInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").filter(line => line.trim() !== "");
        // Assume the first line is the header and skip it if it contains "Name"
        let startIndex = 0;
        if (lines[0].toLowerCase().includes("name")) startIndex = 1;
        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (cols.length < 5) continue; // skip incomplete records
          const [name, phone, group, date, status] = cols.map(item => item.trim());
          // Only add if all fields are present
          if (name && phone && group && date && status) {
            students.push({ name, phone, group, date, status });
          }
        }
        saveStudents();
        renderStudents();
        updateCharts();
      } catch (err) {
        alert("Error parsing CSV.");
      }
    };
    reader.readAsText(file);
  });




  // Chart.js analytics update
  const updateCharts = () => {
    const statusCounts = { "Called": 0, "Follow-Up Needed": 0, "Agreed": 0, "Confirmed": 0, "Paid": 0 };
    const groupCounts = {};
    const deptCounts = { "Science": 0, "Commerce": 0, "Arts": 0 };

    students.forEach(student => {
      if (statusCounts.hasOwnProperty(student.status)) {
        statusCounts[student.status]++;
      } else {
        statusCounts[student.status] = 1;
      }
      groupCounts[student.group] = (groupCounts[student.group] || 0) + 1;
      const groupLower = student.group.trim().toLowerCase();
      if (groupLower === "science") deptCounts["Science"]++;
      else if (groupLower === "commerce") deptCounts["Commerce"]++;
      else if (groupLower === "arts") deptCounts["Arts"]++;
    });

    // Pie Chart: Status Distribution
    if (statusChart) {
      statusChart.data.labels = Object.keys(statusCounts);
      statusChart.data.datasets[0].data = Object.values(statusCounts);
      statusChart.update();
    } else {
      statusChart = new Chart(ctxStatus, {
        type: 'pie',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            label: 'Status Distribution',
            data: Object.values(statusCounts),
            backgroundColor: ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#818CF8']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // Bar Chart: Group Distribution
    if (groupChart) {
      groupChart.data.labels = Object.keys(groupCounts);
      groupChart.data.datasets[0].data = Object.values(groupCounts);
      groupChart.update();
    } else {
      groupChart = new Chart(ctxGroup, {
        type: 'bar',
        data: {
          labels: Object.keys(groupCounts),
          datasets: [{
            label: 'Group Distribution',
            data: Object.values(groupCounts),
            backgroundColor: '#60A5FA'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // Bar Chart: Department Distribution
    if (deptChart) {
      deptChart.data.labels = Object.keys(deptCounts);
      deptChart.data.datasets[0].data = Object.values(deptCounts);
      deptChart.update();
    } else {
      deptChart = new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: Object.keys(deptCounts),
          datasets: [{
            label: 'Department Distribution',
            data: Object.values(deptCounts),
            backgroundColor: ['#60A5FA', '#34D399', '#818CF8']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  };

  // Initial render and analytics update
  renderStudents();
  updateCharts();
});
