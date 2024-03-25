/**
 * Support intellisense and type checking for resources
 */

import bloom from "../en/bloom.json";
import common from "../en/common.json";
import viewer from "../en/viewer.json";

const resources = {
  bloom,
  common,
  viewer,
} as const;

export default resources;
