import Hero from "@/components/Hero";
import PortalGrid from "@/components/PortalGrid";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <PortalGrid sectionClassName="pb-12 px-6 bg-background" />
    </div>
  );
}
