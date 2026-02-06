import AppLayout from './components/Layout/AppLayout';
import GenerationForm from './components/Generator/GenerationForm';
import GalleryGrid from './components/Gallery/GalleryGrid';

export default function App() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Generate Image</h2>
          <GenerationForm />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Your Gallery</h2>
          <GalleryGrid />
        </section>
      </div>
    </AppLayout>
  );
}
