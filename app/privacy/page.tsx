import Link from 'next/link';
import type { Metadata } from 'next';
import { CookieSettingsButton } from '@/components/cookie-consent';
export const metadata: Metadata = { title: 'Privacy policy' };

const contact = 'info@santosautomation.com';

// Describes what the app actually stores and shares. Update it whenever data handling changes.
export default function Page() {
  return <div className="container trust-page">
    <div className="page-heading"><div><span className="eyebrow">PRIVACY POLICY</span><h1>Your information, handled plainly.</h1><p>Effective September 13, 2026. This policy explains what DEALR, a Baitjet company, collects, why, and the choices you have.</p></div></div>
    <div className="stack section">
      <section className="panel"><h2>What we collect</h2>
        <p><strong>Account details.</strong> When you create an account, we receive your email address and name. If you sign in with Google, Google shares your name, email address, and profile picture with us. Passwords are stored by our sign-in provider, Supabase, not in DEALR’s database.</p>
        <p><strong>What you post.</strong> Listings and wanted requests, including titles, descriptions, prices, approximate locations, category details, and the photo or video links you add.</p>
        <p><strong>Activity on DEALR.</strong> Messages, offers and counteroffers, saved listings, reports, blocks, broker requests, and the preferences you save, such as budget, location, and search radius.</p>
        <p><strong>Usage and security records.</strong> Marketplace actions such as messages sent, a tamper-evident log of account actions, and short-lived request counters that prevent abuse. Optional search and listing-view events are recorded only if you allow analytics in Cookie settings. Those events contain your account or demo actor ID, a timestamp, and a result count or listing ID; they do not include raw search text.</p>
      </section>
      <section className="panel"><h2>How we use it</h2>
        <p>We use your information to run the marketplace: showing your listings, delivering messages and offers, matching wanted requests, keeping you signed in, and letting administrators review reports. We do not sell personal information or use it for advertising.</p>
        <p>DEALR’s use of information received from Google APIs follows the <a className="text-link" href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including its Limited Use requirements. We use Google sign-in data only to create and identify your account.</p>
      </section>
      <section className="panel"><h2>What other people can see</h2>
        <p>Published listings are public, including the seller’s display name. Messages and offers are visible to the people in that conversation and to a broker assigned to the listing or invited into the conversation. Administrators can access the records needed to review reports and keep DEALR safe. Your email address is not shown to other members.</p>
      </section>
      <section className="panel"><h2>Services we rely on</h2>
        <p>Supabase provides our database and sign-in service and stores data in the United States. Vercel hosts the website. Google provides sign-in if you choose it. These providers process data on our behalf to run DEALR. Connections to DEALR and to its database are encrypted.</p>
      </section>
      <section className="panel"><h2>Cookies</h2>
        <p>Necessary cookies keep sign-in and the private demo working and remember your cookie choice for 180 days. Optional search and listing-view analytics stay off until you accept them, and you can turn them off at any time. DEALR has no advertising cookies or third-party analytics tools. A Global Privacy Control signal keeps optional analytics off.</p><p>Our <Link className="text-link" href="/cookies">cookie policy</Link> lists cookie names, purposes, durations, and how external media works. Turning off optional analytics stops future optional collection; it does not delete earlier data or prevent the records needed to deliver marketplace services.</p><CookieSettingsButton className="button button-secondary">Manage cookie preferences</CookieSettingsButton>
      </section>
      <section className="panel"><h2>Your choices</h2>
        <p>You can edit or unpublish your listings and update your name and preferences at any time. To get a copy of your information, or to delete your account and its data, email <a className="text-link" href={'mailto:' + contact}>{contact}</a>. We keep information while your account is active and as needed to resolve reports, prevent abuse, or meet legal obligations.</p>
        <p>The interactive demo uses fictional listings in a private workspace that isn’t linked to an email address.</p>
      </section>
      <section className="panel"><h2>Children</h2><p>DEALR is not intended for children under 13, and we do not knowingly collect their information.</p></section>
      <section className="panel"><h2>Changes and contact</h2><p>If this policy changes, we’ll update this page and its effective date. Questions? Email <a className="text-link" href={'mailto:' + contact}>{contact}</a>.</p><Link className="text-link" href="/trust">Read our trust & safety guidance →</Link></section>
    </div>
  </div>;
}
