import React from "react";
import Head from "next/head";
import HomeFeed from "@/components/home/home-feed";

export default function SellerView() {
  return (
    <>
      <Head>
        <title>Arvrtise</title>
        <meta
          name="description"
          content="Arvrtise Sat! Buy and sell anything, anywhere, anytime."
        />

        <meta property="og:url" content="https://arvrtise.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shopstr" />
        <meta
          property="og:description"
          content="Arvrtise Sat! Buy and sell anything, anywhere, anytime. Buy and sell anything, anywhere, anytime."
        />
        <meta property="og:image" content="/shopstr-2000x2000.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="arvrtise.com" />
        <meta property="twitter:url" content="https://arvrtise.com" />
        <meta name="twitter:title" content="Arvrtise" />
        <meta
          name="twitter:description"
          content="Buy and sell anything, anywhere, anytime."
        />
        <meta name="twitter:image" content="/shopstr-2000x2000.png" />
      </Head>
      <div className="flex h-full min-h-screen flex-col bg-light-bg pb-20 pt-4 dark:bg-dark-bg sm:ml-[120px] md:ml-[250px]">
        <HomeFeed />
      </div>
    </>
  );
}
