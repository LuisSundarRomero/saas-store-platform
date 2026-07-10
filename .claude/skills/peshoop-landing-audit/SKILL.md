---
name: peshoop-landing-audit
description: Runs a CRO/UX-writing/SEO audit of Peshoop's SaaS marketing landing page (src/components/platform/PlatformLanding.tsx). Use this whenever the user asks to audit, review, or improve the landing page copy, asks for a conversion/CRO review, mentions increasing WhatsApp clicks or demo requests, asks about the hero/pricing/FAQ/nav copy, or wants a "top improvements" list for the site. Also trigger on "audita la landing", "revisa el copy de la página", "cómo mejoro la conversión", or requests to rewrite specific sections (hero, planes, nosotros, FAQ, footer) of this page. Do not use for the tenant storefront pages (catalogo, checkout, admin) — this skill is scoped to the Peshoop-the-product marketing site only.
---

# Peshoop Landing Page Audit

Audits `src/components/platform/PlatformLanding.tsx` (plus `NavBar.tsx` and
`MobileMenu.tsx` for nav-related findings, and `src/app/(public)/page.tsx` +
`src/app/superadmin/layout.tsx` for the `<title>`/metadata that Google
actually indexes) as a Senior SaaS Product Marketing Manager, CRO Specialist,
UX Writer, and Landing Page Auditor. The goal is conversions, not prose —
every finding should tie back to whether it moves a visitor closer to (or
further from) clicking WhatsApp.

**Always re-read the live files before auditing.** This page changes over
time (copy gets fixed, sections get added). Never audit from memory of a
previous pass — grep/read the current file content first, every time.

## Ground truth — don't relitigate these each time

- **Product name is Peshoop. Full stop.** Not "Contahorro" — that was this
  codebase's name before a rebrand, and the old name has no place in any
  copy, title, or metadata this skill touches. If you see "Contahorro"
  anywhere outside a historical SQL comment, it's a bug, not a valid
  alternate name — fix it, don't preserve it as a variant.
- **Product**: Peshoop, an ecommerce platform for Peruvian entrepreneurs who
  sell via Instagram, WhatsApp, TikTok, or Facebook — small, non-technical,
  price-sensitive sellers already used to running their business by chat.
- **Pricing**: Plan Básico S/69/mes, Plan Pro S/99/mes (Pro adds Culqi card
  payments + Yape, requires RUC). Read the `PLANES` array in the file for the
  current feature lists — don't assume these are static.
- **The conversion event is a WhatsApp click** (`wa.me/...` deep link with a
  prewritten message), not a form submission. There is no demo-request form
  by design — the "free demo before paying" promise is delivered
  conversationally after WhatsApp contact. Never recommend adding a
  lead-capture form; that fights how this audience already operates.
- **Voice**: Spanish (es-PE), tú form, Soles currency, professional but warm,
  zero hype ("la mejor plataforma del mundo" is the wrong register). Match
  the tone already in the file — don't invent a new one.
- **Sections in page order** (confirm against the live file, this list drifts
  as the page evolves): Nav, Hero, Problema (`#te-pasa`), Cómo funciona
  (`#como-funciona`), Planes (`#planes`), Proceso (`#proceso`), Nosotros
  (`#nosotros`), Preguntas frecuentes (`#preguntas`), CTA Final, Footer.

## Hard constraint — never fabricate proof

If a persuasion element is missing (testimonials, a specific guarantee, an
add-on price, a cancellation policy), say so explicitly — e.g. *"Missing —
needs a real add-on price from the founder before this can be written"* —
instead of inventing a placeholder number, review count, or client quote.
Fabricated social proof is also a real legal/SEO risk here, not just a
copywriting shortcut: check the page's JSON-LD (`JSON_LD` constant) for
claims like `aggregateRating` or `FAQPage` and flag any mismatch where the
structured data claims something (a rating, an FAQ) that isn't actually
rendered visibly on the page. That mismatch class of bug has bitten this page
before and is worth checking on every pass.

Also grep for stale brand-name residue — this codebase was renamed to
Peshoop from an earlier project name ("Contahorro"), and that old name has
turned up live in `generateMetadata()` in `src/app/(public)/page.tsx` and in
`src/app/superadmin/layout.tsx`'s `<title>`, both of which Google actually
indexes (a real user found this via a live Google search, not a hypothetical
risk). Run `grep -ri contahorro` across `src/` and `.claude/skills/` every
audit and flag any hit outside of historical SQL comments in `supabase/`
(those describe the old domain and are fine to leave). Don't assume a single
pass fixed every occurrence — new code can reintroduce the old name via
copy-paste from an older file.

## Audit process

For each section that currently exists in the file, evaluate:

1. **Clarity** — can a first-time visitor get the message in 5 seconds? Score
   1–10 and say why.
2. **Value proposition** — is the benefit obvious, and is it stated as a
   benefit or just a feature? Suggest a rewrite only if it's weak.
3. **Conversion** — does this section push toward a WhatsApp click? Never
   suggest a form as the fix (see constraint above).
4. **UX writing** — headings, buttons, helper text, labels. Rewrite only
   where the current copy is actually unclear or wrong, not for its own sake.
5. **Marketing** — emotional impact, trust, credibility, differentiation,
   objection-handling. Name what persuasion element is missing, if any.
6. **Visual hierarchy** — too much text, too many competing CTAs, weak
   scanning. Suggest fixes that fit the existing Tailwind + `pl-*` class
   system already used in the file — don't propose a layout rebuild.
7. **SEO** — H1/H2 structure, keyword coverage for how Peruvian sellers
   actually search ("tienda online Perú", "vender por WhatsApp"), the
   schema/content mismatch check described above, and the stale-brand-name
   grep (`contahorro`) — a wrong `<title>` is an SEO bug, not just a copy nit.
8. **Copywriting** — unnecessary words, passive voice, weak verbs, and ideas
   repeated across sections (e.g. two sections both promising "sin
   complicaciones" is a real repetition to catch, not a style nit).
9. **Trust** — guarantees, testimonials, social proof, FAQ, pricing
   transparency. State what's missing per the hard constraint above rather
   than filling gaps with invented content.
10. **Accessibility** — button wording, sentence length, plain language for
    a non-technical reader.

## Output format

Per section:

```
## [Section Name]
**Score:** X/10
**Strengths**
**Weaknesses**
**Improved copy** (Spanish, only if a rewrite is actually warranted)
**Why this converts better**
```

Then a global score table (Clarity, Value Prop, Conversion, UX Writing,
Marketing, Visual Hierarchy, SEO, Copywriting, Trust, Accessibility,
Overall), followed by a **Top 20 Improvements** list ranked by expected
impact on WhatsApp click-throughs, highest first. For each item, note
whether it's ready to apply as a copy/code change now, or blocked on real
data/decisions from the founder — don't blend the two into one undifferentiated
list, since only the first kind can be turned into an edit in the same
session.

If asked to apply fixes afterward, only apply the ones marked "ready to
apply" — the rest need a real answer from the user first.
