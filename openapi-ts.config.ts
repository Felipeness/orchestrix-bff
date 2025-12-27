import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	// Input: OpenAPI spec
	input: './openapi.yaml',

	// Output: Generated code directory
	output: {
		path: './src/generated',
		format: 'prettier',
	},

	// Plugins
	plugins: [
		// Generate TypeScript types
		'@hey-api/typescript',

		// Generate SDK client
		{
			name: '@hey-api/sdk',
			asClass: false, // Use functions for tree-shaking
			operationId: true,
		},

		// Generate Zod schemas for runtime validation
		{
			name: 'zod',
			export: true,
		},
	],
});
