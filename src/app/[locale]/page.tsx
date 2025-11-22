import { getTranslations } from 'next-intl/server';
import { CsvUpload } from "@/components/csv-upload";
import { TransactionList } from "@/components/transaction-list";
import { SubmitButton } from "@/components/submit-button";
import { TinkLink } from "@/components/tink-link";
import db from "@/lib/db";
import { getCategories } from "@/app/actions/categories";

async function getStagedTransactions() {
    return await db.transaction.findMany({
        where: { status: "STAGED" },
        orderBy: { date: 'desc' }
    });
}

async function getSubmittedTransactions() {
    return await db.transaction.findMany({
        where: { status: "SUBMITTED" },
        orderBy: { submittedAt: 'desc' },
        take: 50
    });
}

export default async function HomePage() {
    try {
        const t = await getTranslations('HomePage');
        const stagedTransactions = await getStagedTransactions();
        const submittedTransactions = await getSubmittedTransactions();
        const categories = await getCategories();

        // Count complete staged transactions (have category AND wantedLevel)
        const completeCount = stagedTransactions.filter(tx => tx.categoryId && tx.wantedLevel).length;

        return (
            <main className="flex min-h-screen flex-col items-center p-24 gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-xl text-gray-600">{t('subtitle')}</p>
                </div>

                <div className="w-full max-w-2xl flex flex-col gap-4 items-center">
                    <TinkLink />
                    <div className="text-sm text-gray-500">- OR -</div>
                    <CsvUpload />
                </div>

                {/* Staging Area */}
                <div className="w-full max-w-6xl mt-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Staging Area ({stagedTransactions.length} transactions)
                    </h2>
                    {stagedTransactions.length > 0 ? (
                        <>
                            <TransactionList initialTransactions={stagedTransactions} categories={categories} />
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

                {/* Submitted Transactions */}
                {submittedTransactions.length > 0 && (
                    <div className="w-full max-w-6xl mt-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Submitted Transactions ({submittedTransactions.length})
                        </h2>
                        <TransactionList initialTransactions={submittedTransactions} categories={categories} />
                    </div>
                )}
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
