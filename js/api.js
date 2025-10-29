import { getJWT, signOut } from './auth.js';

const API_URL = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

// Reusable function to execute GraphQL queries
async function fetchGraphQL(query, variables = {}) {
    const jwt = getJWT();

    // If no JWT is found, the user is not authenticated
    if (!jwt) {
        // Handle unauthenticated state, e.g., by redirecting to the login page
        console.error("No JWT found. User is not authenticated.");
        signOut(); // Clear any stale session data
        window.location.reload(); // Reload the page to trigger the sign-in flow
        throw new Error("User is not authenticated.");
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!response.ok) {
            // Handle HTTP errors
            const errorBody = await response.text();
            console.error("GraphQL request failed with status:", response.status, "Body:", errorBody);
            throw new Error(`GraphQL request failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Handle GraphQL-specific errors
        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            // If the error is due to an expired or invalid token, sign the user out
            if (result.errors.some(e => e.message.includes("JWT") || e.message.includes("token"))) {
                signOut();
                window.location.reload();
            }
            throw new Error(result.errors.map(e => e.message).join('\n'));
        }

        return result.data;

    } catch (error) {
        console.error("An error occurred during the GraphQL fetch:", error);
        throw error;
    }
}

export { fetchGraphQL };
