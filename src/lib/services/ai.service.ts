import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-20b";

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content || "";
}