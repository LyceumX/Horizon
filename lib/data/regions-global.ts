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

// ─── helpers ────────────────────────────────────────────────────────────────

function mock(
  pension: string,
  medical: string,
  housing: string,
  unemployment: string,
  workplace: string,
  note: string,
): SocialInsuranceProfile {
  return { pension, medical, housing, unemployment, workplace, note };
}

// ─── Insurance presets by country ───────────────────────────────────────────

const ins = {
  // APEC
  us:  mock("401(k) employer match ~6%", "Employer plan / ACA marketplace", "No federal housing fund", "State UI ~1%", "Roth IRA available", "Mock data — US rules coming soon."),
  hk:  mock("MPF withdrawal at 65", "Public + private mix", "Housing support varies", "Low unemployment aid", "Employer MPF match 5%", "Mock data for Hong Kong."),
  mo:  mock("Pension age 60 / 65", "Public health system", "Housing support varies", "Limited coverage", "Mandatory central fund", "Mock data for Macao."),
  tw:  mock("Labor insurance pension", "National Health Insurance", "Housing support varies", "Labor insurance coverage", "Labor pension (new system)", "Mock data for Taiwan."),
  sg:  mock("CPF OA/SA/MA split", "Medisave 10.5% (employee)", "CPF OA for housing", "Low formal coverage", "Employer CPF 17%", "Mock data for Singapore."),
  au:  mock("Super guarantee 11.5%", "Medicare levy 2%", "First Home Super Saver Scheme", "JobSeeker payment", "Industry super fund", "Mock data for Australia."),
  jp:  mock("Kosei-Nenkin ~9.15% (employee)", "Health insurance ~5% (employee)", "FLAT35 / Jutaku loan", "Hello Work (雇用保険) 0.6%", "iDeCo / DC plan", "Mock data for Japan."),
  kr:  mock("NPS (국민연금) 4.5%", "NHIS (건강보험) 3.545%", "Housing subscription savings", "Employment insurance 0.9%", "DC / IRP pension", "Mock data for South Korea."),
  ca:  mock("CPP employee 5.95%", "Provincial health insurance (free)", "FHSA / RRSP", "EI (Employment Insurance) 1.66%", "RRSP / TFSA", "Mock data for Canada. Quebec uses QPP."),
  nz:  mock("NZ Super at 65", "ACC levy + public health", "KiwiSaver First Home Withdrawal", "Jobseeker Support", "KiwiSaver 3% employee + 3% employer", "Mock data for New Zealand."),
  my:  mock("EPF 11% (employee)", "SOCSO PERKESO", "EPF Account 2 withdrawal", "EIS 0.2%", "PRS voluntary scheme", "Mock data for Malaysia."),
  // EMEA
  de:  mock("GRV ~9.3% (employee)", "GKV ~7.3% (employee)", "Bausparvertrag", "ALG 1.3% (employee)", "bAV workplace pension", "Mock data for Germany."),
  fr:  mock("CNAV + AGIRC-ARRCO ~10.8% (employee)", "Assurance maladie ~0.75%", "Action Logement 1%", "Assurance chômage ~2.4%", "PERCO / PEE", "Mock data for France."),
  nl:  mock("AOW state pension (employer side)", "Zorgverzekering €1,964+/yr", "NHG mortgage guarantee", "WW 3.36% (capped)", "Pensioenregeling", "Mock data for Netherlands."),
  ch:  mock("AHV/AVS 1st pillar 5.3%", "Krankenkasse CHF 300–600/mo", "3rd pillar (3a) savings", "ALV/AC 1.1% (capped)", "BVG/LPP 2nd pillar", "Mock data for Switzerland."),
  ae:  mock("DEWS / GPSSA for nationals", "Employer-provided compulsory", "National housing programme", "ILOE voluntary scheme", "DEWS gratuity-linked scheme", "Mock data for UAE. Rules differ nationals vs expats."),
  sa:  mock("GOSI 9% (employee)", "CCHI compulsory employer plan", "REDF housing fund", "SANED 1%", "Private savings scheme", "Mock data for Saudi Arabia."),
  se:  mock("Inkomstpension 16% + premiepension 2.5%", "County council health system", "Bostadstillägg for pensioners", "A-kassa ~1% voluntary fund", "ITP / SAF-LO tjänstepension", "Mock data for Sweden."),
  no:  mock("Folketrygd (NI) 7.9%", "Helfo universal coverage", "Husbank support", "NAV dagpenger 2.7%", "OTP obligatorisk tjenestepensjon", "Mock data for Norway."),
  dk:  mock("ATP DKK 99/mo (employee)", "Universal health coverage", "Boligstøtte", "A-kasse ~DKK 900/mo", "Arbejdsmarkedspension", "Mock data for Denmark."),
  es:  mock("RGSS 4.7% (employee)", "Sistema Nacional de Salud", "Deducción adquisición vivienda", "FOGASA 0.1%", "Plan de pensiones privado", "Mock data for Spain."),
  it:  mock("INPS 9.19% (employee)", "SSN universal healthcare", "Detrazione acquisto casa", "NASPI 1.31%", "TFR + fondo pensione", "Mock data for Italy."),
  pl:  mock("ZUS 9.76% (employee)", "NFZ 9% health levy", "MdM housing programme", "FP 1%", "PPK 2% employee + 1.5% employer", "Mock data for Poland."),
  tr:  mock("SGK 9% (employee)", "SGK universal health", "TOKİ housing fund", "İşsizlik Sigortası 1%", "BES auto-enrolment", "Mock data for Turkey."),
  il:  mock("National Insurance 3.5–7%", "Kupat Holim health fund", "Mortgage tzamud madad", "Unemployment 0.3%", "Pension keren gimel 6%", "Mock data for Israel."),
  za:  mock("No mandatory employer pension", "Medical aid scheme varies", "Social housing subsidy", "UIF 1% (employee)", "Provident / retirement annuity", "Mock data for South Africa."),
  uk:  mock("NI Class 1 8% (employee)", "NHS free at point of use", "Help-to-Buy ISA", "NI Class 1 contribution", "NEST auto-enrolment", "Mock data — UK rules coming soon."),
};

// ─── Country list ────────────────────────────────────────────────────────────

export const GLOBAL_REGIONS: CountryOption[] = [

  // ─── APEC ──────────────────────────────────────────────────────────────────

  {
    value: "cn",
    label: { en: "China (Mainland)", zh: "中国大陆" },
    provinces: [
      { value: "guangdong", label: { en: "Guangdong", zh: "广东" }, cities: [
        { value: "guangzhou", label: { en: "Guangzhou", zh: "广州" }, insurance: ins.sg },
        { value: "shenzhen",  label: { en: "Shenzhen",  zh: "深圳" }, insurance: ins.sg },
      ]},
    ],
  },

  {
    value: "hk",
    label: { en: "Hong Kong", zh: "中国香港" },
    provinces: [
      { value: "hk", label: { en: "Hong Kong", zh: "香港" }, cities: [
        { value: "hong-kong", label: { en: "Hong Kong", zh: "香港" }, insurance: ins.hk },
      ]},
    ],
  },

  {
    value: "mo",
    label: { en: "Macao", zh: "中国澳门" },
    provinces: [
      { value: "mo", label: { en: "Macao", zh: "澳门" }, cities: [
        { value: "macao", label: { en: "Macao", zh: "澳门" }, insurance: ins.mo },
      ]},
    ],
  },

  {
    value: "tw",
    label: { en: "Taiwan", zh: "中国台湾" },
    provinces: [
      { value: "tw", label: { en: "Taiwan", zh: "台湾" }, cities: [
        { value: "taipei",   label: { en: "Taipei",    zh: "台北" }, insurance: ins.tw },
        { value: "taichung", label: { en: "Taichung",  zh: "台中" }, insurance: ins.tw },
        { value: "kaohsiung",label: { en: "Kaohsiung", zh: "高雄" }, insurance: ins.tw },
      ]},
    ],
  },

  {
    value: "sg",
    label: { en: "Singapore", zh: "新加坡" },
    provinces: [
      { value: "sg", label: { en: "Singapore", zh: "新加坡" }, cities: [
        { value: "singapore", label: { en: "Singapore", zh: "新加坡" }, insurance: ins.sg },
      ]},
    ],
  },

  {
    value: "au",
    label: { en: "Australia", zh: "澳大利亚" },
    provinces: [
      { value: "nsw", label: { en: "New South Wales", zh: "新南威尔士州" }, cities: [
        { value: "sydney",    label: { en: "Sydney",    zh: "悉尼"   }, insurance: ins.au },
        { value: "newcastle", label: { en: "Newcastle", zh: "纽卡斯尔" }, insurance: ins.au },
      ]},
      { value: "vic", label: { en: "Victoria", zh: "维多利亚州" }, cities: [
        { value: "melbourne", label: { en: "Melbourne", zh: "墨尔本" }, insurance: ins.au },
        { value: "geelong",   label: { en: "Geelong",   zh: "吉朗"  }, insurance: ins.au },
      ]},
      { value: "qld", label: { en: "Queensland", zh: "昆士兰州" }, cities: [
        { value: "brisbane",   label: { en: "Brisbane",   zh: "布里斯班" }, insurance: ins.au },
        { value: "gold-coast", label: { en: "Gold Coast", zh: "黄金海岸" }, insurance: ins.au },
      ]},
      { value: "wa", label: { en: "Western Australia", zh: "西澳大利亚州" }, cities: [
        { value: "perth", label: { en: "Perth", zh: "珀斯" }, insurance: ins.au },
      ]},
      { value: "sa-au", label: { en: "South Australia", zh: "南澳大利亚州" }, cities: [
        { value: "adelaide", label: { en: "Adelaide", zh: "阿德莱德" }, insurance: ins.au },
      ]},
    ],
  },

  {
    value: "jp",
    label: { en: "Japan", zh: "日本" },
    provinces: [
      { value: "kanto", label: { en: "Kanto", zh: "关东" }, cities: [
        { value: "tokyo",    label: { en: "Tokyo",    zh: "东京"  }, insurance: ins.jp },
        { value: "yokohama", label: { en: "Yokohama", zh: "横滨"  }, insurance: ins.jp },
        { value: "kawasaki", label: { en: "Kawasaki", zh: "川崎"  }, insurance: ins.jp },
        { value: "saitama",  label: { en: "Saitama",  zh: "埼玉"  }, insurance: ins.jp },
      ]},
      { value: "kansai", label: { en: "Kansai", zh: "关西" }, cities: [
        { value: "osaka", label: { en: "Osaka", zh: "大阪" }, insurance: ins.jp },
        { value: "kyoto", label: { en: "Kyoto", zh: "京都" }, insurance: ins.jp },
        { value: "kobe",  label: { en: "Kobe",  zh: "神户" }, insurance: ins.jp },
        { value: "nara",  label: { en: "Nara",  zh: "奈良" }, insurance: ins.jp },
      ]},
      { value: "chubu", label: { en: "Chubu", zh: "中部" }, cities: [
        { value: "nagoya", label: { en: "Nagoya", zh: "名古屋" }, insurance: ins.jp },
        { value: "shizuoka", label: { en: "Shizuoka", zh: "静冈" }, insurance: ins.jp },
      ]},
      { value: "kyushu", label: { en: "Kyushu", zh: "九州" }, cities: [
        { value: "fukuoka",  label: { en: "Fukuoka",  zh: "福冈"  }, insurance: ins.jp },
        { value: "hiroshima",label: { en: "Hiroshima",zh: "广岛"  }, insurance: ins.jp },
      ]},
      { value: "tohoku", label: { en: "Tohoku / Hokkaido", zh: "东北·北海道" }, cities: [
        { value: "sapporo", label: { en: "Sapporo", zh: "札幌" }, insurance: ins.jp },
        { value: "sendai",  label: { en: "Sendai",  zh: "仙台" }, insurance: ins.jp },
      ]},
    ],
  },

  {
    value: "kr",
    label: { en: "South Korea", zh: "韩国" },
    provinces: [
      { value: "seoul-metro", label: { en: "Seoul Capital Area", zh: "首都圈" }, cities: [
        { value: "seoul",  label: { en: "Seoul",  zh: "首尔" }, insurance: ins.kr },
        { value: "incheon",label: { en: "Incheon",zh: "仁川" }, insurance: ins.kr },
        { value: "suwon",  label: { en: "Suwon",  zh: "水原" }, insurance: ins.kr },
      ]},
      { value: "gyeongnam", label: { en: "Gyeongsang / Jeolla", zh: "庆尚·全罗" }, cities: [
        { value: "busan", label: { en: "Busan",  zh: "釜山" }, insurance: ins.kr },
        { value: "daegu", label: { en: "Daegu",  zh: "大邱" }, insurance: ins.kr },
        { value: "gwangju",label:{ en: "Gwangju",zh: "光州" }, insurance: ins.kr },
      ]},
      { value: "chungcheong", label: { en: "Chungcheong / Jeju", zh: "忠清·济州" }, cities: [
        { value: "daejeon", label: { en: "Daejeon", zh: "大田" }, insurance: ins.kr },
        { value: "jeju",    label: { en: "Jeju",    zh: "济州" }, insurance: ins.kr },
      ]},
    ],
  },

  {
    value: "ca",
    label: { en: "Canada", zh: "加拿大" },
    provinces: [
      { value: "on", label: { en: "Ontario", zh: "安大略省" }, cities: [
        { value: "toronto", label: { en: "Toronto", zh: "多伦多" }, insurance: ins.ca },
        { value: "ottawa",  label: { en: "Ottawa",  zh: "渥太华" }, insurance: ins.ca },
        { value: "mississauga", label: { en: "Mississauga", zh: "米西沙加" }, insurance: ins.ca },
      ]},
      { value: "bc", label: { en: "British Columbia", zh: "不列颠哥伦比亚省" }, cities: [
        { value: "vancouver", label: { en: "Vancouver", zh: "温哥华" }, insurance: ins.ca },
        { value: "victoria",  label: { en: "Victoria",  zh: "维多利亚" }, insurance: ins.ca },
      ]},
      { value: "qc", label: { en: "Quebec", zh: "魁北克省" }, cities: [
        { value: "montreal",     label: { en: "Montreal",     zh: "蒙特利尔" }, insurance: ins.ca },
        { value: "quebec-city",  label: { en: "Quebec City",  zh: "魁北克市" }, insurance: ins.ca },
      ]},
      { value: "ab", label: { en: "Alberta", zh: "阿尔伯塔省" }, cities: [
        { value: "calgary",   label: { en: "Calgary",   zh: "卡尔加里" }, insurance: ins.ca },
        { value: "edmonton",  label: { en: "Edmonton",  zh: "埃德蒙顿" }, insurance: ins.ca },
      ]},
    ],
  },

  {
    value: "nz",
    label: { en: "New Zealand", zh: "新西兰" },
    provinces: [
      { value: "north-island", label: { en: "North Island", zh: "北岛" }, cities: [
        { value: "auckland",   label: { en: "Auckland",   zh: "奥克兰"   }, insurance: ins.nz },
        { value: "wellington", label: { en: "Wellington", zh: "惠灵顿"   }, insurance: ins.nz },
        { value: "hamilton",   label: { en: "Hamilton",   zh: "汉密尔顿" }, insurance: ins.nz },
      ]},
      { value: "south-island", label: { en: "South Island", zh: "南岛" }, cities: [
        { value: "christchurch", label: { en: "Christchurch", zh: "基督城"  }, insurance: ins.nz },
        { value: "queenstown",   label: { en: "Queenstown",   zh: "皇后镇"  }, insurance: ins.nz },
        { value: "dunedin",      label: { en: "Dunedin",      zh: "但尼丁"  }, insurance: ins.nz },
      ]},
    ],
  },

  {
    value: "my",
    label: { en: "Malaysia", zh: "马来西亚" },
    provinces: [
      { value: "klang-valley", label: { en: "Klang Valley", zh: "巴生谷" }, cities: [
        { value: "kuala-lumpur", label: { en: "Kuala Lumpur",  zh: "吉隆坡"   }, insurance: ins.my },
        { value: "petaling-jaya",label: { en: "Petaling Jaya", zh: "八打灵再也"}, insurance: ins.my },
        { value: "shah-alam",    label: { en: "Shah Alam",     zh: "沙阿南"   }, insurance: ins.my },
      ]},
      { value: "penang", label: { en: "Penang", zh: "槟城" }, cities: [
        { value: "george-town", label: { en: "George Town", zh: "乔治市" }, insurance: ins.my },
      ]},
      { value: "johor", label: { en: "Johor", zh: "柔佛" }, cities: [
        { value: "johor-bahru", label: { en: "Johor Bahru", zh: "新山" }, insurance: ins.my },
      ]},
      { value: "sabah-sarawak", label: { en: "Sabah / Sarawak", zh: "沙巴·砂拉越" }, cities: [
        { value: "kota-kinabalu", label: { en: "Kota Kinabalu", zh: "哥打基纳巴卢" }, insurance: ins.my },
        { value: "kuching",       label: { en: "Kuching",       zh: "古晋"       }, insurance: ins.my },
      ]},
    ],
  },

  {
    value: "us",
    label: { en: "United States (coming soon)", zh: "美国（即将上线）" },
    provinces: [
      { value: "california", label: { en: "California", zh: "加利福尼亚" }, cities: [
        { value: "san-francisco", label: { en: "San Francisco", zh: "旧金山" }, insurance: ins.us },
        { value: "los-angeles",   label: { en: "Los Angeles",   zh: "洛杉矶" }, insurance: ins.us },
      ]},
      { value: "new-york", label: { en: "New York", zh: "纽约州" }, cities: [
        { value: "new-york-city", label: { en: "New York City", zh: "纽约市" }, insurance: ins.us },
      ]},
    ],
  },

  // ─── EMEA ──────────────────────────────────────────────────────────────────

  {
    value: "de",
    label: { en: "Germany", zh: "德国" },
    provinces: [
      { value: "berlin", label: { en: "Berlin", zh: "柏林" }, cities: [
        { value: "berlin", label: { en: "Berlin", zh: "柏林" }, insurance: ins.de },
      ]},
      { value: "bavaria", label: { en: "Bavaria", zh: "巴伐利亚" }, cities: [
        { value: "munich",     label: { en: "Munich",     zh: "慕尼黑" }, insurance: ins.de },
        { value: "nuremberg",  label: { en: "Nuremberg",  zh: "纽伦堡" }, insurance: ins.de },
        { value: "augsburg",   label: { en: "Augsburg",   zh: "奥格斯堡"}, insurance: ins.de },
      ]},
      { value: "hamburg", label: { en: "Hamburg", zh: "汉堡" }, cities: [
        { value: "hamburg", label: { en: "Hamburg", zh: "汉堡" }, insurance: ins.de },
      ]},
      { value: "nrw", label: { en: "North Rhine-Westphalia", zh: "北莱茵-威斯特法伦" }, cities: [
        { value: "cologne",    label: { en: "Cologne",    zh: "科隆"    }, insurance: ins.de },
        { value: "dusseldorf", label: { en: "Düsseldorf", zh: "杜塞尔多夫"}, insurance: ins.de },
        { value: "dortmund",   label: { en: "Dortmund",   zh: "多特蒙德"}, insurance: ins.de },
        { value: "essen",      label: { en: "Essen",      zh: "埃森"    }, insurance: ins.de },
      ]},
      { value: "bw", label: { en: "Baden-Württemberg", zh: "巴登-符腾堡" }, cities: [
        { value: "stuttgart", label: { en: "Stuttgart", zh: "斯图加特" }, insurance: ins.de },
        { value: "freiburg",  label: { en: "Freiburg",  zh: "弗莱堡"  }, insurance: ins.de },
      ]},
      { value: "hessen", label: { en: "Hesse", zh: "黑森" }, cities: [
        { value: "frankfurt", label: { en: "Frankfurt", zh: "法兰克福" }, insurance: ins.de },
      ]},
    ],
  },

  {
    value: "fr",
    label: { en: "France", zh: "法国" },
    provinces: [
      { value: "idf", label: { en: "Île-de-France", zh: "法兰西岛" }, cities: [
        { value: "paris",     label: { en: "Paris",     zh: "巴黎"  }, insurance: ins.fr },
        { value: "versailles",label: { en: "Versailles",zh: "凡尔赛"}, insurance: ins.fr },
      ]},
      { value: "aura", label: { en: "Auvergne-Rhône-Alpes", zh: "奥弗涅-罗纳-阿尔卑斯" }, cities: [
        { value: "lyon",      label: { en: "Lyon",      zh: "里昂"  }, insurance: ins.fr },
        { value: "grenoble",  label: { en: "Grenoble",  zh: "格勒诺布尔"}, insurance: ins.fr },
      ]},
      { value: "paca", label: { en: "Provence-Alpes-Côte d'Azur", zh: "普罗旺斯-蔚蓝海岸" }, cities: [
        { value: "marseille", label: { en: "Marseille", zh: "马赛"  }, insurance: ins.fr },
        { value: "nice",      label: { en: "Nice",      zh: "尼斯"  }, insurance: ins.fr },
      ]},
      { value: "occitanie", label: { en: "Occitanie", zh: "奥克西塔尼" }, cities: [
        { value: "toulouse",   label: { en: "Toulouse",   zh: "图卢兹" }, insurance: ins.fr },
        { value: "montpellier",label: { en: "Montpellier",zh: "蒙彼利埃"}, insurance: ins.fr },
      ]},
      { value: "na", label: { en: "Nouvelle-Aquitaine", zh: "新阿基坦" }, cities: [
        { value: "bordeaux", label: { en: "Bordeaux", zh: "波尔多" }, insurance: ins.fr },
      ]},
    ],
  },

  {
    value: "nl",
    label: { en: "Netherlands", zh: "荷兰" },
    provinces: [
      { value: "north-holland", label: { en: "North Holland", zh: "北荷兰省" }, cities: [
        { value: "amsterdam", label: { en: "Amsterdam", zh: "阿姆斯特丹" }, insurance: ins.nl },
        { value: "haarlem",   label: { en: "Haarlem",   zh: "哈勒姆"    }, insurance: ins.nl },
      ]},
      { value: "south-holland", label: { en: "South Holland", zh: "南荷兰省" }, cities: [
        { value: "rotterdam",  label: { en: "Rotterdam",  zh: "鹿特丹"  }, insurance: ins.nl },
        { value: "the-hague",  label: { en: "The Hague",  zh: "海牙"    }, insurance: ins.nl },
        { value: "delft",      label: { en: "Delft",      zh: "代尔夫特"}, insurance: ins.nl },
      ]},
      { value: "utrecht-nl", label: { en: "Utrecht", zh: "乌得勒支" }, cities: [
        { value: "utrecht", label: { en: "Utrecht", zh: "乌得勒支" }, insurance: ins.nl },
      ]},
      { value: "north-brabant", label: { en: "North Brabant", zh: "北布拉班特" }, cities: [
        { value: "eindhoven", label: { en: "Eindhoven", zh: "埃因霍温" }, insurance: ins.nl },
      ]},
    ],
  },

  {
    value: "ch",
    label: { en: "Switzerland", zh: "瑞士" },
    provinces: [
      { value: "zurich-ch", label: { en: "Zurich", zh: "苏黎世州" }, cities: [
        { value: "zurich",     label: { en: "Zurich",     zh: "苏黎世" }, insurance: ins.ch },
        { value: "winterthur", label: { en: "Winterthur", zh: "温特图尔"}, insurance: ins.ch },
      ]},
      { value: "geneva-ch", label: { en: "Geneva", zh: "日内瓦州" }, cities: [
        { value: "geneva",  label: { en: "Geneva",  zh: "日内瓦" }, insurance: ins.ch },
      ]},
      { value: "bern-ch", label: { en: "Bern", zh: "伯尔尼州" }, cities: [
        { value: "bern",    label: { en: "Bern",    zh: "伯尔尼" }, insurance: ins.ch },
      ]},
      { value: "basel-ch", label: { en: "Basel", zh: "巴塞尔市州" }, cities: [
        { value: "basel",   label: { en: "Basel",   zh: "巴塞尔" }, insurance: ins.ch },
      ]},
      { value: "vaud-ch", label: { en: "Vaud / Lausanne", zh: "沃州·洛桑" }, cities: [
        { value: "lausanne", label: { en: "Lausanne", zh: "洛桑" }, insurance: ins.ch },
      ]},
    ],
  },

  {
    value: "ae",
    label: { en: "UAE", zh: "阿联酋" },
    provinces: [
      { value: "dubai-ae", label: { en: "Dubai", zh: "迪拜" }, cities: [
        { value: "dubai",          label: { en: "Dubai",          zh: "迪拜"     }, insurance: ins.ae },
        { value: "dubai-silicon",  label: { en: "Dubai Silicon Oasis", zh: "迪拜硅谷"}, insurance: ins.ae },
      ]},
      { value: "abu-dhabi-ae", label: { en: "Abu Dhabi", zh: "阿布扎比" }, cities: [
        { value: "abu-dhabi",  label: { en: "Abu Dhabi",  zh: "阿布扎比"  }, insurance: ins.ae },
        { value: "al-ain",     label: { en: "Al Ain",     zh: "艾因"      }, insurance: ins.ae },
      ]},
      { value: "sharjah-ae", label: { en: "Sharjah / Northern Emirates", zh: "沙迦·北部酋长国" }, cities: [
        { value: "sharjah",  label: { en: "Sharjah",  zh: "沙迦"  }, insurance: ins.ae },
        { value: "ajman",    label: { en: "Ajman",    zh: "阿治曼"}, insurance: ins.ae },
      ]},
    ],
  },

  {
    value: "sa",
    label: { en: "Saudi Arabia", zh: "沙特阿拉伯" },
    provinces: [
      { value: "riyadh-sa", label: { en: "Riyadh Region", zh: "利雅得地区" }, cities: [
        { value: "riyadh", label: { en: "Riyadh", zh: "利雅得" }, insurance: ins.sa },
      ]},
      { value: "makkah-sa", label: { en: "Makkah Region", zh: "麦加地区" }, cities: [
        { value: "jeddah", label: { en: "Jeddah", zh: "吉达" }, insurance: ins.sa },
        { value: "mecca",  label: { en: "Mecca",  zh: "麦加" }, insurance: ins.sa },
      ]},
      { value: "eastern-sa", label: { en: "Eastern Province", zh: "东部省" }, cities: [
        { value: "dammam",   label: { en: "Dammam",   zh: "达曼"  }, insurance: ins.sa },
        { value: "al-khobar",label: { en: "Al Khobar", zh: "科博尔"}, insurance: ins.sa },
      ]},
    ],
  },

  {
    value: "se",
    label: { en: "Sweden", zh: "瑞典" },
    provinces: [
      { value: "stockholm-se", label: { en: "Stockholm", zh: "斯德哥尔摩" }, cities: [
        { value: "stockholm", label: { en: "Stockholm", zh: "斯德哥尔摩" }, insurance: ins.se },
        { value: "solna",     label: { en: "Solna",     zh: "索尔纳"     }, insurance: ins.se },
      ]},
      { value: "vgr", label: { en: "Västra Götaland", zh: "西约特兰省" }, cities: [
        { value: "gothenburg", label: { en: "Gothenburg", zh: "哥德堡" }, insurance: ins.se },
      ]},
      { value: "skane", label: { en: "Skåne", zh: "斯科讷省" }, cities: [
        { value: "malmo", label: { en: "Malmö", zh: "马尔默" }, insurance: ins.se },
      ]},
    ],
  },

  {
    value: "no",
    label: { en: "Norway", zh: "挪威" },
    provinces: [
      { value: "oslo-no", label: { en: "Oslo", zh: "奥斯陆" }, cities: [
        { value: "oslo", label: { en: "Oslo", zh: "奥斯陆" }, insurance: ins.no },
      ]},
      { value: "vestland", label: { en: "Vestland", zh: "西部大区" }, cities: [
        { value: "bergen", label: { en: "Bergen", zh: "卑尔根" }, insurance: ins.no },
      ]},
      { value: "trondelag", label: { en: "Trøndelag", zh: "特伦德拉格" }, cities: [
        { value: "trondheim", label: { en: "Trondheim", zh: "特隆赫姆" }, insurance: ins.no },
      ]},
    ],
  },

  {
    value: "dk",
    label: { en: "Denmark", zh: "丹麦" },
    provinces: [
      { value: "capital-dk", label: { en: "Capital Region", zh: "首都大区" }, cities: [
        { value: "copenhagen", label: { en: "Copenhagen", zh: "哥本哈根" }, insurance: ins.dk },
        { value: "frederiksberg", label: { en: "Frederiksberg", zh: "腓特烈斯贝" }, insurance: ins.dk },
      ]},
      { value: "central-dk", label: { en: "Central Jutland", zh: "中日德兰" }, cities: [
        { value: "aarhus", label: { en: "Aarhus", zh: "奥胡斯" }, insurance: ins.dk },
      ]},
      { value: "south-dk", label: { en: "Southern Denmark", zh: "南丹麦" }, cities: [
        { value: "odense", label: { en: "Odense", zh: "欧登塞" }, insurance: ins.dk },
      ]},
    ],
  },

  {
    value: "es",
    label: { en: "Spain", zh: "西班牙" },
    provinces: [
      { value: "madrid-es", label: { en: "Community of Madrid", zh: "马德里自治区" }, cities: [
        { value: "madrid", label: { en: "Madrid", zh: "马德里" }, insurance: ins.es },
      ]},
      { value: "catalonia", label: { en: "Catalonia", zh: "加泰罗尼亚" }, cities: [
        { value: "barcelona", label: { en: "Barcelona", zh: "巴塞罗那" }, insurance: ins.es },
        { value: "girona",    label: { en: "Girona",    zh: "赫罗纳"   }, insurance: ins.es },
      ]},
      { value: "andalusia", label: { en: "Andalusia", zh: "安达卢西亚" }, cities: [
        { value: "seville", label: { en: "Seville", zh: "塞维利亚" }, insurance: ins.es },
        { value: "malaga",  label: { en: "Málaga",  zh: "马拉加"   }, insurance: ins.es },
      ]},
      { value: "valencia-es", label: { en: "Valencia", zh: "巴伦西亚自治区" }, cities: [
        { value: "valencia", label: { en: "Valencia", zh: "巴伦西亚" }, insurance: ins.es },
      ]},
      { value: "basque", label: { en: "Basque Country", zh: "巴斯克地区" }, cities: [
        { value: "bilbao",    label: { en: "Bilbao",     zh: "毕尔巴鄂" }, insurance: ins.es },
        { value: "san-sebastian", label: { en: "San Sebastián", zh: "圣塞巴斯蒂安"}, insurance: ins.es },
      ]},
    ],
  },

  {
    value: "it",
    label: { en: "Italy", zh: "意大利" },
    provinces: [
      { value: "lombardy", label: { en: "Lombardy", zh: "伦巴第大区" }, cities: [
        { value: "milan",   label: { en: "Milan",   zh: "米兰"   }, insurance: ins.it },
        { value: "bergamo", label: { en: "Bergamo", zh: "贝尔加莫"}, insurance: ins.it },
        { value: "brescia", label: { en: "Brescia", zh: "布雷西亚"}, insurance: ins.it },
      ]},
      { value: "lazio", label: { en: "Lazio", zh: "拉齐奥大区" }, cities: [
        { value: "rome", label: { en: "Rome", zh: "罗马" }, insurance: ins.it },
      ]},
      { value: "campania", label: { en: "Campania", zh: "坎帕尼亚大区" }, cities: [
        { value: "naples", label: { en: "Naples", zh: "那不勒斯" }, insurance: ins.it },
      ]},
      { value: "piedmont", label: { en: "Piedmont", zh: "皮埃蒙特大区" }, cities: [
        { value: "turin", label: { en: "Turin", zh: "都灵" }, insurance: ins.it },
      ]},
      { value: "veneto", label: { en: "Veneto", zh: "威尼托大区" }, cities: [
        { value: "venice",  label: { en: "Venice",  zh: "威尼斯"  }, insurance: ins.it },
        { value: "verona",  label: { en: "Verona",  zh: "维罗纳"  }, insurance: ins.it },
        { value: "padua",   label: { en: "Padua",   zh: "帕多瓦"  }, insurance: ins.it },
      ]},
      { value: "tuscany", label: { en: "Tuscany", zh: "托斯卡纳大区" }, cities: [
        { value: "florence", label: { en: "Florence", zh: "佛罗伦萨" }, insurance: ins.it },
      ]},
    ],
  },

  {
    value: "pl",
    label: { en: "Poland", zh: "波兰" },
    provinces: [
      { value: "masovian", label: { en: "Masovian", zh: "马佐夫舍省" }, cities: [
        { value: "warsaw", label: { en: "Warsaw", zh: "华沙" }, insurance: ins.pl },
      ]},
      { value: "lesser-poland", label: { en: "Lesser Poland", zh: "小波兰省" }, cities: [
        { value: "krakow", label: { en: "Kraków", zh: "克拉科夫" }, insurance: ins.pl },
      ]},
      { value: "silesian", label: { en: "Silesian", zh: "西里西亚省" }, cities: [
        { value: "wroclaw",  label: { en: "Wrocław",  zh: "弗罗茨瓦夫" }, insurance: ins.pl },
        { value: "katowice", label: { en: "Katowice", zh: "卡托维兹"   }, insurance: ins.pl },
      ]},
      { value: "pomeranian", label: { en: "Pomeranian", zh: "波美拉尼亚省" }, cities: [
        { value: "gdansk", label: { en: "Gdańsk", zh: "格但斯克" }, insurance: ins.pl },
      ]},
      { value: "greater-poland", label: { en: "Greater Poland", zh: "大波兰省" }, cities: [
        { value: "poznan", label: { en: "Poznań", zh: "波兹南" }, insurance: ins.pl },
      ]},
    ],
  },

  {
    value: "tr",
    label: { en: "Turkey", zh: "土耳其" },
    provinces: [
      { value: "istanbul-tr", label: { en: "Istanbul", zh: "伊斯坦布尔" }, cities: [
        { value: "istanbul", label: { en: "Istanbul", zh: "伊斯坦布尔" }, insurance: ins.tr },
      ]},
      { value: "ankara-tr", label: { en: "Ankara", zh: "安卡拉" }, cities: [
        { value: "ankara", label: { en: "Ankara", zh: "安卡拉" }, insurance: ins.tr },
      ]},
      { value: "izmir-tr", label: { en: "İzmir", zh: "伊兹密尔" }, cities: [
        { value: "izmir", label: { en: "İzmir", zh: "伊兹密尔" }, insurance: ins.tr },
      ]},
      { value: "antalya-tr", label: { en: "Antalya / Coastal", zh: "安塔利亚·海岸" }, cities: [
        { value: "antalya", label: { en: "Antalya", zh: "安塔利亚" }, insurance: ins.tr },
        { value: "bodrum",  label: { en: "Bodrum",  zh: "博德鲁姆" }, insurance: ins.tr },
      ]},
    ],
  },

  {
    value: "il",
    label: { en: "Israel", zh: "以色列" },
    provinces: [
      { value: "tel-aviv-il", label: { en: "Tel Aviv District", zh: "特拉维夫区" }, cities: [
        { value: "tel-aviv", label: { en: "Tel Aviv",  zh: "特拉维夫" }, insurance: ins.il },
        { value: "herzliya", label: { en: "Herzliya",  zh: "赫兹利亚" }, insurance: ins.il },
      ]},
      { value: "jerusalem-il", label: { en: "Jerusalem District", zh: "耶路撒冷区" }, cities: [
        { value: "jerusalem", label: { en: "Jerusalem", zh: "耶路撒冷" }, insurance: ins.il },
      ]},
      { value: "haifa-il", label: { en: "Haifa District", zh: "海法区" }, cities: [
        { value: "haifa", label: { en: "Haifa", zh: "海法" }, insurance: ins.il },
      ]},
    ],
  },

  {
    value: "za",
    label: { en: "South Africa", zh: "南非" },
    provinces: [
      { value: "gauteng", label: { en: "Gauteng", zh: "豪登省" }, cities: [
        { value: "johannesburg", label: { en: "Johannesburg", zh: "约翰内斯堡" }, insurance: ins.za },
        { value: "pretoria",     label: { en: "Pretoria",     zh: "比勒陀利亚" }, insurance: ins.za },
      ]},
      { value: "western-cape", label: { en: "Western Cape", zh: "西开普省" }, cities: [
        { value: "cape-town", label: { en: "Cape Town", zh: "开普敦" }, insurance: ins.za },
      ]},
      { value: "kwazulu-natal", label: { en: "KwaZulu-Natal", zh: "夸祖鲁-纳塔尔省" }, cities: [
        { value: "durban", label: { en: "Durban", zh: "德班" }, insurance: ins.za },
      ]},
    ],
  },

  {
    value: "uk",
    label: { en: "United Kingdom (coming soon)", zh: "英国（即将上线）" },
    provinces: [
      { value: "england", label: { en: "England", zh: "英格兰" }, cities: [
        { value: "london",     label: { en: "London",     zh: "伦敦"     }, insurance: ins.uk },
        { value: "manchester", label: { en: "Manchester", zh: "曼彻斯特" }, insurance: ins.uk },
        { value: "birmingham", label: { en: "Birmingham", zh: "伯明翰"   }, insurance: ins.uk },
      ]},
      { value: "scotland", label: { en: "Scotland", zh: "苏格兰" }, cities: [
        { value: "edinburgh", label: { en: "Edinburgh", zh: "爱丁堡" }, insurance: ins.uk },
        { value: "glasgow",   label: { en: "Glasgow",   zh: "格拉斯哥" }, insurance: ins.uk },
      ]},
    ],
  },

];
