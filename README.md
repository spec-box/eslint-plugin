# eslint-plugin-specs

Linter for testpalm yaml specs

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-spec-box`:

```sh
npm install eslint-plugin-spec-box --save-dev
```

## Usage

Add `specs` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "eslint-plugin-spec-box"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "spec-box/match-asserts": ["error", { "yamlExtention": "unit.testpalm.yml" }]
    }
}
```

## Supported Rules

* [match-assert](docs/rules/match-assert.md)
