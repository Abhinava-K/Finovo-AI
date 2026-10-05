// Shared layout for all module pages (mutual-funds, crypto, advisor).
// Adds top padding for fixed navbar and consistent vertical spacing.
export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-20 pb-16 min-h-screen">
      {children}
    </div>
  )
}
