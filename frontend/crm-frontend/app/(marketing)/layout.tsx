import { MarketingWithModals } from './MarketingWithModals';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingWithModals>{children}</MarketingWithModals>;
}
