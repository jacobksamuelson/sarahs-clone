import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json(
      { error: "Audio file is required" },
      { status: 400 }
    );
  }

  // Forward to OpenAI Whisper
  const whisperForm = new FormData();
  whisperForm.append("file", audio, "recording.webm");
  whisperForm.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Whisper API error:", errorText);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ transcript: data.text });
}
