<script lang="ts">
	import { onMount } from 'svelte';
    let locationIsoCode = "UNKNOWN"
    let locationEmoji = "UNKNOWN"
    onMount(() => {
        console.debug("onmount!")
        const ws = new WebSocket("ws://localhost:9000/ws/location");
        ws.addEventListener("message", (message: any) => {
            const json = JSON.parse(message.data)
            console.debug(`location update: ${message.data}`)
            locationIsoCode = json.location
            locationEmoji = getFlagEmoji(locationIsoCode)
        });
	});

    // https://dev.to/jorik/country-code-to-flag-emoji-a21
    const getFlagEmoji = (countryCode: string) =>String.fromCodePoint(...[...countryCode.toUpperCase()].map(x=>0x1f1a5+x.charCodeAt(0)))

</script>
<section id="location">
   <h2>Location</h2>
   <p class="quote">We think you are in</p>
   <div id="country">{locationEmoji} ({locationIsoCode.toUpperCase()})</div>
</section>