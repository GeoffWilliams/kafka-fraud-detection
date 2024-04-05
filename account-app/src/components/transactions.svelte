<script lang="ts">
	import { onMount } from 'svelte';

    let transactions: Array<any> = []
    let badMessages: Array<string> = []

    const parseTransaction = (message: string) => {
        let parsed = false
        try {
            const json = JSON.parse(message)
            if ("idempotency_key" in json &&
                "source_id" in json &&
                "location_id" in json &&
                "amount_money" in json &&
                "amount" in json.amount_money &&
                "currency" in json.amount_money) {
                    parsed = json;
            }
        } catch (e) {}

        return parsed
    }


    onMount(() => {
        console.debug("onmount!")
        const ws = new WebSocket("ws://localhost:9000/wss/transaction");
        ws.addEventListener("message", (message: any) => {
            const payload = message.data
            console.debug(`received transaction: ${payload}`)
            const newTransaction = parseTransaction(payload)
            if (newTransaction) {
                transactions = [...transactions, newTransaction]
            } else {
                badMessages = [...badMessages, payload]
            }
        });
	});
</script>
<section id="transactions">
    <h2>Recent Transactions: {transactions.length}</h2>
    <body>
        <table>
          <thead>
            <tr>
              <th>idempotency_key</th>
              <th>timestamp</th>
              <th>amount</th>
              <th>currency</th>
              <th>source_id</th>
              <th>location_id</th>
            </tr>
          </thead>
          <tbody>
            {#each transactions as transaction}
              <tr>
                <td>{transaction.idempotency_key}</td>
                <td>{transaction.ts}</td>
                <td>{transaction.amount_money.amount}</td>
                <td>{transaction.amount_money.currency}</td>
                <td>{transaction.source_id}</td>
                <td>{transaction.location_id}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </body>

      <h2>Bad messages: {badMessages.length}</h2>
      <div id="badmessages">
        {#each badMessages as badMessage}
            <div><textarea>{badMessage}</textarea></div>
        {/each}
      </div>
</section>