// The GraphQL endpoint is provided by the platform
const SIGNIN_URL = "https://learn.zone01oujda.ma/api/auth/signin";
const JWT_KEY = "jwt";

// Function to sign in the user
async function signIn(credentials) {
    try {
        const response = await fetch(SIGNIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const jwt = await response.json();
        localStorage.setItem(JWT_KEY, jwt);
        return jwt;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Function to sign out the user
function signOut() {
    localStorage.removeItem(JWT_KEY);
}

// Function to get the JWT from local storage
function getJWT() {
    return localStorage.getItem(JWT_KEY);
}

// Function to check if the user is authenticated
function isAuthenticated() {
    return !!getJWT();
}

export { signIn, signOut, getJWT, isAuthenticated };
