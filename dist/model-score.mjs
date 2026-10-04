export {modelScore} from './ml-decision.mjs';
import {modelScore} from './ml-decision.mjs';
export function displayedScore(info,ruleScore){
 if(info?.status==='error'&&Number.isFinite(ruleScore?.value))return {...ruleScore,source:'rules-fallback',reason:'model-unavailable',calibrated:false};
 return modelScore(info?.result);
}
