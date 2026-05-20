export type SocialInsuranceProfile = {
  pension: string;
  medical: string;
  housing: string;
  unemployment: string;
  workplace: string;
  note: string;
};

export type CityOption = {
  value: string;
  label: { en: string; zh: string };
  insurance: SocialInsuranceProfile;
};

export type ProvinceOption = {
  value: string;
  label: { en: string; zh: string };
  cities: CityOption[];
};

export type CountryOption = {
  value: string;
  label: { en: string; zh: string };
  provinces: ProvinceOption[];
};

export const GLOBAL_REGIONS: CountryOption[] = [
  {
    value: "us",
    label: { en: "United States (Coming soon)", zh: "美国（即将上线）" },
    provinces: [
      {
        value: "california",
        label: { en: "California", zh: "加利福尼亚" },
        cities: [
          {
            value: "san-francisco",
            label: { en: "San Francisco", zh: "旧金山" },
            insurance: {
              pension: "401(k) match: mock 6%",
              medical: "Medical premium: mock 8%",
              housing: "Housing support: none",
              unemployment: "Unemployment: mock 1.0%",
              workplace: "Roth IRA: available",
              note: "Illustrative preset only.",
            },
          },
          {
            value: "los-angeles",
            label: { en: "Los Angeles", zh: "洛杉矶" },
            insurance: {
              pension: "401(k) match: mock 5%",
              medical: "Medical premium: mock 8.5%",
              housing: "Housing support: none",
              unemployment: "Unemployment: mock 1.0%",
              workplace: "Roth IRA: available",
              note: "Illustrative preset only.",
            },
          },
        ],
      },
    ],
  },
  {
    value: "hk",
    label: { en: "Hong Kong", zh: "中国香港" },
    provinces: [
      {
        value: "hk-island",
        label: { en: "Hong Kong", zh: "香港" },
        cities: [
          {
            value: "hong-kong",
            label: { en: "Hong Kong", zh: "香港" },
            insurance: {
              pension: "MPF withdrawal age 65",
              medical: "Public + private mix",
              housing: "Housing support varies",
              unemployment: "Low unemployment aid",
              workplace: "Employer MPF match",
              note: "Mock data for Hong Kong.",
            },
          },
        ],
      },
    ],
  },
  {
    value: "mo",
    label: { en: "Macao", zh: "中国澳门" },
    provinces: [
      {
        value: "macau",
        label: { en: "Macao", zh: "澳门" },
        cities: [
          {
            value: "macau",
            label: { en: "Macao", zh: "澳门" },
            insurance: {
              pension: "Pension age 60/65",
              medical: "Public health system",
              housing: "Housing support varies",
              unemployment: "Limited coverage",
              workplace: "Mandatory fund",
              note: "Mock data for Macao.",
            },
          },
        ],
      },
    ],
  },
  {
    value: "tw",
    label: { en: "Taiwan", zh: "中国台湾" },
    provinces: [
      {
        value: "taiwan",
        label: { en: "Taiwan", zh: "台湾" },
        cities: [
          {
            value: "taipei",
            label: { en: "Taipei", zh: "台北" },
            insurance: {
              pension: "Labor insurance pension",
              medical: "National health insurance",
              housing: "Housing support varies",
              unemployment: "Labor insurance coverage",
              workplace: "Labor pension",
              note: "Mock data for Taiwan.",
            },
          },
        ],
      },
    ],
  },
  {
    value: "sg",
    label: { en: "Singapore", zh: "新加坡" },
    provinces: [
      {
        value: "central",
        label: { en: "Central Region", zh: "中区" },
        cities: [
          {
            value: "singapore-city",
            label: { en: "Singapore", zh: "新加坡" },
            insurance: {
              pension: "CPF-like pension: mock 17%",
              medical: "Medical protection: mock 3%",
              housing: "Housing support: mock 10%",
              unemployment: "Unemployment cover: low",
              workplace: "Private pension: optional",
              note: "Illustrative preset only.",
            },
          },
        ],
      },
    ],
  },
  {
    value: "uk",
    label: { en: "United Kingdom (Coming soon)", zh: "英国（即将上线）" },
    provinces: [
      {
        value: "uk",
        label: { en: "United Kingdom", zh: "英国" },
        cities: [
          {
            value: "london",
            label: { en: "London", zh: "伦敦" },
            insurance: {
              pension: "State pension (coming soon)",
              medical: "NHS (coming soon)",
              housing: "Housing support (coming soon)",
              unemployment: "Benefits (coming soon)",
              workplace: "Workplace pension (coming soon)",
              note: "Coming soon for the UK.",
            },
          },
        ],
      },
    ],
  },
];
