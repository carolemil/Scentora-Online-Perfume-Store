
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");

    const loginMessage = document.getElementById("loginMessage");

    const togglePassword =
        document.getElementById("toggleLoginPassword");

    const forgotPassword =
        document.getElementById("forgotPassword");


    // SHOW / HIDE PASSWORD
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "Hide";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "Show";

        }

    });


    // LOGIN FORM
    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        emailError.textContent = "";
        passwordError.textContent = "";
        loginMessage.textContent = "";

        let valid = true;

        if (email === "") {

            emailError.textContent = "Please enter your email.";
            valid = false;

        }

        if (password === "") {

            passwordError.textContent = "Please enter your password.";
            valid = false;

        }

        if (!valid) return;


        // SAVE LOGIN STATUS
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);

        if (document.getElementById("rememberMe").checked) {

            localStorage.setItem("rememberMe", "true");

        } else {

            localStorage.removeItem("rememberMe");

        }


        loginMessage.textContent =
            "Login successful! Welcome to Scentora.";

        // REDIRECT TO SHOP
        setTimeout(function () {

            window.location.href = "shops.html";

        }, 1000);

    });


    // FORGOT PASSWORD
    forgotPassword.addEventListener("click", function () {

        alert("Please contact Scentora support to reset your password.");

    });

});
