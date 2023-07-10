import "https://deno.land/x/dotenv/load.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

const openAiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_KEY')

if (!openAiKey) {
    throw new Error('Missing environment variable OPENAI_API_KEY')
}

if (!supabaseUrl) {
    throw new Error('Missing environment variable SUPABASE_URL')
}

if (!supabaseKey) {
    throw new Error('Missing environment variable SUPABASE_KEY')
}

const getClients = () => {
    const configuration = new Configuration({ apiKey: openAiKey })
    const openAiClient = new OpenAIApi(configuration)

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    return { openAiClient, supabaseClient }

}

export default getClients