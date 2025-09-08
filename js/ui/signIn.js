class SignIn {
  constructor() {
    this.container = null;
    this.form = null;
    this.isLoading = false;
    this.onSuccess = null;
    this.onError = null;
  }

  // Initialize the sign-in component
  init(onSuccess, onError) {
    this.container = document.getElementById("sign-in-container");
    if (!this.container) {
      console.error("Sign-in container not found");
      return;
    }

    this.onSuccess = onSuccess;
    this.onError = onError;
    this.render();
    this.attachEventListeners();
  }

  // Render the sign-in form HTML
  render() {
    this.container.innerHTML = /*html*/ `
            <div class="signin-wrapper">
                <div class="signin-container">
                    <div class="signin-header">
                        <div class="logo">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="#1560DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="#1560DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your GraphQL profile</p>
                    </div>

                    <form id="signin-form" class="signin-form">
                        <div class="input-group">
                            <label for="username" class="input-label">Username or Email</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                class="input-field"
                                placeholder="Enter your username or email"
                                required
                                autocomplete="username"
                            >
                            <span class="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </span>
                        </div>

                        <div class="input-group">
                            <label for="password" class="input-label">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="input-field"
                                placeholder="Enter your password"
                                required
                                autocomplete="current-password"
                            >
                            <span class="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </span>
                        </div>

                        <button type="submit" class="signin-button" id="signin-submit">
                            <span class="button-text">Sign In</span>
                            <span class="button-spinner hidden">
                                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.3"/>
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                                </svg>
                            </span>
                        </button>

                        <div class="error-message hidden" id="error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span id="error-text"></span>
                        </div>
                    </form>

                    <div class="signin-info">
                        <p>You can sign in using either your <strong>username:password</strong> or <strong>email:password</strong></p>
                    </div>
                </div>
            </div>
    `;

    this.form = document.getElementById("signin-form");
  }

  // Attach event listeners to the form
  attachEventListeners() {
    if (!this.form) return;

    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Input focus and blur effects
    const inputs = this.form.querySelectorAll(".input-field");
    inputs.forEach((input) => {
      input.addEventListener("focus", this.handleInputFocus.bind(this));
      input.addEventListener("blur", this.handleInputBlur.bind(this));
      input.addEventListener("input", this.handleInputChange.bind(this));
    });
  }

  // Handle form submission
  async handleSubmit(event) {
    event.preventDefault();
    if (this.isLoading) return;

    const formData = new FormData(this.form);
    const username = formData.get("username").trim();
    const password = formData.get("password").trim();

    // Basic validation
    if (!username || !password) {
      this.showError("Both fields are required.");
      return;
    }

    this.setLoading(true);
    this.hideError();

    try {
      // Call the success callback with form data
      if (this.onSuccess) {
        await this.onSuccess({ username, password });
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      this.showError(
        error.message || "Sign-in failed. Please check your credentials."
      );
    } finally {
      this.setLoading(false);
    }
  }

  // Handle input focus event
  handleInputFocus(event) {
    const inputGroup = event.target.closest(".input-group");
    if (inputGroup) {
      inputGroup.classList.add("focused");
    }
  }

  // Handle input blur event
  handleInputBlur(event) {
    const inputGroup = event.target.closest(".input-group");
    if (inputGroup) {
      inputGroup.classList.remove("focused");
    }
  }

  // Handle input change event
  handleInputChange(event) {
    const inputGroup = event.target.closest(".input-group");
    if (inputGroup) {
      if (event.target.value.trim()) {
        inputGroup.classList.add("has-value");
      } else {
        inputGroup.classList.remove("has-value");
      }
    }

    // Clear error message on input
    this.hideError();
  }

  // Set loading state
  setLoading(loading) {
    this.isLoading = loading;
    const button = document.getElementById("signin-submit");
    const buttonText = button.querySelector(".button-text");
    const buttonSpinner = button.querySelector(".button-spinner");

    if (loading) {
      button.disabled = true;
      button.classList.add("loading");
      buttonText.classList.add("hidden");
      buttonSpinner.classList.remove("hidden");
    } else {
      button.disabled = false;
      button.classList.remove("loading");
      buttonText.classList.remove("hidden");
      buttonSpinner.classList.add("hidden");
    }
  }

  // Show error message
  showError(message) {
    const errorContainer = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");

    if (errorContainer && errorText) {
      errorText.textContent = message;
      errorContainer.classList.remove("hidden");

      // Add shake animation
      errorContainer.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        errorContainer.style.animation = "";
      }, 500);
    }
  }

  // Hide error message
  hideError() {
    const errorContainer = document.getElementById("error-message");
    if (errorContainer) {
      errorContainer.classList.add("hidden");
    }
  }

  // Show the sign-in component
  show() {
    if (this.container) {
      this.container.classList.remove("hidden");

      // Focus the first input field
      setTimeout(() => {
        const usernameField = document.getElementById("username");
        if (usernameField) {
          usernameField.focus();
        }
      }, 100);
    }
  }

  // Hide the sign-in component
  hide() {
    if (this.container) {
      this.container.classList.add("hidden");
      this.hideError();
      this.setLoading(false);

      // Reset form fields
      if (this.form) {
        this.form.reset();
        const inputGroups = this.form.querySelectorAll(".input-group");
        inputGroups.forEach((group) =>
          group.classList.remove("focused", "has-value")
        );
      }
    }
  }

  // Reset the form
  reset() {
    this.hideError();
    this.setLoading(false);
    if (this.form) {
      this.form.reset();
    }
  }
}

// Export a singleton instance
const signIn = new SignIn();
export default signIn;
console.log("SignIn instance created", signIn);
