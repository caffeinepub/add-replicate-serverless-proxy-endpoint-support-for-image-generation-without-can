import { GenerationRequest, Provider } from '../backend';

const PROVIDER_LABELS: Record<Provider, string> = {
  [Provider.Flux]: 'flux',
  [Provider.StableDiffusion]: 'sd',
  [Provider.Dalle3]: 'dalle3',
  [Provider.MidJourney]: 'mj',
  [Provider.ReplicateOrProxy]: 'replicate',
};

export function downloadImage(request: GenerationRequest) {
  if (!request.resultBlob) {
    console.error('No image to download');
    return;
  }

  const imageUrl = request.resultBlob.getDirectURL();
  const timestamp = new Date(Number(request.timestamp) / 1_000_000).getTime();
  const provider = PROVIDER_LABELS[request.provider];
  const filename = `${provider}-${timestamp}-${request.id}.png`;

  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
