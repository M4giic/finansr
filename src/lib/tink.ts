import axios from 'axios';

const TINK_API_URL = process.env.TINK_ENV === 'production'
    ? 'https://api.tink.com'
    : 'https://api.tink.com'; // Tink uses same URL for both

export const tinkClient = axios.create({
    baseURL: TINK_API_URL,
});

// Get access token for your app (client credentials flow)
export async function getTinkAccessToken() {
    const params = new URLSearchParams({
        client_id: process.env.TINK_CLIENT_ID!,
        client_secret: process.env.TINK_CLIENT_SECRET!,
        grant_type: 'client_credentials',
        scope: 'authorization:grant user:create',
    });

    const response = await tinkClient.post('/api/v1/oauth/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data.access_token;
}

// Create a Tink user (required for each end-user)
export async function createTinkUser(accessToken: string, externalUserId: string) {
    const response = await tinkClient.post(
        '/api/v1/user/create',
        {
            external_user_id: externalUserId,
            market: 'PL', // Poland
            locale: 'pl_PL',
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.user_id;
}

// Generate authorization code for user to connect their bank
export async function generateAuthorizationCode(accessToken: string, userId: string) {
    const response = await tinkClient.post(
        '/api/v1/oauth/authorization-grant/delegate',
        {
            user_id: userId,
            scope: 'accounts:read transactions:read',
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.code;
}

// Exchange authorization code for user access token
export async function exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
        code,
        client_id: process.env.TINK_CLIENT_ID!,
        client_secret: process.env.TINK_CLIENT_SECRET!,
        grant_type: 'authorization_code',
    });

    const response = await tinkClient.post('/api/v1/oauth/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
    };
}
