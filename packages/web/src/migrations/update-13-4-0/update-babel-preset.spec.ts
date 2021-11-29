import { addProjectConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import update from './update-babel-preset';

describe('Jest Migration (v13.1.2)', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(
      'apps/project-one/.babelrc',
      String.raw`{
  "presets": ["@nrwl/react/babel"],
  "plugins": ["@emotion/babel-plugin"]
}
`
    );
    tree.write(
      'libs/lib-one/.babelrc',
      String.raw`{
  "presets": [["@nrwl/js/babel", { "useBuiltIns": "usage" }]]
}
`
    );

    addProjectConfiguration(tree, 'app-one', {
      root: 'apps/project-one',
      sourceRoot: 'apps/project-one/src',
      projectType: 'application',
      targets: {
        build: {
          executor: '@nrwl/react:build',
        },
        test: {
          executor: '@nrwl/jest:jest',
        },
      },
    });

    addProjectConfiguration(tree, 'lib-one', {
      root: 'libs/lib-one',
      sourceRoot: 'libs/libs-one/src',
      projectType: 'library',
      targets: {
        build: {
          executor: '@nrwl/web:build',
        },
        test: {
          executor: '@nrwl/jest:jest',
        },
      },
    });
  });
  it('should NOT update babel preset if not using nrwl/web/babel', async () => {
    await update(tree);

    const actualBabelRc = readJson(tree, 'apps/project-one/.babelrc');
    expect(actualBabelRc.presets).toEqual(['@nrwl/react/babel']);
  });

  it('should update babel preset for lib', async () => {
    await update(tree);

    const actualBabelRc = readJson(tree, 'libs/lib-one/.babelrc');
    expect(actualBabelRc.presets).toEqual([
      ['@nrwl/js/babel', { useBuiltIns: 'usage' }],
    ]);
  });
});
