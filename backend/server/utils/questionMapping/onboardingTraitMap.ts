export const ONBOARDING_TRAIT_MAPPINGS: Record<
  string,
  Record<string, number>
> = {
  /* ================================
     What kind of energy do you like at events?
     ================================ */

  high_energy: {
    energetic: 1.0,
    extroverted: 0.7,
    social: 0.7,
    "large-groups": 0.4,
  },

  laid_back: {
    "laid-back": 1.0,
    calm: 0.7,
    "low-key": 0.7,
    reserved: 0.4,
  },

  thoughtful: {
    thoughtful: 1.0,
    curious: 0.7,
    focused: 0.4,
    "one-on-one": 0.4,
  },

  active: {
    active: 1.0,
    energetic: 0.7,
    outdoorsy: 0.4,
  },

  balanced: {
    easygoing: 0.7,
    realistic: 0.4,
    social: 0.4,
  },

  /* ================================
     How do you usually show up in a group?
     ================================ */

  hype_person: {
    energetic: 1.0,
    outgoing: 0.7,
    talkative: 0.7,
    extroverted: 0.4,
  },

  chill_observer: {
    calm: 0.7,
    reserved: 0.7,
    introverted: 0.4,
    "good-listener": 0.4,
  },

  planner: {
    planner: 1.0,
    organized: 0.7,
    "group-leader": 0.4,
    practical: 0.4,
  },

  deep_talker: {
    thoughtful: 1.0,
    "one-on-one": 0.7,
    "good-listener": 0.4,
    curious: 0.4,
  },

  funny_light: {
    easygoing: 0.7,
    outgoing: 0.4,
    "easy-to-talk-to": 0.4,
  },

  /* ================================
     What atmosphere makes you feel most alive?
     ================================ */

  loud_energy: {
    energetic: 1.0,
    extroverted: 0.7,
    "large-groups": 0.4,
  },

  relaxed_cozy: {
    "laid-back": 1.0,
    calm: 0.7,
    "low-key": 0.4,
    indoorsy: 0.4,
  },

  outdoors_free: {
    outdoorsy: 1.0,
    active: 0.7,
    easygoing: 0.4,
  },

  artsy_inspiring: {
    creative: 1.0,
    curious: 0.7,
    thoughtful: 0.4,
  },

  focused_purposeful: {
    focused: 1.0,
    practical: 0.7,
    organized: 0.4,
  },

  /* ================================
     How do you like to spend your downtime?
     ================================ */

  active_outside: {
    active: 1.0,
    outdoorsy: 0.7,
    energetic: 0.4,
  },

  new_food_places: {
    curious: 0.7,
    "open-minded": 0.7,
    social: 0.4,
  },

  creating_learning: {
    creative: 0.7,
    curious: 0.7,
    focused: 0.4,
  },

  close_friends: {
    social: 0.7,
    "small-groups": 0.7,
    supportive: 0.4,
  },

  recharge_solo: {
    introverted: 1.0,
    independent: 0.7,
    calm: 0.4,
  },

  /* ================================
     What kind of people do you vibe with most?
     ================================ */

  curious_open: {
    "open-minded": 1.0,
    curious: 0.7,
    thoughtful: 0.4,
  },

  chill_grounded: {
    easygoing: 0.7,
    "laid-back": 0.7,
    realistic: 0.4,
  },

  driven_goal: {
    focused: 0.7,
    practical: 0.7,
    organized: 0.4,
  },

  playful_spontaneous: {
    energetic: 0.7,
    easygoing: 0.7,
    "go-with-the-flow": 0.4,
  },

  empathetic_genuine: {
    supportive: 1.0,
    "good-listener": 0.7,
    "easy-to-talk-to": 0.4,
  },
};
