import { Suspense } from "react";
import { Dashboard } from "./Dashboard";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return <Suspense><Dashboard /></Suspense>;
}
