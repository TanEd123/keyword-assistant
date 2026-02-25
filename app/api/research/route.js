import Anthropic from "@anthropic-ai/sdk";

export async function POST(request) {
  const { topic } = await request.json();

  if (!topic || topic.trim().length < 3) {
    return Response.json({ error: "Please enter a valid topic." }, { status: 400 });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `You are an expert market research assistant and social media strategist for coaches, consultants, and service providers.

Your job is to deeply research pain points, frustrations, and desires of a target audience — then produce a strategic keyword list the coach can use across their social profiles to be discovered by the algorithm AND by people searching for help.

When researching, look for:
- Real complaints and frustrations from Reddit, forums, Facebook groups, reviews, Twitter/X, and Quora
- Exact language and phrases people use (not polished marketing speak)
- What they've tried that hasn't worked
- What they wish existed
- Their fears, embarrassments, and deepest desires around this topic

Then produce a keyword list organized as a CSV with these exact columns:
Keyword,Category,Platform,Search_Intent,Notes

Where:
- Keyword: the exact keyword or phrase
- Category: one of: Pain Point | Desire | Identity | Solution Seeking | Emotion | Transformation
- Platform: Best platform(s): Instagram | LinkedIn | TikTok | Google | Pinterest | YouTube | All
- Search_Intent: Informational | Navigational | Commercial | Transactional
- Notes: brief note on why this keyword matters or how to use it

Produce at least 40-60 keywords. Mix short-tail and long-tail. Include hashtag-style keywords (without the #) and search-style phrases.

IMPORTANT: Output ONLY the CSV data. Start directly with the header row. No intro text, no explanation, no markdown formatting, no code blocks. Just raw CSV.`;

  const userMessage = `Research this ideal client for a coach: "${topic}"

Search for what these people are struggling with, frustrated by, and actively searching for solutions to. Find their real pain points from reviews, forums, Reddit, social media. What's missing? What do they wish existed?

Then generate the keyword CSV as instructed.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract the text content from the response
    let csvContent = "";
    for (const block of response.content) {
      if (block.type === "text") {
        csvContent += block.text;
      }
    }

    // Clean up any accidental markdown
    csvContent = csvContent
      .replace(/```csv\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    return Response.json({ csv: csvContent });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Something went wrong. Check your API key or try again." },
      { status: 500 }
    );
  }
}
