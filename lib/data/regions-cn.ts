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

export const CN_REGIONS: CountryOption[] = [
  {
    value: "cn",
    label: { en: "China", zh: "中国" },
    provinces: [
      {
        value: "zhejiang",
        label: { en: "Zhejiang", zh: "浙江" },
        cities: [
          {
            value: "hangzhou",
            label: { en: "Hangzhou", zh: "杭州" },
            insurance: {
              pension: "Basic pension +5.5%",
              medical: "Medical insurance +2.0%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.5%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only.",
            },
          },
          {
            value: "ningbo",
            label: { en: "Ningbo", zh: "宁波" },
            insurance: {
              pension: "Basic pension +5.3%",
              medical: "Medical insurance +1.9%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.4%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only.",
            },
          },
        ],
      },
      {
        value: "guangdong",
        label: { en: "Guangdong", zh: "广东" },
        cities: [
          {
            value: "shenzhen",
            label: { en: "Shenzhen", zh: "深圳" },
            insurance: {
              pension: "Basic pension +6.0%",
              medical: "Medical insurance +2.2%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.5%",
              workplace: "Enterprise annuity: popular",
              note: "Fake preset for demonstration only.",
            },
          },
          {
            value: "guangzhou",
            label: { en: "Guangzhou", zh: "广州" },
            insurance: {
              pension: "Basic pension +5.8%",
              medical: "Medical insurance +2.1%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.4%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only.",
            },
          },
        ],
      },
    ],
  },
];
