class Navigation {
  constructor() {
    this.container = null;
    this.currentUser = null;
    this.activeSection = "profile";
    this.onSectionChange = null;
    this.onLogout = null;
  }

  // Initialize the navigation component
  init(user, onSectionChange, onLogout) {
    this.container = document.getElementById("header");
    if (!this.container) {
      console.error("Header container not found");
      return;
    }

    this.currentUser = user;
    this.onSectionChange = onSectionChange;
    this.onLogout = onLogout;
    this.render();
    this.attachEventListeners();
  }

  // Render the navigation HTML
  render() {
    const userInitial = this.currentUser?.login?.charAt(0).toUpperCase() || "U";
    const userName = this.currentUser?.login || "User";

    this.container.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <!-- Logo/Brand -->
                    <div class="nav-brand">
                        <div class="brand-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#1560DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 17l10 5 10-5" stroke="#1560DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 12l10 5 10-5" stroke="#1560DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <span class="brand-text">GraphQL Profile</span>
                    </div>

                    <!-- Navigation Links -->
                    <div class="nav-links">
                        <button class="nav-link active" data-section="profile" id="profile-nav">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Profile</span>
                        </button>
                        
                        <button class="nav-link" data-section="statistics" id="statistics-nav">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>Statistics</span>
                        </button>
                    </div>

                    <!-- User Menu -->
                    <div class="nav-user">
                        <div class="user-menu" id="user-menu">
                            <button class="user-button" id="user-button">
                                <div class="user-avatar">
                                    <span class="avatar-text">${userInitial}</span>
                                </div>
                                <div class="user-info">
                                    <span class="user-name">${userName}</span>
                                    <span class="user-status">Online</span>
                                </div>
                                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <div class="user-dropdown hidden" id="user-dropdown">
                                <div class="dropdown-header">
                                    <div class="dropdown-user">
                                        <div class="dropdown-avatar">
                                            <span class="avatar-text">${userInitial}</span>
                                        </div>
                                        <div class="dropdown-info">
                                            <div class="dropdown-name">${userName}</div>
                                            <div class="dropdown-email">ID: ${
                                              this.currentUser?.id || "N/A"
                                            }</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="dropdown-divider"></div>
                                
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" id="refresh-data">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <polyline points="1,20 1,14 7,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span>Refresh Data</span>
                                    </button>
                                    
                                    <button class="dropdown-item" id="logout-button">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Menu Button -->
                    <button class="mobile-menu-button" id="mobile-menu-button">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>

                <!-- Mobile Navigation -->
                <div class="mobile-nav hidden" id="mobile-nav">
                    <div class="mobile-nav-links">
                        <button class="mobile-nav-link active" data-section="profile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Profile</span>
                        </button>
                        
                        <button class="mobile-nav-link" data-section="statistics">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>Statistics</span>
                        </button>
                    </div>
                    
                    <div class="mobile-nav-footer">
                        <button class="mobile-nav-item" id="mobile-refresh">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="1,20 1,14 7,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Refresh Data</span>
                        </button>
                        
                        <button class="mobile-nav-item" id="mobile-logout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
  }

  // Attach event listeners
  attachEventListeners() {
    // Navigation links
    const navLinks = this.container.querySelectorAll("[data-section]");
    navLinks.forEach((link) => {
      link.addEventListener("click", this.handleSectionChange.bind(this));
    });

    // User dropdown
    const userButton = document.getElementById("user-button");
    const userDropdown = document.getElementById("user-dropdown");

    if (userButton && userDropdown) {
      userButton.addEventListener("click", this.toggleUserDropdown.bind(this));
    }

    // Logout buttons
    const logoutButton = document.getElementById("logout-button");
    const mobileLogout = document.getElementById("mobile-logout");

    if (logoutButton) {
      logoutButton.addEventListener("click", this.handleLogout.bind(this));
    }
    if (mobileLogout) {
      mobileLogout.addEventListener("click", this.handleLogout.bind(this));
    }

    // Refresh data buttons
    const refreshButton = document.getElementById("refresh-data");
    const mobileRefresh = document.getElementById("mobile-refresh");

    if (refreshButton) {
      refreshButton.addEventListener("click", this.handleRefresh.bind(this));
    }
    if (mobileRefresh) {
      mobileRefresh.addEventListener("click", this.handleRefresh.bind(this));
    }

    // Mobile menu
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileNav = document.getElementById("mobile-nav");

    if (mobileMenuButton && mobileNav) {
      mobileMenuButton.addEventListener(
        "click",
        this.toggleMobileMenu.bind(this)
      );
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", this.handleDocumentClick.bind(this));
  }

  // Handle section change
  handleSectionChange(event) {
    const section = event.currentTarget.getAttribute("data-section");
    if (section && section !== this.activeSection) {
      this.setActiveSection(section);
      if (this.onSectionChange) {
        this.onSectionChange(section);
      }
    }

    // Close mobile menu if open
    this.closeMobileMenu();
  }

  // Set active section
  setActiveSection(section) {
    this.activeSection = section;

    // Update desktop nav links
    const navLinks = this.container.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      if (link.getAttribute("data-section") === section) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update mobile nav links
    const mobileLinks = this.container.querySelectorAll(".mobile-nav-link");
    mobileLinks.forEach((link) => {
      if (link.getAttribute("data-section") === section) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Toggle user dropdown
  toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("user-dropdown");
    const button = document.getElementById("user-button");

    if (dropdown && button) {
      const isOpen = !dropdown.classList.contains("hidden");

      if (isOpen) {
        dropdown.classList.add("hidden");
        button.classList.remove("active");
      } else {
        dropdown.classList.remove("hidden");
        button.classList.add("active");
      }
    }
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    const mobileNav = document.getElementById("mobile-nav");
    const mobileButton = document.getElementById("mobile-menu-button");

    if (mobileNav && mobileButton) {
      const isOpen = !mobileNav.classList.contains("hidden");

      if (isOpen) {
        this.closeMobileMenu();
      } else {
        mobileNav.classList.remove("hidden");
        mobileButton.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scroll
      }
    }
  }

  // Close mobile menu
  closeMobileMenu() {
    const mobileNav = document.getElementById("mobile-nav");
    const mobileButton = document.getElementById("mobile-menu-button");

    if (mobileNav && mobileButton) {
      mobileNav.classList.add("hidden");
      mobileButton.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable scroll
    }
  }

  // Handle document click (close dropdowns)
  handleDocumentClick(event) {
    const userMenu = document.getElementById("user-menu");
    const userDropdown = document.getElementById("user-dropdown");
    const userButton = document.getElementById("user-button");

    if (
      userMenu &&
      userDropdown &&
      userButton &&
      !userMenu.contains(event.target)
    ) {
      userDropdown.classList.add("hidden");
      userButton.classList.remove("active");
    }
  }

  // Handle refresh data
  handleRefresh() {
    // Close dropdowns
    const userDropdown = document.getElementById("user-dropdown");
    const userButton = document.getElementById("user-button");

    if (userDropdown && userButton) {
      userDropdown.classList.add("hidden");
      userButton.classList.remove("active");
    }

    this.closeMobileMenu();

    // Emit refresh event or callback
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("refreshData"));
    }
  }

  // Handle logout
  handleLogout() {
    if (this.onLogout) {
      this.onLogout();
    }
  }

  // Update user info
  updateUser(user) {
    this.currentUser = user;
    this.render();
    this.attachEventListeners();
  }

  // Show navigation
  show() {
    if (this.container) {
      this.container.classList.remove("hidden");
    }
  }

  // Hide navigation
  hide() {
    if (this.container) {
      this.container.classList.add("hidden");
    }
  }
}

// Create and export singleton instance
const navigation = new Navigation();
export default navigation;
console.log("Navigation instance created", navigation);

