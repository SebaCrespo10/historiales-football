// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JsonLd({ data }: { data: unknown[] | Record<string, any> }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify no puede producir '<', pero por las dudas (texto
          // libre con "</script>" adentro) se escapa antes de inyectarlo.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
