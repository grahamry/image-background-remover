'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';

export const Navbar = () => {
  const { user } = useUser();
  const userName = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || 'User';

  return (
    <Section className="sticky top-0 z-50 border-b bg-background/90 px-3 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <CenteredMenu
        logo={<span className="block w-0" aria-hidden />}
        rightMenu={(
          <>
            <SignedOut>
              <li className="ml-1 mr-2.5" data-fade>
                <Link href="/sign-in">Sign In</Link>
              </li>
              <li>
                <Link className={buttonVariants()} href="/sign-up">
                  Sign Up
                </Link>
              </li>
            </SignedOut>

            <SignedIn>
              <li className="ml-1 mr-2.5 text-sm text-muted-foreground" data-fade>
                {userName}
              </li>
              <li>
                <UserButton
                  userProfileMode="navigation"
                  userProfileUrl="/dashboard/user-profile"
                  appearance={{
                    elements: {
                      rootBox: 'px-1 py-1',
                    },
                  }}
                />
              </li>
            </SignedIn>
          </>
        )}
      >
        <li>
          <Link href="#upload">Upload</Link>
        </li>

        <li>
          <Link href="#features">Features</Link>
        </li>

        <li>
          <Link href="#pricing">Pricing</Link>
        </li>

        <li>
          <Link href="#faq">FAQ</Link>
        </li>
      </CenteredMenu>
    </Section>
  );
};
