import { ATCCommand, FlightData } from "@/types/training";

const altitudeCommands = [
  { text: "Climb to flight level one eight zero", expected: "Climbing to flight level one eight zero" },
  { text: "Descend to five thousand feet", expected: "Descending to five thousand feet" },
  { text: "Maintain flight level two four zero", expected: "Maintaining flight level two four zero" },
  { text: "Climb to one zero thousand feet", expected: "Climbing to one zero thousand feet" },
];

const headingCommands = [
  { text: "Turn left heading two seven zero", expected: "Left heading two seven zero" },
  { text: "Turn right heading zero nine zero", expected: "Right heading zero nine zero" },
  { text: "Fly heading three six zero", expected: "Flying heading three six zero" },
  { text: "Turn left heading one eight zero", expected: "Left heading one eight zero" },
];

const speedCommands = [
  { text: "Reduce speed to two five zero knots", expected: "Reducing speed to two five zero knots" },
  { text: "Increase speed to three zero zero knots", expected: "Increasing speed to three zero zero knots" },
  { text: "Maintain present speed", expected: "Maintaining present speed" },
  { text: "Reduce to minimum clean speed", expected: "Reducing to minimum clean speed" },
];

const clearanceCommands = [
  { text: "Cleared for ILS approach runway two seven", expected: "Cleared ILS approach runway two seven" },
  { text: "Contact tower on one one eight decimal one", expected: "Contact tower one one eight decimal one" },
  { text: "Squawk seven five zero zero", expected: "Squawking seven five zero zero" },
  { text: "Report established on the localizer", expected: "Will report established" },
];

export function generateATCCommand(flightData: FlightData): ATCCommand {
  const commandTypes = ["altitude", "heading", "speed", "clearance"];
  const type = commandTypes[Math.floor(Math.random() * commandTypes.length)] as ATCCommand["type"];
  
  let command: { text: string; expected: string };
  
  switch (type) {
    case "altitude":
      command = altitudeCommands[Math.floor(Math.random() * altitudeCommands.length)];
      break;
    case "heading":
      command = headingCommands[Math.floor(Math.random() * headingCommands.length)];
      break;
    case "speed":
      command = speedCommands[Math.floor(Math.random() * speedCommands.length)];
      break;
    case "clearance":
      command = clearanceCommands[Math.floor(Math.random() * clearanceCommands.length)];
      break;
    default:
      command = altitudeCommands[0];
  }
  
  return {
    id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: command.text,
    type,
    expectedResponse: command.expected,
    timestamp: Date.now(),
  };
}

export function generateCrossCheckQuestion(flightData: FlightData): string {
  const questions = [
    `What is your current altitude?`,
    `What is your current heading?`,
    `What is your current airspeed?`,
    `What is your vertical speed?`,
    `Confirm your altitude`,
    `Report your heading`,
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}