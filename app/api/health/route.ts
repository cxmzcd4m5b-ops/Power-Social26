import { NextResponse } from "next/server";

export async function GET() {
  const configured = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;
  
  return NextResponse.json({ 
    configured,
    status: "ok" 
  });
}
