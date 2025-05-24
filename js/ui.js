// js/ui.js

// LoginUI: مدیریت رابط کاربری برای صفحه ورود
const LoginUI = {
    /**
     * ساخت و نمایش فرم ورود
     */
    setupUi: function () {
        const loginContainer = document.getElementById('login-dialog-container');
        if (!loginContainer) {
            console.error("Login container (login-dialog-container) not found!");
            return;
        }

        loginContainer.innerHTML = `
            <div class="login-dialog">
                <h2 class="login-title">سیستم تخصیص ساعت اضافه کاری</h2>
                <div class="login-form-group">
                    <h3 class="form-group-title">ورود به سیستم</h3>
                    <form id="login-form" novalidate>
                        <div class="form-row">
                            <label for="username">نام کاربری:</label>
                            <input type="text" id="username" name="username" placeholder="نام کاربری واحد" required autocomplete="username">
                        </div>
                        <div class="form-row">
                            <label for="password">رمز عبور:</label>
                            <input type="password" id="password" name="password" placeholder="رمز عبور" required autocomplete="current-password">
                        </div>
                        <div class="form-row remember-me-row">
                            <input type="checkbox" id="remember-me">
                            <label for="remember-me" class="checkbox-label">مرا به خاطر بسپار</label>
                        </div>
                        <div class="form-row">
                            <button type="submit" id="login-button">ورود</button>
                        </div>
                    </form>
                </div>
                <p class="login-help-text">برای دریافت نام کاربری و رمز عبور با بخش سرمایه‌های انسانی تماس بگیرید.</p>
                <div id="login-message" class="login-message hidden"></div>
            </div>
        `;
        this.loadSavedCredentialsToUI();
    },

    /**
     * اتصال شنونده‌های رویداد به فرم ورود
     */
    connectEventListeners: function () {
        const loginForm = document.getElementById('login-form');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('login-button');


        if (loginForm && loginButton) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const username = usernameInput?.value.trim();
                const password = passwordInput?.value;
                const rememberMe = document.getElementById('remember-me')?.checked;

                this.showMessage('در حال بررسی...', 'info');
                loginButton.disabled = true;

                if (!username || !password) {
                    this.showMessage("نام کاربری و رمز عبور را وارد کنید.", "error");
                    loginButton.disabled = false;
                    return;
                }

                try {
                    const loginSuccess = await Auth.login(username, password);
                    if (loginSuccess) {
                        Auth.saveLoginState(username, password, rememberMe);
                        this.showMessage("ورود موفقیت آمیز بود. در حال انتقال...", "success");
                        setTimeout(() => {
                            App.showMainAppView();
                            MainAppUI.setupUi();
                            MainAppUI.connectEventListeners();
                            MainAppUI.initializeUiState();
                        }, 1000);
                    } else {
                        this.showMessage("نام کاربری یا رمز عبور اشتباه است.", "error");
                        if (passwordInput) {
                            passwordInput.value = '';
                            passwordInput.focus();
                        }
                    }
                } catch (error) {
                    console.error("Login error:", error);
                    this.showMessage("خطا در فرآیند ورود. لطفاً کنسول را بررسی کنید.", "error");
                } finally {
                    if (!AppState.isLoggedIn) { // فقط اگر لاگین موفق نبود، دکمه را فعال کن
                        loginButton.disabled = false;
                    }
                }
            });
        }

        usernameInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                passwordInput?.focus();
            }
        });
        passwordInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                loginButton?.click();
            }
        });
    },

    /**
     * بارگذاری نام کاربری و رمز عبور ذخیره شده در فرم
     */
    loadSavedCredentialsToUI: function () {
        const savedCreds = Auth.loadLoginState();
        const rememberMeChecked = localStorage.getItem('overtimeAppRememberMe') === 'true';
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberCheckbox = document.getElementById('remember-me');

        if (rememberCheckbox) rememberCheckbox.checked = rememberMeChecked;

        if (usernameInput) {
            usernameInput.value = (savedCreds && rememberMeChecked) ? savedCreds.username : '';
        }
        if (passwordInput) {
            passwordInput.value = (savedCreds && rememberMeChecked) ? savedCreds.password : '';
        }

        if (usernameInput && passwordInput) {
            if (rememberMeChecked && usernameInput.value && passwordInput.value) { // اگر هر دو پر بودند
                // فوکوس روی دکمه ورود برای راحتی
                document.getElementById('login-button')?.focus();
            } else if (usernameInput.value) {
                passwordInput.focus();
            }
            else {
                usernameInput.focus();
            }
        }
    },

    /**
     * نمایش پیام در دیالوگ ورود
     */
    showMessage: function (message, type = "info") {
        const loginMessageEl = document.getElementById('login-message');
        if (loginMessageEl) {
            loginMessageEl.textContent = message;
            loginMessageEl.className = `login-message ${type}`;
            loginMessageEl.classList.remove('hidden');
        }
    }
};

// MainAppUI: مدیریت رابط کاربری برای پنجره اصلی برنامه
const MainAppUI = {
    /**
     * ساخت و نمایش ساختار اولیه پنجره اصلی برنامه
     */
    setupUi: function () {
        const mainAppContainer = document.getElementById('main-app-window-container');
        if (!mainAppContainer) {
            console.error("Main app container not found!");
            return;
        }
        mainAppContainer.innerHTML = `
            <div class="main-app-layout">
                <div id="status-bar" class="status-bar">اطلاعات کاربر بارگذاری می‌شود...</div>
                <div class="control-group" id="top-controls-group">
                    <h3 class="form-group-title">انتخاب واحد و مشاهده اطلاعات پایه</h3>
                    <div class="controls-grid">
                        <label for="dept-combo">واحد سازمانی:</label>
                        <select id="dept-combo" disabled><option value="">-- صبر کنید --</option></select>

                        <label for="total-hours-input">سرانه کل (ساعت):</label>
                        <input type="number" id="total-hours-input" value="0" min="0" max="9999">

                        <label for="production-days-input">روزهای تولید:</label>
                        <input type="number" id="production-days-input" value="0" min="0" max="31" readonly>
                    </div>
                    <div id="admin-controls-area" class="admin-controls hidden">
                        <hr class="separator">
                        <div class="controls-grid">
                            <label for="admin-employees-count">تعداد پرسنل (ادمین):</label>
                            <input type="number" id="admin-employees-count" value="0" min="0" max="200">
                            <button id="admin-create-table-btn" class="admin-btn">ایجاد جدول دستی</button>
                            <button id="admin-import-excel-btn" class="admin-btn">وارد کردن دستی اکسل</button>
                        </div>
                    </div>
                </div>

                <div class="control-group" id="table-group">
                    <h3 class="form-group-title">تخصیص ساعات اضافه کاری پرسنل</h3>
                    <div id="overtime-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>نام پرسنل</th>
                                    <th>کد پرسنلی</th>
                                    <th>ساعت اضافه کاری</th>
                                    <th>ماه تخصیص</th>
                                    <th>قفل</th>
                                </tr>
                            </thead>
                            <tbody id="overtime-table-body"></tbody>
                        </table>
                    </div>
                    <div id="summary-label-container">
                        <p id="summary-label">مجموع ساعات: 0 / سرانه: 0</p>
                    </div>
                </div>

                <div class="bottom-buttons-container">
                    <button id="export-excel-btn" disabled>خروجی اکسل</button>
                    <button id="update-from-cloud-btn" class="non-admin-btn hidden" disabled>به‌روزرسانی از سرور</button>
                    <span class="spacer"></span>
                    <button id="reset-table-btn" disabled>پاک کردن جدول</button>
                    <button id="help-btn">راهنما</button>
                    <button id="about-btn">درباره</button>
                    <button id="logout-main-btn">خروج از حساب</button>
                </div>
            </div>
        `;
    },

    /**
     * اتصال شنونده‌های رویداد به کنترل‌های پنجره اصلی
     */
    connectEventListeners: function () {
        document.getElementById('dept-combo')?.addEventListener('change', this.onDepartmentChanged.bind(this));
        document.getElementById('logout-main-btn')?.addEventListener('click', App.logout);
        document.getElementById('total-hours-input')?.addEventListener('change', this.onTotalHoursChangedByAdmin.bind(this));
        document.getElementById('admin-create-table-btn')?.addEventListener('click', this.onAdminCreateTable.bind(this));
        document.getElementById('admin-import-excel-btn')?.addEventListener('click', this.onAdminImportExcel.bind(this));
        document.getElementById('export-excel-btn')?.addEventListener('click', this.onExportToExcel.bind(this));
        document.getElementById('update-from-cloud-btn')?.addEventListener('click', this.onUpdateFromCloud.bind(this));
        document.getElementById('reset-table-btn')?.addEventListener('click', this.onResetTable.bind(this));
        document.getElementById('help-btn')?.addEventListener('click', this.showHelp.bind(this));
        document.getElementById('about-btn')?.addEventListener('click', this.showAbout.bind(this));
    },

    /**
     * مقداردهی اولیه وضعیت رابط کاربری پنجره اصلی
     */
    initializeUiState: function () {
        this.updateStatusBar();
        AppState.accessibleDeptShifts = App._getAccessibleDepartments();

        const deptCombo = document.getElementById('dept-combo');
        const totalHoursInput = document.getElementById('total-hours-input');
        const prodDaysInput = document.getElementById('production-days-input');
        const exportBtn = document.getElementById('export-excel-btn');
        const resetBtn = document.getElementById('reset-table-btn');
        const updateCloudBtn = document.getElementById('update-from-cloud-btn');
        const adminControlsArea = document.getElementById('admin-controls-area');

        if (deptCombo) {
            deptCombo.innerHTML = '<option value="">-- انتخاب واحد --</option>';
            if (AppState.accessibleDeptShifts.length > 0) {
                AppState.accessibleDeptShifts.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    deptCombo.appendChild(option);
                });
                deptCombo.disabled = false;
            } else {
                deptCombo.disabled = true;
                deptCombo.innerHTML = '<option value="">-- واحدی قابل دسترس نیست --</option>';
                Utils.showGlobalMessage("هیچ واحدی برای شما قابل دسترسی نیست.", "warning");
            }
        }

        const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';
        if (totalHoursInput) {
            totalHoursInput.readOnly = !isAdmin;
            totalHoursInput.title = isAdmin ? "سرانه کل قابل ویرایش توسط ادمین." : "سرانه کل از فایل سرور خوانده می‌شود.";
        }
        if (prodDaysInput) prodDaysInput.readOnly = true;

        adminControlsArea?.classList.toggle('hidden', !isAdmin);
        updateCloudBtn?.classList.toggle('hidden', isAdmin);

        if (exportBtn) exportBtn.disabled = true;
        if (resetBtn) resetBtn.disabled = true;
        if (updateCloudBtn) updateCloudBtn.disabled = true;

        this.clearTableAndInfo(false);
        this.updateSummaryDisplay();
    },

    /**
     * به‌روزرسانی نوار وضعیت
     */
    updateStatusBar: function () {
        const statusBar = document.getElementById('status-bar');
        if (statusBar && AppState.currentUser) {
            let statusText = `کاربر: ${AppState.currentUser.username}`;
            if (AppState.currentUser.department && AppState.currentUser.department !== 'all') {
                statusText += ` | واحد پایه: ${AppState.currentUser.department}`;
            }
            const roleText = AppState.currentUser.role === 'admin' ? "مدیر سیستم" : "بالاترین مقام واحد";
            statusText += ` | نقش: ${roleText}`;
            statusBar.textContent = statusText;
        } else if (statusBar) {
            statusBar.textContent = "کاربر وارد نشده است.";
        }
    },

    /**
     * مدیریت رویداد تغییر واحد انتخاب شده
     */
    onDepartmentChanged: async function (event) {
        const selectedDeptShift = event.target.value;
        AppState.currentDepartmentShift = selectedDeptShift;

        const exportBtn = document.getElementById('export-excel-btn');
        const resetBtn = document.getElementById('reset-table-btn');
        const updateCloudBtn = document.getElementById('update-from-cloud-btn');
        const totalHoursInput = document.getElementById('total-hours-input');

        if (!selectedDeptShift) {
            this.clearTableAndInfo(true);
            if (exportBtn) exportBtn.disabled = true;
            if (resetBtn) resetBtn.disabled = true;
            if (updateCloudBtn) updateCloudBtn.disabled = true;
            if (totalHoursInput) totalHoursInput.value = 0;
            document.getElementById('production-days-input').value = 0;
            return;
        }

        if (resetBtn) resetBtn.disabled = false;
        if (updateCloudBtn && AppState.currentUser && AppState.currentUser.role !== 'admin') {
            updateCloudBtn.disabled = false;
        }

        if (AppState.departmentsData[selectedDeptShift]) {
            const data = AppState.departmentsData[selectedDeptShift];
            AppState.totalHoursForCurrentDept = data.total_hours || 0;
            AppState.productionDaysForCurrentDept = data.production_days || 0;
            AppState.monthNameForCurrentDept = data.month_name || Utils.getCurrentPersianMonthName();
            AppState.currentEmployeesInTable = JSON.parse(JSON.stringify(data.employees || []));

            if (totalHoursInput) totalHoursInput.value = AppState.totalHoursForCurrentDept;
            document.getElementById('production-days-input').value = AppState.productionDaysForCurrentDept;

            this.populateTable();
            Utils.showGlobalMessage(`اطلاعات واحد '${selectedDeptShift}' از حافظه بارگذاری شد.`, "info", 2000);
        } else {
            this.clearTableAndInfo(false);
            AppState.totalHoursForCurrentDept = 0;
            AppState.productionDaysForCurrentDept = 0;
            AppState.monthNameForCurrentDept = Utils.getCurrentPersianMonthName();
            AppState.currentEmployeesInTable = [];

            if (totalHoursInput) totalHoursInput.value = 0;
            document.getElementById('production-days-input').value = 0;
            this.populateTable();

            if (AppState.currentUser && AppState.currentUser.role !== 'admin') {
                Utils.showGlobalMessage(`برای واحد '${selectedDeptShift}'، اطلاعات را از سرور به‌روزرسانی کنید.`, 'info');
            } else if (AppState.currentUser && AppState.currentUser.role === 'admin') {
                Utils.showGlobalMessage(`برای واحد '${selectedDeptShift}'، اطلاعات را وارد یا از فایل بارگذاری کنید.`, 'info');
            }
        }
        this.updateSummaryDisplay();
    },

    /**
     * پاک کردن جدول و اطلاعات نمایش داده شده
     */
    clearTableAndInfo: function (resetCurrentDeptState = true) {
        document.getElementById('overtime-table-body').innerHTML = '';
        if (resetCurrentDeptState) {
            AppState.currentDepartmentShift = null; // این باعث می‌شود در onDepartmentChanged بعدی، کش بررسی نشود
            AppState.monthNameForCurrentDept = "";
        }
        AppState.totalHoursForCurrentDept = resetCurrentDeptState ? 0 : AppState.totalHoursForCurrentDept;
        AppState.productionDaysForCurrentDept = resetCurrentDeptState ? 0 : AppState.productionDaysForCurrentDept;
        AppState.currentEmployeesInTable = [];

        document.getElementById('total-hours-input').value = AppState.totalHoursForCurrentDept;
        document.getElementById('production-days-input').value = AppState.productionDaysForCurrentDept;
        this.updateSummaryDisplay();
        const exportBtn = document.getElementById('export-excel-btn');
        if (exportBtn) exportBtn.disabled = true;
    },

    /**
     * پر کردن جدول اضافه کاری
     */
    populateTable: function () {
        const tableBody = document.getElementById('overtime-table-body');
        const exportBtn = document.getElementById('export-excel-btn');
        tableBody.innerHTML = '';

        if (!AppState.currentEmployeesInTable || AppState.currentEmployeesInTable.length === 0) {
            if (exportBtn) exportBtn.disabled = true;
            this.updateSummaryDisplay();
            return;
        }
        if (exportBtn) exportBtn.disabled = false;

        const monthForDisplay = AppState.monthNameForCurrentDept || Utils.getCurrentPersianMonthName();

        AppState.currentEmployeesInTable.forEach((emp, index) => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = emp.name || "نامشخص";
            row.insertCell().textContent = emp.id || "----";

            const hoursCell = row.insertCell();
            const hoursInput = document.createElement('input');
            hoursInput.type = 'number';
            hoursInput.value = emp.hours || 0;
            hoursInput.min = 0;
            hoursInput.max = 999;
            hoursInput.dataset.index = index;
            hoursInput.addEventListener('change', this.onHoursChangedInTable.bind(this));
            hoursInput.addEventListener('input', this.validateHoursInput.bind(this));
            hoursCell.appendChild(hoursInput);

            const monthCell = row.insertCell();
            monthCell.textContent = monthForDisplay;
            monthCell.classList.add('read-only-cell');

            const lockCell = row.insertCell();
            const lockCheckbox = document.createElement('input');
            lockCheckbox.type = 'checkbox';
            lockCheckbox.checked = emp.locked || false;
            lockCheckbox.dataset.index = index;
            lockCheckbox.addEventListener('change', this.onLockChangedInTable.bind(this));
            lockCell.appendChild(lockCheckbox);
        });
        this.updateSummaryDisplay();
    },

    /**
     * ولیدیشن ورودی ساعت در جدول
     */
    validateHoursInput: function (event) {
        const input = event.target;
        if (input.value === "") return;
        let value = parseInt(input.value, 10);
        if (isNaN(value) || value < 0) input.value = 0;
        else if (value > 999) input.value = 999;
    },

    /**
     * مدیریت تغییر ساعت در جدول
     */
    onHoursChangedInTable: function (event) {
        const employeeIndex = parseInt(event.target.dataset.index, 10);
        let newHours = parseInt(event.target.value, 10);
        if (isNaN(newHours) || newHours < 0) newHours = 0;
        if (newHours > 999) newHours = 999;
        event.target.value = newHours;
        App.updateEmployeeHour(employeeIndex, newHours);
    },

    /**
     * مدیریت تغییر وضعیت قفل در جدول
     */
    onLockChangedInTable: function (event) {
        const employeeIndex = parseInt(event.target.dataset.index, 10);
        const isLocked = event.target.checked;
        App.updateEmployeeLock(employeeIndex, isLocked);
    },

    /**
     * مدیریت تغییر سرانه کل توسط ادمین
     */
    onTotalHoursChangedByAdmin: function (event) {
        if (AppState.currentUser && AppState.currentUser.role === 'admin' && AppState.currentDepartmentShift) {
            let newTotal = parseInt(event.target.value, 10);
            if (isNaN(newTotal) || newTotal < 0) {
                newTotal = 0;
                event.target.value = 0;
            }
            if (newTotal > 9999) { // یک حد بالا برای سرانه
                newTotal = 9999;
                event.target.value = 9999;
            }
            AppState.totalHoursForCurrentDept = newTotal;
            if (AppState.departmentsData[AppState.currentDepartmentShift]) {
                AppState.departmentsData[AppState.currentDepartmentShift].total_hours = newTotal;
            } else {
                AppState.departmentsData[AppState.currentDepartmentShift] = {
                    total_hours: newTotal,
                    production_days: AppState.productionDaysForCurrentDept,
                    month_name: AppState.monthNameForCurrentDept,
                    employees: JSON.parse(JSON.stringify(AppState.currentEmployeesInTable))
                };
            }
            App.reallocateHours();
        }
    },

    /**
     * مدیریت کلیک "به‌روزرسانی از سرور"
     */
    onUpdateFromCloud: async function () {
        if (!AppState.currentDepartmentShift) {
            Utils.showGlobalMessage("لطفاً ابتدا یک واحد را انتخاب کنید.", "warning");
            return;
        }
        const deptKey = AppState.currentDepartmentShift;
        const updateButton = document.getElementById('update-from-cloud-btn');
        if (updateButton) updateButton.disabled = true;

        const fileUrl = DEFAULT_CLOUD_LINKS[deptKey]; // از config.js
        if (!fileUrl) {
            Utils.showGlobalMessage(`لینک دانلود برای واحد '${deptKey}' یافت نشد.`, "error");
            if (updateButton) updateButton.disabled = false;
            return;
        }

        Utils.showGlobalMessage(`در حال دریافت اطلاعات از سرور برای واحد ${deptKey}...`, "info", 7000);
        const downloadLink = Utils.convertToDownloadLink(fileUrl);

        try {
            const data = await ExcelHandler.readFileData(downloadLink);
            if (data) {
                AppState.totalHoursForCurrentDept = data.seraneh;
                AppState.productionDaysForCurrentDept = data.prodDays;
                AppState.monthNameForCurrentDept = data.monthName;
                AppState.currentEmployeesInTable = JSON.parse(JSON.stringify(data.employees));

                AppState.departmentsData[deptKey] = {
                    total_hours: data.seraneh,
                    production_days: data.prodDays,
                    month_name: data.monthName,
                    employees: JSON.parse(JSON.stringify(data.employees))
                };

                document.getElementById('total-hours-input').value = data.seraneh;
                document.getElementById('production-days-input').value = data.prodDays;
                App.reallocateHours();
                Utils.showGlobalMessage(`اطلاعات واحد '${deptKey}' با موفقیت از سرور دریافت شد.`, "success");
            } else {
                Utils.showGlobalMessage(`خطا در پردازش اطلاعات واحد '${deptKey}'. لطفاً فایل اکسل و لینک آن را بررسی کنید.`, "error", 7000);
            }
        } catch (error) {
            console.error("Error in onUpdateFromCloud:", error);
            Utils.showGlobalMessage(`خطای بحرانی هنگام به‌روزرسانی از سرور: ${error.message}`, "error", 7000);
        } finally {
            if (updateButton) updateButton.disabled = false;
        }
    },

    /**
     * مدیریت کلیک "پاک کردن جدول"
     */
    onResetTable: function () {
        if (!AppState.currentDepartmentShift) {
            Utils.showGlobalMessage("ابتدا یک واحد را انتخاب کنید.", "warning");
            return;
        }
        if (confirm(`آیا از پاک کردن تمام اطلاعات (شامل سرانه و پرسنل) برای واحد '${AppState.currentDepartmentShift}' مطمئن هستید؟ این عمل اطلاعات کش شده را نیز حذف می‌کند.`)) {
            AppState.totalHoursForCurrentDept = 0;
            AppState.productionDaysForCurrentDept = 0;
            AppState.monthNameForCurrentDept = Utils.getCurrentPersianMonthName();
            AppState.currentEmployeesInTable = [];

            if (AppState.departmentsData[AppState.currentDepartmentShift]) {
                delete AppState.departmentsData[AppState.currentDepartmentShift];
            }

            document.getElementById('total-hours-input').value = 0;
            document.getElementById('production-days-input').value = 0;
            this.populateTable(); // شامل updateSummary و غیرفعال کردن دکمه خروجی
            Utils.showGlobalMessage(`اطلاعات واحد '${AppState.currentDepartmentShift}' پاک شد.`, "info");
        }
    },

    /**
     * مدیریت کلیک "خروجی اکسل"
     */
    onExportToExcel: function () {
        if (!AppState.currentDepartmentShift || !AppState.currentEmployeesInTable || AppState.currentEmployeesInTable.length === 0) {
            Utils.showGlobalMessage("داده‌ای برای خروجی وجود ندارد یا واحدی انتخاب نشده است.", "warning");
            return;
        }
        const allocatedHours = AppState.currentEmployeesInTable.reduce((sum, emp) => sum + (parseInt(emp.hours, 10) || 0), 0);
        const targetHours = parseInt(AppState.totalHoursForCurrentDept, 10) || 0;

        if (allocatedHours !== targetHours) {
            Utils.showGlobalMessage(`جمع ساعات تخصیص یافته (${allocatedHours}) با سرانه کل (${targetHours}) برابر نیست. لطفاً قبل از خروجی، ساعات را اصلاح کنید.`, "error", 7000);
            return;
        }
        const monthForExport = AppState.monthNameForCurrentDept || Utils.getCurrentPersianMonthName();
        ExcelHandler.exportToExcel(
            AppState.currentEmployeesInTable,
            AppState.currentDepartmentShift,
            monthForExport,
            "تخصیص_اضافه_کاری"
        );
    },

    /**
     * مدیریت ایجاد جدول دستی توسط ادمین
     */
    onAdminCreateTable: function () {
        if (!AppState.currentDepartmentShift) {
            Utils.showGlobalMessage("ابتدا یک واحد را برای ایجاد جدول انتخاب کنید.", "warning");
            return;
        }
        const numEmployeesInput = document.getElementById('admin-employees-count');
        const numEmployees = parseInt(numEmployeesInput?.value, 10);
        const totalHours = parseInt(document.getElementById('total-hours-input')?.value, 10); // سرانه از فیلد خوانده شود

        if (isNaN(numEmployees) || numEmployees <= 0 || numEmployees > 200) { // حد بالا برای تعداد پرسنل
            Utils.showGlobalMessage("تعداد پرسنل برای ایجاد جدول دستی باید عدد صحیح بین 1 تا 200 باشد.", "error");
            numEmployeesInput?.focus();
            return;
        }
        if (isNaN(totalHours) || totalHours < 0) {
            Utils.showGlobalMessage("مقدار سرانه کل نامعتبر است.", "error");
            document.getElementById('total-hours-input')?.focus();
            return;
        }

        if (confirm(`آیا برای واحد '${AppState.currentDepartmentShift}' یک جدول با ${numEmployees} پرسنل و سرانه ${totalHours} ساعت ایجاد می‌کنید؟ اطلاعات قبلی این واحد بازنویسی خواهد شد.`)) {
            AppState.currentEmployeesInTable = [];
            const currentMonth = Utils.getCurrentPersianMonthName();
            AppState.monthNameForCurrentDept = currentMonth;
            AppState.totalHoursForCurrentDept = totalHours;
            AppState.productionDaysForCurrentDept = 0; // پیش‌فرض برای جدول دستی

            for (let i = 0; i < numEmployees; i++) {
                AppState.currentEmployeesInTable.push({
                    name: `پرسنل جدید ${i + 1}`,
                    id: `${Math.floor(1000 + Math.random() * 9000)}`,
                    hours: 0,
                    locked: false
                });
            }
            AppState.departmentsData[AppState.currentDepartmentShift] = {
                total_hours: totalHours,
                production_days: 0,
                month_name: currentMonth,
                employees: JSON.parse(JSON.stringify(AppState.currentEmployeesInTable))
            };
            // به‌روزرسانی UI سرانه چون ممکن است ادمین آن را تغییر داده باشد
            document.getElementById('total-hours-input').value = totalHours;
            document.getElementById('production-days-input').value = 0;
            App.reallocateHours();
            Utils.showGlobalMessage(`جدول جدید با ${numEmployees} پرسنل برای واحد '${AppState.currentDepartmentShift}' ایجاد شد.`, "success");
        }
    },

    /**
     * مدیریت وارد کردن اکسل دستی توسط ادمین
     */
    onAdminImportExcel: function () {
        if (!AppState.currentDepartmentShift) {
            Utils.showGlobalMessage("لطفاً ابتدا واحدی را که می‌خواهید اطلاعات اکسل برای آن بارگذاری شود، انتخاب کنید.", "warning");
            return;
        }
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx, .xls";
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                Utils.showGlobalMessage(`در حال پردازش فایل اکسل '${file.name}' برای واحد '${AppState.currentDepartmentShift}'...`, "info", 7000);
                try {
                    // ExcelHandler.readFileData از AppState.currentDepartmentShift برای فیلتر کردن استفاده می‌کند
                    const data = await ExcelHandler.readFileData(file);
                    if (data) {
                        // مقادیر خوانده شده از فایل اکسل (F1, F2, F3) و لیست پرسنل فیلتر شده برای واحد فعلی
                        AppState.totalHoursForCurrentDept = data.seraneh;
                        AppState.productionDaysForCurrentDept = data.prodDays;
                        AppState.monthNameForCurrentDept = data.monthName;
                        AppState.currentEmployeesInTable = JSON.parse(JSON.stringify(data.employees));

                        AppState.departmentsData[AppState.currentDepartmentShift] = {
                            total_hours: data.seraneh,
                            production_days: data.prodDays,
                            month_name: data.monthName,
                            employees: JSON.parse(JSON.stringify(data.employees))
                        };

                        document.getElementById('total-hours-input').value = data.seraneh;
                        document.getElementById('production-days-input').value = data.prodDays;
                        App.reallocateHours();
                        Utils.showGlobalMessage(`اطلاعات از فایل '${file.name}' برای واحد '${AppState.currentDepartmentShift}' با موفقیت بارگذاری شد.`, "success");
                    } else {
                        Utils.showGlobalMessage(`خطا در پردازش فایل '${file.name}'. ممکن است فایل فرمت صحیحی نداشته باشد یا پرسنلی برای واحد '${AppState.currentDepartmentShift}' در آن یافت نشود.`, "error", 10000);
                    }
                } catch (error) {
                    console.error("Error importing Excel by admin:", error);
                    Utils.showGlobalMessage(`خطا در وارد کردن فایل اکسل: ${error.message}`, "error", 7000);
                }
            }
            document.body.removeChild(fileInput);
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    },

    /**
     * نمایش راهنما
     */
    showHelp: function () {
        const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';
        let helpTitle = isAdmin ? "راهنمای مدیر سیستم" : "راهنمای بالاترین مقام واحد";
        let helpContent = `
            <div style="text-align: right; max-height: 400px; overflow-y: auto; padding: 0 10px;">
            <h4>نکات کلی:</h4>
            <ul>
                <li><b>انتخاب واحد:</b> همیشه ابتدا واحد سازمانی مورد نظر را از لیست انتخاب کنید.</li>
                <li><b>جدول تخصیص:</b> ساعات اضافه کاری را در ستون مربوطه وارد کنید (0-999). با ویرایش ساعت، ردیف قفل می‌شود.</li>
                <li><b>قفل:</b> برای ثابت نگه‌داشتن ساعت یک پرسنل یا آزاد کردن آن برای توزیع مجدد، از تیک ستون "قفل" استفاده کنید.</li>
                <li><b>جمع‌بندی:</b> برچسب پایین جدول وضعیت تخصیص (مجموع ساعات در برابر سرانه) را نشان می‌دهد. برای خروجی صحیح، این دو باید برابر باشند (برچسب سبز).</li>
                <li><b>ماه تخصیص:</b> این ماه از فایل اکسل خوانده می‌شود (سلول F3) یا در صورت ایجاد دستی جدول، ماه جاری سیستم خواهد بود و در خروجی اکسل نیز همین ماه درج می‌شود.</li>
                <li><b>خروجی اکسل:</b> پس از تخصیص صحیح، فایل اکسل دریافت کنید.</li>
                <li><b>پاک کردن جدول:</b> اطلاعات واحد فعلی را پاک می‌کند (از حافظه داخلی برنامه، نه از سرور).</li>
            </ul>
        `;
        if (isAdmin) {
            helpContent += `
                <h4>امکانات مدیر سیستم:</h4>
                <ul>
                    <li><b>ویرایش سرانه کل:</b> می‌توانید سرانه کل واحد انتخاب شده را مستقیماً تغییر دهید.</li>
                    <li><b>ایجاد جدول دستی:</b> با وارد کردن "تعداد پرسنل" و کلیک روی این دکمه، یک جدول با پرسنل فرضی و سرانه فعلی ایجاد می‌شود.</li>
                    <li><b>وارد کردن دستی اکسل:</b> یک فایل اکسل از سیستم خود انتخاب کنید. برنامه اطلاعات سرانه (F1)، روزهای تولید (F2)، ماه (F3) و لیست پرسنل (فیلتر شده برای واحد انتخاب شده فعلی) را از آن می‌خواند.</li>
                </ul>
            `;
        } else {
            helpContent += `
                <h4>امکانات بالاترین مقام واحد:</h4>
                <ul>
                    <li><b>به‌روزرسانی از سرور:</b> اطلاعات سرانه، روز تولید، ماه و لیست پرسنل واحد شما از لینک تعریف شده در سیستم بارگذاری می‌شود.</li>
                    <li><b>محدودیت ویرایش:</b> شما نمی‌توانید سرانه کل، روزهای تولید، یا لیست پرسنل را مستقیماً تغییر دهید. این اطلاعات از سرور خوانده می‌شوند.</li>
                </ul>
            `;
        }
        helpContent += `
            <hr>
            <p style="font-size: 0.9em;">سلول‌های مرجع در فایل اکسل (برای خواندن توسط سیستم):<br>
            - سرانه کل: <b>F1</b><br>
            - روزهای تولید: <b>F2</b><br>
            - نام ماه تخصیص: <b>F3</b> (مثال: فروردین)<br>
            - نام واحد: ستون A (یا اولین ستون با عنوان "نام واحد")<br>
            - نام پرسنل: ستون B (یا دومین ستون با عنوان "نام پرسنل")<br>
            - کد پرسنلی: ستون C (یا سومین ستون با عنوان "کد پرسنلی")
            </p>
            </div>
        `;
        this._showModal(helpTitle, helpContent);
    },

    /**
     * نمایش اطلاعات "درباره برنامه"
     */
    showAbout: function () {
        const aboutTitle = "درباره سیستم تخصیص ساعت اضافه کاری";
        const aboutContent = `
            <div style="text-align: center;">
                <p><strong>نسخه وب 1.0.0</strong></p>
                <p>این برنامه برای محاسبه و تخصیص ساعات اضافه کاری پرسنل طراحی شده است.</p>
                <hr>
                <p style="font-size:0.9em;">توسعه یافته با کمک هوش مصنوعی.</p>
                <p style="font-size:0.8em; color: #aaa;">کلیه حقوق این نرم‌افزار متعلق به سازمان مربوطه می‌باشد.</p>
            </div>
        `;
        this._showModal(aboutTitle, aboutContent);
    },

    /**
     * نمایش یک مودال ساده
     * @private
     */
    _showModal: function (title, contentHtml) {
        let modal = document.getElementById('app-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'app-modal';
            modal.className = 'app-modal'; // استایل در style.css اضافه شود
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="app-modal-content">
                <div class="app-modal-header">
                    <span class="app-modal-close-btn">&times;</span>
                    <h2>${title}</h2>
                </div>
                <div class="app-modal-body">
                    ${contentHtml}
                </div>
            </div>
        `;
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.app-modal-close-btn');
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },


    /**
     * به‌روزرسانی نمایش جمع‌بندی ساعات (مجموع و سرانه)
     */
    updateSummaryDisplay: function () {
        const summaryLabel = document.getElementById('summary-label');
        if (!summaryLabel) return;

        const allocatedHours = AppState.currentEmployeesInTable.reduce((sum, emp) => sum + (parseInt(emp.hours, 10) || 0), 0);
        const targetHours = parseInt(AppState.totalHoursForCurrentDept, 10) || 0;

        summaryLabel.textContent = `مجموع ساعات: ${allocatedHours} / سرانه: ${targetHours}`;
        summaryLabel.classList.remove('summary-ok', 'summary-error');

        // فقط در صورتی که کارمندی وجود داشته باشد یا سرانه‌ای تعریف شده باشد، رنگی شود
        if (AppState.currentEmployeesInTable.length > 0 || targetHours > 0) {
            if (allocatedHours === targetHours) {
                summaryLabel.classList.add('summary-ok');
            } else {
                summaryLabel.classList.add('summary-error');
            }
        }
    }
};
