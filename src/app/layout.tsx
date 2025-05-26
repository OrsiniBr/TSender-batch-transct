import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";import Header from "@/components/Header";



export const metadata: Metadata = {
  title: "TSender",
};

export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">

              <Header />
              {props.children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
