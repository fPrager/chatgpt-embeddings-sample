import GPT3Tokenizer from 'https://esm.sh/gpt3-tokenizer@1.1.5'
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
import getClients from './util/get-clients.ts';

const QUERY = 'What is the structure of the Kenyan curriculum?';
const FORMAT_INSTRUCTIONS = 'Format the response as as JSON. Respond with """null""" if you have no answer to the question.'
const CONTEXT = `You are an assistant who can explain the structure of the Pre Primary One curriculum of Kenya.
Given the following sections from the Kenyan curriculum, answer the question using only the information from these sections.`

const TOKEN_LIMIT = 4097 // see limit https://platform.openai.com/docs/models/gpt-3-5
const MAX_COMPLETION_TOKENS = 400

const { openAiClient, supabaseClient } = getClients()

// Generate a one-time embedding for the query itself
const embeddingResponse = await openAiClient.createEmbedding({
  model: 'text-embedding-ada-002',
  input: QUERY,
})

const [{ embedding }] = embeddingResponse.data.data

// Fetching whole documents for this simple example.
//
// Ideally for context injection, documents are chunked into
// smaller sections at earlier pre-processing/embedding step.
const { data: documents } = await supabaseClient.rpc('match_documents', {
  query_embedding: embedding,
  match_threshold: 0.78, // Choose an appropriate threshold for your data
  match_count: 10, // Choose the number of matches
})

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
let tokenCount = 0
let contextText = ''

const introTokensCount = tokenizer.encode(CONTEXT).text.length

if (documents) {
  // Concat matched documents
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i]
    const content = JSON.parse(document.content).pageContent
    const encoded = tokenizer.encode(content)
    tokenCount += encoded.text.length

    // Limit context to max 1500 tokens (configurable)
    if (tokenCount > TOKEN_LIMIT - introTokensCount - MAX_COMPLETION_TOKENS) {
      break
    }

    contextText += `${content.trim()}\n---\n`
  }
} else {
  contextText = 'No context given.'
}

const prompt = `
  Context: 
  ${CONTEXT}
  Context sections:
  ${contextText}

  Format instructions:
  ${FORMAT_INSTRUCTIONS}

  Question: """
  ${QUERY}
  """`

// @ts-expect-error chalk's color property is not defined
console.log('prompt:', '\n', chalk.green(prompt))
console.log('used tokens:', tokenizer.encode(prompt).text.length)

// In production we should handle possible errors
const completionResponse = await openAiClient.createCompletion({
  model: 'text-davinci-003',
  prompt,
  max_tokens: MAX_COMPLETION_TOKENS,
  temperature: 0, // Set to 0 for deterministic results
})

console.log('completion response:', completionResponse.data)
const {
  choices: [{ text }],
} = completionResponse.data

// @ts-expect-error chalk's color property is not defined
console.log('completion text:', chalk.blue(text))