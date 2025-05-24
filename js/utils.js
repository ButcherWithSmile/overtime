// js/utils.js

const Utils = {
    /**
     * هش کردن رمز عبور با استفاده از SHA-256 به صورت ناهمزمان
     * @param {string} password - رشته رمز عبور برای هش شدن
     * @returns {Promise<string>} یک Promise که با رشته هش شده (hex) resolve می‌شود
     */
    hashPassword: async function (password) {
        if (typeof password !== 'string' || password.length === 0) {
            // در یک برنامه واقعی، بهتر است خطا throw شود یا مدیریت خطای بهتری انجام شود
            console.warn("رمز عبور برای هش کردن نمی‌تواند خالی یا غیر رشته‌ای باشد.");
            return '';
        }
        try {
            const encoder = new TextEncoder(); // برای تبدیل رشته به بایت UTF-8
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data); // API مرورگر برای هش
            const hashArray = Array.from(new Uint8Array(hashBuffer)); // تبدیل بافر به آرایه بایت
            // تبدیل آرایه بایت به رشته هگزادسیمال
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error("خطا در هش کردن رمز عبور:", error);
            // در یک برنامه واقعی، این خطا باید به کاربر اطلاع داده شود یا لاگ شود
            throw error; // خطا را مجدداً ارسال می‌کنیم تا توسط فراخواننده مدیریت شود
        }
    },

    /**
     * دریافت نام ماه شمسی فعلی با استفاده از کتابخانه Moment.js و Moment-jalaali
     * @returns {string} نام ماه شمسی فعلی (مثال: "فروردین")
     */
    getCurrentPersianMonthName: function () {
        // اطمینان از بارگذاری کتابخانه‌ها
        if (typeof moment === 'undefined' || typeof moment.fn.jMonths !== 'function') {
            console.warn("کتابخانه‌های moment.js یا moment-jalaali.js بارگذاری نشده‌اند. از ماه پیش‌فرض استفاده می‌شود.");
            return PERSIAN_MONTH_NAMES[0]; // استفاده از اولین ماه در لیست پیش‌فرض (از config.js)
        }
        try {
            const jDate = moment(); // تاریخ و زمان فعلی
            const monthIndex = jDate.jMonth(); // ایندکس ماه شمسی (0 تا 11)
            return PERSIAN_MONTH_NAMES[monthIndex] || PERSIAN_MONTH_NAMES[0]; // بازگرداندن نام ماه یا مقدار پیش‌فرض
        } catch (e) {
            console.error("خطا در دریافت نام ماه شمسی:", e);
            return PERSIAN_MONTH_NAMES[0]; // بازگرداندن مقدار پیش‌فرض در صورت خطا
        }
    },

    /**
     * تبدیل لینک اشتراک‌گذاری Dropbox به لینک دانلود مستقیم
     * @param {string} link - لینک اشتراک‌گذاری Dropbox
     * @returns {string} لینک دانلود مستقیم یا لینک اصلی در صورت عدم تطابق
     */
    convertToDownloadLink: function (link) {
        if (!link || typeof link !== 'string') return "";
        let dl = link.trim();
        // برای لینک‌های نوع /s/
        if (dl.includes("dropbox.com/s/")) {
            dl = dl.replace("www.dropbox.com", "dl.dropboxusercontent.com"); // تغییر دامنه
            // اطمینان از وجود dl=1 برای دانلود مستقیم
            if (dl.includes("?") && !dl.includes("dl=")) {
                dl += "&dl=1";
            } else if (!dl.includes("?")) {
                dl += "?dl=1";
            } else { // اگر dl=0 وجود دارد، آن را به dl=1 تغییر بده
                dl = dl.replace("dl=0", "dl=1");
            }
        }
        // برای لینک‌های نوع /scl/ (لینک‌های جدیدتر Dropbox)
        else if (dl.includes("dropbox.com/scl/")) {
            // این نوع لینک‌ها معمولاً پارامترهای rlkey و st دارند.
            // فقط کافیست dl=1 اضافه شود یا اگر dl=0 هست، به dl=1 تغییر یابد.
            if (!dl.includes("dl=1")) {
                dl = dl.replace("?dl=0", "").replace("&dl=0", ""); // حذف dl=0 اگر وجود دارد
                // اضافه کردن dl=1 با توجه به وجود یا عدم وجود '?'
                dl += (dl.includes('?') ? "&dl=1" : "?dl=1");
                // پاکسازی && یا ?& اضافی
                dl = dl.replace('&&', '&').replace('?&', '?');
            }
        }
        // اگر لینک از نوع شناخته شده Dropbox نباشد، خود لینک را برمی‌گرداند
        return dl;
    },

    /**
     * نمایش یک پیام گلوبال (toast notification) به کاربر
     * @param {string} message - متن پیام
     * @param {string} type - نوع پیام ('info', 'success', 'warning', 'error')
     * @param {number} duration - مدت زمان نمایش پیام به میلی‌ثانیه
     */
    showGlobalMessage: function (message, type = 'info', duration = 5000) {
        let messageContainer = document.getElementById('global-message-container');
        // اگر کانتینر وجود ندارد، آن را ایجاد کن
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'global-message-container';
            // استایل‌های این کانتینر باید در style.css تعریف شده باشند
            document.body.appendChild(messageContainer);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `global-message global-message-${type}`; // کلاس‌ها برای استایل‌دهی
        messageDiv.textContent = message;

        messageContainer.appendChild(messageDiv); // اضافه کردن پیام به کانتینر

        // حذف پیام پس از مدت زمان مشخص شده
        setTimeout(() => {
            // انیمیشن محو شدن قبل از حذف (اختیاری، می‌تواند با CSS مدیریت شود)
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode === messageContainer) { // بررسی اینکه هنوز فرزند است
                    messageContainer.removeChild(messageDiv);
                }
            }, 300); // زمان برای انیمیشن محو شدن
        }, duration);
    }
};
