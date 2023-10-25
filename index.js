const processed = Symbol('processed');
const defaultExcludedAtRules = ['keyframes', '-webkit-keyframes', '-moz-keyframes'];
const defaultExcludedSelectors = [':root', '*', 'html', 'body'];

/**
 * @typedef {Object} AtRules
 * @property {string[]} exclude
 */

/**
 * @typedef {Object} Selectors
 * @property {string[]} exclude
 */

/**
 * @param {{scope?: string; atRules?: AtRules; selectors?: Selectors}} opts
 */
module.exports = (opts = {}) => ({
  postcssPlugin: 'postcss-simple-scope',
  Once(root) {
    const scope = opts?.scope.toString().trim();
    if (!scope) return;

    const excludedAtRules = [...defaultExcludedAtRules, ...(opts.atRules?.exclude || [])];
    root.walkAtRules((atRule) => {
      if (!excludedAtRules.some((s) => atRule.name.startsWith(s))) return;
      atRule.walkRules((rule) => (rule[processed] = true));
    });

    const excludedSelectors = [...defaultExcludedSelectors, ...(opts.selectors?.exclude || [])];
    root.walkRules((rule) => {
      if (rule[processed]) return;
      rule.selectors = rule.selectors.map((selector) => {
        if (excludedSelectors.some((s) => selector.startsWith(s))) return selector;
        return `${scope} ${selector}`;
      });
    });
  },
});

module.exports.postcss = true;
