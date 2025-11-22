import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: 'user-id' },
            client_name: 'Finansr',
            products: [Products.Transactions],
            country_codes: [CountryCode.Pl], // Poland
            language: 'pl',
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error creating link token:", error);
        return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
    }
}
