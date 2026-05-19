import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type PreferencePayload = {
  language?: "en" | "zh";
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ language: null }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ language: null }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("language")
    .eq("clerk_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ language: null, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ language: data?.language ?? null });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ saved: false, message: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as PreferencePayload;
  if (body.language !== "en" && body.language !== "zh") {
    return NextResponse.json({ saved: false, message: "Invalid language." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ saved: false, message: "Not saved: configure Supabase env vars first." }, { status: 503 });
  }

  const { error } = await supabase.from("user_preferences").upsert({
    clerk_user_id: userId,
    language: body.language,
    updated_at: new Date().toISOString()
  }, {
    onConflict: "clerk_user_id"
  });

  if (error) {
    return NextResponse.json({ saved: false, message: `Save failed: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
