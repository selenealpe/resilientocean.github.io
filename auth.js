document.addEventListener("DOMContentLoaded", () => {
  restoreAccountTab();
});

// Global key names
const USER_KEY = "resilientUser";
const REGISTRY_KEY = "resilientUserRegistry";

// Unify login logic
function loginUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("resilientUserLoggedIn", "true");
  if (user.email === "info@resilientocean.com") {
    localStorage.setItem("resilientUserIsAdmin", "true");
  }
  showAccountTab();
}

// Unified function for "My Account" tab
function showAccountTab() {
  const nav = document.querySelector("nav");
  if (!document.getElementById("accountLink")) {
    const accountLink = document.createElement("a");
    accountLink.href = "account.html";
    accountLink.textContent = "My Account";
    accountLink.id = "accountLink";
    nav.appendChild(accountLink);
  }
}

// Restore on page load
function restoreAccountTab() {
  const userData = JSON.parse(localStorage.getItem(USER_KEY));
  if (userData && userData.email) {
    showAccountTab();
  }
}

// Handle toolkit form submission (auto-login + registry)
function handleToolkitSubmission(event) {
  event.preventDefault();

  const email = document.querySelector("#toolkitEmail")?.value.trim();
  const password = document.querySelector("#toolkitPassword")?.value.trim();
  const name = document.querySelector("#toolkitName")?.value.trim();
  const institution = document.querySelector("#toolkitInstitution")?.value.trim();
  const institutionType = document.querySelector("#toolkitInstitutionType")?.value;
  const toolkit = document.querySelector("[name='toolkit']").value;
  const guidance = document.querySelector("[name='guidance']").value;

  if (!email || !password || !name || !institution || !institutionType) {
    alert("Please fill out all required fields.");
    return;
  }

  const user = {
    email,
    password,
    name,
    institution,
    institutionType,
    services: [`Toolkit: ${toolkit}` + (guidance.includes("Yes") ? " + Guidance" : "")]
  };

  loginUser(user);
  saveToRegistry(user);

  alert("You have now created a personal account at Resilient Ocean. You will be able to access the toolkits via your personal account tab at the top right of the home page.");
  closeModal("toolkitModal");
}

// Save user in registry if not already stored
function saveToRegistry(user) {
  const registry = JSON.parse(localStorage.getItem(REGISTRY_KEY)) || [];

  const exists = registry.some(u => u.email === user.email);
  if (!exists) {
    registry.push(user);
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }
}

// Login handler (from login.html)
function loginFromLoginPage(email, password, rememberMe) {
  const registry = JSON.parse(localStorage.getItem(REGISTRY_KEY)) || [];

  const user = registry.find(u => u.email === email && u.password === password);
  if (user) {
    loginUser(user);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    }
    window.location.href = "account.html";
  } else {
    alert("Invalid credentials.");
  }
}

// Persist login
(function checkRememberMe() {
  if (localStorage.getItem("rememberMe") === "true") {
    restoreAccountTab();
  }
})();

// Attach handler for toolkit form
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "toolkitForm") {
    handleToolkitSubmission(e);
  }
});
