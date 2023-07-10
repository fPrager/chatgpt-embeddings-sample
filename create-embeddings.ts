import "https://deno.land/x/dotenv/load.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import getDocuments from "./util/get-documents.ts";
import GPT3Tokenizer from 'https://esm.sh/gpt3-tokenizer@1.1.5'

const openAiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_KEY')
const TOKEN_LIMIT = 8191 // from https://platform.openai.com/docs/guides/embeddings/what-are-embeddings

if (!openAiKey) {
    throw new Error('Missing environment variable OPENAI_API_KEY')
}

if (!supabaseUrl) {
    throw new Error('Missing environment variable SUPABASE_URL')
}

if (!supabaseKey) {
    throw new Error('Missing environment variable SUPABASE_KEY')
}

const configuration = new Configuration({ apiKey: openAiKey })
const openai = new OpenAIApi(configuration)
const supabaseClient = createClient(supabaseUrl, supabaseKey)
const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })

const documents = await getDocuments()
console.log("Try to insert", documents.length, "documents")

let goodToGo = true
for (const document of documents) {
    const input = document.pageContent
    const encoded = tokenizer.encode(input)
    const tokenCount = encoded.text.length
    if (tokenCount > TOKEN_LIMIT) {
        console.error('Error document has too much tokens', document.metadata.index)
        console.log('Tokens', tokenCount)
        goodToGo = false
    }
}

if (!goodToGo) {
    Deno.exit(1)
}

// clear the table first
await supabaseClient.from('documents').delete().neq("id", 0)

// Assuming each document is a string
for (const document of documents) {
    const input = document.pageContent

    let embeddingResponse
    try {
        embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input,
        })
    } catch (e) {
        console.error('Error creating embedding of document', document.metadata.index)
        console.log(e)
        break
    }

    if (embeddingResponse.status !== 200) {
        console.error('Error creating embedding')
        console.log('Status:', embeddingResponse.status)
        console.log('StatusText:', embeddingResponse.statusText)
        break
    }

    const [{ embedding }] = embeddingResponse.data.data
    // In production we should handle possible errors
    await supabaseClient.from('documents').insert({
        content: document,
        embedding,
    })
    console.log('Inserted document', document.metadata.index)
}
