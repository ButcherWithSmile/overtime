// js/app.js

// AppState: آبجکتی برای نگهداری وضعیت فعلی برنامه
const AppState = {
    currentUser: null, // اطلاعات کاربر وارد شده: { username: '...', role: '...', department: '...' }
    isLoggedIn: false,
    currentView: 'login', // نمای فعلی: 'login' یا 'mainApp'
    accessibleDeptShifts: [], // لیست واحدهای سازمانی-شیفت قابل دسترس برای کاربر
    departmentsData: {}, // کش داده‌های بارگذاری شده برای هر واحد: { [deptShift]: { total_hours, production_days, month_name, employees } }
    currentDepartmentShift: null, // واحد-شیفت انتخاب شده فعلی
    totalHoursForCurrentDept: 0,  // سرانه کل برای واحد فعلی
    productionDaysForCurrentDept: 0, // روزهای تولید برای واحد فعلی
    monthNameForCurrentDept: "", // نام ماه تخصیص برای واحد فعلی
    currentEmployeesInTable: [], // لیست کارمندان نمایش داده شده در جدول برای واحد فعلی (کپی عمیق برای ویرایش)
};

// App: منطق اصلی برنامه
const App = {
    /**
     * مقداردهی اولیه برنامه
     */
    init: async function () {
        console.log("برنامه در حال مقداردهی اولیه...");
        // اطمینان از نمایش صحیح المان‌ها در شروع
        const loginContainer = document.getElementById('login-dialog-container');
        const mainAppContainer = document.getElementById('main-app-window-container');

        if (loginContainer) loginContainer.classList.remove('hidden');
        if (mainAppContainer) mainAppContainer.classList.add('hidden');

        await Auth.initializeUsers(); // مقداردهی اولیه کاربران و هش کردن رمزها
        await Auth.checkPersistedLogin(); // بررسی وضعیت ورود ذخیره شده

        if (AppState.isLoggedIn && AppState.currentUser) {
            this.showMainAppView();
            MainAppUI.setupUi(); // ساخت UI اصلی
            MainAppUI.connectEventListeners(); // اتصال رویدادها
            MainAppUI.initializeUiState(); // مقداردهی اولیه UI اصلی
        } else {
            this.showLoginView();
            LoginUI.setupUi(); // ساخت UI ورود
            LoginUI.connectEventListeners(); // اتصال رویدادهای ورود
        }
    },

    /**
     * نمایش نمای ورود
     */
    showLoginView: function () {
        console.log("نمایش نمای ورود");
        AppState.currentView = 'login';
        const loginContainer = document.getElementById('login-dialog-container');
        const mainAppContainer = document.getElementById('main-app-window-container');
        if (loginContainer) loginContainer.classList.remove('hidden');
        if (mainAppContainer) mainAppContainer.classList.add('hidden');
    },

    /**
     * نمایش نمای اصلی برنامه
     */
    showMainAppView: function () {
        console.log("نمایش نمای اصلی برنامه");
        AppState.currentView = 'mainApp';
        const loginContainer = document.getElementById('login-dialog-container');
        const mainAppContainer = document.getElementById('main-app-window-container');
        if (loginContainer) loginContainer.classList.add('hidden');
        if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    },

    /**
     * خروج کاربر از سیستم
     */
    logout: function () {
        if (confirm("آیا مایل به خروج از حساب کاربری خود هستید؟")) {
            Auth.clearLoginState(); // پاک کردن اطلاعات ورود از localStorage
            AppState.isLoggedIn = false;
            AppState.currentUser = null;
            // پاک کردن داده‌های حساس برنامه
            AppState.departmentsData = {};
            AppState.currentDepartmentShift = null;
            AppState.accessibleDeptShifts = [];
            AppState.currentEmployeesInTable = [];
            AppState.totalHoursForCurrentDept = 0;
            AppState.productionDaysForCurrentDept = 0;
            AppState.monthNameForCurrentDept = "";

            // پاک کردن محتوای پنجره اصلی قبل از نمایش لاگین
            const mainAppContainer = document.getElementById('main-app-window-container');
            if (mainAppContainer) mainAppContainer.innerHTML = ''; // برای جلوگیری از نمایش UI قبلی

            App.showLoginView();
            LoginUI.setupUi(); // بازسازی UI ورود برای اطمینان از وضعیت اولیه صحیح
            LoginUI.connectEventListeners();
            Utils.showGlobalMessage("شما با موفقیت خارج شدید.", "info");
        }
    },

    /**
     * تعیین لیست واحدهای قابل دسترس برای کاربر فعلی
     * @returns {Array<string>} لیستی از رشته‌های "نام واحد - شیفت"
     */
    _getAccessibleDepartments: function () {
        if (!AppState.currentUser) return [];

        const userRole = AppState.currentUser.role;
        const baseDept = AppState.currentUser.department; // نام فارسی واحد پایه کاربر

        if (userRole === "admin") {
            return MANAGEABLE_DEPARTMENTS; // از config.js
        }

        let accessible = [];
        if (userRole === "department_head") {
            if (baseDept === "فنی مهندسی") {
                accessible = [
                    "تراشکاری - شیفتی", "دفتر فنی - ثابت", "برق - ثابت", "برق - شیفتی",
                    "مکانیک - ثابت", "مکانیک - شیفتی", "نت - ثابت", "تأسیسات - ثابت",
                    "تأسیسات - شیفتی", "رؤسا و سرپرستان فنی مهندسی - ثابت"
                ];
            } else if (baseDept === "سرمایه های انسانی") {
                accessible = [
                    "سرمایه های انسانی - ثابت", "سرمایه های انسانی - شیفتی",
                    "مدیران و رؤسا - ثابت"
                ];
            } else if (DEPARTMENT_SHIFTS[baseDept]) { // از config.js
                accessible = DEPARTMENT_SHIFTS[baseDept].map(shift => `${baseDept} - ${shift}`);
            } else {
                console.warn(`واحد '${baseDept}' برای کاربر ${AppState.currentUser.username} تعریف نشده است.`);
                Utils.showGlobalMessage(`واحد پایه '${baseDept}' برای شما تعریف نشده است.`, "warning");
            }
        } else {
            console.error(`نقش کاربری '${userRole}' نامعتبر است.`);
            Utils.showGlobalMessage(`نقش کاربری شما (${userRole}) نامعتبر است.`, "error");
        }
        // فیلتر نهایی برای اطمینان از وجود در لیست اصلی و مرتب‌سازی
        return accessible.filter(deptShift => MANAGEABLE_DEPARTMENTS.includes(deptShift)).sort((a, b) => a.localeCompare(b, 'fa'));
    },

    /**
     * محاسبه مجدد و به‌روزرسانی ساعات اضافه کاری برای کارمندان قفل نشده
     */
    reallocateHours: function () {
        if (!AppState.currentEmployeesInTable) {
            AppState.currentEmployeesInTable = []; // اطمینان از اینکه آرایه است
        }

        const lockedSum = AppState.currentEmployeesInTable.reduce((sum, emp) => {
            return emp.locked ? sum + (parseInt(emp.hours, 10) || 0) : sum;
        }, 0);

        const unlockedIndices = AppState.currentEmployeesInTable
            .map((emp, index) => emp.locked ? -1 : index)
            .filter(index => index !== -1);

        const numUnlocked = unlockedIndices.length;
        const { baseHours, extraHoursCount } = this.calculateDistribution(lockedSum, numUnlocked);

        let extraDistributed = 0;
        unlockedIndices.forEach(empIndex => {
            let hoursAllocated = baseHours;
            if (extraDistributed < extraHoursCount) {
                hoursAllocated++;
                extraDistributed++;
            }
            AppState.currentEmployeesInTable[empIndex].hours = Math.max(0, hoursAllocated);
        });

        MainAppUI.populateTable(); // بازрисов جدول با ساعات جدید
        MainAppUI.updateSummaryDisplay(); // به‌روزرسانی جمع‌بندی

        // به‌روزرسانی کش داده‌ها برای واحد فعلی
        if (AppState.currentDepartmentShift && AppState.departmentsData[AppState.currentDepartmentShift]) {
            AppState.departmentsData[AppState.currentDepartmentShift].employees = JSON.parse(JSON.stringify(AppState.currentEmployeesInTable));
        }
    },

    /**
     * محاسبه ساعات پایه و اضافی برای توزیع بین کارمندان قفل نشده
     * @param {number} lockedHoursSum - مجموع ساعات کارمندان قفل شده
     * @param {number} numUnlocked - تعداد کارمندان قفل نشده
     * @returns {object} شامل { baseHours, extraHoursCount }
     */
    calculateDistribution: function (lockedHoursSum, numUnlocked) {
        const targetTotalHours = parseInt(AppState.totalHoursForCurrentDept, 10) || 0;
        if (numUnlocked <= 0) {
            return { baseHours: 0, extraHoursCount: 0 };
        }
        const remainingHours = Math.max(0, targetTotalHours - lockedHoursSum);
        const baseHours = Math.floor(remainingHours / numUnlocked);
        const extraHoursCount = remainingHours % numUnlocked;
        return { baseHours, extraHoursCount };
    },

    /**
     * به‌روزرسانی ساعت یک کارمند خاص در AppState و اجرای توزیع مجدد
     * @param {number} employeeIndex - ایندکس کارمند در AppState.currentEmployeesInTable
     * @param {number} newHours - ساعت جدید
     */
    updateEmployeeHour: function (employeeIndex, newHours) {
        if (AppState.currentEmployeesInTable && AppState.currentEmployeesInTable[employeeIndex]) {
            const emp = AppState.currentEmployeesInTable[employeeIndex];
            newHours = parseInt(newHours, 10); // اطمینان از اینکه عدد است

            if (isNaN(newHours) || newHours < 0) newHours = 0;
            if (newHours > 999) newHours = 999;

            if (emp.hours !== newHours) {
                emp.hours = newHours;
                emp.locked = true; // ویرایش ساعت، آن را قفل می‌کند
                this.reallocateHours();
            } else if (!emp.locked) { // اگر ساعت تغییر نکرده ولی کاربر فیلد را ویرایش کرده (مثلا enter زده)، قفل شود
                emp.locked = true;
                this.reallocateHours(); // برای به‌روزرسانی جدول و اطمینان از وضعیت صحیح
            }
        } else {
            console.error(`کارمند با ایندکس ${employeeIndex} یافت نشد هنگام به‌روزرسانی ساعت.`);
        }
    },

    /**
     * به‌روزرسانی وضعیت قفل یک کارمند خاص در AppState و اجرای توزیع مجدد
     * @param {number} employeeIndex - ایندکس کارمند
     * @param {boolean} isLocked - وضعیت جدید قفل
     */
    updateEmployeeLock: function (employeeIndex, isLocked) {
        if (AppState.currentEmployeesInTable && AppState.currentEmployeesInTable[employeeIndex]) {
            AppState.currentEmployeesInTable[employeeIndex].locked = isLocked;
            this.reallocateHours();
        } else {
            console.error(`کارمند با ایندکس ${employeeIndex} یافت نشد هنگام به‌روزرسانی قفل.`);
        }
    }
};
