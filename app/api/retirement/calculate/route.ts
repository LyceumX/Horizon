import { NextResponse } from "next/server";
import { addMonths, calcAgeAtDate, createDateFromParts, formatYearMonth, getCnRetireDate, getHkStandardRetireAge, getTwRetireAge } from "@/lib/retirement";

type RequestPayload = {
  region?: "cn" | "hk" | "mo" | "tw" | "sg";
  gender?: "male" | "female";
  identity?: "worker" | "cadre";
  special_work?: boolean;
  birth?: string;
  employment_type?: "private" | "government_civilian" | "government_disciplined";
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

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

type RateState = { count: number; reset: number };

const rateStore = (globalThis as { __retirementRateStore?: Map<string, RateState> }).__retirementRateStore ?? new Map();
(globalThis as { __retirementRateStore?: Map<string, RateState> }).__retirementRateStore = rateStore;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const current = rateStore.get(ip);

  if (!current || current.reset < now) {
    rateStore.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((current.reset - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true };
}

export async function POST(request: Request) {
  const rate = checkRateLimit(request);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429, headers: { "Retry-After": `${rate.retryAfter ?? 60}` } });
  }

  const body = (await request.json()) as RequestPayload;
  const birth = parseBirth(body.birth);

  if (!birth) {
    return NextResponse.json({ message: "Invalid birth date." }, { status: 400 });
  }

  const region = body.region || "cn";
  const birthDate = createDateFromParts(birth.year, birth.month, 1);

  if (region === "cn") {
    const group = resolveGroup(body);
    if (!group) {
      return NextResponse.json({ message: "Invalid retirement category." }, { status: 400 });
    }
    const retireDate = getCnRetireDate(birthDate.toISOString().slice(0, 10), group as Parameters<typeof getCnRetireDate>[1]);
    if (!retireDate) {
      return NextResponse.json({ message: "Retirement data not found." }, { status: 404 });
    }
    const legalRetireAge = Number(calcAgeAtDate(birthDate, retireDate).toFixed(1));
    return NextResponse.json({
      legal_retire: formatYearMonth(retireDate),
      legal_retire_age: legalRetireAge,
      rule_group: group,
      rule_version: "2025-v1",
      region
    });
  }

  if (region === "hk") {
    const employmentType = body.employment_type || "private";
    const standardRetirementAge = getHkStandardRetireAge(employmentType);
    const standardDate = addMonths(birthDate, standardRetirementAge * 12);
    return NextResponse.json({
      legal_retire: formatYearMonth(standardDate),
      legal_retire_age: standardRetirementAge,
      meta: {
        standard_retire_age: standardRetirementAge,
        mpf_withdraw_age: 65,
        mpf_early_withdraw_age: 60,
        employment_type: employmentType
      },
      region,
      rule_version: "2025-v1"
    });
  }

  if (region === "mo") {
    const normalPensionAge = 65;
    return NextResponse.json({
      legal_retire: formatYearMonth(addMonths(birthDate, normalPensionAge * 12)),
      legal_retire_age: normalPensionAge,
      meta: {
        early_pension_age: 60,
        normal_pension_age: normalPensionAge
      },
      region,
      rule_version: "2025-v1"
    });
  }

  if (region === "tw") {
    const retireAge = getTwRetireAge(birth.year);
    const retireDate = addMonths(birthDate, retireAge * 12);
    return NextResponse.json({
      legal_retire: formatYearMonth(retireDate),
      legal_retire_age: retireAge,
      region,
      rule_version: "2025-v1"
    });
  }

  if (region === "sg") {
    const age55Date = addMonths(birthDate, 55 * 12);
    const age65Date = addMonths(birthDate, 65 * 12);
    return NextResponse.json({
      legal_retire: formatYearMonth(age65Date),
      legal_retire_age: 65,
      meta: {
        age55_date: formatYearMonth(age55Date),
        age65_date: formatYearMonth(age65Date),
        cpf_rules: {
          age55Rules: {
            unconditionalWithdrawal: 5000,
            conditionWithdrawal: "Full Retirement Sum",
            propertyWithdrawal: "Basic Retirement Sum"
          },
          age65Rules: {
            partialWithdrawal: 0.2,
            cpfLifePayoutStart: 65
          }
        }
      },
      region,
      rule_version: "2025-v1"
    });
  }

  return NextResponse.json({ message: "Unsupported region." }, { status: 400 });
}
