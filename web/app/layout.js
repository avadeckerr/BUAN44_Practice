import "./globals.css";

export const metadata = { title: "BUAN44 Practice" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
