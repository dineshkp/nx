import {
  formatFiles,
  getProjects,
  joinPathFragments,
  logger,
  Tree,
  updateJson,
} from '@nrwl/devkit';

async function findBabelRcFiles(tree: Tree): Promise<string[]> {
  const projects = await getProjects(tree);

  const babelConfigs = [];
  for (const [projectName, project] of projects) {
    const potentialBabelConfig = joinPathFragments(project.root, '.babelrc');
    logger.info(`Checking for .babelrc @ ${potentialBabelConfig}`);

    if (tree.exists(potentialBabelConfig)) {
      logger.info(`Found babel config for project ${projectName}`);
      babelConfigs.push(potentialBabelConfig);
    } else {
      logger.info(`No babel config found for project ${projectName}`);
    }
  }

  return babelConfigs;
}

interface BabelRc {
  presets?: Array<string | [string, object]>;
}

function updateBabelPreset(tree: Tree, pathToBabelRc: string) {
  updateJson(tree, pathToBabelRc, (json: BabelRc) => {
    json.presets = json.presets || [];

    const newPresets = [];
    for (let preset of json.presets) {
      if (typeof preset === 'string' && preset === '@nrwl/web/babel') {
        // check to see if it's @nrwl/web/babel and update to @nrwl/web/babel
        newPresets.push('@nrwl/js/babel');
      } else if (Array.isArray(preset) && preset?.[0] === '@nrwl/web/babel') {
        preset[0] = '@nrwl/js/babel';
        newPresets.push(preset);
      } else {
        newPresets.push(preset);
      }
    }

    json.presets = newPresets;

    return json;
  });
}

export default async function update(tree: Tree) {
  const babelPaths = await findBabelRcFiles(tree);

  for (const pathToBabelRc of babelPaths) {
    updateBabelPreset(tree, pathToBabelRc);
  }

  // TODO(caleb): add nrwl/js if preset was updated
  // addDependenciesToPackageJson(tree, {}, {'@nrwl/js': nxVersion})

  return await formatFiles(tree);
}
