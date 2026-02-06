import { GenerationRequest, Provider } from '../../backend';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import ImagePreview from './ImagePreview';
import { downloadImage } from '../../utils/downloadImage';

interface GenerationCardProps {
  request: GenerationRequest;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  [Provider.Flux]: 'Flux',
  [Provider.StableDiffusion]: 'Stable Diffusion',
  [Provider.Dalle3]: 'DALL·E 3',
  [Provider.MidJourney]: 'Midjourney API',
  [Provider.ReplicateOrProxy]: 'Replicate / Proxy',
};

export default function GenerationCard({ request }: GenerationCardProps) {
  const isPending = request.status === 'pending';
  const isFailed = request.status === 'failed';
  const isSucceeded = request.status === 'succeeded';

  const formattedDate = new Date(Number(request.timestamp) / 1_000_000).toLocaleString();

  const handleDownload = () => {
    if (request.resultBlob) {
      downloadImage(request);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{request.prompt}</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {PROVIDER_LABELS[request.provider]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {isPending && (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating...</p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="aspect-square bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive font-medium mb-1">Generation Failed</p>
              <p className="text-xs text-muted-foreground break-words">
                {request.errorMessage || 'An error occurred during generation'}
              </p>
            </div>
          </div>
        )}

        {isSucceeded && request.resultBlob && (
          <ImagePreview blob={request.resultBlob} alt={request.prompt} />
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
        {isSucceeded && request.resultBlob && (
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
