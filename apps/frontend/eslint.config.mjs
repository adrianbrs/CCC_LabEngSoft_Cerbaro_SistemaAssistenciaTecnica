// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        message:
          "Do not import default from lodash-es. Use a namespace import (* as) instead.",
        selector:
          'ImportDeclaration[source.value="lodash-es"] ImportDefaultSpecifier',
      },
    ],
    "@typescript-eslint/unified-signatures": [
      "error",
      {
        ignoreOverloadsWithDifferentJSDoc: true,
      },
    ],
  },
});
