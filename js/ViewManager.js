export class ViewManager {
  currentView = null;
  #dashboard; // Private field for the dashboard instance

  constructor(dashboard) {
    this.#dashboard = dashboard;
  }

  // Show a specific view and hide others
  showView(viewId) {
    document.querySelectorAll(".view").forEach((view) => {
      view.style.display = "none";
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.style.display = "flex";
      this.currentView = viewId;

      // If we are showing the dashboard, initialize it
      if (viewId === "dashboard-view") {
        this.#dashboard.init();
      }
    }
  }

  // Initialize the app
  init() {
    const token = localStorage.getItem("authToken");
    if (token && this.#isTokenValid(token)) {
      this.showView("dashboard-view");
    } else {
      localStorage.removeItem("authToken");
      this.showView("login-view");
    }
  }

  // Basic token validation (now a private method)
  #isTokenValid(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}