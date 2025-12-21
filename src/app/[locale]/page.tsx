import { getTranslations } from 'next-intl/server';
import { ImportWizard } from "@/components/import-wizard";
import { TransactionList } from "@/components/transaction-list";
import { SubmitButton } from "@/components/submit-button";
import { TinkLink } from "@/components/tink-link";
import { AccountManager } from "@/components/account-manager";
import { CategoryManager } from "@/components/category-manager";
import { AllTransactions } from "@/components/all-transactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import db from "@/lib/db";
import { getCategories } from "@/app/actions/categories";
import { getExistingBanks } from "@/app/actions/get-banks";
import { SyncButton } from "@/components/sync-button";

async function getAccounts() {
    let accounts = await db.account.findMany({
        include: {
            importCoverages: {
                orderBy: {
                    startDate: 'asc'
                }
            }
        }
    });
    if (accounts.length === 0) {
        // Create default account
        await db.account.create({
            data: {
                name: "Personal Account",
                type: "PERSONAL",
                currency: "PLN"
            }
        });
        accounts = await db.account.findMany({
            include: {
                importCoverages: {
                    orderBy: {
                        startDate: 'asc'
                    }
                }
            }
        });
    }
    return accounts;
}

async function getStagedTransactions() {
    return await db.transaction.findMany({
        where: { status: "STAGED" },
        orderBy: { date: 'desc' },
        include: { account: true }
    });
}

async function getAllTransactions() {
    return await db.transaction.findMany({
        orderBy: { date: 'desc' },
        include: { account: true }
    });
}

async function getCategoriesWithAccounts() {
    return await db.category.findMany({
        include: {
            account: true,
            subcategories: true
        },
        orderBy: { name: 'asc' }
    });
}

export default async function HomePage() {
    try {
        const t = await getTranslations('HomePage');
        const stagedTransactions = await getStagedTransactions();
        const allTransactions = await getAllTransactions();
        const categories = await getCategories();
        const categoriesWithAccounts = await getCategoriesWithAccounts();
        const accounts = await getAccounts();
        const { banks: existingBanks } = await getExistingBanks();

        // Count complete staged transactions (have category AND wantedLevel)
        const completeCount = stagedTransactions.filter(tx => tx.categoryId && tx.wantedLevel).length;

        // Calculate date range for staged transactions
        let dateRangeString = "";
        if (stagedTransactions.length > 0) {
            const dates = stagedTransactions.map(tx => new Date(tx.date).getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            dateRangeString = ` - Covering: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
        }

        return (
            <main className="flex min-h-screen flex-col items-center p-8 gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-xl text-gray-600">{t('subtitle')}</p>
                </div>

                <div className="w-full max-w-7xl">
                    <Tabs defaultValue="import" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="import">Import & Staging</TabsTrigger>
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Import & Staging */}
                        <TabsContent value="import" className="space-y-6">
                            <div className="flex flex-col gap-4 items-center">
                                <TinkLink />
                                <div className="text-sm text-gray-500">- OR -</div>
                                <ImportWizard accounts={accounts} />
                            </div>

                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">
                                    Staging Area ({stagedTransactions.length} transactions{dateRangeString})
                                </h2>
                                {stagedTransactions.length > 0 ? (
                                    <>
                                        <TransactionList
                                            initialTransactions={stagedTransactions}
                                            categories={categories}
                                            accounts={accounts}
                                            existingBanks={existingBanks}
                                        />
                                        <div className="mt-4">
                                            <SubmitButton
                                                totalCount={stagedTransactions.length}
                                                completeCount={completeCount}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8 border rounded-lg">
                                        No transactions in staging. Upload a CSV or connect your bank to get started.
                                    </p>
                                )}
                            </div>
                        </TabsContent>



                        {/* Tab 2: Admin */}
                        <TabsContent value="admin" className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Configuration</h2>
                                <SyncButton />
                            </div>
                            <AccountManager initialAccounts={accounts} />
                            <CategoryManager initialCategories={categoriesWithAccounts} />
                        </TabsContent>

                        {/* Tab 3: Analytics */}
                        <TabsContent value="analytics">
                            <div className="text-center py-16 border rounded-lg bg-gray-50">
                                <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                                <p className="text-gray-600">
                                    This section will contain charts and insights about your spending.
                                </p>
                            </div>
                        </TabsContent>

                        {/* Tab 4: All Transactions */}
                        <TabsContent value="transactions">
                            <AllTransactions
                                initialTransactions={allTransactions}
                                categories={categories}
                                accounts={accounts}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        );
    } catch (error) {
        console.error("HomePage Error:", error);
        return (
            <div className="p-24 text-red-500">
                <h1>Error loading page</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }
}
