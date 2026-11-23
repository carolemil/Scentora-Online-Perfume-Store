
document.addEventListener("DOMContentLoaded", function () {

    const USERS_KEY = "scentoraDemoUsers";
    const CURRENT_USER_KEY = "scentoraCurrentUser";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function showError(id, message) {
        const element = document.getElementById(id);
        if (element) element.textContent = message;
    }

    function clearErrors(ids) {
        ids.forEach(id => showError(id, ""));
    }

    function setMessage(id, message, success = false) {
        const element = document.getElementById(id);
        if (!element) return;

        element.textContent = message;
        element.style.color = success ? "#63846A" : "#A74636";
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validPhone(phone) {
        return /^(01[0125][0-9]{8}|\+201[0125][0-9]{8})$/.test(phone);
    }

    function validName(name) {
        return /^[A-Za-zÀ-ÿ\s'-]{2,30}$/.test(name);
    }

    function validPassword(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password);
    }

    async function hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(salt + password);
        const hash = await crypto.subtle.digest("SHA-256", data);

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function makeSalt() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    function togglePassword(buttonId, inputId) {
        const button = document.getElementById(buttonId);
        const input = document.getElementById(inputId);

        if (!button || !input) return;

        button.addEventListener("click", function () {
            const hidden = input.type === "password";
            input.type = hidden ? "text" : "password";
            button.textContent = hidden ? "Hide" : "Show";
        });
    }

    togglePassword("toggleLoginPassword", "loginPassword");
    togglePassword("toggleRegPassword", "regPassword");
    togglePassword("toggleConfirmPassword", "regConfirmPassword");

    /* REGISTRATION */

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        const passwordInput = document.getElementById("regPassword");
        const strengthBar = document.getElementById("strengthBar");
        const strengthText = document.getElementById("strengthText");

        passwordInput.addEventListener("input", function () {
            const password = passwordInput.value;
            let score = 0;

            if (password.length >= 8) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;

            const levels = [
                { width: "0%", text: "Password strength" },
                { width: "20%", text: "Very weak" },
                { width: "40%", text: "Weak" },
                { width: "60%", text: "Fair" },
                { width: "80%", text: "Good" },
                { width: "100%", text: "Strong" }
            ];

            strengthBar.style.width = levels[score].width;
            strengthText.textContent = levels[score].text;
        });

        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const firstName = document.getElementById("regFirstName").value.trim();
            const lastName = document.getElementById("regLastName").value.trim();
            const email = document.getElementById("regEmail").value.trim().toLowerCase();
            const phone = document.getElementById("regPhone").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;
            const accepted = document.getElementById("acceptTerms").checked;

            clearErrors([
                "firstNameError",
                "lastNameError",
                "emailError",
                "phoneError",
                "passwordError",
                "confirmPasswordError",
                "termsError"
            ]);

            setMessage("registerMessage", "");

            let valid = true;

            if (!validName(firstName)) {
                showError("firstNameError", "Enter a valid first name.");
                valid = false;
            }

            if (!validName(lastName)) {
                showError("lastNameError", "Enter a valid last name.");
                valid = false;
            }

            if (!validEmail(email)) {
                showError("emailError", "Enter a valid email address.");
                valid = false;
            }

            if (!validPhone(phone)) {
                showError("phoneError", "Enter a valid Egyptian phone number.");
                valid = false;
            }

            if (!validPassword(password)) {
                showError("passwordError", "Use 8+ characters, uppercase, lowercase and a number.");
                valid = false;
            }

            if (password !== confirmPassword) {
                showError("confirmPasswordError", "Passwords do not match.");
                valid = false;
            }

            if (!accepted) {
                showError("termsError", "Please accept the Terms & Conditions.");
                valid = false;
            }

            if (!valid) return;

            const users = getUsers();

            if (users.some(user => user.email && user.email.toLowerCase() === email)) {
                showError("emailError", "This email is already registered.");
                return;
            }

            try {
                const salt = makeSalt();
                const passwordHash = await hashPassword(password, salt);

                const newUser = {
                    id: Date.now(),
                    firstName,
                    lastName,
                    name: firstName + " " + lastName,
                    email,
                    phone,
                    salt,
                    passwordHash,
                    role: "customer",
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                saveUsers(users);

                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }));

                setMessage("registerMessage", "Account created successfully! Redirecting...", true);

                document.getElementById("registerButton").disabled = true;

                setTimeout(() => {
                    window.location.href = "shop.html";
                }, 1200);

            } catch (error) {
                setMessage("registerMessage", "Something went wrong. Please try again.");
                console.error(error);
            }
        });
    }

    /* LOGIN */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            clearErrors(["loginEmailError", "loginPasswordError"]);
            setMessage("loginMessage", "");

            let valid = true;

            if (!validEmail(email)) {
                showError("loginEmailError", "Enter a valid email address.");
                valid = false;
            }

            if (!password) {
                showError("loginPasswordError", "Please enter your password.");
                valid = false;
            }

            if (!valid) return;

            const users = getUsers();
            const user = users.find(item => item.email && item.email.toLowerCase() === email);

            if (!user) {
                setMessage("loginMessage", "No account found with this email.");
                return;
            }

            try {
                let passwordMatches = false;

                if (user.passwordHash && user.salt) {
                    const hash = await hashPassword(password, user.salt);
                    passwordMatches = hash === user.passwordHash;
                } else if (user.password) {
                    passwordMatches = user.password === password;

                    if (passwordMatches) {
                        const salt = makeSalt();
                        user.salt = salt;
                        user.passwordHash = await hashPassword(password, salt);
                        delete user.password;
                        saveUsers(users);
                    }
                }

                if (!passwordMatches) {
                    setMessage("loginMessage", "Incorrect email or password.");
                    return;
                }

                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
                    id: user.id,
                    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                    email: user.email,
                    role: user.role || "customer"
                }));

                setMessage("loginMessage", "Welcome back! Redirecting...", true);

                document.getElementById("loginButton").disabled = true;

                setTimeout(() => {
                    window.location.href = user.role === "admin" ? "admin.html" : "shop.html";
                }, 1000);

            } catch (error) {
                setMessage("loginMessage", "Login failed. Please try again.");
                console.error(error);
            }
        });
    }

    /* FORGOT PASSWORD */

    const forgotButton = document.getElementById("forgotPassword");

    if (forgotButton) {
        forgotButton.addEventListener("click", function () {
            const email = document.getElementById("loginEmail").value.trim();

            if (!email || !validEmail(email)) {
                setMessage("loginMessage", "Enter your email address first.");
                return;
            }

            setMessage("loginMessage", "Password reset requires a connected email service.");
        });
    }

    /* SOCIAL LOGIN PLACEHOLDERS */

    const googleButton = document.getElementById("googleLogin");
    const appleButton = document.getElementById("appleLogin");

    if (googleButton) {
        googleButton.addEventListener("click", () => {
            alert("Google login requires OAuth configuration.");
        });
    }

    if (appleButton) {
        appleButton.addEventListener("click", () => {
            alert("Apple login requires OAuth configuration.");
        });
    }

});
