import Navbar from "./Navbar";

export default function Layout({ children }) {
  return <><Navbar /><main className="min-h-screen bg-blush pt-16">{children}</main></>;
}
