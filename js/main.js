import { ViewManager } from "./ViewManager.js";
import { AuthHandler } from "./Auth.js";
import { Dashboard } from "./Dashboard.js";

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Create instances of the classes
  const dashboard = new Dashboard();
  const viewManager = new ViewManager(dashboard);
  const authHandler = new AuthHandler(viewManager);

  // 2. Initialize the ViewManager
  viewManager.init();

  // 3. Set up all event listeners
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      authHandler.hideError();
      const username = document.getElementById("email-field").value.trim();
      const password = document.getElementById("password-field").value;

      if (!username || !password) {
        authHandler.showError("Please enter both username and password");
        return;
      }
      await authHandler.login({ username, password });
    });
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      authHandler.logout();
    });
  }

  // Set up a listener for forced logouts (e.g., if dashboard data is missing)
  document.addEventListener("force-logout", () => {
    authHandler.logout();
  });

  const eyeIcon = document.getElementById("eye");
  if (eyeIcon) {
    eyeIcon.addEventListener("click", () => {
      const passwordField = document.getElementById("password-field");
      const type = passwordField.type === "password" ? "text" : "password";
      passwordField.type = type;
    });
  }

  const emailField = document.getElementById("email-field");
  const passwordField = document.getElementById("password-field");
  [emailField, passwordField].forEach((field) => {
    if (field) {
      field.addEventListener("input", () => {
        authHandler.hideError();
      });
    }
  });
});