"use client";

import { useEffect } from "react";

const SOURCE_COMMENT = `<!--
   _   _  _  _____ _  __ ____ 
  /_\\ | \\| ||_   _|\\ \\/ /|_  /
 / _ \\| .\` |  | |   >  <  / / 
/_/ \\_\\_|\\_|  |_|  /_/\\_\\/___|

 [ System Node: antxz.com ]
 [ Accessing Reality Interface... DONE ]
 [ Observer Mode: ENABLED ]
-->`;

const CONSOLE_BANNER = `
   _   _  _  _____ _  __ ____ 
  /_\\ | \\| ||_   _|\\ \\/ /|_  /
 / _ \\| .\` |  | |   >  <  / / 
/_/ \\_\\_|\\_|  |_|  /_/\\_\\/___|

 [ System Node: antxz.com ]
 [ Observer Mode: ENABLED ]
 [ Reality is the source code. ]
`;

export function SystemEasterEgg() {
	useEffect(() => {
		console.log(
			`%c${CONSOLE_BANNER}`,
			"color: #00ff00; background: #000; font-family: monospace; font-weight: bold;",
		);
	}, []);

	return (
		<div
			style={{ display: "none" }}
			dangerouslySetInnerHTML={{ __html: SOURCE_COMMENT }}
		/>
	);
}
