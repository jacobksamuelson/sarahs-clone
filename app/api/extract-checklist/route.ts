import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const { transcript } = await req.json();

  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { error: "Transcript is required" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You extract action items from a mom's voice note to her family.

Return JSON: { "items": [{ "text": "...", "assignee": "..." }] }

Assignee rules:
- "leo" — if directed at Leo
- "felix" — if directed at Felix
- "boys" — if directed at "both of you", "boys", "you two", etc.
- "jake" — if directed at Jake/Dad/husband
- "everyone" — if no specific person mentioned, or directed at the whole family

Capitalize the first letter of each task text. Keep tasks concise but faithful to the original wording. If the note has no actionable items, return { "items": [] }.`,
        },
        { role: "user", content: transcript },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    return NextResponse.json(
      { error: "Failed to extract checklist" },
      { status: response.status }
    );
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json({ items: parsed.items || [] });
  } catch {
    console.error("Failed to parse checklist response:", content);
    return NextResponse.json(
      { error: "Failed to parse checklist" },
      { status: 500 }
    );
  }
}
