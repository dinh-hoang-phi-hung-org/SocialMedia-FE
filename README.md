# Socialmedia

This graduation project is a multilingual social media platform where users can create posts, interact, and chat in real time.

From a frontend perspective, the focus is on building an interactive, responsive user experience, handling real-time updates, content moderation states, and a comprehensive admin dashboard for managing users, posts, and reports.

---

## Report

This project was developed as a graduation thesis at the University of Science and Technology — The University of Danang.

**Title:** Social Media System Integrated with Negative Content Prevention Technology

**Author:** Đinh Hoàng Phi Hùng · Student ID: 102210114 · Class: 21T-DT2

**Major:** Software Engineering — Information Technology

**Advisor:** ThS. Nguyễn Thế Xuân Ly

**Institution:** Faculty of Information Technology, University of Science and Technology, The University of Danang

**Year:** 2025

The full graduation thesis report is available here:
[Graduation Thesis Report (PDF)](https://drive.google.com/file/d/1Ue4nHwUSQQDds60lackH7RDCsJ0p5kNf/view?usp=sharing)

---

## Tech Stack

| Technology                                        | Version | Purpose                                              |
| ------------------------------------------------- | ------- | ---------------------------------------------------- |
| [Next.js](https://nextjs.org)                     | 15.x    | Core framework (App Router)                          |
| [React](https://react.dev)                        | 19.x    | UI                                                   |
| [TypeScript](https://www.typescriptlang.org)      | 5.x     | Type safety                                          |
| [Shadcn UI](https://ui.shadcn.com/)               |         | Reusable, accessible UI components                   |
| [i18next](https://www.i18next.com/)               | 24.x    | Internationalization and localization                |
| [Tailwind CSS](https://tailwindcss.com)           | 4.x     | Styling                                              |
| [Google OAuth](https://console.cloud.google.com/) |         | User authentication (OAuth 2.0 flow, token handling) |

---

## Page Structure

```
/	                Home — View posts from other users and create new posts
/auth	            Authentication — Sign in and register
/message	        Messaging — Chat with other users
/profile/[uuid]	    View a user’s profile page
/post/[uuid]	    View post details
/admin	            Admin dashboard overview
/admin/user	        Manage system users
/admin/report	    Review and moderate reported content
```

---

## Environment Variables

Create a `.env.local` file at the root of the project with the following variables:

```env
NEXT_PUBLIC_URL_API=http://your-backend-api-url
NEXT_PUBLIC_URL_API_AI=http://your-ai-api-url
NEXT_PUBLIC_SOCKET_URL=http://your-socket-server-url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
npm run build
npm start
```

---

## Internationalization (i18n)

The app supports **English** and **Vietnamese** out of the box.

- Translation files are located in `public/locales/{locale}/`
- Namespaces: `common`, `admin`, `message`, `notification`, `user-management`, `report-management`
- Default locale: `en`
- Language can be switched at runtime via the `useLanguage` hook

To add a new language, add a new locale folder under `public/locales/` and register the locale in `next-i18next.config.js`.

---

## Goals

- Learned how to structure, organize, and maintain a scalable frontend codebase
- Deployed the application and understood the production workflow
- Optimized performance for smooth user experience across devices
- Designed user-friendly UI/UX focused on clarity and usability
- Implemented practical features such as multilingual support, Google account authentication, ...
- Integrated the frontend with the backend through RESTful APIs
- Managed real-time data updates and application state effectively
- Improved problem-solving skills through handling edge cases and performance bottlenecks
