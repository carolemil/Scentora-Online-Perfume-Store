/*
document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const accountButton = document.getElementById("accountButton");
    const accountOverlay = document.getElementById("accountOverlay");
    const closeAccount = document.getElementById("closeAccount");

    const accountName = document.getElementById("accountName");
    const accountEmail = document.getElementById("accountEmail");
    const accountAvatar = document.getElementById("profileAvatar");

    const accountStatus = document.getElementById("accountStatus");
    const accountEmailDetails = document.getElementById("accountEmailDetails");
    const accountStatusDetails = document.getElementById("accountStatusDetails");

    const logoutButton = document.getElementById("accountLogout");

    // Check login information
    function updateAccount() {

        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const email = localStorage.getItem("userEmail") || "";

        // Get the name saved during registration, if available
        const savedName = localStorage.getItem("userName") || "";

        if (isLoggedIn) {

            const displayName = savedName || (email ? email.split("@")[0] : "User");

            accountName.textContent = displayName;
            accountEmail.textContent = email;
            accountAvatar.textContent = displayName.charAt(0).toUpperCase();

            accountStatus.textContent = "Logged In";
            accountEmailDetails.textContent = email;
            accountStatusDetails.textContent = "Active";

            logoutButton.style.display = "block";

        } else {

            accountName.textContent = "Guest";
            accountEmail.textContent = "You are not logged in";
            accountAvatar.textContent = "G";

            accountStatus.textContent = "Guest";
            accountEmailDetails.textContent = "Not available";
            accountStatusDetails.textContent = "Guest";

            logoutButton.style.display = "none";
        }
    }

    // Open account sidebar
    function openAccount() {
        updateAccount();
        accountOverlay.classList.add("active");
        accountOverlay.setAttribute("aria-hidden", "false");
    }

    // Close account sidebar
    function closeAccountPanel() {
        accountOverlay.classList.remove("active");
        accountOverlay.setAttribute("aria-hidden", "true");
    }

    // Button events
    if (accountButton) {
        accountButton.addEventListener("click", openAccount);
    }

    if (closeAccount) {
        closeAccount.addEventListener("click", closeAccountPanel);
    }

    // Close when clicking outside the sidebar
    if (accountOverlay) {
        accountOverlay.addEventListener("click", function (event) {
            if (event.target === accountOverlay) {
                closeAccountPanel();
            }
        });
    }

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("rememberMe");

            updateAccount();
            closeAccountPanel();

            alert("You have logged out successfully!");

            // Refresh the page to update navigation
            window.location.reload();
        });
    }

    // Close using Escape key
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAccountPanel();
        }
    });

    // Initial account information
    updateAccount();

});


*/





document.addEventListener("DOMContentLoaded", function () {

    // Elements
    const accountButton = document.getElementById("accountButton");
    const accountOverlay = document.getElementById("accountOverlay");
    const closeAccount = document.getElementById("closeAccount");

    const accountName = document.getElementById("accountName");
    const accountEmail = document.getElementById("accountEmail");
    const accountEmailDetails = document.getElementById("accountEmailDetails");

    const accountStatus = document.getElementById("accountStatus");
    const accountStatusDetails = document.getElementById("accountStatusDetails");

    const profileAvatar = document.getElementById("profileAvatar");
    const accountLogout = document.getElementById("accountLogout");


    // Check if user is logged in
    function updateAccountInfo() {

        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        const email = localStorage.getItem("userEmail") || "";
        const name = localStorage.getItem("userName") || "";

        if (isLoggedIn) {

            // Show user information
            accountName.textContent = name || "Welcome!";
            accountEmail.textContent = email;

            accountEmailDetails.textContent = email;
            accountStatus.textContent = "Logged In";
            accountStatusDetails.textContent = "Logged In";

            // Avatar letter
            profileAvatar.textContent = name
                ? name.charAt(0).toUpperCase()
                : email.charAt(0).toUpperCase();

            accountLogout.style.display = "block";

        } else {

            // Guest information
            accountName.textContent = "Guest";
            accountEmail.textContent = "You are not logged in";

            accountEmailDetails.textContent = "Not available";
            accountStatus.textContent = "Guest";
            accountStatusDetails.textContent = "Guest";

            profileAvatar.textContent = "G";

            accountLogout.style.display = "none";
        }
    }


    // Open account sidebar
    function openAccount() {

        updateAccountInfo();

        accountOverlay.classList.add("active");
        accountOverlay.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }


    // Close account sidebar
    function closeAccountSidebar() {

        accountOverlay.classList.remove("active");
        accountOverlay.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }


    // Account button
    if (accountButton) {
        accountButton.addEventListener("click", openAccount);
    }


    // Close button
    if (closeAccount) {
        closeAccount.addEventListener("click", closeAccountSidebar);
    }


    // Close when clicking outside the sidebar
    if (accountOverlay) {

        accountOverlay.addEventListener("click", function (event) {

            if (event.target === accountOverlay) {
                closeAccountSidebar();
            }

        });
    }


    // Logout
    if (accountLogout) {

        accountLogout.addEventListener("click", function () {

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("rememberMe");

            updateAccountInfo();
            closeAccountSidebar();

            alert("You have logged out successfully!");

            window.location.href = "index.html";

        });
    }


    // Close sidebar with Escape
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeAccountSidebar();
        }

    });


    // Initial update
    updateAccountInfo();

});



function updateLoginButton() {
    const authNav = document.getElementById("auth-nav");

    if (!authNav) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        authNav.innerHTML = `
            <button id="logoutButton" class="nav-auth-button">
                Logout
            </button>
        `;

        document.getElementById("logoutButton").addEventListener("click", function () {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("rememberMe");

            updateLoginButton();
            window.location.href = "index.html";
        });

    } else {
        authNav.innerHTML = `
            <a href="login.html" class="nav-auth-button">
                Login
            </a>
        `;
    }
}

updateLoginButton();
