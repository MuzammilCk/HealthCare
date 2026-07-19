/**
 * Deterministic emergency/red-flag screening for the AI Symptom Checker.
 *
 * HEALTHCARE-DOMAIN SAFETY FIX: the symptom checker previously had no
 * emergency-detection path at all - a description of classic heart-attack
 * or stroke symptoms would go straight to the LLM and come back as a
 * generic "possible causes: indigestion, anxiety, muscle strain" style list
 * with a routine "consult a doctor" disclaimer, with nothing telling the
 * user to seek emergency care NOW. For a symptom checker, missing that is a
 * patient-safety gap, not just a UX nicety.
 *
 * This check runs BEFORE the LLM call and does NOT depend on the model
 * reliably following prompt instructions - keyword matching against
 * well-established red-flag phrasing (chest pain radiating to the arm,
 * stroke FAST signs, anaphylaxis, severe bleeding, loss of consciousness,
 * suicidal ideation, etc.) is a blunt instrument, but a defense-in-depth
 * one: it fires independently of whatever the LLM decides to do, and the
 * prompt itself (see controller) is instructed to do the same screening as
 * a second layer for phrasing this list doesn't catch.
 *
 * This is intentionally conservative (multi-word, fairly specific phrases,
 * not single generic words like "pain" or "chest") to avoid crying wolf on
 * routine complaints, but it is NOT a substitute for a clinician's judgment
 * and will not catch every genuine emergency phrased unusually - the LLM
 * prompt layer and the disclaimer both exist because of that.
 */

const RED_FLAG_PATTERNS = [
  {
    category: 'cardiac',
    patterns: [
      /chest pain.{0,40}(arm|jaw|back|shoulder)/i,
      /(crushing|squeezing|tight(ness)?).{0,20}chest/i,
      /chest pain.{0,30}(breath|sweat|nausea|dizzy)/i,
    ],
    message: 'These symptoms can be associated with a heart attack.',
  },
  {
    category: 'stroke',
    patterns: [
      /face.{0,15}(droop|numb)/i,
      /(slurred|sudden).{0,20}speech/i,
      /sudden.{0,20}(weakness|numbness).{0,20}(one side|arm|leg|face)/i,
      /sudden.{0,20}(confusion|vision loss|severe headache)/i,
    ],
    message: 'These symptoms can be associated with a stroke.',
  },
  {
    category: 'breathing',
    patterns: [
      /(can'?t|cannot|difficulty|struggling to).{0,15}breath/i,
      /(severe|extreme).{0,15}(shortness of breath|breathlessness)/i,
      /throat.{0,20}(closing|swelling)/i,
      /lips?.{0,15}(blue|turning blue)/i,
    ],
    message: 'These symptoms can indicate a serious breathing emergency, including a possible severe allergic reaction (anaphylaxis).',
  },
  {
    category: 'bleeding_or_trauma',
    patterns: [
      /(severe|heavy|uncontrolled|won'?t stop).{0,15}bleed/i,
      /(coughing|vomiting).{0,15}blood/i,
      /(deep|large).{0,10}(wound|cut|gash)/i,
    ],
    message: 'These symptoms can indicate a serious bleeding or trauma emergency.',
  },
  {
    category: 'consciousness',
    patterns: [
      /(lost|losing|loss of).{0,15}conscious/i,
      /(passed out|fainted|unresponsive|seizure)/i,
    ],
    message: 'Loss of consciousness or a seizure can indicate a serious emergency.',
  },
  {
    category: 'self_harm',
    patterns: [
      /suicid/i,
      /kill(ing)?\s+myself/i,
      /end(ing)?\s+(it all|my (own\s+)?life)/i,
      /(want|going|plan)\s+to\s+die/i,
      /self.?harm/i,
      /hurt(ing)?\s+myself\s+(on purpose|intentionally)/i,
    ],
    message: 'If you are thinking about harming yourself, you deserve immediate support from someone who can help right now.',
  },
];

/**
 * @param {string} symptomsText - raw user-entered symptom description
 * @returns {{isEmergency: boolean, category?: string, message?: string} }
 */
function screenForEmergency(symptomsText) {
  const text = String(symptomsText || '');
  for (const { category, patterns, message } of RED_FLAG_PATTERNS) {
    if (patterns.some((re) => re.test(text))) {
      return { isEmergency: true, category, message };
    }
  }
  return { isEmergency: false };
}

module.exports = { screenForEmergency };
