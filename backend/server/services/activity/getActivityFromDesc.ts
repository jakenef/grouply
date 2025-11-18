import OpenAI from "openai";

// takes in a desc and a name maybe and uses text embedding vector math to find related activities
export async function getActivityFromDesc(desc: string) {
  // generate semantic embedding for desc
  const openai = new OpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: desc,
    encoding_format: "float",
  });

  const embedding = response.data[0].embedding;

  // compare against database, find best match using cosine similarity
  // return activity ID if high enough, null if not
}
