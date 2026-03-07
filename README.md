# ✉️ Envelope Print & Design App

A modern, fast, and entirely client-side React application to design, format, and print envelopes and letterheads directly from your web browser. Built with Vite and Tailwind CSS.

**[🚀 View Live Demo](https://lumiliaro.github.io/envelope-generator/)**

## ✨ Features

- **Visual Drag & Drop:** Position sender and recipient addresses intuitively on a virtual canvas.
- **Fixed Norm-Orientations:** Unlike generic tools, this app automatically locks the orientation (Portrait/Landscape) based on the selected DIN format to ensure it matches physical printer feed standards.
- **New: DIN A4 Letterhead Support:** Generate a standard A4 page with the recipient address perfectly positioned for C4 or windowed envelopes.
- **Millimeter Precision:** Fine-tune coordinates using exact X and Y millimeter inputs.
- **Standard Format Library:** Pre-configured dimensions for:
    - **DIN A4** (Letterhead for window envelopes)
    - **DIN Lang** (With & without window)
    - **C4, C5, C6** (Standard & Large envelopes)
    - **B4, B5** (Special formats)
    - **Square formats** (155x155, 220x220)
- **Typography Control:** Independent customization for font family (Helvetica, Times, Courier), size, bold, and italic styles.
- **Visual Guides:** Real-time overlays for **Postage Zones** (Franking) and **Window Zones** to ensure your layout is post-office compliant.
- **Direct Print & PDF Export:** Print directly or export a pixel-perfect PDF using `jsPDF`.
- **Privacy First:** 🛡️ **No server-side storage.**
    - No server storage.
    - All data stays local in your browser.
- **Bilingual UI:** Instantly toggle between English and German.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **PDF Generation:** [jsPDF](https://parall.ax/products/jspdf)
- **Interactivity:** [react-draggable](https://github.com/react-grid-layout/react-draggable)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

To run this project locally:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/lumiliaro/envelope-generator.git
cd envelope-generator
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open in browser:**
   Open `http://localhost:5173` (or the port provided in your terminal) to view the app.

## 🖨️ Printing Tips

When using the **Print** feature, make sure your printer settings in the browser print dialog are configured correctly:

- **Scale:** Set to 100% or Actual Size. Do not use "Fit to Page", or the millimeter coordinates will be incorrect.
- **Margins:** Set to None.
- **Paper Size:** Ensure the selected paper size in the print dialog matches your physical envelope/paper.

## 📸 Screenshots

![App Screenshot](./screenshot.png)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
