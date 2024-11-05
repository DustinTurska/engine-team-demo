"use client";

import ClaimTo from "../../components/ClaimTo";

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <ClaimTo />
      </div>
    </main>
  );
}
