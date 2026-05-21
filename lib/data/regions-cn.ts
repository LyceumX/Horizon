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

function ins(pension: string, medical: string, housing: string): SocialInsuranceProfile {
  return { pension, medical, housing, unemployment: "0.5%", workplace: "企业年金：可选", note: "模拟数据，仅供演示。" };
}

export const CN_REGIONS: CountryOption[] = [
  {
    value: "cn",
    label: { en: "China", zh: "中国" },
    provinces: [
      // ── Municipalities ────────────────────────────────────────
      {
        value: "beijing",
        label: { en: "Beijing", zh: "北京" },
        cities: [
          { value: "chaoyang",   label: { en: "Chaoyang",   zh: "朝阳区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "haidian",    label: { en: "Haidian",    zh: "海淀区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "fengtai",    label: { en: "Fengtai",    zh: "丰台区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "xicheng",    label: { en: "Xicheng",    zh: "西城区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "dongcheng",  label: { en: "Dongcheng",  zh: "东城区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
        ],
      },
      {
        value: "shanghai",
        label: { en: "Shanghai", zh: "上海" },
        cities: [
          { value: "pudong",    label: { en: "Pudong",    zh: "浦东新区" }, insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "huangpu",   label: { en: "Huangpu",   zh: "黄浦区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "xuhui",     label: { en: "Xuhui",     zh: "徐汇区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "jingan",    label: { en: "Jing'an",   zh: "静安区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "changning", label: { en: "Changning", zh: "长宁区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
        ],
      },
      {
        value: "tianjin",
        label: { en: "Tianjin", zh: "天津" },
        cities: [
          { value: "heping",    label: { en: "Heping",    zh: "和平区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "hexi",      label: { en: "Hexi",      zh: "河西区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "nankai",    label: { en: "Nankai",    zh: "南开区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "binhai",    label: { en: "Binhai",    zh: "滨海新区" }, insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "wuqing",    label: { en: "Wuqing",    zh: "武清区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
        ],
      },
      {
        value: "chongqing",
        label: { en: "Chongqing", zh: "重庆" },
        cities: [
          { value: "yuzhong",    label: { en: "Yuzhong",    zh: "渝中区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "jiangbei",   label: { en: "Jiangbei",   zh: "江北区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "nanan",      label: { en: "Nan'an",     zh: "南岸区" },  insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "shapingba",  label: { en: "Shapingba",  zh: "沙坪坝区" }, insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
          { value: "jiulongpo",  label: { en: "Jiulongpo",  zh: "九龙坡区" }, insurance: ins("养老 +8%", "医疗 +2%", "公积金 12%") },
        ],
      },

      // ── Provinces ─────────────────────────────────────────────
      {
        value: "guangdong",
        label: { en: "Guangdong", zh: "广东" },
        cities: [
          { value: "guangzhou", label: { en: "Guangzhou", zh: "广州" }, insurance: ins("养老 +5.8%", "医疗 +2.1%", "公积金 12%") },
          { value: "shenzhen",  label: { en: "Shenzhen",  zh: "深圳" }, insurance: ins("养老 +6.0%", "医疗 +2.2%", "公积金 12%") },
          { value: "dongguan",  label: { en: "Dongguan",  zh: "东莞" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 10%") },
          { value: "foshan",    label: { en: "Foshan",    zh: "佛山" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 10%") },
          { value: "zhuhai",    label: { en: "Zhuhai",    zh: "珠海" }, insurance: ins("养老 +5.6%", "医疗 +2.0%", "公积金 10%") },
        ],
      },
      {
        value: "zhejiang",
        label: { en: "Zhejiang", zh: "浙江" },
        cities: [
          { value: "hangzhou", label: { en: "Hangzhou", zh: "杭州" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 12%") },
          { value: "ningbo",   label: { en: "Ningbo",   zh: "宁波" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "wenzhou",  label: { en: "Wenzhou",  zh: "温州" }, insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "shaoxing", label: { en: "Shaoxing", zh: "绍兴" }, insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "jinhua",   label: { en: "Jinhua",   zh: "金华" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
        ],
      },
      {
        value: "jiangsu",
        label: { en: "Jiangsu", zh: "江苏" },
        cities: [
          { value: "nanjing",  label: { en: "Nanjing",  zh: "南京" }, insurance: ins("养老 +5.6%", "医疗 +2.0%", "公积金 12%") },
          { value: "suzhou",   label: { en: "Suzhou",   zh: "苏州" }, insurance: ins("养老 +5.6%", "医疗 +2.0%", "公积金 12%") },
          { value: "wuxi",     label: { en: "Wuxi",     zh: "无锡" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 12%") },
          { value: "nantong",  label: { en: "Nantong",  zh: "南通" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 10%") },
          { value: "changzhou",label: { en: "Changzhou",zh: "常州" }, insurance: ins("养老 +5.4%", "医疗 +1.9%", "公积金 10%") },
        ],
      },
      {
        value: "shandong",
        label: { en: "Shandong", zh: "山东" },
        cities: [
          { value: "jinan",    label: { en: "Jinan",    zh: "济南" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "qingdao",  label: { en: "Qingdao",  zh: "青岛" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 12%") },
          { value: "yantai",   label: { en: "Yantai",   zh: "烟台" }, insurance: ins("养老 +5.3%", "医疗 +1.8%", "公积金 10%") },
          { value: "weifang",  label: { en: "Weifang",  zh: "潍坊" }, insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "zibo",     label: { en: "Zibo",     zh: "淄博" }, insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
        ],
      },
      {
        value: "sichuan",
        label: { en: "Sichuan", zh: "四川" },
        cities: [
          { value: "chengdu",  label: { en: "Chengdu",  zh: "成都" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 12%") },
          { value: "mianyang", label: { en: "Mianyang", zh: "绵阳" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "deyang",   label: { en: "Deyang",   zh: "德阳" }, insurance: ins("养老 +5.0%", "医疗 +1.8%", "公积金 10%") },
          { value: "yibin",    label: { en: "Yibin",    zh: "宜宾" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "nanchong", label: { en: "Nanchong", zh: "南充" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "hubei",
        label: { en: "Hubei", zh: "湖北" },
        cities: [
          { value: "wuhan",    label: { en: "Wuhan",    zh: "武汉" }, insurance: ins("养老 +5.5%", "医疗 +2.0%", "公积金 12%") },
          { value: "yichang",  label: { en: "Yichang",  zh: "宜昌" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "xiangyang",label: { en: "Xiangyang",zh: "襄阳" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "jingzhou", label: { en: "Jingzhou", zh: "荆州" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "huangshi", label: { en: "Huangshi", zh: "黄石" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "hunan",
        label: { en: "Hunan", zh: "湖南" },
        cities: [
          { value: "changsha",  label: { en: "Changsha",  zh: "长沙" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "zhuzhou",   label: { en: "Zhuzhou",   zh: "株洲" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "xiangtan",  label: { en: "Xiangtan",  zh: "湘潭" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "yueyang",   label: { en: "Yueyang",   zh: "岳阳" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "changde",   label: { en: "Changde",   zh: "常德" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "henan",
        label: { en: "Henan", zh: "河南" },
        cities: [
          { value: "zhengzhou", label: { en: "Zhengzhou", zh: "郑州" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "luoyang",   label: { en: "Luoyang",   zh: "洛阳" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "kaifeng",   label: { en: "Kaifeng",   zh: "开封" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "xinxiang",  label: { en: "Xinxiang",  zh: "新乡" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "nanyang",   label: { en: "Nanyang",   zh: "南阳" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "hebei",
        label: { en: "Hebei", zh: "河北" },
        cities: [
          { value: "shijiazhuang", label: { en: "Shijiazhuang", zh: "石家庄" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "tangshan",     label: { en: "Tangshan",     zh: "唐山" },   insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "baoding",      label: { en: "Baoding",      zh: "保定" },   insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "handan",       label: { en: "Handan",       zh: "邯郸" },   insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "qinhuangdao",  label: { en: "Qinhuangdao",  zh: "秦皇岛" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
        ],
      },
      {
        value: "fujian",
        label: { en: "Fujian", zh: "福建" },
        cities: [
          { value: "fuzhou",   label: { en: "Fuzhou",   zh: "福州" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "xiamen",   label: { en: "Xiamen",   zh: "厦门" }, insurance: ins("养老 +5.6%", "医疗 +2.0%", "公积金 12%") },
          { value: "quanzhou", label: { en: "Quanzhou", zh: "泉州" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 10%") },
          { value: "zhangzhou",label: { en: "Zhangzhou",zh: "漳州" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "putian",   label: { en: "Putian",   zh: "莆田" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
        ],
      },
      {
        value: "anhui",
        label: { en: "Anhui", zh: "安徽" },
        cities: [
          { value: "hefei",     label: { en: "Hefei",     zh: "合肥" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "wuhu",      label: { en: "Wuhu",      zh: "芜湖" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "maanshan",  label: { en: "Ma'anshan",  zh: "马鞍山" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "bengbu",    label: { en: "Bengbu",    zh: "蚌埠" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "huainan",   label: { en: "Huainan",   zh: "淮南" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "jiangxi",
        label: { en: "Jiangxi", zh: "江西" },
        cities: [
          { value: "nanchang",    label: { en: "Nanchang",    zh: "南昌" },  insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "jiujiang",    label: { en: "Jiujiang",    zh: "九江" },  insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "ganzhou",     label: { en: "Ganzhou",     zh: "赣州" },  insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "jian",        label: { en: "Ji'an",        zh: "吉安" },  insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "jingdezhen",  label: { en: "Jingdezhen",  zh: "景德镇" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "liaoning",
        label: { en: "Liaoning", zh: "辽宁" },
        cities: [
          { value: "shenyang", label: { en: "Shenyang", zh: "沈阳" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "dalian",   label: { en: "Dalian",   zh: "大连" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "anshan",   label: { en: "Anshan",   zh: "鞍山" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "fushun",   label: { en: "Fushun",   zh: "抚顺" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "benxi",    label: { en: "Benxi",    zh: "本溪" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "heilongjiang",
        label: { en: "Heilongjiang", zh: "黑龙江" },
        cities: [
          { value: "harbin",      label: { en: "Harbin",      zh: "哈尔滨" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "qiqihaer",    label: { en: "Qiqihar",     zh: "齐齐哈尔" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "daqing",      label: { en: "Daqing",      zh: "大庆" },   insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "mudanjiang",  label: { en: "Mudanjiang",  zh: "牡丹江" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "jiamusi",     label: { en: "Jiamusi",     zh: "佳木斯" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "jilin",
        label: { en: "Jilin", zh: "吉林" },
        cities: [
          { value: "changchun", label: { en: "Changchun", zh: "长春" },   insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "jilinshi",  label: { en: "Jilin City", zh: "吉林市" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "siping",    label: { en: "Siping",    zh: "四平" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "tonghua",   label: { en: "Tonghua",   zh: "通化" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yanbian",   label: { en: "Yanbian",   zh: "延边" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "shanxi",
        label: { en: "Shanxi", zh: "山西" },
        cities: [
          { value: "taiyuan",  label: { en: "Taiyuan",  zh: "太原" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "datong",   label: { en: "Datong",   zh: "大同" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yuncheng", label: { en: "Yuncheng", zh: "运城" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "jincheng", label: { en: "Jincheng", zh: "晋城" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "changzhi", label: { en: "Changzhi", zh: "长治" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "shaanxi",
        label: { en: "Shaanxi", zh: "陕西" },
        cities: [
          { value: "xian",    label: { en: "Xi'an",   zh: "西安" }, insurance: ins("养老 +5.4%", "医疗 +2.0%", "公积金 12%") },
          { value: "baoji",   label: { en: "Baoji",   zh: "宝鸡" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "xianyang",label: { en: "Xianyang",zh: "咸阳" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "weinan",  label: { en: "Weinan",  zh: "渭南" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yanan",   label: { en: "Yan'an",  zh: "延安" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "yunnan",
        label: { en: "Yunnan", zh: "云南" },
        cities: [
          { value: "kunming", label: { en: "Kunming", zh: "昆明" }, insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "dali",    label: { en: "Dali",    zh: "大理" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "lijiang", label: { en: "Lijiang", zh: "丽江" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "qujing",  label: { en: "Qujing",  zh: "曲靖" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yuxi",    label: { en: "Yuxi",    zh: "玉溪" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "guizhou",
        label: { en: "Guizhou", zh: "贵州" },
        cities: [
          { value: "guiyang", label: { en: "Guiyang", zh: "贵阳" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "zunyi",   label: { en: "Zunyi",   zh: "遵义" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "anshun",  label: { en: "Anshun",  zh: "安顺" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "bijie",   label: { en: "Bijie",   zh: "毕节" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "kaili",   label: { en: "Kaili",   zh: "凯里" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "gansu",
        label: { en: "Gansu", zh: "甘肃" },
        cities: [
          { value: "lanzhou",    label: { en: "Lanzhou",   zh: "兰州" }, insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "tianshui",   label: { en: "Tianshui",  zh: "天水" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "jiuquan",    label: { en: "Jiuquan",   zh: "酒泉" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "zhangye",    label: { en: "Zhangye",   zh: "张掖" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "baiyin",     label: { en: "Baiyin",    zh: "白银" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "hainan",
        label: { en: "Hainan", zh: "海南" },
        cities: [
          { value: "haikou",   label: { en: "Haikou",   zh: "海口" },   insurance: ins("养老 +5.3%", "医疗 +1.9%", "公积金 12%") },
          { value: "sanya",    label: { en: "Sanya",    zh: "三亚" },   insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "danzhou",  label: { en: "Danzhou",  zh: "儋州" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "wenchang", label: { en: "Wenchang", zh: "文昌" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "qionghai", label: { en: "Qionghai", zh: "琼海" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "qinghai",
        label: { en: "Qinghai", zh: "青海" },
        cities: [
          { value: "xining",    label: { en: "Xining",    zh: "西宁" },   insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "haidong",   label: { en: "Haidong",   zh: "海东" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "golmud",    label: { en: "Golmud",    zh: "格尔木" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "delingha",  label: { en: "Delingha",  zh: "德令哈" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yushu",     label: { en: "Yushu",     zh: "玉树" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },

      // ── Autonomous Regions ────────────────────────────────────
      {
        value: "guangxi",
        label: { en: "Guangxi", zh: "广西" },
        cities: [
          { value: "nanning",  label: { en: "Nanning",  zh: "南宁" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "guilin",   label: { en: "Guilin",   zh: "桂林" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "liuzhou",  label: { en: "Liuzhou",  zh: "柳州" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "wuzhou",   label: { en: "Wuzhou",   zh: "梧州" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "beihai",   label: { en: "Beihai",   zh: "北海" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "innermongolia",
        label: { en: "Inner Mongolia", zh: "内蒙古" },
        cities: [
          { value: "hohhot",      label: { en: "Hohhot",      zh: "呼和浩特" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "baotou",      label: { en: "Baotou",      zh: "包头" },     insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "hulunbuir",   label: { en: "Hulunbuir",   zh: "呼伦贝尔" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "ordos",       label: { en: "Ordos",       zh: "鄂尔多斯" }, insurance: ins("养老 +5.1%", "医疗 +1.8%", "公积金 10%") },
          { value: "chifeng",     label: { en: "Chifeng",     zh: "赤峰" },     insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "tibet",
        label: { en: "Tibet", zh: "西藏" },
        cities: [
          { value: "lhasa",     label: { en: "Lhasa",     zh: "拉萨" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "shigatse",  label: { en: "Shigatse",  zh: "日喀则" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "linzhi",    label: { en: "Nyingchi",  zh: "林芝" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "chamdo",    label: { en: "Chamdo",    zh: "昌都" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "shannan",   label: { en: "Shannan",   zh: "山南" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "ningxia",
        label: { en: "Ningxia", zh: "宁夏" },
        cities: [
          { value: "yinchuan",   label: { en: "Yinchuan",  zh: "银川" },   insurance: ins("养老 +5.2%", "医疗 +1.8%", "公积金 10%") },
          { value: "shizuishan", label: { en: "Shizuishan",zh: "石嘴山" }, insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "wuzhong",    label: { en: "Wuzhong",   zh: "吴忠" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "guyuan",     label: { en: "Guyuan",    zh: "固原" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "zhongwei",   label: { en: "Zhongwei",  zh: "中卫" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
      {
        value: "xinjiang",
        label: { en: "Xinjiang", zh: "新疆" },
        cities: [
          { value: "urumqi",   label: { en: "Ürümqi",   zh: "乌鲁木齐" }, insurance: ins("养老 +5.2%", "医疗 +1.9%", "公积金 12%") },
          { value: "kashgar",  label: { en: "Kashgar",  zh: "喀什" },     insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "yining",   label: { en: "Yining",   zh: "伊宁" },     insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "korla",    label: { en: "Korla",    zh: "库尔勒" },   insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
          { value: "changji",  label: { en: "Changji",  zh: "昌吉" },     insurance: ins("养老 +5.0%", "医疗 +1.7%", "公积金 10%") },
        ],
      },
    ],
  },
];
