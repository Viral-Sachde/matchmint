import { Suspense } from "react";
import { AuthScreen } from "@/components/AuthScreen";

export const metadata = { title: "Join" };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="signup" />
    </Suspense>
  );
}
