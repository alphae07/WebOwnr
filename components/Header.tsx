"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from 'react'


const Header = () => {
  return (
          <header className="flex justify-between items-center bg-cyan-50 px-8 py-4 border-b">
            <h1 className="text-2xl font-bold text-cyan-600">
                <Link href="/">WebOwnr</Link>
            </h1>
            <nav className="space-x-6">
              <Link href="/auth" className="text-gray-600 hover:text-cyan-600">
                Login
              </Link>
              <Link href="/register">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Get Started
                </Button>
              </Link>
            </nav>
          </header>
  )
}

export default Header