/**
 * Support intellisense and type checking for resources
 */

import bloom from "../en/bloom.json";
import viewer from "../en/viewer.json";

const resources = {
  viewer,
  bloom,
} as const;

export default resources;
