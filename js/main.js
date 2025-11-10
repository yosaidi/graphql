// API Endpoints
const API = {
  SIGNIN: "https://learn.zone01oujda.ma/api/auth/signin",
  GRAPHQL: "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
};

// View Manager for SPA
const ViewManager = {
  currentView: null,

  // Show a specific view and hide others
  showView(viewId) {
    // Hide all views
    document.querySelectorAll(".view").forEach((view) => {
      view.style.display = "none";
    });

    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.style.display = "flex";
      this.currentView = viewId;
    }
  },

  // Initialize the app
  init() {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");

    if (token && this.isTokenValid(token)) {
      this.showView("dashboard-view");
    } else {
      localStorage.removeItem("authToken");
      this.showView("login-view");
    }
  },

  // Basic token validation
  isTokenValid(token) {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));

      // Check if token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  },
};

// Authentication Handler for Zone01 Oujda
const AuthHandler = {
  async login(credentials) {
    try {
      ViewManager.showView("loading-view");

      // Zone01 uses Basic Authentication
      const basicAuth = btoa(`${credentials.username}:${credentials.password}`);

      const response = await fetch(API.SIGNIN, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error(`Authentication failed: ${response.status}`);
      }

      // Zone01 returns a JWT token as plain text
      let token = await response.text();
      token = token.replace(/^"|"$/g, "");

      if (!token) {
        throw new Error("No token received");
      }

      // Store the token
      localStorage.setItem("authToken", token);

      // Fetch user data
      await this.fetchUserData(token);

      // Redirect to dashboard
      ViewManager.showView("dashboard-view");

      return true;
    } catch (error) {
      console.error("Login error:", error);
      this.showError(error.message || "Invalid credentials. Please try again.");
      ViewManager.showView("login-view");
      return false;
    }
  },

  async fetchUserData(token) {
    try {
      // Query for comprehensive user data
      const query = `
        query {
          user {
            id
            login
            attrs
            totalUp
            totalDown
            auditRatio
            transactions(order_by: { createdAt: desc }) {
              id
              type
              amount
              createdAt
              path
            }
            progresses(order_by: { updatedAt: desc }) {
              id
              grade
              createdAt
              updatedAt
              path
              object {
                name
                type
              }
            }
          }
        }
      `;

      const response = await fetch(API.GRAPHQL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        throw new Error(data.errors[0].message);
      }

      // Store user data
      if (data.data && data.data.user && data.data.user.length > 0) {
        const userData = data.data.user[0];
        localStorage.setItem("userData", JSON.stringify(userData));
        return userData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },

  async queryGraphQL(query, variables = {}) {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token");
    }

    try {
      const response = await fetch(API.GRAPHQL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, logout
          this.logout();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`GraphQL request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data;
    } catch (error) {
      console.error("GraphQL error:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    ViewManager.showView("login-view");

    // Clear form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.reset();
    }

    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
      errorMessage.style.display = "none";
    }
  },

  showError(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  },

  hideError() {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize view manager
  ViewManager.init();

  // Login form handler
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Hide any previous errors
      AuthHandler.hideError();

      const username = document.getElementById("email-field").value.trim();
      const password = document.getElementById("password-field").value;

      if (!username || !password) {
        AuthHandler.showError("Please enter both username and password");
        return;
      }

      await AuthHandler.login({ username, password });
    });
  }

  // Logout button handler
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      AuthHandler.logout();
    });
  }

  // Password visibility toggle
  const eyeIcon = document.getElementById("eye");
  if (eyeIcon) {
    eyeIcon.addEventListener("click", () => {
      const passwordField = document.getElementById("password-field");
      const type = passwordField.type === "password" ? "text" : "password";
      passwordField.type = type;
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  // Clear error on input
  const emailField = document.getElementById("email-field");
  const passwordField = document.getElementById("password-field");

  [emailField, passwordField].forEach((field) => {
    if (field) {
      field.addEventListener("input", () => {
        AuthHandler.hideError();
      });
    }
  });
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { API, ViewManager, AuthHandler };
}
