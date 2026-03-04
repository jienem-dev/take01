import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Container } from "@/components/Container";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { NearestLodgingMap } from "@/components/NearestLodgingMap";
import { MyPosts } from "@/components/MyPosts";
import { BannerCarousel } from "@/components/BannerCarousel";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <Container>
        <div className="space-y-4">
          <ProfileSection />
          <NearestLodgingMap />
          <MyPosts />
          <BannerCarousel />
        </div>
      </Container>
    </AppShell>
  );
}
