import NordigenClient from 'nordigen-node';

const SECRET_ID = process.env.GOCARDLESS_SECRET_ID;
const SECRET_KEY = process.env.GOCARDLESS_SECRET_KEY;

if (!SECRET_ID || !SECRET_KEY) {
    console.warn("GoCardless credentials missing. Bank integration will not work.");
}

export const client = new NordigenClient({
    secretId: SECRET_ID || '',
    secretKey: SECRET_KEY || '',
});

export async function getToken() {
    // The client handles token generation internally usually, but explicit call might be needed
    const token = await client.generateToken();
    return token;
}

export async function createRequisition(institutionId: string, redirectUrl: string) {
    const init = await client.initSession({
        redirectUrl,
        institutionId,
        referenceId: crypto.randomUUID(),
    });
    return init;
}

export async function getAccounts(requisitionId: string) {
    const requisition = await client.requisition.getRequisitionById(requisitionId);
    return requisition.accounts;
}

export async function getTransactions(accountId: string, dateFrom: string, dateTo: string) {
    const account = client.account(accountId);
    const transactions = await account.getTransactions({
        dateFrom,
        dateTo,
    });
    return transactions;
}

export async function getInstitutions(country: string = 'PL') {
    return await client.institution.getInstitutions({ country });
}
