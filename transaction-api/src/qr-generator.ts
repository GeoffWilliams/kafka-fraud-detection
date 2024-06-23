
import {getExamplesAsStrings} from "./index.ts"
import qrcode from "qrcode";
import { search, SafetyLevels } from "ddg-images/mod.ts";
import assert from "node:assert"

const baseUrl = async () => {
    const proc = Bun.spawn(['terraform', 'output', "-raw", "base_url"], {
        cwd: "../terraform-aws",
    });
    const out = await new Response(proc.stdout).text();
    const err = await new Response(proc.stderr).text();
    if (err) {
        console.error(err)
        throw new Error("failed to run terraform")
    }
    console.log(`Using baseUrl: ${out}`)
    assert(out.length > 0)

    return out
}

const searchImage = async (term: string) => {
    console.log(`image search: ${term}`);

    const duck = await search(term, SafetyLevels.STRICT)
    return `<img width="20%" src=\"${duck[0].image}\"/>`
}

const qrCode = async (url: string) => {
    console.log(`url: ${url}`)
    const base64Image = await qrcode.toDataURL(url); // data:image/gif;base64,...
    return `<img width="20%" src="${base64Image}" />`
}

const example = async (url: string, json: any) => {
    let amount;
    let currency;
    if (json["amount_money"]) {
        amount = json["amount_money"]["amount"]
        currency = json["amount_money"]["currency"]
    } else {
        amount = "0"
        currency = "XXX"
    }
    return `
    <div style="border: 5px solid black; border-radius: 20px; margin-bottom: 20px; width: 40%; padding: 20px;">
        ${await searchImage(json["note"])}
        ${await qrCode(url)}
        <div>Source_id: ${json["source_id"]}</div>
        <div>Location: ${json["location_id"]}</div>
        <div>$${amount}${currency}</div>
        <div><a href="${url}">${url}</a></div>
    </div>
    `
}

const main = async () => {
    console.log("generate qr codes")
    const examples = await getExamplesAsStrings();
    let html = `
    <style>
    @media print {
        div {
          break-inside: avoid;
        }
      }
    </style>`

    const baseUrlResolved = await baseUrl();
    for (const [key, value] of Object.entries(examples)) {
        const json = JSON.parse(value);
        const url = `${baseUrlResolved}/${key}`

        html += await example(url, json)
    }
    html += "</div>"

    await Bun.write("./qrcodes/qr.html", html);
}

await main()

