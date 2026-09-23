import { Suspense } from "react";
import { Explorer } from "@/components/repositories";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Explorer />
    </Suspense>
  );
}
