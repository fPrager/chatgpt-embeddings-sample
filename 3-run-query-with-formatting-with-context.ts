import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
import getClients from "./util/get-clients.ts";

const QUERY = 'What is the structure of the curriculum?'
const CONTEXT = 'You are an assistant who can explain the structure of the Pre Primary One curriculum of Kenya.'
const FORMAT_INSTRUCTIONS = 'Format the response as as JSON. Respond with """null""" if you have no answer to the question.'

const { openAiClient } = getClients()

const prompt = `
  Context: 
  ${CONTEXT}

  Format instructions:
  ${FORMAT_INSTRUCTIONS}

  Question: """
  ${QUERY}
  """`

// @ts-expect-error chalk's color property is not defined
console.log('prompt:', '\n', chalk.green(prompt))

// In production we should handle possible errors
const completionResponse = await openAiClient.createCompletion({
  model: 'text-davinci-003',
  prompt,
  max_tokens: 100,
  temperature: 0, // Set to 0 for deterministic results
})

const {
  choices: [{ text }],
} = completionResponse.data

// @ts-expect-error chalk's color property is not defined
console.log('completion text:', chalk.blue(text))