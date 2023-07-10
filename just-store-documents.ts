import getDocuments from "./util/get-documents.ts";

const documents = await getDocuments()
console.log(documents)

let clearDirectory = true
try {
    await Deno.stat("docs/split")
}
catch (_) {
    clearDirectory = false
}

if (clearDirectory) {
    await Deno.remove("docs/split", { recursive: true })
}
await Deno.mkdir("docs/split")
for (let i = 0; i < documents.length; i++) {
    await Deno.writeTextFile(`docs/split/${i}.md`, documents[i].pageContent)
}