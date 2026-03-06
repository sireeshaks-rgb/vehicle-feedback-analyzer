import Groq from "groq-sdk";
import "dotenv/config";

async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("Checking API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) return;

    const groq = new Groq({ apiKey });
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("SUCCESS:", chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error("GROQ ERROR:", error);
    }
}

testGroq();
