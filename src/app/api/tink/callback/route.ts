import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/tink";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error("Tink authorization error:", error);
            return NextResponse.redirect(new URL('/?error=tink_auth_failed', request.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL('/?error=missing_code', request.url));
        }

        // Exchange code for access token
        const { access_token, refresh_token } = await exchangeCodeForToken(code);

        // Store in database
        await db.bankConnection.create({
            data: {
                itemId: `tink_${Date.now()}`, // Temporary ID, will be updated with actual account ID
                accessToken: access_token,
                institutionName: 'Tink',
            }
        });

        // Redirect back to home page with success
        return NextResponse.redirect(new URL('/?success=bank_connected', request.url));
    } catch (error) {
        console.error("Error in Tink callback:", error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}
