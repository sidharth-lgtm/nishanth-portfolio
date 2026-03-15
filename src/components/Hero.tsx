export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Gradient fallback — visible when video is missing or loading */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #080B12 0%, #111318 100%)" }}
      />

      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/assets/reel.mp4"
        poster="/assets/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
    </section>
  );
}
