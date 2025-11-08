
        // Sidebar Toggle
        document.getElementById('sidebarCollapse').addEventListener('click', function () {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.getElementById('content').classList.toggle('expanded');
        });

        // Form Submission Handling
        document.getElementById('userForm').addEventListener('submit', function (e) {
            e.preventDefault();
            alert('User added successfully!');
            this.reset();
        });

        document.getElementById('productForm').addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Product created successfully!');
            this.reset();
        });

        document.getElementById('settingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Settings saved successfully!');
        });

        // File Upload Preview
        document.getElementById('imageUpload').addEventListener('change', function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                const fileUploadBtn = document.querySelector('.file-upload-btn');
                fileUploadBtn.innerHTML = `<i class="bi bi-check-circle" style="font-size: 2rem; color: #4cc9f0;"></i>
                                          <p class="mt-2">${files.length} file(s) selected</p>`;
            }
        });

        // Mobile sidebar toggle
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('collapsed');
            document.getElementById('content').classList.add('expanded');
        }