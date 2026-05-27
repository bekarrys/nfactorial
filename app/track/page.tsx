import StatsGrid from '@/components/dashboard/StatsGrid';

export default function TrackPage() {
  return (
    <div className="flex flex-col h-screen bg-background px-6 py-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <p className="text-text-secondary text-sm ml-3">Track your performance metrics and improvement</p>
        </div>
        <StatsGrid />
      </div>
    </div>
  );
}
