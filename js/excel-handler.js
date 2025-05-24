// js/excel-handler.js

const ExcelHandler = {
    /**
     * خواندن داده از فایل اکسل (از URL یا آبجکت File/Blob)
     * @param {string|Blob} fileSource - URL فایل .xlsx یا یک آبجکت File/Blob
     * @returns {Promise<object|null>} آبجکتی شامل { seraneh, prodDays, monthName, employees } یا null در صورت خطا
     */
    readFileData: async function (fileSource) {
        // بررسی بارگذاری کتابخانه SheetJS
        if (typeof XLSX === 'undefined') {
            console.error("کتابخانه SheetJS (XLSX) بارگذاری نشده است.");
            Utils.showGlobalMessage("خطا: کتابخانه پردازش اکسل بارگذاری نشده است.", "error");
            return null;
        }

        try {
            let arrayBuffer;
            // دریافت فایل از URL یا خواندن از Blob
            if (typeof fileSource === 'string') { // اگر URL است
                const response = await fetch(fileSource);
                if (!response.ok) {
                    throw new Error(`خطا در دریافت فایل اکسل از سرور: ${response.statusText} (کد: ${response.status})`);
                }
                arrayBuffer = await response.arrayBuffer();
            } else { // اگر File یا Blob است (برای آپلود دستی توسط ادمین)
                arrayBuffer = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(new Error("خطا در خواندن فایل محلی."));
                    reader.readAsArrayBuffer(fileSource);
                });
            }

            const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, dataAnerkennung: true }); // dataAnerkennung برای خواندن فرمت‌های خاص
            const firstSheetName = workbook.SheetNames[0]; // فرض بر استفاده از اولین شیت
            if (!firstSheetName) {
                throw new Error("فایل اکسل هیچ شیتی ندارد یا خالی است.");
            }
            const worksheet = workbook.Sheets[firstSheetName];

            // خواندن مقادیر از سلول‌های F1, F2, F3
            const seranehVal = worksheet[AppConfig.SERANEH_CELL] ? worksheet[AppConfig.SERANEH_CELL].v : null;
            const prodDaysVal = worksheet[AppConfig.PRODUCTION_DAYS_CELL] ? worksheet[AppConfig.PRODUCTION_DAYS_CELL].v : null;
            // برای ماه، هم مقدار خام (v) و هم مقدار فرمت شده (w) را بررسی می‌کنیم
            const monthValRaw = worksheet[AppConfig.MONTH_CELL];
            const monthVal = monthValRaw ? (monthValRaw.w || String(monthValRaw.v)) : null;


            // ولیدیشن و تبدیل سرانه و روزهای تولید
            let seraneh = 0;
            if (seranehVal !== null && !isNaN(parseFloat(seranehVal)) && parseFloat(seranehVal) >= 0) {
                seraneh = Math.round(parseFloat(seranehVal)); // گرد کردن به نزدیک‌ترین عدد صحیح
            } else {
                console.warn(`مقدار سرانه (${AppConfig.SERANEH_CELL}=${seranehVal}) نامعتبر است. از 0 استفاده می‌شود.`);
            }

            let prodDays = 0;
            if (prodDaysVal !== null && !isNaN(parseFloat(prodDaysVal)) && parseFloat(prodDaysVal) >= 0) {
                prodDays = Math.round(parseFloat(prodDaysVal));
            } else {
                console.warn(`مقدار روزهای تولید (${AppConfig.PRODUCTION_DAYS_CELL}=${prodDaysVal}) نامعتبر است. از 0 استفاده می‌شود.`);
            }

            // ولیدیشن و تعیین نام ماه
            let monthName = "";
            if (monthVal && typeof monthVal === 'string' && PERSIAN_MONTH_NAMES.includes(monthVal.trim())) {
                monthName = monthVal.trim();
            } else {
                monthName = Utils.getCurrentPersianMonthName(); // مقدار پیش‌فرض
                if (monthVal && String(monthVal).trim() !== "") { // فقط اگر مقداری وجود داشته ولی نامعتبر بوده، هشدار بده
                    Utils.showGlobalMessage(`مقدار ماه در سلول ${AppConfig.MONTH_CELL} ('${monthVal}') نامعتبر یا خالی است. از ماه جاری سیستم (${monthName}) استفاده خواهد شد.`, 'warning', 7000);
                }
            }

            // خواندن داده‌های پرسنل
            // فرض بر این است که هدرها در ردیف اول هستند
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }); // تبدیل شیت به آرایه‌ای از آرایه‌ها، مقادیر خالی رشته خالی می‌شوند
            const employees = [];

            if (jsonData.length > 0 && jsonData[0].length > 0) { // بررسی وجود هدر
                const headerRow = jsonData[0].map(h => String(h).trim()); // تمیز کردن هدرها

                // پیدا کردن ایندکس ستون‌های مورد نیاز بر اساس نام‌های تعریف شده در AppConfig
                const deptColName = AppConfig.EMPLOYEE_DATA_COL_NAMES[0];
                const nameColName = AppConfig.EMPLOYEE_DATA_COL_NAMES[1];
                const idColName = AppConfig.EMPLOYEE_DATA_COL_NAMES[2];

                const deptColIndex = headerRow.indexOf(deptColName);
                const nameColIndex = headerRow.indexOf(nameColName);
                const idColIndex = headerRow.indexOf(idColName);

                if (deptColIndex === -1 || nameColIndex === -1 || idColIndex === -1) {
                    throw new Error(`یک یا چند ستون مورد نیاز ("${deptColName}", "${nameColName}", "${idColName}") در فایل اکسل یافت نشد. لطفاً هدرهای فایل را بررسی کنید.`);
                }

                // پردازش ردیف‌ها از ردیف دوم به بعد (ردیف اول هدر است)
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    // اطمینان از اینکه ردیف به اندازه کافی داده دارد
                    const deptNameFromFile = row[deptColIndex] ? String(row[deptColIndex]).trim() : null;
                    const empName = row[nameColIndex] ? String(row[nameColIndex]).trim() : null;
                    let empId = row[idColIndex] ? String(row[idColIndex]).trim() : null;

                    // فیلتر کردن پرسنل بر اساس واحد انتخاب شده فعلی در برنامه
                    // این کار برای هر دو حالت (به‌روزرسانی از سرور و وارد کردن دستی توسط ادمین) انجام می‌شود
                    if (deptNameFromFile && AppState.currentDepartmentShift &&
                        deptNameFromFile.toLowerCase() === AppState.currentDepartmentShift.toLowerCase()) {

                        if (empName && empId && empName !== "" && empId !== "") { // پرسنل با نام و کد معتبر
                            // پاکسازی کد پرسنلی اگر به صورت عدد با اعشار خوانده شده (مثلا "1234.0")
                            if (empId.includes('.') && !isNaN(parseFloat(empId))) {
                                empId = String(parseInt(parseFloat(empId), 10));
                            }

                            employees.push({
                                name: empName,
                                id: empId,
                                hours: 0, // ساعت اولیه صفر در نظر گرفته می‌شود
                                locked: false, // در ابتدا قفل نیست
                            });
                        }
                    }
                }
            } else {
                throw new Error("فایل اکسل خالی است یا هدر ندارد.");
            }

            if (employees.length === 0 && AppState.currentDepartmentShift) {
                // این یک هشدار است نه خطا، ممکن است فایل برای واحدهای دیگر باشد
                console.warn(`پرسنلی برای واحد "${AppState.currentDepartmentShift}" در فایل اکسل یافت نشد.`);
                Utils.showGlobalMessage(`پرسنلی برای واحد "${AppState.currentDepartmentShift}" در فایل اکسل یافت نشد.`, "warning", 7000);
            }

            return { seraneh, prodDays, monthName, employees };

        } catch (error) {
            console.error("خطا در خواندن و پردازش فایل اکسل:", error);
            Utils.showGlobalMessage(`خطا در پردازش فایل اکسل: ${error.message}`, "error", 10000);
            return null; // بازگرداندن null برای نشان دادن خطا در پردازش
        }
    },

    /**
     * ایجاد و دانلود فایل اکسل از داده‌های ارائه شده
     * @param {Array<object>} employeesData - آرایه‌ای از آبجکت‌های کارمندان برای شیت
     * @param {string} departmentName - نام واحد فعلی (برای نام شیت و نام فایل)
     * @param {string} monthNameForFile - نام ماه برای استفاده در نام فایل و ستون "ماه"
     * @param {string} [fileNamePrefix="Overtime_Export"] - پیشوند برای نام فایل
     */
    exportToExcel: function (employeesData, departmentName, monthNameForFile, fileNamePrefix = "Overtime_Export") {
        if (typeof XLSX === 'undefined') {
            console.error("کتابخانه SheetJS (XLSX) بارگذاری نشده است.");
            Utils.showGlobalMessage("خطا: کتابخانه پردازش اکسل بارگذاری نشده است.", "error");
            return;
        }
        if (!employeesData || employeesData.length === 0) {
            Utils.showGlobalMessage("داده‌ای برای خروجی اکسل وجود ندارد.", "warning");
            return;
        }

        // آماده‌سازی داده‌ها برای شیت با هدرهای فارسی
        const exportData = employeesData.map(emp => ({
            [AppConfig.EMPLOYEE_DATA_COL_NAMES[0]]: departmentName, // "نام واحد"
            [AppConfig.EMPLOYEE_DATA_COL_NAMES[1]]: emp.name,       // "نام پرسنل"
            [AppConfig.EMPLOYEE_DATA_COL_NAMES[2]]: emp.id,         // "کد پرسنلی"
            "ساعت اضافه کاری": emp.hours,
            "ماه": monthNameForFile // ستون "ماه" با نام ماه تخصیص یافته
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        // نام شیت نمی‌تواند کاراکترهای خاص داشته باشد و طول آن محدود است
        const safeSheetName = departmentName.replace(/[\\/*?[\]:]/g, "").substring(0, 30);
        XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName || "Sheet1");

        // ایجاد نام فایل
        const dateStr = new Date().toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '-'); // تاریخ شمسی YY-MM-DD
        let safeDeptNameForFile = departmentName.replace(/[\\/*?"<>|:]/g, '_'); // پاکسازی کاراکترهای نامعتبر
        let safeMonthNameForFile = monthNameForFile.replace(/[\\/*?"<>|:]/g, '_');
        const fileName = `${fileNamePrefix}_${safeDeptNameForFile}_${safeMonthNameForFile}_${dateStr}.xlsx`;

        XLSX.writeFile(workbook, fileName); // ایجاد و دانلود فایل
        Utils.showGlobalMessage("فایل اکسل با موفقیت برای دانلود آماده شد.", "success");
    }
};
