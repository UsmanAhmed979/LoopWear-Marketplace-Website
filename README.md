\# 🌿 Loopwear ("Loop it, don't lose it")



> \*\*Pakistan's premier digital thrift marketplace platform for pre-loved clothing, shoes, and sustainable fashion.\*\*



Loopwear is a full-stack web application designed to bring reliability, sanitation standards, and intelligent curation to Pakistan's second-hand clothing ecosystem. Built with React 19, TypeScript, Express, Tailwind CSS, and Google Gemini AI, Loopwear features a three-tier role system (Customers, Sellers, and Admins), automated courier tracking integration (TCS/Leopards), and an AI-powered personal stylist.



\---



\## ✨ Features



\### 🛍️ Customer Experience

\- \*\*Interactive Marketplace Feed\*\*: Browse pre-loved apparel filtered by category (Shirts, Pants, Jackets, Hoodies, Shoes, Bags, Accessories), size, price range, and sanitation condition (\*Like New\*, \*Gently Used\*, \*Worn\*).

\- \*\*Gemini AI Stylist\*\*: Integrated AI assistant powered by Google Gemini (`@google/genai`) offering tailored outfit recommendations based on available real-time marketplace inventory.

\- \*\*Cart \& Order Management\*\*: Seamless cart persistence with Cash on Delivery (COD) and Credit/Debit card payment flows.

\- \*\*Live Courier Tracking\*\*: Track dispatched orders with real-time status updates and carrier tracking PINs (TCS, Leopards Courier, M\&P, Post Pakistan).

\- \*\*Hygiene \& Returns System\*\*: Submit return and refund claim tickets with customer satisfaction support.



\### 🏷️ Seller Studio

\- \*\*Garment Cataloging\*\*: Easily list pre-loved garments with images, sizes, brands, condition tags, and descriptions.

\- \*\*Thrift Price Cap\*\*: Automated enforcement of Pakistan's digital thrift price ceiling (PKR 8,000 max per item) to keep fashion accessible.

\- \*\*Order Dispatching \& Logistics\*\*: Mark orders as packed/processed and dispatch via TCS/Leopards courier with auto-generated tracking PINs.

\- \*\*Earnings \& Analytics\*\*: Real-time gross sales tracking, net earnings calculation (after 8% platform commission), and performance trend charts.

\- \*\*Refund Disputes Management\*\*: Review and authorize or decline customer return requests.



\### 🛡️ Admin Overseer Panel

\- \*\*Core Platform Analytics\*\*: Monitor gross exchange volume, platform commission revenue cuts, catalog statistics, and payment escrows.

\- \*\*Listing Moderation\*\*: Approve new garment entries or purge listings failing quality/hygiene benchmarks.

\- \*\*User Account Administration\*\*: View registered accounts with search/filter capabilities and toggle account suspensions or authorizations.

\- \*\*Global Parameters Configuration\*\*: Adjust default platform commission percentages and enforce strict courier verification standards.



\---



\## 🛠️ Tech Stack



\- \*\*Frontend\*\*: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React Icons

\- \*\*Backend\*\*: Express.js (Node.js CJS/ESM runtime)

\- \*\*AI Integration\*\*: Google Gemini API (`@google/genai`) for AI Stylist interactions

\- \*\*Build Tooling\*\*: Vite, esbuild, tsx, TypeScript



\---



\## 🚀 Quick Start



\### Prerequisites



\- \*\*Node.js\*\*: `v18.x` or higher

\- \*\*npm\*\*: `v9.x` or higher

\- \*\*Google Gemini API Key\*\* \*(Optional, for AI Stylist features)\*



\### Installation



1\. \*\*Clone the repository\*\*:

&#x20;  ```bash

&#x20;  git clone https://github.com/your-username/loopwear.git

&#x20;  cd loopwear

&#x20;  ```



2\. \*\*Install dependencies\*\*:

&#x20;  ```bash

&#x20;  npm install

&#x20;  ```



3\. \*\*Configure Environment Variables\*\*:

&#x20;  Create a `.env` file in the project root (see `.env.example`):

&#x20;  ```env

&#x20;  GEMINI\_API\_KEY=your\_gemini\_api\_key\_here

&#x20;  ```



4\. \*\*Run the Development Server\*\*:

&#x20;  ```bash

&#x20;  npm run dev

&#x20;  ```

&#x20;  Open your browser and navigate to `http://localhost:3000`.



\---



\## 🔑 Demo Access Credentials



For quick local testing and evaluation, pre-seeded sandbox credentials are built into the login modal:



| Role | Email | Password |

| :--- | :--- | :--- |

| \*\*Customer\*\* | `customer@loopwear.pk` | `customer123` |

| \*\*Seller\*\* | `seller@loopwear.pk` | `seller123` |

| \*\*Admin\*\* | `admin@loopwear.pk` | `admin123` |



\---



\## 📜 Available Scripts



\- `npm run dev` - Starts the development server with `tsx` watching `server.ts`.

\- `npm run build` - Bundles client assets with Vite and compiles server code with `esbuild` into `dist/server.cjs`.

\- `npm run start` - Launches the production CommonJS bundle from `dist/server.cjs`.

\- `npm run lint` - Runs TypeScript compiler type checking (`tsc --noEmit`).



\---



\## 📁 Project Structure



```text

├── src/

│   ├── components/

│   │   ├── Navbar.tsx          # Top navigation bar with logo, cart, search \& notifications

│   │   ├── CustomerView.tsx    # Customer marketplace catalog, filters \& order tracking

│   │   ├── SellerDashboard.tsx # Seller inventory management, orders \& sales analytics

│   │   ├── AdminDashboard.tsx  # Admin moderation, revenue tracking \& user accounts

│   │   └── GeminiStylist.tsx   # AI-powered outfit stylist drawer

│   ├── types.ts                # Shared TypeScript definitions \& interfaces

│   ├── App.tsx                 # Main layout \& state orchestrator

│   ├── main.tsx               # Client entry point

│   └── index.css               # Global Tailwind CSS imports

├── server.ts                   # Express server \& API endpoints

├── package.json

└── README.md

```



\---



\## 💚 Slogan



\*"Loop it, don't lose it"\* — Encouraging sustainable fashion cycles across Pakistan.



\---



\## 📄 License



Apache-2.0 License.



