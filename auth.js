document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const welcomeText = document.getElementById("welcomeText");

  const servicesList = document.getElementById("servicesList");
  const whitepapersList = document.getElementById("whitepapersList");
  const toolkitsList = document.getElementById("toolkitsList");

  // Signup Logic
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const firstName = document.getElementById("firstName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const user = {
        firstName,
        email,
        password,
        services: [],
        whitepapers: [],
        toolkits: []
      };

      localStorage.setItem(email, JSON.stringify(user));
      localStorage.setItem("currentUser", email);
      window.location.href = "account.html";
    });
  }

  // Login Logic
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const remember = document.getElementById("rememberMe")?.checked;

      const user = JSON.parse(localStorage.getItem(email));
      if (user && user.password === password) {
        localStorage.setItem("currentUser", email);
        if (remember) localStorage.setItem("rememberMe", "true");
        window.location.href = "account.html";
      } else {
        alert("Invalid credentials. Please try again.");
      }
    });
  }

  // Account Page Loader
  if (welcomeText) {
    const email = localStorage.getItem("currentUser");
    const user = JSON.parse(localStorage.getItem(email));

    if (!user) {
      alert("You must be logged in to view this page.");
      window.location.href = "login.html";
      return;
    }

    welcomeText.textContent = `Welcome, ${user.firstName}! Here's your account`;

    user.services.forEach(service => {
      const li = document.createElement("li");
      li.textContent = service;
      servicesList?.appendChild(li);
    });

    user.whitepapers.forEach(paper => {
      const li = document.createElement("li");
      li.textContent = paper;
      whitepapersList?.appendChild(li);
    });

    user.toolkits.forEach(tool => {
      const li = document.createElement("li");
      li.textContent = tool;
      toolkitsList?.appendChild(li);
    });
  }

  // Logout Logic
  window.logout = function () {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  };
});
