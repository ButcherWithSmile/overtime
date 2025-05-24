// js/config.js

// ماه‌های فارسی
const PERSIAN_MONTH_NAMES = [
    "فروردین", "اردیبهشت", "خرداد", "تیر",
    "مرداد", "شهریور", "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
];

// رمز عبور پیش‌فرض ادمین (به صورت متن ساده، در auth.js هش می‌شود)
const DEFAULT_ADMIN_PASSWORD_PLAINTEXT = "Admin@1371";

// لیست واحدهای پایه
const BASE_DEPARTMENTS = [
    "انبار", "حراست", "برق", "تولید", "تأسیسات", "مکانیک",
    "سرمایه های انسانی", "کنترل کیفیت", "تراشکاری", "نت", "مهندسی سیستم",
    "فناوری اطلاعات", "برنامه ریزی", "مدیریت", "فروش", "دفتر فنی",
    "تدارکات", "مالی", "HSE", "فنی مهندسی",
    "رؤسا و سرپرستان فنی مهندسی", "مدیران و رؤسا"
];

// نگاشت نام فارسی واحدها به نام انگلیسی (برای نام کاربری)
const DEPT_ENGLISH_MAP = {
    "انبار": "warehouse", "حراست": "security", "برق": "electrical",
    "تولید": "production", "تأسیسات": "facilities", "مکانیک": "mechanical",
    "سرمایه های انسانی": "hr", "کنترل کیفیت": "qc", "تراشکاری": "machining",
    "نت": "maintenance", "مهندسی سیستم": "se", "فناوری اطلاعات": "it",
    "برنامه ریزی": "planning", "مدیریت": "management", "فروش": "sales",
    "دفتر فنی": "technicaloffice", "تدارکات": "logistics", "مالی": "finance",
    "HSE": "hse", "فنی مهندسی": "technicalengineering",
    "رؤسا و سرپرستان فنی مهندسی": "technicalengineeringheads",
    "مدیران و رؤسا": "managersandheads"
};

// رمز عبور پیش‌فرض برای واحد فنی مهندسی
const TECH_ENG_PASSWORD_PLAINTEXT = "Technicalengineering@5432";

// رمزهای عبور پیش‌فرض برای سایر واحدها (به صورت متن ساده)
const FIXED_CREDENTIALS_PLAINTEXT = {
    "warehouse": "Warehouse@8902", "security": "Security@6285",
    "electrical": "Electrical@3937", "production": "Production@1427",
    "facilities": "Facilities@1121", "mechanical": "Mechanical@4451",
    "hr": "Hr@9610", "qc": "Qc@4673", "machining": "Machining@5110",
    "maintenance": "Maintenance@1064", "se": "Se@9743", "it": "It@1277",
    "planning": "Planning@4595", "management": "Management@6643",
    "sales": "Sales@2817", "technicaloffice": "Technicaloffice@3668",
    "logistics": "Logistics@7677", "finance": "Finance@3115",
    "hse": "Hse@4011", "technicalengineering": TECH_ENG_PASSWORD_PLAINTEXT
};

// شیفت‌های موجود برای هر واحد
const DEPARTMENT_SHIFTS = {
    "انبار": ["شیفتی", "ثابت"], "حراست": ["نگهبانی", "باسکول"], "برق": ["شیفتی", "ثابت"],
    "تولید": ["شیفتی", "ثابت"], "تأسیسات": ["شیفتی", "ثابت"], "مکانیک": ["شیفتی", "ثابت"],
    "سرمایه های انسانی": ["شیفتی", "ثابت"], "کنترل کیفیت": ["شیفتی", "ثابت"],
    "تراشکاری": ["شیفتی"], "نت": ["ثابت"], "مهندسی سیستم": ["ثابت"],
    "فناوری اطلاعات": ["ثابت"], "برنامه ریزی": ["ثابت"], "مدیریت": ["ثابت"],
    "فروش": ["ثابت"], "دفتر فنی": ["ثابت"], "تدارکات": ["ثابت"], "مالی": ["ثابت"],
    "HSE": ["شیفتی", "ثابت"], "فنی مهندسی": ["ثابت"], // فنی مهندسی خودش یک واحد است، شیفت‌های زیرمجموعه‌ها جدا هستند
    "رؤسا و سرپرستان فنی مهندسی": ["ثابت"], "مدیران و رؤسا": ["ثابت"],
};

// لیست تمام واحدهای قابل مدیریت (نام واحد - شیفت)
const MANAGEABLE_DEPARTMENTS = Object.entries(DEPARTMENT_SHIFTS)
    .flatMap(([dept, shifts]) => shifts.map(shift => `${dept} - ${shift}`))
    .sort((a, b) => a.localeCompare(b, 'fa')); // مرتب‌سازی فارسی

// لینک‌های پیش‌فرض دانلود فایل اکسل از فضای ابری
// این لینک‌ها باید معتبر و قابل دسترس باشند و فایل‌های اکسل در آن‌ها فرمت صحیح داشته باشند.
const DEFAULT_CLOUD_LINKS = {
    "HSE - ثابت": "https://www.dropbox.com/scl/fi/uz8v8xod2b3nspp40ig22/HSE.xlsx?rlkey=kurdpxgn77yt71fc99ab0ztbn&st=s4f31k91&dl=1",
    "HSE - شیفتی": "https://www.dropbox.com/scl/fi/4hcrwqnlhz3r6qpwtqxf6/HSE.xlsx?rlkey=5638e5620q3yny6nxzz8kyegt&st=ztk0c4o1&dl=1",
    "انبار - ثابت": "https://www.dropbox.com/scl/fi/vqx5fcxut5ukrg8n59b7r/.xlsx?rlkey=7m9ra6721ejxr5gmxfyvn7c4w&st=q7sp1mkb&dl=1",
    "انبار - شیفتی": "https://www.dropbox.com/scl/fi/83jvetdkjbdavrpgxuuzf/.xlsx?rlkey=ilyqwp1b2m5u8uyjsgu7sj7oi&st=bou3utxh&dl=1",
    "برق - ثابت": "https://www.dropbox.com/scl/fi/n7j8j6j1sztuz4ss93947/.xlsx?rlkey=i9ugkmqco93ief8nmtf768yxz&st=usnodlzk&dl=1",
    "برق - شیفتی": "https://www.dropbox.com/scl/fi/l6h1apicjk1qs7j2zarqa/.xlsx?rlkey=rfchg32cu7uqypa5r0dkoybmr&st=716399r4&dl=1",
    "برنامه ریزی - ثابت": "https://www.dropbox.com/scl/fi/oq2ujnmyw1trcqdz0gdcl/.xlsx?rlkey=80dq5hsdm5ydbznqnasuzarz6&st=43j83har&dl=1",
    "تأسیسات - ثابت": "https://www.dropbox.com/scl/fi/lubjun2xome8d3w8tp4ud/.xlsx?rlkey=uz863syg7ozuydjr7gsfu1iv7&st=vdx426xb&dl=1",
    "تأسیسات - شیفتی": "https://www.dropbox.com/scl/fi/1cckasqzcjbw8ssejq4co/.xlsx?rlkey=22q5hq59mh6o6a64b64hnzw8b&st=9r0t1vd5&dl=1",
    "تدارکات - ثابت": "https://www.dropbox.com/scl/fi/tfdz2raj0o5x8u5p4g3w1/.xlsx?rlkey=jw0pvqivfbrjug4hq6p4fof6e&st=t5gr3ckk&dl=1",
    "تراشکاری - شیفتی": "https://www.dropbox.com/scl/fi/qr86gs3sy5gygk6umz5ia/.xlsx?rlkey=li15y9of59sluh24gu07jife5&st=h21uqpmx&dl=1",
    "تولید - ثابت": "https://www.dropbox.com/scl/fi/yac03wrvmbj57y7fxoqxa/.xlsx?rlkey=b5xrph5wyiqfefnclrwe5hlqh&st=yaqpffap&dl=1",
    "تولید - شیفتی": "https://www.dropbox.com/scl/fi/su5mfci3vffy67ff2hw8q/.xlsx?rlkey=mf7rm5wnrkmi0ln134oorq97v&st=ybj4sekv&dl=1",
    "حراست - باسکول": "https://www.dropbox.com/scl/fi/k3j9bfxvyf23pddpjwhth/.xlsx?rlkey=n8dci36keg39z2end29zat3xn&st=zb44p9am&dl=1",
    "حراست - نگهبانی": "https://www.dropbox.com/scl/fi/t0j83yhufqfc3yp5jvff0/.xlsx?rlkey=a1y6mnfxdzgzzwcrn1lx4h9u3&st=fa6gykfk&dl=1",
    "دفتر فنی - ثابت": "https://www.dropbox.com/scl/fi/311z8v1g1shwi3wgl3xid/.xlsx?rlkey=6wbhxyn2js7zyqk5zhyankc5j&st=divym8y6&dl=1",
    "سرمایه های انسانی - ثابت": "https://www.dropbox.com/scl/fi/v9bbm1o2m6hj8n4ttmps3/.xlsx?rlkey=attthzg6k97o98gh54igvuefz&st=iegplzkp&dl=1",
    "سرمایه های انسانی - شیفتی": "https://www.dropbox.com/scl/fi/ew6pnfoefm38qy6e9ypcx/.xlsx?rlkey=s1hbtwczj4q7rp7g9mgve5dp6&st=olbi7qwz&dl=1",
    "فروش - ثابت": "https://www.dropbox.com/scl/fi/rvvu738ofwvc1pjj1ku9f/.xlsx?rlkey=oe1njddo56hjy8elu2yc6icyx&st=x98ozrhd&dl=1",
    "فناوری اطلاعات - ثابت": "https://www.dropbox.com/scl/fi/5mlufhahpx64je30xkimu/.xlsx?rlkey=ptbdzbhjawo8u0wvlz71zzsm0&st=m84fe689&dl=1",
    "مالی - ثابت": "https://www.dropbox.com/scl/fi/wz0gew1bh55p4gytj96w7/.xlsx?rlkey=nfzmhgwdjumdmtupst0ifwlql&st=94ibnjxt&dl=1",
    "مدیریت - ثابت": "https://www.dropbox.com/scl/fi/zn2dvntweuvgd3smv2xg1/.xlsx?rlkey=eyplw9k9log4x73prsel6hf6u&st=4as4jzx2&dl=1",
    "مهندسی سیستم - ثابت": "https://www.dropbox.com/scl/fi/3wh7xqof5pfn5uxko5y8b/.xlsx?rlkey=mmsn3vql9qx9imy9c3d3wj1sy&st=dj6loggm&dl=1",
    "مکانیک - ثابت": "https://www.dropbox.com/scl/fi/ce2tfb2j0o7b8bmr2ncqg/.xlsx?rlkey=jgdi7fy8vaawk1dfxskv15dye&st=08gzspx4&dl=1",
    "مکانیک - شیفتی": "https://www.dropbox.com/scl/fi/gayc7gqzvywtkc3fg64ps/.xlsx?rlkey=g2gsd1hxayf6dydd8z4w46nr7&st=8sxnc35i&dl=1",
    "نت - ثابت": "https://www.dropbox.com/scl/fi/d3147tnmuhnuqmbj6barz/.xlsx?rlkey=2aevhetyv13g94n6ae492xmb8&st=hv61h4w1&dl=1",
    "کنترل کیفیت - ثابت": "https://www.dropbox.com/scl/fi/idi7tsdf95slnmqklv5mn/.xlsx?rlkey=m37s1o7n28dp0dnw7rdc20wt5&st=i0wnj85u&dl=1",
    "کنترل کیفیت - شیفتی": "https://www.dropbox.com/scl/fi/wsccgz63ae15ae6yew35g/.xlsx?rlkey=bxl7exds5qde0z36u5m8bfaym&st=42kjnrnq&dl=1",
    "مدیران و رؤسا - ثابت": "https://www.dropbox.com/scl/fi/8hjcam51yyp8skhpy00ed/.xlsx?rlkey=m7z95smqkpataqfwk1wwnfqxm&st=v7b1i59x&dl=1",
    "رؤسا و سرپرستان فنی مهندسی - ثابت": "https://www.dropbox.com/scl/fi/9db4lb2mvgsuehv504aud/.xlsx?rlkey=rn996b0nyujhqlc2en2rnqnx8&st=mbgkequk&dl=1",
    // "فنی مهندسی - ثابت"  ممکن است لینک مستقلی داشته باشد یا از طریق زیرمجموعه‌ها مدیریت شود.
    // اگر لینک مستقلی دارد، اینجا اضافه شود.
};

// تنظیمات برنامه (آدرس سلول‌ها و نام ستون‌ها در اکسل)
const AppConfig = {
    SERANEH_CELL: "F1", // سلول حاوی سرانه کل
    PRODUCTION_DAYS_CELL: "F2", // سلول حاوی تعداد روزهای تولید
    MONTH_CELL: "F3", // سلول حاوی نام ماه تخصیص
    // ایندکس ستون‌ها (0-based) برای خواندن از اکسل (ستون A, B, C)
    EMPLOYEE_DATA_COLS_INDICES: [0, 1, 2],
    // نام ستون‌ها برای هدر و پردازش داده‌ها
    EMPLOYEE_DATA_COL_NAMES: ["نام واحد", "نام پرسنل", "کد پرسنلی"]
};
