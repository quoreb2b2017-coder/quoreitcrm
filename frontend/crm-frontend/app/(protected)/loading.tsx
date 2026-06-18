import { PageSpinner } from '@/components/ui/PageSpinner';

export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[42vh] items-center justify-center py-16">
      <PageSpinner size="md" variant="light" />
    </div>
  );
}
