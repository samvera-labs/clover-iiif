# Clover IIIF

**Extensible IIIF front-end toolkit and Manifest viewer. Accessible. Composable. Open Source.**

Clover IIIF is a suite of Manifest and Collection components combined with lower-level IIIF Presentation 3.0 API UI components. Designed with a focus on accessibility, customization, and developer experience. You can use Clover IIIF to build your own custom IIIF-fluent web interfaces while still using the full power of the IIIF Presentation 3.0 API.

---

## Documentation

For full documentation, visit [samvera-labs.github.io/clover-iiif](https://samvera-labs.github.io/clover-iiif/).

## Contributing

We welcome all contributions. Please follow our [contributing guidelines](./.github/CONTRIBUTING.md). If you're working on a pull request for this project, create a feature branch off of `main`.

### Development

Clover IIIF front-end development occurs within Next.js based [Nextra](https://nextra.site/) documentation. The default url for the local server is `http://localhost:3000`, unless the `3000` port is in use.

```shell
npm install
npm run dev
```

### Testing

Clover IIIF utilizes [vitest](https://vitest.dev/) for unit testing.

```shell
# Run tests
npm run test
```

```shell
# Run coverage report on the tests
npm run test --coverage
```

The coverage report uses [Vitest UI](https://vitest.dev/guide/ui.html). It will output a coverage report in the terminal, and open a nicer looking HTML coverage report as well.

## Releases

The Clover Suite is transitioning to it's next major release `v2`. Experiment with the Release Candidate by installing `npm install @samvera/clover-iiif@next`. View the source code on the `/suite` branch.

## License

This project is available under the [MIT License](https://github.com/samvera-labs/clover-iiif/blob/main/LICENSE).
