import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type RequestPayload = {
  profile: Record<string, unknown>;
  projection: Record<string, unknown>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      saved: false,
      message: "Not saved: configure Supabase env vars first."
    });
  }

  const tableName = process.env.SUPABASE_TABLE_NAME || "planner_profiles";
  const { error } = await supabase.from(tableName).insert({
    profile: body.profile,
    projection: body.projection,
    created_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({
      saved: false,
      message: `Save failed: ${error.message}`
    });
  }

  return NextResponse.json({
    saved: true,
    message: "Scenario saved to Supabase."
  });
}
