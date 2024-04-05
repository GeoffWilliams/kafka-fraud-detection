
import {getExamplesAsStrings} from "./app.ts"
import { qrcode } from "https://deno.land/x/qrcode/mod.ts";
import { search, SafetyLevels } from 'https://deno.land/x/ddgimages@v1.0.0/search.ts'
import { assert } from "https://deno.land/std@0.221.0/assert/mod.ts";

const baseUrl = async () => {
    const proc = await new Deno.Command("terraform", {
        cwd: "../terraform-aws",
        args: ['output', "-raw", "base_url"]
    }).output();
    const td = new TextDecoder();
    const out = td.decode(proc.stdout).trim()
    const err = td.decode(proc.stderr)
    if (err) {
        console.error(td.decode(proc.stderr))
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
    const base64Image = await qrcode(url); // data:image/gif;base64,...
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

    await Deno.writeTextFile("./qrcodes/qr.html", html);
}

await main()

