import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { public_token } = await request.json();

        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Store accessToken securely
        await db.bankConnection.create({
            data: {
                itemId,
                accessToken,
            }
        });

        console.log("Access Token exchanged and saved for item:", itemId);

        return NextResponse.json({ access_token: accessToken, item_id: itemId });
    } catch (error) {
        console.error("Error exchanging public token:", error);
        return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
    }
}
