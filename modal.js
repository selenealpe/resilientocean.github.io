// Load modal forms dynamically from forms.html
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
      restoreAccountTab();
    })
    .catch(error => console.error("Failed to load modal forms:", error));
});

// Open modal by ID
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Attach listener dynamically if modal is a form
    const form = modal.querySelector("form");
    if (form && modalId === "toolkitModal") {
      form.addEventListener("submit", handleToolkitSubmission);
    }
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking outside content
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
};

// Show My Account tab dynamically
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

// Restore tab if session exists
function restoreAccountTab() {
  if (localStorage.getItem("resilientUserLoggedIn") === "true" ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("rememberMeUser")) {
    showAccountTab();
  }
}

// Handle toolkit modal form
function handleToolkitSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.querySelector("input[name='email']").value;
  const password = form.querySelector("input[name='password']").value;
  const firstName = form.querySelector("input[name='firstName']").value;
  const institution = form.querySelector("input[name='institution']").value;
  const institutionType = form.querySelector("select[name='institutionType']").value;

  if (!email || !password || !firstName || !institution || !institutionType) {
    alert("All fields are required.");
    return;
  }

  // Save user object to localStorage
  const user = {
    email,
    password,
    firstName,
    institution,
    institutionType,
    services: [],
    whitepapers: [],
    toolkits: ["Toolkit Access Requested"]
  };

  localStorage.setItem(email, JSON.stringify(user));
  localStorage.setItem("currentUser", email);
  localStorage.setItem("resilientUserLoggedIn", "true");

  // Simulate email confirmation
  const emailMessage = `mailto:${email}?subject=Welcome to Resilient Ocean&body=You're all set!%0D%0A%0D%0AHere are your login credentials:%0D%0AEmail: ${email}%0D%0APassword: ${password}%0D%0A%0D%0AVisit https://www.resilientocean.com/account.html to access your profile.%0D%0A%0D%0AQuestions? Contact info@resilientocean.com`;
  window.open(emailMessage, "_blank");

  alert("You have now created a personal account at Resilient Ocean. You will be able to access the toolkits via your personal account tab at the top right of the home page.");

  showAccountTab();
  closeModal("toolkitModal");
}
