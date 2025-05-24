// js/auth.js

const Auth = {
    DEFAULT_USERS: {}, // Will be populated by initializeUsers

    /**
     * Initializes the DEFAULT_USERS object by hashing plaintext passwords from config.js.
     * This function should be called once at application startup.
     */
    initializeUsers: async function () {
        // Admin user
        const adminHashedPassword = await Utils.hashPassword(DEFAULT_ADMIN_PASSWORD_PLAINTEXT);
        this.DEFAULT_USERS["admin"] = {
            password: adminHashedPassword,
            role: "admin",
            department: "all"
        };

        // Department head users
        const revMap = {};
        for (const persianName in DEPT_ENGLISH_MAP) {
            revMap[DEPT_ENGLISH_MAP[persianName]] = persianName;
        }

        for (const userEngName in FIXED_CREDENTIALS_PLAINTEXT) {
            const plainPassword = FIXED_CREDENTIALS_PLAINTEXT[userEngName];
            const hashedInputPassword = await Utils.hashPassword(plainPassword);
            const departmentPersianName = revMap[userEngName];
            if (departmentPersianName) {
                this.DEFAULT_USERS[userEngName] = {
                    password: hashedInputPassword,
                    role: "department_head",
                    department: departmentPersianName
                };
            }
        }
        // console.log("Initialized DEFAULT_USERS:", this.DEFAULT_USERS);
    },

    /**
     * Attempts to log in a user.
     * @param {string} username
     * @param {string} password
     * @returns {Promise<boolean>} True if login is successful, false otherwise.
     */
    login: async function (username, password) {
        if (!username || !password) {
            // console.warn("Username or password empty during login attempt.");
            return false;
        }

        const user = this.DEFAULT_USERS[username.trim()];
        if (user) {
            const hashedInputPassword = await Utils.hashPassword(password);
            if (hashedInputPassword === user.password) {
                AppState.currentUser = {
                    username: username.trim(),
                    role: user.role,
                    department: user.department
                };
                AppState.isLoggedIn = true;
                return true;
            }
        }
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        return false;
    },

    saveLoginState: function (username, password, rememberMe) {
        if (rememberMe) {
            localStorage.setItem('overtimeAppUser', JSON.stringify({ username, password })); // Storing plain password if "remember me"
            localStorage.setItem('overtimeAppRememberMe', 'true');
        } else {
            localStorage.removeItem('overtimeAppUser');
            localStorage.setItem('overtimeAppRememberMe', 'false');
        }
    },

    loadLoginState: function () {
        const rememberMe = localStorage.getItem('overtimeAppRememberMe') === 'true';
        if (rememberMe) {
            const userDataString = localStorage.getItem('overtimeAppUser');
            if (userDataString) {
                try {
                    return JSON.parse(userDataString); // { username, password }
                } catch (e) {
                    console.error("Error parsing saved user data:", e);
                    return null;
                }
            }
        }
        return null;
    },

    clearLoginState: function () {
        localStorage.removeItem('overtimeAppUser');
        localStorage.removeItem('overtimeAppRememberMe');
        // Do NOT clear Auth.DEFAULT_USERS here
    },

    checkPersistedLogin: async function () {
        const savedCredentials = this.loadLoginState();
        if (savedCredentials && savedCredentials.username && savedCredentials.password) {
            const loginSuccess = await this.login(savedCredentials.username, savedCredentials.password);
            if (loginSuccess) {
                // console.log(`Persisted login successful for user: ${savedCredentials.username}`);
                AppState.isLoggedIn = true; // Already set by Auth.login
                // AppState.currentUser is also already set
            } else {
                // console.log("Persisted login failed, clearing saved state.");
                this.clearLoginState(); // Clear invalid saved credentials
                AppState.isLoggedIn = false;
                AppState.currentUser = null;
            }
        } else {
            AppState.isLoggedIn = false;
            AppState.currentUser = null;
        }
    }
};