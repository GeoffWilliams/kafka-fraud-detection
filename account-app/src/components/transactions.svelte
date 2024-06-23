<script lang="ts">
	  import { onMount } from 'svelte';
    import { TransactionMessageType, type TransactionMessage} from "shared/src/interfaces";

    let transactions: Array<any> = []
    let transactionChallenge: Array<any> = []
    let transactionForbid: Array<any> = []
    let badMessages: Array<string> = []

    const parseTransaction = (message: string): TransactionMessage|undefined => {
        try {
            const json = JSON.parse(message);
            const transactionMessage = json as TransactionMessage;
            return transactionMessage;
        } catch (e) {
          console.error("JSON parse error!!! ");
          console.error(message);
        }
    }


    onMount(() => {
        console.debug("onmount!")
        const ws = new WebSocket("ws://localhost:9000/ws/transactionMessage");
        ws.addEventListener("message", (message: any) => {
            const payload = message.data
            console.debug(`received transaction: ${payload}`)
            const transactionMessage = parseTransaction(payload)
            if (transactionMessage && transactionMessage.transactionMessageType === TransactionMessageType.TransactionReceived) {
                // received
                transactions = [transactionMessage.TransactionReceived, ...transactions]
            } else if (transactionMessage && transactionMessage.transactionMessageType === TransactionMessageType.TransactionChallenge) {
                // challenge
                transactionChallenge = [transactionMessage.TransactionChallenge, ...transactionChallenge]
            } else if (transactionMessage && transactionMessage.transactionMessageType === TransactionMessageType.TransactionForbid) {
                // forbid
                transactionForbid = [transactionMessage.TransactionForbid, ...transactionForbid]
            } else {
                badMessages = [payload, ...badMessages]
            }
        });
	});
</script>

<section id="transactions">
    <h2>Forbidden</h2>
    EG banned countries:
    <ul>
    {#each transactionForbid as tf}
      <li>${JSON.stringify(tf)}</li>
    {/each}
    </ul>

    <h2>Challenge</h2>
    Eg 3D secure - ask customer to enter OTP from an app
    <ul>
      {#each transactionChallenge as tc}
        <li>${JSON.stringify(tc)}</li>
      {/each}
    </ul>


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
                <td style="text-align: right;">${transaction.amount_money.amount.toFixed(2)}</td>
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