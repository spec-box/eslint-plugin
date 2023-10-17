# match-assert

Checks that all describes and asserts match yaml specs.

## Options

- `yamlExtention` - extention of yaml files to match the spec files. Default is `unit.testpalm.yml`.

```json
{
  "rules": {
    "spec-box/match-asserts": [
      "error",
      { "yamlExtention": "unit.testpalm.yml" }
    ]
  }
}
```
