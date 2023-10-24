import { readFileSync } from 'node:fs';
import { DEFAULT_CONFIG_PATH } from '@spec-box/sync/dist/lib/config';
import { AssertionContext, ProjectData, getAttributesContext, getKey, processYamlFiles } from '@spec-box/sync/dist/lib/domain';
import { glob } from 'fast-glob';
import { RootConfig } from '@spec-box/sync/dist/lib/config/models';
import { resolvePath, parseObject } from '@spec-box/sync/dist/lib/utils';
import { configDecoder } from '@spec-box/sync/dist/lib/config/models';
import { parse } from 'yaml';
import { entityDecoder } from '@spec-box/sync/dist/lib/yaml/models';
import { YamlFile } from '@spec-box/sync/dist/lib/yaml';

const loadConfig = (
  path = DEFAULT_CONFIG_PATH,
  basePath?: string
): RootConfig => {
  const absolutePath = resolvePath(path, basePath);
  const content = readFileSync(absolutePath);
  const data = JSON.parse(content.toString());

  const config = parseObject(data, configDecoder);

  return config;
};

const loadYaml = (path: string, basePath?: string): YamlFile | undefined => {
  try {
    const absolutePath = resolvePath(path, basePath);
    const rawContent = readFileSync(absolutePath);
    const data = parse(rawContent.toString());
    const content = parseObject(data, entityDecoder);

    return {
      content,
      filePath: '',
      fileName: '',
    };
  } catch {
    return undefined;
  }
};

export const getFullName = (...parts: string[]) => parts.join(' / ');

let assertionsCache: Set<string> | undefined;

const buildAsserionFullNames = ({ features, attributes }: ProjectData, keyParts: string[]) => {
  const uniqueAssertions = new Set<string>();

  const attributesCtx = getAttributesContext(attributes);
  for (let {
    title: featureTitle,
    code: featureCode,
    groups,
    fileName,
    filePath,
    attributes = {},
  } of features) {
    for (let { title: groupTitle, assertions } of groups || []) {
      for (let assertion of assertions || []) {
        const assertionCtx: AssertionContext = {
          featureTitle,
          featureCode,
          groupTitle,
          assertionTitle: assertion.title,
          attributes,
          fileName,
          filePath,
        };

        const parts = getKey(keyParts, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        uniqueAssertions.add(fullName);
      }
    }
  }
  return uniqueAssertions;
}


export const getValidationContext = (configPath?: string) => {
  if (assertionsCache) {
    return assertionsCache;
  }

  const { yml, jest, projectPath } = loadConfig();

  if(!jest) {
    assertionsCache = new Set<string>();
    return assertionsCache;
  }

  const files = glob.sync(yml.files, { cwd: projectPath });
  const yamls = files.map((path) => loadYaml(path, projectPath));

  const successYamls = new Array<YamlFile>();
  yamls.forEach((yaml) => yaml && successYamls.push(yaml));
  
  const projectData = processYamlFiles(successYamls, { filePath: '', meta: {}});
  assertionsCache = buildAsserionFullNames(projectData, jest?.keys);

  
  return assertionsCache;
};
