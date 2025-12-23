export default function Footer() {
  return (
    <footer className="bg-background py-4 my-auto border-t border-border">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          &copy; 2023{" "}
          <a
            className="hover:underline hover:text-primary"
            href="https://github.com/afadhili"
            target="_blank"
          >
            @afadhili
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
