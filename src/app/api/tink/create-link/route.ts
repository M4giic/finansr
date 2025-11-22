import { NextResponse } from "next/server";
import { getTinkAccessToken, createTinkUser, generateAuthorizationCode } from "@/lib/tink";

export async function POST() {
    try {
        // Step 1: Get app access token
        const appAccessToken = await getTinkAccessToken();

        // Step 2: Create or get Tink user (in production, use authenticated user ID)
        const externalUserId = 'user-id'; // Replace with actual user ID from your auth system
        const tinkUserId = await createTinkUser(appAccessToken, externalUserId);

        // Step 3: Generate authorization code
        const authCode = await generateAuthorizationCode(appAccessToken, tinkUserId);

        // Step 4: Build Tink Link URL
        const tinkLinkUrl = new URL('https://link.tink.com/1.0/authorize');
        tinkLinkUrl.searchParams.set('client_id', process.env.TINK_CLIENT_ID!);
        tinkLinkUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/tink/callback`);
        tinkLinkUrl.searchParams.set('authorization_code', authCode);
        tinkLinkUrl.searchParams.set('market', 'PL');
        tinkLinkUrl.searchParams.set('locale', 'pl_PL');
        tinkLinkUrl.searchParams.set('test', process.env.TINK_ENV === 'production' ? 'false' : 'true');

        return NextResponse.json({
            url: tinkLinkUrl.toString(),
            tink_user_id: tinkUserId
        });
    } catch (error) {
        console.error("Error creating Tink Link:", error);
        return NextResponse.json({ error: "Failed to create Tink Link" }, { status: 500 });
    }
}
