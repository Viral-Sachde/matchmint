# MatchMint

A marketplace where people and organisations who need backing (NGOs, fests, creators, communities, events, young companies) meet the brands, funds and CSR teams who want to back them.

## Run it

```
npm install
cp apps/api/.env.example apps/api/.env   # then set JWT_SECRET and DEMO_PASSWORD
npm run dev
```

- Web (Next.js): http://localhost:3000
- API (NestJS): http://localhost:4000/api

## Layout

```
apps/web   Next.js 15 app: marketing site and the product
apps/api   NestJS 11 API with SQLite (file at apps/api/data/matchmint.db)
```

Marketing pages: `/`, `/how-it-works` (interactive demo), `/about`, `/seekers`, `/backers`, `/contact`, `/logos`
Product pages: `/explore`, `/posts/[id]`, `/posts/new`, `/dashboard`, `/login`, `/signup`

## How matching works

- A **Seeking** post comes from someone who needs backing. An **Offering** post comes from someone who has backing to give.
- Either kind receives **proposals**: an amount and a short message.
- The post owner accepts or declines each proposal. On an Offering post that is the payer choosing who to fund. On a Seeking post, the proposal is the payer's yes and the seeker accepts the one they want.
- Contact details are shared only after a proposal is accepted.

## Demo data

The API seeds eight demo accounts and twelve posts into an empty database. Demo accounts share the `DEMO_PASSWORD` from `apps/api/.env`. Delete `apps/api/data/matchmint.db` to reseed.

## Logo

Ten concepts live at `/logos`. Set `ACTIVE_MARK` in `apps/web/src/components/Logo.tsx` to switch the one in use.

## Photographs

Images in `apps/web/public/img` are from Unsplash, used under the Unsplash licence.
