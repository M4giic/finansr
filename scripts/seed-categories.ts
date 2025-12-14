
import "dotenv/config";
import db from "../src/lib/db";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";
import { createCategory } from "../src/app/actions/categories";
import { createSubcategory } from "../src/app/actions/manage-subcategories";

async function main() {
    console.log("Seeding Global Categories...");

    for (const cat of DEFAULT_CATEGORIES) {
        console.log(`Processing category: ${cat.name}`);

        // Create as Global (accountId: null)
        // Note: createCategory now handles normalization and duplicates
        const categoryResult = await createCategory(cat.name, null);

        if (categoryResult.success && categoryResult.category) {
            if (categoryResult.category.accountId === null) {
                console.log(`  - Global Category ensured: ${categoryResult.category.name}`);
            } else {
                console.log(`  - Existing category found but it might be account specific? ID: ${categoryResult.category.id}, AccountID: ${categoryResult.category.accountId}`);
                // If createCategory returned an account-specific one when we asked for global (null), that would be a bug in createCategory logic or usage.
                // Let's verify createCategory logic:
                // const existing = await db.category.findFirst({ where: { name: normalizedName, accountId: accountId || null } });
                // If accountId is null, it looks for accountId: null. So it should be fine.
            }

            for (const subName of cat.subcategories) {
                await createSubcategory(subName, categoryResult.category.id);
                console.log(`    - Subcategory ensured: ${subName}`);
            }
        } else {
            console.error(`  - Failed to create category ${cat.name}:`, categoryResult.error);
        }
    }

    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
