import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type RequestPayload = {
  gender?: "male" | "female";
  identity?: "worker" | "cadre";
  special_work?: boolean;
  birth?: string;
};

type LookupResult = {
  retire_year: number;
  retire_month: number;
};

function parseBirth(input?: string) {
  if (!input) {
    return null;
  }

  const parts = input.split("-");
  if (parts.length < 2) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function resolveGroup(payload: RequestPayload) {
  const { gender, identity, special_work } = payload;

  if (special_work) {
    if (gender === "male") {
      return "special_male";
    }
    if (gender === "female") {
      return "special_female";
    }
    return null;
  }

  if (gender === "male") {
    return "male";
  }

  if (gender === "female") {
    return identity === "worker" ? "female_worker" : "female_cadre";
  }

  return null;
}

function formatYearMonth(year: number, month: number) {
  const paddedMonth = String(month).padStart(2, "0");
  return `${year}-${paddedMonth}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;
  const birth = parseBirth(body.birth);

  if (!birth) {
    return NextResponse.json({ message: "Invalid birth date." }, { status: 400 });
  }

  const group = resolveGroup(body);
  if (!group) {
    return NextResponse.json({ message: "Invalid retirement category." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Not configured: Supabase env vars missing." }, { status: 503 });
  }

  const tableName = body.special_work ? "retirement_special_lookup" : "retirement_lookup";
  const { data, error } = await supabase
    .from(tableName)
    .select("retire_year, retire_month")
    .eq("rule_group", group)
    .eq("birth_year", birth.year)
    .eq("birth_month", birth.month)
    .single<LookupResult>();

  if (error || !data) {
    return NextResponse.json({ message: "Retirement data not found." }, { status: 404 });
  }

  return NextResponse.json({
    legal_retire: formatYearMonth(data.retire_year, data.retire_month),
    rule_group: group,
    rule_version: "2025-v1"
  });
}
