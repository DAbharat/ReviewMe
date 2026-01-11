# ReviewMe

> A lightweight social feed for product/media discussions — built with Next.js, Tailwind CSS and MongoDB.

ProdFeed is a sample/full-stack application for sharing posts, commenting, voting on simple polls, and uploading images. It includes authentication, server-side API routes, and a responsive UI built with the Next.js App Router.

## Key Features
- Email/password authentication (NextAuth)
- Create, update and delete posts with optional image uploads (Cloudinary)
- Commenting system with edit/delete and server-side persistence (MongoDB + Mongoose)
- Simple poll/voting support per post
- Responsive UI using Shadcn components and Tailwind CSS 
- Toast notifications via Sonner, centralized styling

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- NextAuth for authentication
- MongoDB with Mongoose
- Cloudinary for image uploads
- Axios for client HTTP calls
- Lucide icons

## Repository Structure (selected)
- `src/app` — Next.js app routes and global layout
- `src/components` — React components (posts, comments, UI primitives)
- `src/lib` — helpers (Cloudinary, DB connect)
- `src/model` — Mongoose models
- `src/app/api` — server API routes

## Getting Started

Prerequisites
- Node.js 18+ (recommended)
- Yarn or npm
- MongoDB instance (Atlas or local)

Install

```bash
npm install
# or
yarn
```

Environment variables
Create a `.env.local` file at the project root with the following (example names used in code):

```
MONGO_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=a_long_random_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (used for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: public cloud name for client-side usage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Running the app

```bash
npm run dev
# open http://localhost:3000
```

Contributing

Contributions are welcome. Open an issue for discussion or submit a pull request with a clear description and tests where appropriate.

Author

- [@DAbharat](https://github.com/DAbharat)

