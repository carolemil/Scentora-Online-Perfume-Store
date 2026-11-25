
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");
    const loginMessage = document.getElementById("loginMessage");

    const togglePassword = document.getElementById("toggleLoginPassword");
    const forgotPassword = document.getElementById("forgotPassword");

    // Show / Hide Password
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }

    });

    // Login Form
    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Clear previous errors
        emailError.textContent = "";
        passwordError.textContent = "";
        loginMessage.textContent = "";

        let valid = true;

        // Validate Email
        if (email === "") {
            emailError.textContent = "Please enter your email.";
            valid = false;
        }

        // Validate Password
        if (password === "") {
            passwordError.textContent = "Please enter your password.";
            valid = false;
        }

        if (!valid) return;

        // Save login status
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);

        // Remember Me
        if (document.getElementById("rememberMe").checked) {
            localStorage.setItem("rememberMe", "true");
        } else {
            localStorage.removeItem("rememberMe");
        }

        loginMessage.textContent = "Login successful! Welcome to Scentora.";

        // Redirect to Shop
        setTimeout(function () {
            window.location.href = "shops.html";
        }, 1000);

    });

    // Forgot Password
    forgotPassword.addEventListener("click", function () {
        alert("Please contact Scentora support to reset your password.");
    });

});
