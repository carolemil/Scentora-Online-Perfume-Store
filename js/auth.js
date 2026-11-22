// EMAIL FORMAT VALIDATION
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
}


// ==========================================
// 1. LOGIN PAGE LOGIC (login.html)
// ==========================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!email || !password) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent = "Please enter your email and password.";
            return;
        }

        if (!isValidEmail(email)) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent = "Please enter a valid email address (e.g. name@example.com).";
            emailInput.focus();
            return;
        }

        const users = JSON.parse(localStorage.getItem("scentoraDemoUsers") || "[]");
        const foundUser = users.find(u => u.email.toLowerCase() === email);

        if (foundUser) {
            // Email IS recognized -> log in and send straight to shop.html
            localStorage.setItem("scentoraCurrentUser", JSON.stringify({
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role || "customer"
            }));

            loginMessage.style.color = "#63846A";
            loginMessage.textContent = `Welcome back, ${foundUser.name}! Redirecting to shop...`;

            setTimeout(() => {
                window.location.href = "shop.html";
            }, 900);
        } else {
            // Email is NOT recognized -> tell them to create an account and redirect to register.html
            loginMessage.style.color = "#A74636";
            loginMessage.textContent = "No account found with this email. Please create an account...";

            sessionStorage.setItem("pendingRegisterEmail", email);

            setTimeout(() => {
                window.location.href = "register.html";
            }, 1300);
        }
    });
}


// ==========================================
// 2. REGISTER PAGE LOGIC (register.html)
// ==========================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    const regName = document.getElementById("regName");
    const regEmail = document.getElementById("regEmail");
    const regPassword = document.getElementById("regPassword");
    const regConfirmPassword = document.getElementById("regConfirmPassword");
    const registerMessage = document.getElementById("registerMessage");

    const pendingEmail = sessionStorage.getItem("pendingRegisterEmail");
    if (pendingEmail) {
        regEmail.value = pendingEmail;
        sessionStorage.removeItem("pendingRegisterEmail");
    }

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = regName.value.trim();
        const email = regEmail.value.trim().toLowerCase();
        const password = regPassword.value;
        const confirmPassword = regConfirmPassword.value;

        if (!name || !email || !password || !confirmPassword) {
            registerMessage.style.color = "#A74636";
            registerMessage.textContent = "Please fill in all fields.";
            return;
        }

        if (!isValidEmail(email)) {
            registerMessage.style.color = "#A74636";
            registerMessage.textContent = "Please enter a valid email address (e.g. name@example.com).";
            regEmail.focus();
            return;
        }

        if (password !== confirmPassword) {
            registerMessage.style.color = "#A74636";
            registerMessage.textContent = "Passwords do not match.";
            return;
        }

        const users = JSON.parse(localStorage.getItem("scentoraDemoUsers") || "[]");
        const alreadyExists = users.some(u => u.email.toLowerCase() === email);

        if (alreadyExists) {
            registerMessage.style.color = "#A74636";
            registerMessage.textContent = "This email is already registered. Redirecting to login...";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: password,
            role: "customer"
        };

        users.push(newUser);
        localStorage.setItem("scentoraDemoUsers", JSON.stringify(users));
        localStorage.setItem("scentoraCurrentUser", JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }));

        registerMessage.style.color = "#63846A";
        registerMessage.textContent = `Account created! Welcome, ${name}. Redirecting to shop...`;

        setTimeout(() => {
            window.location.href = "shop.html";
        }, 1000);
    });
}
// ==========================================
// 3. ADMIN LOGIN LOGIC (admin-login.html)
// ==========================================
const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    const adminEmailInput = document.getElementById("adminEmail");
    const adminPasswordInput = document.getElementById("adminPassword");
    const adminLoginMessage = document.getElementById("adminLoginMessage");
    const toggleAdminPassword = document.getElementById("toggleAdminPassword");

    if (toggleAdminPassword) {
        toggleAdminPassword.addEventListener("click", function () {
            adminPasswordInput.type = adminPasswordInput.type === "password" ? "text" : "password";
        });
    }

    adminLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = adminEmailInput.value.trim().toLowerCase();
        const password = adminPasswordInput.value;

        if (!email || !password) {
            adminLoginMessage.style.color = "#A74636";
            adminLoginMessage.textContent = "Please enter the admin email and password.";
            return;
        }

        // Preset Admin Credentials
        if (email === "admin@gmail.com" && password === "admin123") {
            sessionStorage.setItem("scentoraAdminLoggedIn", "true");

            adminLoginMessage.style.color = "#63846A";
            adminLoginMessage.textContent = "Access granted. Opening Admin Dashboard...";

            setTimeout(() => {
                window.location.href = "admin.html";
            }, 800);
        } else {
            adminLoginMessage.style.color = "#A74636";
            adminLoginMessage.textContent = "Invalid admin email or password.";
        }
    });
}