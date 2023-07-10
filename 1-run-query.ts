import "https://deno.land/x/dotenv/load.ts";
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
import getClients from "./util/get-clients.ts";

const QUERY = 'What is the structure of the curriculum?';

const { openAiClient } = getClients()

const prompt = `
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