import { isAuthenticated, signIn, signOut } from "./auth.js";
import { fetchGraphQL } from "./api.js";
import signInUI from "./ui/signIn.js";
import loader from "./ui/loader.js";
import navigation from "./ui/navigation.js";
import profile from "./ui/profile.js";
import statistics from "./ui/statistics.js";

// Main application flow
async function main() {
    console.log('Starting main application flow...');
    loader.init();
    loader.show("Initializing...");

    if (isAuthenticated()) {
        console.log('User is authenticated. Fetching data...');
        try {
            loader.updateMessage("Fetching user data...");
            const userData = await fetchUserProfile();
            console.log('User data fetched:', userData);

            console.log('Initializing navigation...');
            navigation.init(userData.user, handleSectionChange, signOut);
            console.log('Initializing profile...');
            profile.init(userData);
            console.log('Initializing statistics...');
            statistics.init(userData);

            console.log('Setting default section to profile...');
            handleSectionChange('profile');
            console.log('Showing main dashboard...');
            showMainDashboard();
        } catch (error) {
            console.error("Failed to load user data:", error);
            signOut();
            showSignInPage();
        }
    } else {
        console.log('User is not authenticated. Showing sign-in page.');
        showSignInPage();
    }

    loader.hide();
}

// Function to handle section changes
function handleSectionChange(section) {
    if (section === 'profile') {
        profile.show();
        statistics.hide();
    } else if (section === 'statistics') {
        profile.hide();
        statistics.show();
    }
}

// Function to fetch user profile data
async function fetchUserProfile() {
    console.log('Constructing GraphQL query for user profile...');
    const query = `
        query {
            user {
                id
                login
                email
                firstName
                lastName
                campus
                auditRatio
                totalUp
                totalDown
            }
            transaction(order_by: {createdAt: asc}, where: {type: {_eq: "xp"}}) {
                amount
                createdAt
                path
            }
        }
    `;
    console.log('GraphQL Query:', query);

    try {
        console.log('Executing fetchGraphQL...');
        const data = await fetchGraphQL(query);
        console.log('Data received from fetchGraphQL:', data);
        // Add additional processing if needed, e.g., calculating total XP
        data.totalXP = data.transaction.reduce((sum, tx) => sum + tx.amount, 0);
        console.log('User profile data processed:', data);
        return data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

// Show the main dashboard and hide other views
function showMainDashboard() {
    const mainContainer = document.getElementById("main-container");
    const signInContainer = document.getElementById("sign-in-container");

    signInContainer.classList.add("hidden");
    mainContainer.classList.remove("hidden");
}

// Show the sign-in page and hide other views
function showSignInPage() {
    const mainContainer = document.getElementById("main-container");
    const signInContainer = document.getElementById("sign-in-container");

    mainContainer.classList.add("hidden");
    signInContainer.classList.remove("hidden");

    // Initialize the sign-in UI and set up callbacks
    signInUI.init(handleSignInSuccess, handleSignInError);
}

// Callback for successful sign-in
async function handleSignInSuccess(credentials) {
    loader.show("Signing in...");
    try {
        await signIn(credentials);
        loader.updateMessage("Sign-in successful! Fetching data...");

        // Reload the main application flow
        await main();
    } catch (error) {
        loader.hide();
        signInUI.showError(error.message);
    }
}

// Callback for sign-in error
function handleSignInError(error) {
    console.error("Sign-in failed:", error);
    signInUI.showError(error.message || "An unexpected error occurred.");
}

// Entry point when the DOM is ready
document.addEventListener("DOMContentLoaded", main);
