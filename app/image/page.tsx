import ImageGenerator from "../components/image-generator";

export default function ImagePage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <ImageGenerator />
    </div>
  );
}
