Loopwear is a full-stack web application designed to bring reliability, sanitation standards, and intelligent curation to Pakistan's second-hand clothing ecosystem.


--Disclaimer-- 
This is a demo website with limited functionality, only made to provide a concept of how LoopWear would work.
Built with **React 19, TypeScript, Express, Tailwind CSS, and Google Gemini AI**, Loopwear features a three-tier role system for **Customers, Sellers, and Admins**, automated courier tracking integration, and an AI-powered personal stylist.

---

## ✨ Features

### 🛍️ Customer Experience

* **Interactive Marketplace Feed** — Browse pre-loved apparel filtered by category, size, price range, and sanitation condition.
* **Gemini AI Stylist** — Get personalized outfit recommendations based on real-time marketplace inventory.
* **Cart & Order Management** — Manage carts and orders with Cash on Delivery (COD) and Credit/Debit Card payment flows.
* **Live Courier Tracking** — Track dispatched orders with carrier tracking PINs from TCS, Leopards Courier, M&P, and Pakistan Post.
* **Hygiene & Returns System** — Submit return and refund claim tickets for customer support.

### 🏷️ Seller Studio

* **Garment Cataloging** — List pre-loved garments with images, sizes, brands, conditions, and descriptions.
* **Thrift Price Cap** — Automated enforcement of a maximum price of **PKR 8,000 per item**.
* **Order Dispatching & Logistics** — Process orders and dispatch them through supported courier services.
* **Earnings & Analytics** — Track gross sales, net earnings, platform commissions, and performance trends.
* **Refund Dispute Management** — Review and authorize or decline customer return requests.

### 🛡️ Admin Overseer Panel

* **Platform Analytics** — Monitor gross exchange volume, commission revenue, catalog statistics, and payment escrows.
* **Listing Moderation** — Approve or remove listings based on quality and hygiene standards.
* **User Administration** — Search, filter, suspend, and manage registered user accounts.
* **Global Configuration** — Adjust platform commission rates and courier verification requirements.

---

## 🛠️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* Motion
* Lucide React Icons

### Backend

* Node.js
* Express.js

### AI Integration

* Google Gemini API
* `@google/genai`

### Build Tooling

* Vite
* esbuild
* tsx
* TypeScript

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

* **Node.js** `v18.x` or higher
* **npm** `v9.x` or higher
* **Google Gemini API Key** *(optional — required for AI Stylist functionality)*

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/loopwear.git
cd loopwear
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 4. Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:3000
```

---

## 🔑 Demo Access Credentials

For quick local testing and evaluation, the application includes pre-seeded sandbox credentials.

| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Customer | `customer@loopwear.pk` | `customer123` |
| Seller   | `seller@loopwear.pk`   | `seller123`   |
| Admin    | `admin@loopwear.pk`    | `admin123`    |

---

## 📜 Available Scripts

| Command         | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `npm run dev`   | Starts the development server with `tsx` watching `server.ts`.    |
| `npm run build` | Builds the client with Vite and compiles the server with esbuild. |
| `npm run start` | Launches the production CommonJS bundle.                          |
| `npm run lint`  | Runs TypeScript type checking with `tsc --noEmit`.                |

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── CustomerView.tsx
│   │   ├── SellerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── GeminiStylist.tsx
│   │
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server.ts
├── package.json
└── README.md
```

---

## 💚 Our Mission

> **"Loop it, don't lose it."**

Loopwear promotes sustainable fashion by extending the life cycle of clothing and creating a reliable digital marketplace for Pakistan's growing second-hand fashion ecosystem.

By combining **technology, sustainability, intelligent recommendations, and structured marketplace management**, Loopwear aims to make pre-loved fashion more accessible, trustworthy, and convenient.

---

## 📄 License

This project is licensed under the **Apache-2.0 License**.
