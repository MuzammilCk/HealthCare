export default function VideoBackground() {
  return (
    <video
      autoPlay
      loop
      muted
      className="absolute top-0 left-0 w-full h-full object-cover -z-10"
    >
      <source src="/bg-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}