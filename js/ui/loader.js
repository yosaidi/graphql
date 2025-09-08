class Loader {
  constructor() {
    this.container = null;
    this.isVisible = false;
  }

  // Initialize the loader by creating its DOM structure
  init() {
    this.container = document.getElementById("loader-container");
    if (!this.container) {
      console.error("Loader container not found");
      return;
    }
    this.render();
  }

  // Render the loader's HTML structure
  render() {
    this.container.innerHTML = /*html*/ `
          <div class="loader-wrapper">
            <div class="loader-content">
                <div class="loader-spinner">
                    <div class="spinner-circle"></div>
                    <div class="spinner-circle"></div>
                    <div class="spinner-circle"></div>
                </div>
                <div class="loader-text">
                    <h2>QraphQl Profile</h2>
                    <p id ="loader-message">Loading your profile...</p>
                </div>
            </div>
      </div>
    `;
  }

  // Show the loader with an optional message
  show(message = "Loading...") {
    if (!this.container) {
      console.error("Loader container not initialized");
      return;
    }
    const messageEL = document.getElementById("loader-message");
    if (messageEL) {
      messageEL.textContent = message;
    }
    this.container.classList.remove("hidden");
    this.isVisible = true;

    // Prevent scrolling when loader is visible
    document.body.style.overflow = "hidden";
  }

  // Hide the loader with smooth transition
  hide() {
    if (!this.container) {
      console.error("Loader container not initialized");
      return;
    }

    // Add a fade-out effect
    this.container.style.opacity = "0";
    this.container.style.transition = "opacity 0.3s ease-out";

    setTimeout(() => {
      this.container.classList.add("hidden");
      this.container.style.opacity = "1";
      this.container.style.transition = "";
      this.isVisible = false;

      // Restore scrolling
      document.body.style.overflow = "";
    }, 300); // Match the transition duration
  }

  // Update the loader message 
  updateMessage(message) {
    const messageEl = document.getElementById("loader-message");
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  // Check if loader is currently visible
  isLoading() {
    return this.isVisible;
  }

  // Show loader with progress-like messages
  showWithProgress(messages = [], interval = 1000) {
    if (!Array.isArray(messages) || messages.length === 0) {
      this.show();
      return;
    }

    this.show(messages[0]);

    let currentIndex = 0;
    const progressInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex < messages.length) {
        this.updateMessage(messages[currentIndex]);
      } else {
        clearInterval(progressInterval);
      }
    }, interval);

    return progressInterval;
  }
}

// Create and export a singleton instance
const loader = new Loader();
export default loader;
console.log("Loader instance created:", loader);
