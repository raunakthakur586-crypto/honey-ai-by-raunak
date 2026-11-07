export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "API key not configured"
    }), { status: 500 });
  }

  try {
    const body = await request.json();

    const contents = body.messages.slice(-12).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`,
      {
        
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are Honey AI, a helpful personal AI created by Raunak. Answer naturally and helpfully."
            }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "AI request failed");
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "").join("");

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/chat"
};
