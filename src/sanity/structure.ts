import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
	S.list()
		.title("Content")
		.items([
			// Singleton: About Me — always opens the same document directly
			S.listItem()
				.title("About Me")
				.child(
					S.document()
						.schemaType("aboutMe")
						.documentId("singleton-aboutMe")
						.title("About Me")
				),
			...S.documentTypeListItems().filter(
				(item) => item.getId() !== "aboutMe"
			),
		]);
