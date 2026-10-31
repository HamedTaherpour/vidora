import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/modules/footage/format-duration";
import type { PublicFootageDetail } from "../public-footage-detail.types";
import { FootageBuyNowStates } from "./footage-buy-now-states";
import { FootageDetailPreview } from "./footage-detail-preview";

type FootageDetailPageProps = {
  footage: PublicFootageDetail;
};

export function FootageDetailPage(props: FootageDetailPageProps) {
  const { footage } = props;
  const metadata = <FootageMetadata footage={footage} />;
  const purchase = <FootageBuyNowStates footage={footage} />;
  const title = <FootageTitle footage={footage} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)] lg:items-start">
      <div className="flex flex-col gap-6">
        {title}
        <FootageDetailPreview footage={footage} />
      </div>
      <div className="flex flex-col gap-6 lg:sticky lg:top-24">
        {metadata}
        {purchase}
        <p className="max-w-prose text-sm leading-6 text-muted-foreground">
          {footage.descriptionFa}
        </p>
      </div>
    </div>
  );
}

function FootageTitle(props: { footage: PublicFootageDetail }) {
  const { footage } = props;
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{footage.category.nameFa}</Badge>
        <span className="text-sm text-muted-foreground">فوتیج منتخب</span>
      </div>
      <h1 className="max-w-4xl text-3xl leading-10 font-bold tracking-tight md:text-5xl md:leading-tight">
        {footage.titleFa}
      </h1>
      <p className="max-w-3xl text-base leading-8 text-muted-foreground">
        {footage.descriptionFa}
      </p>
    </header>
  );
}

function FootageMetadata(props: { footage: PublicFootageDetail }) {
  const { footage } = props;
  return (
    <Card>
      <CardHeader>
        <CardTitle>جزئیات فوتیج</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">مدت</dt>
            <dd className="mt-1 font-medium" dir="ltr">
              {formatDuration(footage.durationSeconds)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">رزولوشن</dt>
            <dd className="mt-1 font-medium" dir="ltr">
              {footage.resolution}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">نرخ فریم</dt>
            <dd className="mt-1 font-medium" dir="ltr">
              {footage.frameRate}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">فرمت</dt>
            <dd className="mt-1 font-medium" dir="ltr">
              {footage.format}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2" aria-label="برچسب‌ها">
          {footage.tagsFa.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
