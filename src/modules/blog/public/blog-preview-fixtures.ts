import {
  BLOG_PREVIEW_CATEGORIES,
  type BlogPreviewArticle,
} from "./blog-preview.types";

const COVER_FOREST =
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1280&h=720&q=80";
const COVER_CITY =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1280&h=720&q=80";
const COVER_DESERT =
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1280&h=720&q=80";

const categoryLabels = new Map(
  BLOG_PREVIEW_CATEGORIES.map((category) => [category.slug, category.labelFa]),
);

export const blogPreviewArticles = [
  {
    slug: "راهنمای-انتخاب-فوتیج-برای-یک-روایت-روان",
    titleFa: "چطور برای یک روایت روان، فوتیج مناسب انتخاب کنیم؟",
    excerptFa:
      "از ریتم تدوین تا فضای احساسی، چند سؤال ساده کمک می‌کند قبل از جست‌وجو تصویر درست را دقیق‌تر بشناسیم.",
    category: "guide",
    categoryLabelFa: "راهنمای فوتیج",
    readingTimeFa: "۴ دقیقه مطالعه",
    publishedAt: "نمونه انتشار · مهر ۱۴۰۵",
    coverSrc: COVER_FOREST,
    coverAltFa: "جاده‌ای در میان جنگل مه‌آلود برای نمونه مقاله انتخاب فوتیج",
    body: [
      {
        headingFa: "اول از حس صحنه شروع کنید",
        paragraphsFa: [
          "قبل از انتخاب یک قاب، از خودتان بپرسید مخاطب قرار است چه حسی را تجربه کند. حرکت آرام دوربین می‌تواند مکث و تأمل بسازد و یک قاب پرتحرک، انرژی بیشتری به تدوین بدهد.",
          "این یادداشت یک نمونه محتوای نمایشی است؛ قرار نیست توصیه حرفه‌ای یا متن منتشرشده واقعی تلقی شود.",
        ],
      },
      {
        headingFa: "بعد به ریتم تدوین فکر کنید",
        paragraphsFa: [
          "فوتیج‌هایی را کنار هم بگذارید که از نظر جهت حرکت، نور و سرعت با روایت شما هم‌خوان باشند. یک مجموعه کوچک اما هماهنگ، معمولاً از تعداد زیادی قاب نامرتبط کاربردی‌تر است.",
        ],
      },
    ],
    relatedFootage: [
      {
        href: "/footage/پرواز-پرندگان-بر-فراز-کوهستان",
        titleFa: "پرواز پرندگان بر فراز کوهستان",
        categoryFa: "طبیعت",
      },
      {
        href: "/footage/دویدن-در-مسیر-جنگلی",
        titleFa: "دویدن در مسیر جنگلی",
        categoryFa: "ورزش",
      },
    ],
  },
  {
    slug: "سه-راه-برای-ساخت-ریتم-تصویری",
    titleFa: "سه راه برای ساختن ریتم تصویری در ویدیو",
    excerptFa:
      "گاهی یک تغییر کوچک در ترتیب نماها، مسیر نگاه مخاطب و ضرباهنگ روایت را روشن‌تر می‌کند.",
    category: "creative",
    categoryLabelFa: "ایده‌پردازی",
    readingTimeFa: "۳ دقیقه مطالعه",
    publishedAt: "نمونه انتشار · مهر ۱۴۰۵",
    coverSrc: COVER_CITY,
    coverAltFa: "خیابان‌های شهری در نور غروب برای نمونه مقاله ریتم تصویری",
    body: [
      {
        headingFa: "تکرار را آگاهانه بسازید",
        paragraphsFa: [
          "تکرار یک رنگ، زاویه یا حرکت می‌تواند بین نماهای جداگانه پیوند ایجاد کند. این پیوند به مخاطب کمک می‌کند تغییر صحنه را بدون گسست دنبال کند.",
        ],
      },
      {
        headingFa: "بین سکوت و حرکت فاصله بگذارید",
        paragraphsFa: [
          "همه نماها لازم نیست پرتحرک باشند. چند ثانیه سکون، ارزش حرکت بعدی را بیشتر می‌کند و به روایت فرصت نفس کشیدن می‌دهد.",
        ],
      },
    ],
    relatedFootage: [
      {
        href: "/footage/حرکت-آرام-دوربین-در-خیابان-تهران",
        titleFa: "حرکت آرام دوربین در خیابان‌های بارانی تهران",
        categoryFa: "شهری",
      },
    ],
  },
  {
    slug: "رزولوشن-مناسب-برای-پروژه-ویدیویی",
    titleFa: "برای پروژه ویدیویی، چه رزولوشنی مناسب‌تر است؟",
    excerptFa:
      "انتخاب رزولوشن به مقصد انتشار، فاصله برش و امکانات پروژه بستگی دارد؛ اینجا یک چارچوب کوتاه برای مقایسه داریم.",
    category: "technical",
    categoryLabelFa: "فنی",
    readingTimeFa: "۵ دقیقه مطالعه",
    publishedAt: "نمونه انتشار · مهر ۱۴۰۵",
    coverSrc: COVER_DESERT,
    coverAltFa: "تپه‌های شنی کویر در نور طلایی برای نمونه مقاله رزولوشن",
    body: [
      {
        headingFa: "مقصد انتشار را مشخص کنید",
        paragraphsFa: [
          "اگر ویدیو برای شبکه‌های اجتماعی یا یک نمایشگر مشخص آماده می‌شود، ابعاد خروجی روی انتخاب اولیه اثر می‌گذارد. رزولوشن بالاتر همیشه به معنی نتیجه بهتر نیست؛ هماهنگی با پروژه مهم‌تر است.",
        ],
      },
      {
        headingFa: "فضا برای برش را در نظر بگیرید",
        paragraphsFa: [
          "در بعضی پروژه‌ها لازم است قاب کمی برش بخورد یا برای چند نسبت تصویر آماده شود. در این حالت، داشتن فضای کافی در تصویر می‌تواند دست تدوینگر را بازتر بگذارد.",
        ],
      },
    ],
    relatedFootage: [
      {
        href: "/footage/نور-طلایی-در-کویر-مرنجاب",
        titleFa: "نور طلایی و سایه‌های بلند روی شن‌های کویر مرنجاب",
        categoryFa: "سفر",
      },
    ],
  },
] satisfies readonly BlogPreviewArticle[];

export function getBlogPreviewCategoryLabel(slug: string) {
  return (
    categoryLabels.get(slug as "all" | "guide" | "creative" | "technical") ??
    "همه یادداشت‌ها"
  );
}
