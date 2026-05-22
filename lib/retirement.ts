export type MainlandCategory = "male" | "female_pro" | "female_worker" | "special_male" | "special_female" | "prefer_not_to_say";
export type Region =
  // Greater China & Southeast Asia
  | "cn" | "hk" | "mo" | "tw" | "sg" | "my"
  // Asia-Pacific
  | "au" | "jp" | "kr" | "nz" | "ca"
  // EMEA — Europe
  | "de" | "fr" | "nl" | "ch" | "se" | "no" | "dk" | "es" | "it" | "pl" | "tr" | "il"
  // EMEA — Middle East & Africa
  | "ae" | "sa" | "za"
  // Coming soon
  | "us" | "uk";
export type EmploymentType = "private" | "government_civilian" | "government_disciplined";

type PolicyConfig = {
  baseAge: number;
  stepMonths: number;
  capAge: number;
};

export function createDateFromParts(year: number, month: number, day = 1) {
  return new Date(year, month - 1, day);
}

export function toMonthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function formatYearMonth(date: Date) {
  const paddedMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${paddedMonth}`;
}

function getPolicyConfig(group: MainlandCategory): PolicyConfig {
  switch (group) {
    case "male":
      return { baseAge: 60, stepMonths: 4, capAge: 63 };
    case "female_worker":
      return { baseAge: 50, stepMonths: 2, capAge: 55 };
    case "female_pro":
      return { baseAge: 55, stepMonths: 4, capAge: 58 };
    case "special_male":
      return { baseAge: 55, stepMonths: 4, capAge: 58 };
    case "special_female":
      return { baseAge: 45, stepMonths: 2, capAge: 50 };
    case "prefer_not_to_say":
    default:
      return { baseAge: 60, stepMonths: 4, capAge: 63 }; // treats as male for CN (conservative)
  }
}

export function getCnRetireDate(dob: string, category: MainlandCategory) {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const policy = getPolicyConfig(category);
  const baseRetireDate = addMonths(birthDate, policy.baseAge * 12);
  const reformStart = new Date(2025, 0, 1);

  if (toMonthIndex(baseRetireDate) < toMonthIndex(reformStart)) {
    return baseRetireDate;
  }

  const diffMonths = toMonthIndex(baseRetireDate) - toMonthIndex(reformStart);
  const delayMonths = Math.floor(diffMonths / policy.stepMonths);
  const delayedDate = addMonths(baseRetireDate, delayMonths);
  const capDate = addMonths(birthDate, policy.capAge * 12);

  return toMonthIndex(delayedDate) > toMonthIndex(capDate) ? capDate : delayedDate;
}

export function getHkStandardRetireAge(employmentType: EmploymentType) {
  if (employmentType === "government_disciplined") {
    return 55;
  }

  return 60;
}

export function getTwRetireAge(birthYear: number) {
  const rocYear = birthYear - 1911;
  if (rocYear <= 46) {
    return 60;
  }
  if (rocYear === 47) {
    return 61;
  }
  if (rocYear === 48) {
    return 62;
  }
  if (rocYear === 49) {
    return 63;
  }
  if (rocYear === 50) {
    return 64;
  }
  return 65;
}

export function getDefaultRetireDate(region: Region, dob: string, category: MainlandCategory, employmentType: EmploymentType) {
  if (region === "cn") {
    return getCnRetireDate(dob, category);
  }

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  if (region === "hk") {
    return addMonths(birthDate, getHkStandardRetireAge(employmentType) * 12);
  }

  if (region === "mo") {
    return addMonths(birthDate, 65 * 12);
  }

  if (region === "tw") {
    return addMonths(birthDate, getTwRetireAge(birthDate.getFullYear()) * 12);
  }

  if (region === "sg") {
    return addMonths(birthDate, 65 * 12);
  }

  if (region === "uk") {
    return null;
  }

  // Statutory retirement ages by region.
  // Some countries have gender-differentiated ages; female_pro / female_worker = female.
  const isFemale = category === "female_pro" || category === "female_worker" || category === "special_female";

  const RETIRE_AGE_MALE: Partial<Record<Region, number>> = {
    us: 67,
    au: 67, jp: 65, kr: 63, ca: 65, nz: 65, my: 60,
    de: 67, fr: 64, nl: 67, ch: 65, se: 65, no: 67,
    dk: 67, es: 65, it: 67, pl: 65, tr: 60, il: 67,
    ae: 60, sa: 60, za: 65,
  };
  const RETIRE_AGE_FEMALE: Partial<Record<Region, number>> = {
    // Countries with lower female retirement ages
    pl: 60, tr: 58, sa: 55, za: 60,
    kr: 63, my: 60,
  };

  const ageMap = isFemale ? { ...RETIRE_AGE_MALE, ...RETIRE_AGE_FEMALE } : RETIRE_AGE_MALE;
  const age = ageMap[region] ?? 65;
  return addMonths(birthDate, age * 12);
}

export function calcAgeAtDate(birthDate: Date, targetDate: Date) {
  const months = toMonthIndex(targetDate) - toMonthIndex(birthDate);
  return months / 12;
}
