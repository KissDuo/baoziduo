// PC-specific inner layout.
// The main shell (navbar + footer) is provided by the root layout.
// This layout adds PC-specific section context if needed (e.g., IELTS sub-navigation).
export default function PCLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
