import { getInterestOverlapScore } from "./getInterestOverlapScore";

describe("getInterestOverlapScore tests", () => {
  const firstInterestArray = ["hiking", "reading"];
  const secondInterestArray = ["videogames", "movies"];
  const eventWithLotsOfInterests = [
    "hiking",
    "reading",
    "camping",
    "snowboarding",
  ];
  const eventWithOverlapInterest = ["videogames", "hiking"];

  it("returns 0 when no overlap", () => {
    expect(
      getInterestOverlapScore(firstInterestArray, secondInterestArray)
    ).toBe(0);
  });

  it("returns 1 if user interests are all included in event interests", () => {
    expect(
      getInterestOverlapScore(firstInterestArray, eventWithLotsOfInterests)
    ).toBe(1);
  });

  it("returns .5 if only half overlap", () => {
    expect(
      getInterestOverlapScore(firstInterestArray, eventWithOverlapInterest)
    ).toBe(0.5);
  });

  it("returns 0 if either array length 0", () => {
    expect(getInterestOverlapScore([], [])).toBe(0);
  });
});
