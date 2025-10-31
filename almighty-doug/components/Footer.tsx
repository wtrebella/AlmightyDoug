import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="flex-1 ml-4 mb-1 p-1 text-left text-sm text-gray-500"
    >
      <div className="mt-1">
          <span className="inline-flex text-tiny">
              <p>Site by Whitaker Trebella</p>
              <p className="px-3 text-md">•</p>
              <p><Link href="https://skfb.ly/ouBTP">Stylized Rock</Link> by Jaspreet Singh is licensed under <Link href="https://creativecommons.org/licenses/by/4.0">Creative Commons Attribution</Link></p>
          </span>
      </div>
    </footer>
  );
}