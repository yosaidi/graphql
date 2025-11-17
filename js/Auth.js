import { API } from "./config.js";
import { USER_QUERY } from "./queries.js";

export class AuthHandler {
  #viewManager; // Private field for the ViewManager

  constructor(viewManager) {
    this.#viewManager = viewManager;
  }

  async login(credentials) {
    try {
      this.#viewManager.showView("loading-view");
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

      let token = await response.text();
      token = token.replace(/^"|"$/g, "");
      if (!token) throw new Error("No token received");

      localStorage.setItem("authToken", token);
      await this.#fetchUserData(token);
      this.#viewManager.showView("dashboard-view");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      this.showError(error.message || "Invalid credentials. Please try again.");
      this.#viewManager.showView("login-view");
      return false;
    }
  }

  // This is now a private method
  async #fetchUserData(token) {
    try {
      const query = USER_QUERY; // Use the imported query
      const response = await fetch(API.GRAPHQL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        throw new Error(data.errors[0].message);
      }

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
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    this.#viewManager.showView("login-view");

    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.reset();

    this.hideError();
  }

  showError(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  hideError() {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }
}
