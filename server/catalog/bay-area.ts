import type { CatalogItem } from "./types.ts";

/**
 * The Bay Area care catalog, by stage of childhood. Nothing ships to a
 * grandparent; everything is used in the child's city.
 * Prices marked priceVerified:false must be checked before the demo.
 */
export const BAY_AREA_CATALOG: CatalogItem[] = [
  // Expecting and baby: help for tired parents
  {
    id: "dinner-delivered",
    title: { en: "Dinner delivered, so they can rest", "zh-TW": "幫他們叫晚餐，好好休息", "ja-JP": "夕食をお届け、ゆっくり休んで", "fr-FR": "Le dîner livré, pour souffler" },
    why: { en: "The first weeks with a baby are long. Dinner is one less thing.", "zh-TW": "寶寶剛出生的幾週很辛苦，少煮一餐也好。", "ja-JP": "赤ちゃんが来たばかりの数週間は大変。夕食の心配をひとつ減らせます。", "fr-FR": "Les premières semaines sont longues. Un dîner en moins à préparer." },
    stages: ["expecting", "baby", "toddler"], category: "food", area: "Bay Area",
    priceUsdCents: 10000, fulfillment: "gift_card", provider: "DoorDash eGift ($5–$500)",
    sourceUrl: "https://www.doordash.com/en/gift-cards/", priceVerified: true,
  },
  {
    id: "registry-item",
    title: { en: "Something from their baby list", "zh-TW": "寶寶清單上的一樣東西", "ja-JP": "出産準備リストからひとつ", "fr-FR": "Un cadeau de leur liste de naissance" },
    why: { en: "The parents picked it, so it's exactly what they need.", "zh-TW": "爸媽自己挑的，一定用得到。", "ja-JP": "両親が選んだものなので、本当に必要なものです。", "fr-FR": "Les parents l'ont choisi : c'est ce qu'il leur faut." },
    stages: ["expecting", "baby"], category: "baby_gear", area: "Bay Area",
    priceUsdCents: 7500, fulfillment: "registry", provider: "Babylist (parent's registry)",
    sourceUrl: "https://www.babylist.com/", priceVerified: false,
  },
  {
    id: "sitter-night",
    title: { en: "A night off for Mom and Dad", "zh-TW": "讓爸媽放一晚假", "ja-JP": "パパとママに一晩のお休みを", "fr-FR": "Une soirée libre pour les parents" },
    why: { en: "A sitter for the evening, so the parents get dinner together.", "zh-TW": "請保母顧一晚，讓爸媽一起吃頓飯。", "ja-JP": "ベビーシッターに一晩任せて、二人で食事を。", "fr-FR": "Une baby-sitter pour la soirée, un dîner à deux." },
    stages: ["baby", "toddler", "kid"], category: "care", area: "Bay Area",
    priceUsdCents: 10000, fulfillment: "registration", provider: "Parent's own sitter (UrbanSitter or similar)",
    sourceUrl: "https://www.urbansitter.com/", priceVerified: false,
  },
  // Toddler and kid: places to go
  {
    id: "bay-area-discovery-museum",
    title: { en: "A year at the Bay Area Discovery Museum", "zh-TW": "灣區探索博物館一年會員", "ja-JP": "ベイエリア・ディスカバリー・ミュージアム年間会員", "fr-FR": "Un an au Bay Area Discovery Museum" },
    why: { en: "Built for little ones under 8. Every rainy Saturday is covered.", "zh-TW": "專為八歲以下的孩子設計，下雨的週末也有地方去。", "ja-JP": "8歳以下の子ども向け。雨の週末も安心です。", "fr-FR": "Pensé pour les moins de 8 ans. Tous les samedis de pluie sont réglés." },
    stages: ["toddler", "kid"], category: "membership", area: "Bay Area",
    priceUsdCents: 22900, fulfillment: "membership", provider: "Bay Area Discovery Museum",
    sourceUrl: "https://bayareadiscoverymuseum.org/membership", priceVerified: true,
  },
  {
    id: "sf-zoo",
    title: { en: "A year of Saturdays at the SF Zoo", "zh-TW": "舊金山動物園一年會員", "ja-JP": "サンフランシスコ動物園の年間会員", "fr-FR": "Un an de samedis au zoo de San Francisco" },
    why: { en: "Visit as often as they like, all year.", "zh-TW": "一整年想去就去。", "ja-JP": "一年中、好きなだけ通えます。", "fr-FR": "Autant de visites qu'ils veulent, toute l'année." },
    stages: ["toddler", "kid", "big_kid"], category: "membership", area: "SF",
    priceUsdCents: 19900, fulfillment: "membership", provider: "San Francisco Zoo",
    sourceUrl: "https://www.sfzoo.org/membership/", priceVerified: true,
  },
  {
    id: "exploratorium",
    title: { en: "A year at the Exploratorium", "zh-TW": "探索館一年會員", "ja-JP": "エクスプロラトリアム年間会員", "fr-FR": "Un an à l'Exploratorium" },
    why: { en: "Hands-on science for a curious kid.", "zh-TW": "給好奇的孩子動手玩科學。", "ja-JP": "好奇心いっぱいの子に、体験型サイエンス。", "fr-FR": "De la science à toucher, pour un enfant curieux." },
    stages: ["kid", "big_kid"], category: "membership", area: "SF",
    priceUsdCents: 23900, fulfillment: "membership", provider: "Exploratorium",
    sourceUrl: "https://www.exploratorium.edu/membership", priceVerified: true,
  },
  {
    id: "lawrence-hall-of-science",
    title: { en: "A year at the Lawrence Hall of Science", "zh-TW": "勞倫斯科學館一年會員", "ja-JP": "ローレンス科学館の年間会員", "fr-FR": "Un an au Lawrence Hall of Science" },
    why: { en: "Berkeley's science museum, with dinosaurs and a view of the bay.", "zh-TW": "柏克萊的科學館，有恐龍，還看得到海灣。", "ja-JP": "バークレーの科学館。恐竜も、湾の眺めも。", "fr-FR": "Le musée des sciences de Berkeley, dinosaures et vue sur la baie." },
    stages: ["kid", "big_kid"], category: "membership", area: "East Bay",
    priceUsdCents: 15000, fulfillment: "membership", provider: "Lawrence Hall of Science",
    sourceUrl: "https://lawrencehallofscience.org/visit/membership/", priceVerified: false,
  },
  {
    id: "oakland-zoo",
    title: { en: "A year at the Oakland Zoo", "zh-TW": "奧克蘭動物園一年會員", "ja-JP": "オークランド動物園の年間会員", "fr-FR": "Un an au zoo d'Oakland" },
    why: { en: "Close to home in the East Bay, with a gondola ride.", "zh-TW": "就在東灣，還能坐纜車。", "ja-JP": "イーストベイから近く、ゴンドラにも乗れます。", "fr-FR": "Tout près, dans l'East Bay, avec une télécabine." },
    stages: ["toddler", "kid", "big_kid"], category: "membership", area: "East Bay",
    priceUsdCents: 18000, fulfillment: "membership", provider: "Oakland Zoo",
    sourceUrl: "https://www.oaklandzoo.org/membership", priceVerified: false,
  },
  {
    id: "saturday-movies",
    title: { en: "Saturday at the movies", "zh-TW": "週六看電影", "ja-JP": "土曜日は映画へ", "fr-FR": "Un samedi au cinéma" },
    why: { en: "Popcorn and a dinosaur movie with Mom.", "zh-TW": "和媽媽一起吃爆米花，看恐龍電影。", "ja-JP": "ママとポップコーンと恐竜の映画。", "fr-FR": "Du pop-corn et un film de dinosaures avec maman." },
    stages: ["kid", "big_kid"], category: "outing", area: "Bay Area",
    priceUsdCents: 10000, fulfillment: "gift_card", provider: "Regal (PayPal sandbox gift-card store)",
    sourceUrl: "https://webmcp-store.paypal.com/", priceVerified: true,
  },
  // Kid and big kid: lessons and camp
  {
    id: "swim-lessons",
    title: { en: "Swimming lessons", "zh-TW": "游泳課", "ja-JP": "水泳教室", "fr-FR": "Des cours de natation" },
    why: { en: "A skill for life, and she already loves the water.", "zh-TW": "一輩子用得到的本事，她本來就愛玩水。", "ja-JP": "一生ものの力。もともと水が大好きです。", "fr-FR": "Un savoir pour la vie, et elle adore déjà l'eau." },
    stages: ["toddler", "kid", "big_kid"], category: "lessons", area: "Bay Area",
    priceUsdCents: 20000, fulfillment: "registration", provider: "Local swim school (parent picks)",
    sourceUrl: "", priceVerified: false,
  },
  {
    id: "summer-camp-week",
    title: { en: "A week of summer camp", "zh-TW": "一週夏令營", "ja-JP": "サマーキャンプ1週間", "fr-FR": "Une semaine de colo d'été" },
    why: { en: "A week of science or nature camp, close to home.", "zh-TW": "離家近的一週科學或自然營隊。", "ja-JP": "家の近くで、科学か自然のキャンプを1週間。", "fr-FR": "Une semaine de stage science ou nature, près de chez eux." },
    stages: ["kid", "big_kid"], category: "camp", area: "Bay Area",
    priceUsdCents: 45000, fulfillment: "registration", provider: "Day camp (parent picks)",
    sourceUrl: "", priceVerified: false,
  },
];
