export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-6">
      <p className="text-center text-sm text-muted-foreground">
        &copy; {year} Naim Academy. All rights reserved.
      </p>
    </footer>
  );
}
