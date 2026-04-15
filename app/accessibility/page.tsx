export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="prose-tech">
        <h1>Accessibility statement</h1>
        <p>
          PixelTech is designed to meet WCAG 2.1 Level AA. We aim to meet Level AAA for
          colour contrast and heading structure on editorial pages.
        </p>
        <h2>What we do</h2>
        <ul>
          <li>Semantic HTML5 landmarks on every page.</li>
          <li>Keyboard navigable; a visible focus ring is shown on all interactive elements.</li>
          <li>Skip-to-content link available on first Tab press.</li>
          <li>All non-decorative images require alt text at publish time.</li>
          <li>Body text contrast ratio above 7:1 on the default dark theme.</li>
          <li><code>prefers-reduced-motion</code> is respected for animations.</li>
        </ul>
        <h2>Known issues</h2>
        <p>
          Syntax-highlighted code blocks currently use a colour scheme where some tokens
          fall between 4.5:1 and 7:1 contrast. We track these in a public issue list.
        </p>
        <h2>Contact</h2>
        <p>
          Found something broken for you? Please email{" "}
          <a href="mailto:accessibility@pixeltech.dev">accessibility@pixeltech.dev</a>.
          We aim to reply within two business days.
        </p>
      </div>
    </div>
  );
}
