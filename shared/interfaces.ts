export interface LocationMessage {
    userid: string;
    location: string;
}


export interface TransactionMessage {
    ts: string
    idempotency_key: string
    amount_money: {
        amount: string
        currency: string
    }
    source_id: string
    autocomplete: boolean
    customer_id: string
    location_id: string
    reference_id: string
    note: string
    app_fee_money: {
        amount: number
        currency: string
    }
}
