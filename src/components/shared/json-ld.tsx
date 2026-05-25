// components/shared/json-ld.tsx
import type { Thing, WithContext } from "schema-dts";

export function JsonLd({ jsonLd }: { jsonLd: WithContext<Thing> }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
