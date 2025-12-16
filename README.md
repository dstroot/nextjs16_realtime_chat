This is a [Next.js](https://nextjs.org) project

All the credit goes to Josh!!

- This project was forked from [Josh's Repo](https://github.com/joschan21/nextjs16_realtime_chat/pulls)
- See Josh's most excellent [video](https://www.youtube.com/watch?v=D8CLV-MRH0k&t=2603s)!

Middleware @ 1:18. https://youtu.be/D8CLV-MRH0k?t=4715
Realtime @ 1:51  https://youtu.be/D8CLV-MRH0k?t=6719 

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## To Do

- [x] Use Shadcn UI Components
- [x] Support light/dark/system theme
- [x] Change from local storage to session storage (don't want any data saved beyond a session)
- [x] Your username is not used in the chat (you appear as "you") so we don't need to show it on the landing page.
- [x] Username can simply be a nanoid. No need for any extra complexity.
- [x] Room destruction messages/Errors now disappear after a delay.
- [x] Consolidated constants into a single file in /lib (constants.ts)
- [x] Added end-to-end encryption from @oguzbits pull request
