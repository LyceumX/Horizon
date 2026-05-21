export type Copy = {
  brand: string;
  since: string;
  nav: { summary: string; customize: string; budget: string; stories: string };
  goal: string;
  slogan: string;
  interest: string;
  heroBadge: string;
  heroCaption: string;
  summaryTitle: string;
  summaryLead: string;
  summaryIntro: string;
  customizeTitle: string;
  customizeDesc: string;
  dob: string;
  country: string;
  province: string;
  city: string;
  gender: string;
  employmentType: string;
  employmentOptions: { private: string; governmentCivilian: string; governmentDisciplined: string };
  genderOptions: { male: string; femalePro: string; femaleWorker: string; specialMale: string; specialFemale: string };
  defaultRetireLabel: string;
  defaultRetireValue: string;
  yearsSavedLabel: string;
  retirementDisclaimer: string;
  save: string;
  spend: string;
  projectionTitle: string;
  projectionYears: string;
  projectionAge: string;
  projectionYear: string;
  projectionCapital: string;
  tierLabel: string;
  tierTop: string;
  tierElite: string;
  tierStrong: string;
  tierSteady: string;
  rankLabel: string;
  rankAmong: string;
  shareTitle: string;
  shareLead: string;
  sharePost: string;
  shareCopy: string;
  shareLink: string;
  shareChannels: string[];
  localSave: string;
  localSaved: string;
  cloudSave: string;
  saving: string;
  saveRequiresSignIn: string;
  freeHint: string;
  signInHint: string;
  authMissing: string;
  budgetTitle: string;
  budgetLead: string;
  budgetLocked: string;
  lowBudgetLabel: string;
  lowBudgetCopy: string;
  balancedBudgetLabel: string;
  balancedBudgetCopy: string;
  fullBudgetLabel: string;
  fullBudgetCopy: string;
  selectedPlan: string;
  insuranceTitle: string;
  insuranceLead: string;
  insuranceFields: { pension: string; medical: string; housing: string; unemployment: string; workplace: string; note: string };
  currentSavings: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  nestEgg: string;
  monthlySurplus: string;
  monthlyGap: string;
  horizonDate: string;
  scenarioLabel: string;
  scenarioBase: string;
  scenarioOptimistic: string;
  scenarioStress: string;
  assumptionsTitle: string;
  returnRateLabel: string;
  inflationRateLabel: string;
  multiplierLabel: string;
  pensionIncome: string;
  storiesTitle: string;
  storiesLead: string;
  stories: { name: string; role: string; text: string; image: string }[];
};

export const CN_COPY: Copy = {
  brand: "锁定你的自由之日。",
  since: "自2026",
  nav: { summary: "摘要", customize: "参数", budget: "预算方案", stories: "真实故事" },
  goal: "退休规划，不再靠表格。",
  slogan: "Horizon 把复杂的地区规则变成极简方案，并实时更新。先看自由日期，再用每月选择把它提前。",
  interest: "丢掉 Excel，参考最佳实践，看到使用 Horizon 节省的年数，与同路人一起坚持。",
  heroBadge: "先定日期 · 共同规划",
  heroCaption: "更快制定计划，跟随成功路径，加速自由之日。",
  summaryTitle: "为什么选择 Horizon Day 1",
  summaryLead: "把复杂计算变简单，把规则本地化，与同路人一起迭代。",
  summaryIntro: "丢掉表格，得到清晰日期、可执行方案和成长社群。",
  customizeTitle: "先自定义基础参数",
  customizeDesc: "无需注册，先免费体验，并可保存到本地浏览器。",
  dob: "出生日期",
  country: "国家",
  province: "省 / 州",
  city: "城市",
  employmentType: "雇佣类型（香港）",
  employmentOptions: {
    private: "私营部门",
    governmentCivilian: "政府文职",
    governmentDisciplined: "纪律部队",
  },
  gender: "退休类别",
  genderOptions: {
    male: "男性（通用）",
    femalePro: "女性（干部 / 管理 / 专业）",
    femaleWorker: "女性（工人 / 蓝领）",
    specialMale: "特殊工种（男）",
    specialFemale: "特殊工种（女）",
  },
  defaultRetireLabel: "法定退休基准",
  defaultRetireValue: "默认退休年龄",
  yearsSavedLabel: "使用 Horizon 节省年数",
  retirementDisclaimer: "仅供参考，具体政策以当地规定为准。",
  save: "每月可储蓄",
  spend: "你认为“足够”的月花费",
  projectionTitle: "实时测算",
  projectionYears: "距离 Day 1 年数",
  projectionAge: "当前年龄",
  projectionYear: "预计年份",
  projectionCapital: "预计本金目标",
  tierLabel: "层级",
  tierTop: "顶层",
  tierElite: "精英",
  tierStrong: "稳健",
  tierSteady: "稳步",
  rankLabel: "排名",
  rankAmong: "在全部用户中",
  shareTitle: "分享预览",
  shareLead: "生成一段帖子，并发送到你所在地区最合适的渠道。",
  sharePost: "生成的帖子",
  shareCopy: "复制文案",
  shareLink: "打开分享链接",
  shareChannels: ["微信", "微博", "小红书"],
  localSave: "保存到本地",
  localSaved: "已保存到本设备本地。",
  cloudSave: "保存到账户",
  saving: "保存中...",
  saveRequiresSignIn: "请先登录后再保存方案。",
  freeHint: "任何人都可免费使用测算器。",
  signInHint: "仅当你希望跨设备同步和获取个性化跟进时，再注册/登录即可。",
  authMissing: "当前工作区未配置 Clerk，因此登录和账户同步不可用。",
  budgetTitle: "预算方案",
  budgetLead: "不同的自由路径适合不同的人生策略。已注册用户可点击应用。",
  budgetLocked: "请先登录后解锁高级预算方案。",
  lowBudgetLabel: "低预算自由",
  lowBudgetCopy: "减少欲望，更快抵达 Day 1。",
  balancedBudgetLabel: "平衡自由",
  balancedBudgetCopy: "保持现实生活方式，同时提高储蓄率。",
  fullBudgetLabel: "全预算自由",
  fullBudgetCopy: "保护更高生活标准，并用更强收入或储蓄缩小缺口。",
  selectedPlan: "当前方案",
  insuranceTitle: "自动填充的社保信息",
  insuranceLead: "目前是模拟数据，但已经展示出本地条件如何进入规划流程。",
  insuranceFields: {
    pension: "养老",
    medical: "医疗",
    housing: "公积金",
    unemployment: "失业",
    workplace: "职业养老金",
    note: "备注",
  },
  currentSavings: "当前储蓄",
  monthlyIncome: "月税后收入",
  monthlyExpenses: "月支出",
  nestEgg: "目标本金",
  monthlySurplus: "月结余",
  monthlyGap: "每月差额",
  horizonDate: "自由日期",
  scenarioLabel: "情景",
  scenarioBase: "基准",
  scenarioOptimistic: "乐观",
  scenarioStress: "压力",
  assumptionsTitle: "计算假设",
  returnRateLabel: "年化收益率",
  inflationRateLabel: "年通胀率",
  multiplierLabel: "安全倍数",
  pensionIncome: "社保/公积金预计月收入（可选）",
  storiesTitle: "最佳实践",
  storiesLead: "跟随那些节省多年的人，分享你的方法并一起成长（即将上线）。",
  stories: [
    {
      name: "林薇",
      role: "产品负责人 · 上海",
      image: "/assets/Stories_image_1.webp",
      text: "Horizon 把模糊目标变成了日期，再变成了我能坚持的计划。",
    },
    {
      name: "俊凯",
      role: "工程师 · 深圳",
      image: "/assets/Stories_image_2.jpeg",
      text: "方案让我看到哪里能省下几年，而且不牺牲生活感。",
    },
    {
      name: "马娅",
      role: "设计师 · 杭州",
      image: "/assets/Stories_image_3.jpg",
      text: "路线不同，但自由日期一样清晰。持续跟踪让我稳住节奏。",
    },
    {
      name: "阿伦",
      role: "创业者 · 新加坡",
      image: "/assets/Stories_image_4.jpg",
      text: "我从本地开始，后来把方法分享给更多人，一起优化。",
    }
  ]
};
