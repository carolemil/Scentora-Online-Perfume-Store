
const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");
const togglePassword = document.getElementById("togglePassword");


// EMAIL VALIDATION
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
}


// PASSWORD VALIDATION
function validatePassword(password) {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
}


// PASSWORD HASHING
async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// SHOW / HIDE PASSWORD
togglePassword.addEventListener("click", function () {
    const hidden = passwordInput.type === "password";

    passwordInput.type = hidden ? "text" : "password";

    togglePassword.setAttribute(
        "aria-label",
        hidden ? "Hide password" : "Show password"
    );
});


// CLEAR ERRORS WHILE TYPING
emailInput.addEventListener("input", function () {
    emailError.textContent = "";
    emailInput.closest(".input-field").classList.remove("input-invalid");
});

passwordInput.addEventListener("input", function () {
    passwordError.textContent = "";
    passwordInput.closest(".input-field").classList.remove("input-invalid");
});


// LOGIN
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";

    emailInput.closest(".input-field").classList.remove("input-invalid");
    passwordInput.closest(".input-field").classList.remove("input-invalid");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let valid = true;

    if (!email) {
        emailError.textContent = "Please enter your email address.";
        emailInput.closest(".input-field").classList.add("input-invalid");
        valid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = "Please enter a valid email address.";
        emailInput.closest(".input-field").classList.add("input-invalid");
        valid = false;
    }

    if (!password) {
        passwordError.textContent = "Please enter your password.";
        passwordInput.closest(".input-field").classList.add("input-invalid");
        valid = false;
    } else if (!validatePassword(password)) {
        passwordError.textContent =
            "Use at least 8 characters, one uppercase letter, one lowercase letter, and one number.";
        passwordInput.closest(".input-field").classList.add("input-invalid");
        valid = false;
    }

    if (!valid) return;

    loginButton.disabled = true;
    loginButton.querySelector("span").textContent = "Please wait...";

    try {
        const users = JSON.parse(
            localStorage.getItem("scentoraDemoUsers") || "[]"
        );

        const user = users.find(
            item => item.email.toLowerCase() === email
        );

        if (!user) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent = "Incorrect email or password.";
            return;
        }

        if (user.isVerified !== true) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent =
                "Please verify your email address before logging in.";
            return;
        }

        if (!user.passwordHash || !user.salt) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent =
                "This account needs to be registered again using the updated registration system.";
            return;
        }

        const enteredHash = await hashPassword(password, user.salt);

        if (enteredHash !== user.passwordHash) {
            loginMessage.style.color = "#A74636";
            loginMessage.textContent = "Incorrect email or password.";
            return;
        }

        const currentUser = {
            name: user.name,
            email: user.email,
            role: user.role
        };

        if (document.getElementById("rememberMe").checked) {
            localStorage.setItem(
                "scentoraCurrentUser",
                JSON.stringify(currentUser)
            );
            sessionStorage.removeItem("scentoraCurrentUser");
        } else {
            sessionStorage.setItem(
                "scentoraCurrentUser",
                JSON.stringify(currentUser)
            );
            localStorage.removeItem("scentoraCurrentUser");
        }

        loginMessage.style.color = "#63846A";
        loginMessage.textContent = "Welcome back! Redirecting...";

        setTimeout(function () {
            window.location.href = "shop.html";
        }, 1000);

    } catch (error) {
        console.error(error);
        loginMessage.style.color = "#A74636";
        loginMessage.textContent =
            "Something went wrong. Please try again.";

    } finally {
        loginButton.disabled = false;
        loginButton.querySelector("span").textContent = "Log In";
    }
});


// FORGOT PASSWORD MODAL
const forgotModal = document.getElementById("forgotModal");
const forgotPassword = document.getElementById("forgotPassword");
const closeModal = document.getElementById("closeModal");

forgotPassword.addEventListener("click", function () {
    forgotModal.classList.add("show");
    forgotModal.setAttribute("aria-hidden", "false");
});

function closeForgotModal() {
    forgotModal.classList.remove("show");
    forgotModal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeForgotModal);

forgotModal.addEventListener("click", function (event) {
    if (event.target === forgotModal) {
        closeForgotModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeForgotModal();
    }
});


// FORGOT PASSWORD FORM
document.getElementById("forgotForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const recoveryEmail = document
        .getElementById("recoveryEmail")
        .value.trim()
        .toLowerCase();

    const recoveryError = document.getElementById("recoveryError");
    const recoveryMessage = document.getElementById("recoveryMessage");

    recoveryError.textContent = "";
    recoveryMessage.textContent = "";

    if (!isValidEmail(recoveryEmail)) {
        recoveryError.textContent = "Please enter a valid email address.";
        return;
    }

    recoveryMessage.style.color = "#A85C36";
    recoveryMessage.textContent =
        "Password recovery needs a server to send a secure reset link.";
});


// SOCIAL LOGIN PLACEHOLDERS
document.getElementById("googleLogin").addEventListener("click", function () {
    loginMessage.style.color = "#A85C36";
    loginMessage.textContent =
        "Google sign-in will be available after authentication integration.";
});

document.getElementById("appleLogin").addEventListener("click", function () {
    loginMessage.style.color = "#A85C36";
    loginMessage.textContent =
        "Apple sign-in will be available after authentication integration.";
});
