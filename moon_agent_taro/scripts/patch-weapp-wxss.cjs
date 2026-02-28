/**
 * Patch WXSS output for WeChat Mini Program compatibility.
 *
 * Problems:
 * 1. Tailwind v4 generates modern selectors like `:where(...)` (e.g. `space-y-*` utilities).
 *    - WeChat WXSS parser may fail on `:where` with: `error at token ':'` and cause a blank screen.
 * 2. Tailwind v4 generates `@supports` at-rules for modern color syntax (display-p3).
 *    - WeChat WXSS parser does not support `@supports` at-rule.
 * 3. Modern CSS color functions like `color(display-p3 ...)` are not supported.
 *
 * Fixes:
 * - Replace `:where(>:not(:last-child))` with `> :not(:last-child)` (same meaning for our usage).
 * - Remove `@supports` blocks entirely (they contain display-p3 fallbacks which are optional).
 * - Remove `color(display-p3 ...)` color values from properties.
 *
 * Usage:
 * - One-off:  node scripts/patch-weapp-wxss.cjs
 * - Watch:    node scripts/patch-weapp-wxss.cjs --watch
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');

const filePath = path.resolve(__dirname, '..', 'dist', 'weapp', 'app-origin.wxss');

/**
 * Remove @supports blocks with nested braces handling
 * @param {string} css - The CSS content
 * @returns {string} - CSS with @supports blocks removed
 */
function removeSupportsBlocks(css) {
  let result = '';
  let i = 0;

  while (i < css.length) {
    // Check for @supports
    if (css.slice(i, i + 9) === '@supports') {
      // Find the opening brace
      let braceStart = css.indexOf('{', i);
      if (braceStart === -1) {
        result += css.slice(i);
        break;
      }

      // Count nested braces to find matching closing brace
      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }

      // Skip the entire @supports block
      console.log('[patch-weapp-wxss] Removed @supports block');
      i = j;
    } else {
      result += css[i];
      i++;
    }
  }

  return result;
}

/**
 * Remove color(display-p3 ...) values
 * @param {string} css - The CSS content
 * @returns {string} - CSS with display-p3 colors removed
 */
function removeDisplayP3Colors(css) {
  let changed = false;

  // Remove standalone color(display-p3 ...) declarations
  // Pattern: property: value; property: color(display-p3 ...);
  // We want to remove the display-p3 fallback while keeping the original value
  let result = css.replace(
    /([^;{}]+:\s*[^;{}]+);([^;{}]+:\s*)color\(display-p3\s+[^)]+\)/g,
    (match, firstDecl, secondPropStart) => {
      changed = true;
      // Keep only the first declaration
      return firstDecl;
    }
  );

  // Remove any remaining color(display-p3 ...) as property values
  result = result.replace(/color\(display-p3\s+[^)]+\)/g, () => {
    changed = true;
    return '';
  });

  // Clean up empty declarations like "property:;"
  result = result.replace(/([a-z-]+):\s*;/g, '$1: initial;');

  // Clean up double semicolons
  result = result.replace(/;;+/g, ';');

  if (changed) {
    console.log('[patch-weapp-wxss] Removed color(display-p3) values');
  }

  return result;
}

/**
 * Remove selectors containing :not() pseudo-class (not supported by WXSS)
 * This includes space-y-*, space-x-* utilities that use > :not(:last-child)
 * @param {string} css - The CSS content
 * @returns {string} - CSS with unsupported selectors removed
 */
function removeNotSelectors(css) {
  let changed = false;

  // Remove rules that contain :not() pseudo-class
  // Pattern: .selector > :not(:last-child){...} or similar
  const result = css.replace(
    /[^{}]*>\s*:not\([^)]*\)[^{}]*\{[^{}]*\}/g,
    () => {
      changed = true;
      return '';
    }
  );

  if (changed) {
    console.log('[patch-weapp-wxss] Removed :not() selectors (space-y/space-x utilities)');
  }

  return result;
}

/**
 * Remove ::backdrop pseudo-element from selector groups (not supported by WXSS)
 * @param {string} css - The CSS content
 * @returns {string} - CSS with ::backdrop removed from selectors
 */
function removeBackdropSelector(css) {
  let changed = false;

  // Remove ::backdrop from selector groups
  // Pattern: view,text,:before,:after,::backdrop{...} -> view,text,:before,:after{...}
  let result = css.replace(/,\s*::backdrop/g, () => {
    changed = true;
    return '';
  });

  // Also handle case where ::backdrop is at the beginning
  result = result.replace(/::backdrop\s*,/g, () => {
    changed = true;
    return '';
  });

  if (changed) {
    console.log('[patch-weapp-wxss] Removed ::backdrop selectors');
  }

  return result;
}

/**
 * Convert or remove modern CSS media query range syntax (not supported by older parsers)
 * @param {string} css - The CSS content
 * @returns {string} - CSS with media queries converted or removed
 */
function fixMediaQuerySyntax(css) {
  let changed = false;
  let result = css;

  // Remove @media rules with modern range syntax for mini programs
  // Mini programs typically don't need responsive breakpoints like web
  // Pattern: @media (width >= 40rem){.container{...}}
  // Need to match the complete media query with nested braces
  
  const mediaPattern = /@media\s*\([^)]*(?:>=|<=|>|<)[^)]*\)\s*\{/g;
  let match;
  const toRemove = [];

  // Find all media queries with range syntax
  while ((match = mediaPattern.exec(css)) !== null) {
    const startIdx = match.index;
    // Find matching closing brace
    let depth = 1;
    let endIdx = match.index + match[0].length;
    while (endIdx < css.length && depth > 0) {
      if (css[endIdx] === '{') depth++;
      else if (css[endIdx] === '}') depth--;
      endIdx++;
    }
    toRemove.push({ start: startIdx, end: endIdx });
    changed = true;
  }

  // Remove from end to start to preserve indices
  for (let i = toRemove.length - 1; i >= 0; i--) {
    const { start, end } = toRemove[i];
    result = result.slice(0, start) + result.slice(end);
  }

  if (changed) {
    console.log(`[patch-weapp-wxss] Removed ${toRemove.length} modern @media query blocks`);
  }

  return result;
}

function patchOnce() {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-weapp-wxss] Not found: ${filePath}`);
    return;
  }

  const input = fs.readFileSync(filePath, 'utf8');
  let output = input;
  let patchCount = 0;

  // 1. Replace :where(>:not(:last-child)) with > :not(:last-child)
  const wherePattern = ':where(>:not(:last-child))';
  if (output.includes(wherePattern)) {
    output = output.replaceAll(wherePattern, '> :not(:last-child)');
    patchCount++;
    console.log('[patch-weapp-wxss] Fixed :where() selectors');
  }

  // 2. Remove @supports blocks (must be done before removing display-p3 colors)
  const beforeSupports = output;
  output = removeSupportsBlocks(output);
  if (output !== beforeSupports) {
    patchCount++;
  }

  // 3. Remove color(display-p3 ...) values
  const beforeP3 = output;
  output = removeDisplayP3Colors(output);
  if (output !== beforeP3) {
    patchCount++;
  }

  // 4. Remove :not() selectors (not supported by WXSS)
  const beforeNot = output;
  output = removeNotSelectors(output);
  if (output !== beforeNot) {
    patchCount++;
  }

  // 5. Remove ::backdrop selectors (not supported by WXSS)
  const beforeBackdrop = output;
  output = removeBackdropSelector(output);
  if (output !== beforeBackdrop) {
    patchCount++;
  }

  // 6. Fix modern @media query syntax (not supported by WXSS)
  const beforeMedia = output;
  output = fixMediaQuerySyntax(output);
  if (output !== beforeMedia) {
    patchCount++;
  }

  if (output === input) {
    console.log('[patch-weapp-wxss] No changes needed.');
    return;
  }

  fs.writeFileSync(filePath, output, 'utf8');
  console.log(`[patch-weapp-wxss] Patched app-origin.wxss successfully (${patchCount} fixes applied).`);
}

patchOnce();

if (isWatch) {
  console.log(`[patch-weapp-wxss] Watching: ${filePath}`);
  let timer = null;
  fs.watch(path.dirname(filePath), { persistent: true }, (_eventType, filename) => {
    if (filename !== path.basename(filePath)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        patchOnce();
      } catch (err) {
        console.error('[patch-weapp-wxss] Patch failed:', err);
      }
    }, 50);
  });
}
