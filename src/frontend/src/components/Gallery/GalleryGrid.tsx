import { useUserGenerationRequests } from '../../hooks/useQueries';
import GenerationCard from './GenerationCard';
import { Loader2, ImageOff } from 'lucide-react';

export default function GalleryGrid() {
  const { data: requests, isLoading, error } = useUserGenerationRequests();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load gallery. Please try again.</p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No images yet. Generate your first image above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <GenerationCard key={request.id} request={request} />
      ))}
    </div>
  );
}
