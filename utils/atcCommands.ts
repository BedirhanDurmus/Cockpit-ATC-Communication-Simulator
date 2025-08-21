import { ATCCommand, FlightData } from "@/types/training";

//
// ALTITUDE COMMANDS
//
const altitudeCommands = [
  { 
    text: "Climb to flight level one eight zero", 
    expectedResponses: [
      "Climbing to flight level one eight zero",
      "Roger, climbing FL180",
      "Wilco, climb flight level one eight zero"
    ],
    minAlt: 0, maxAlt: 12000 
  },
  { 
    text: "Descend to five thousand feet", 
    expectedResponses: [
      "Descending to five thousand feet",
      "Wilco, descending five thousand",
      "Roger, down to five thousand"
    ],
    minAlt: 15000, maxAlt: 99999 
  },
  { 
    text: "Maintain flight level two four zero", 
    expectedResponses: [
      "Maintaining flight level two four zero",
      "Roger, maintaining FL240",
      "Wilco, maintain two four zero"
    ],
    minAlt: 20000, maxAlt: 26000 
  },
  { 
    text: "Climb to one zero thousand feet", 
    expectedResponses: [
      "Climbing to one zero thousand feet",
      "Roger, climbing ten thousand",
      "Wilco, climb ten thousand"
    ],
    minAlt: 0, maxAlt: 8000 
  },
  { 
    text: "Descend and maintain flight level one five zero", 
    expectedResponses: [
      "Descending and maintaining flight level one five zero",
      "Roger, descend FL150",
      "Wilco, maintain FL150"
    ],
    minAlt: 20000, maxAlt: 40000 
  },
  { 
    text: "Climb and maintain flight level three one zero", 
    expectedResponses: [
      "Climbing and maintaining flight level three one zero",
      "Roger, climbing FL310",
      "Wilco, maintain FL310"
    ],
    minAlt: 15000, maxAlt: 25000 
  },
];

//
// HEADING COMMANDS
//
const headingCommands = [
  { 
    text: "Turn left heading two seven zero", 
    expectedResponses: [
      "Left heading two seven zero",
      "Roger, left heading two seven zero",
      "Wilco, heading two seven zero"
    ] 
  },
  { 
    text: "Turn right heading zero nine zero", 
    expectedResponses: [
      "Right heading zero nine zero",
      "Roger, right heading zero nine zero",
      "Wilco, heading zero nine zero"
    ] 
  },
  { 
    text: "Fly heading three six zero", 
    expectedResponses: [
      "Flying heading three six zero",
      "Roger, heading three six zero",
      "Wilco, three six zero"
    ] 
  },
  { 
    text: "Turn left heading one eight zero", 
    expectedResponses: [
      "Left heading one eight zero",
      "Roger, left heading one eight zero",
      "Wilco, heading one eight zero"
    ] 
  },
  { 
    text: "Proceed direct to waypoint ALPHA", 
    expectedResponses: [
      "Direct to ALPHA",
      "Roger, proceeding direct ALPHA",
      "Wilco, direct ALPHA"
    ] 
  },
  { 
    text: "Continue present heading", 
    expectedResponses: [
      "Continuing present heading",
      "Roger, present heading",
      "Wilco, continue heading"
    ] 
  },
];

//
// SPEED COMMANDS
//
const speedCommands = [
  { 
    text: "Reduce speed to two five zero knots", 
    expectedResponses: [
      "Reducing speed to two five zero knots",
      "Roger, reducing two five zero",
      "Wilco, speed two five zero"
    ],
    condition: (spd: number) => spd > 280 
  },
  { 
    text: "Increase speed to three zero zero knots", 
    expectedResponses: [
      "Increasing speed to three zero zero knots",
      "Roger, speeding up to three zero zero",
      "Wilco, three zero zero knots"
    ],
    condition: (spd: number) => spd < 250 
  },
  { 
    text: "Maintain present speed", 
    expectedResponses: [
      "Maintaining present speed",
      "Roger, maintaining speed",
      "Wilco, present speed"
    ],
    condition: (_: number) => true 
  },
  { 
    text: "Reduce to minimum clean speed", 
    expectedResponses: [
      "Reducing to minimum clean speed",
      "Roger, slowing to min clean",
      "Wilco, minimum clean speed"
    ],
    condition: (spd: number) => spd > 200 
  },
  { 
    text: "Increase to maximum cruise speed", 
    expectedResponses: [
      "Increasing to maximum cruise speed",
      "Roger, speeding up to max cruise",
      "Wilco, maximum cruise"
    ],
    condition: (spd: number) => spd < 280 
  },
];

//
// CLEARANCE COMMANDS
//
const clearanceCommands = [
  { 
    text: "Cleared for ILS approach runway two seven", 
    expectedResponses: [
      "Cleared ILS approach runway two seven",
      "Roger, cleared ILS two seven",
      "Wilco, ILS approach runway two seven"
    ] 
  },
  { 
    text: "Contact tower on one one eight decimal one", 
    expectedResponses: [
      "Contacting tower one one eight decimal one",
      "Roger, switching one one eight decimal one",
      "Wilco, tower one one eight decimal one"
    ] 
  },
  { 
    text: "Squawk seven five zero zero", 
    expectedResponses: [
      "Squawking seven five zero zero",
      "Roger, squawk seven five zero zero",
      "Wilco, seven five zero zero"
    ] 
  },
  { 
    text: "Report established on the localizer", 
    expectedResponses: [
      "Will report established",
      "Roger, will report established",
      "Wilco, reporting established"
    ] 
  },
  { 
    text: "Cleared for takeoff runway three six", 
    expectedResponses: [
      "Cleared for takeoff runway three six",
      "Roger, cleared takeoff three six",
      "Wilco, taking off runway three six"
    ] 
  },
  { 
    text: "Cleared to land runway two eight", 
    expectedResponses: [
      "Cleared to land runway two eight",
      "Roger, cleared landing two eight",
      "Wilco, landing runway two eight"
    ] 
  },
  { 
    text: "Hold short of runway one eight", 
    expectedResponses: [
      "Holding short runway one eight",
      "Roger, hold short one eight",
      "Wilco, holding short runway one eight"
    ] 
  },
  { 
    text: "Line up and wait runway two seven", 
    expectedResponses: [
      "Lining up and waiting runway two seven",
      "Roger, line up and wait two seven",
      "Wilco, line up runway two seven"
    ] 
  },
];

//
// ATC COMMAND GENERATOR
//
export function generateATCCommand(flightData: FlightData): ATCCommand {
  const commandTypes = ["altitude", "heading", "speed", "clearance"];
  let type = commandTypes[Math.floor(Math.random() * commandTypes.length)] as ATCCommand["type"];

  let command: { text: string; expectedResponses: string[] };

  switch (type) {
    case "altitude":
      const filteredAlt = altitudeCommands.filter(
        c => flightData.altitude >= c.minAlt && flightData.altitude <= c.maxAlt
      );
      command = filteredAlt.length > 0
        ? filteredAlt[Math.floor(Math.random() * filteredAlt.length)]
        : altitudeCommands[0];
      break;

    case "heading":
      command = headingCommands[Math.floor(Math.random() * headingCommands.length)];
      break;

    case "speed":
      const filteredSpd = speedCommands.filter(c => c.condition(flightData.speed));
      command = filteredSpd.length > 0
        ? filteredSpd[Math.floor(Math.random() * filteredSpd.length)]
        : speedCommands[2];
      break;

    case "clearance":
      command = clearanceCommands[Math.floor(Math.random() * clearanceCommands.length)];
      break;

    default:
      command = altitudeCommands[0];
  }

  // Random expected response seç
  const expected = command.expectedResponses[Math.floor(Math.random() * command.expectedResponses.length)];

  return {
    id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: command.text,
    type,
    expectedResponse: expected,
    timestamp: Date.now(),
  };
}

//
// CROSSCHECK QUESTIONS
//
export function generateCrossCheckQuestion(flightData: FlightData): string {
  const questions = [
    `What is your current altitude? (Now: ${flightData.altitude} ft)`,
    `What is your current heading? (Now: ${flightData.heading})`,
    `What is your current airspeed? (Now: ${flightData.speed} kt)`,
    `What is your vertical speed? (Now: ${flightData.verticalSpeed} ft/min)`,
    `Confirm your altitude (Now: ${flightData.altitude} ft)`,
    `Report your heading (Now: ${flightData.heading})`,
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}

//
// MOCK FLIGHT DATA (TEST AMAÇLI)
//
const mockFlightData: FlightData = {
  altitude: 8500,        // ft
  heading: 270,          // derece
  speed: 290,            // knots
  verticalSpeed: 500,    // ft/min
  targetAltitude: 24000,
  targetHeading: 270,
};

// Test
console.log("Generated ATC Command:", generateATCCommand(mockFlightData));
console.log("Crosscheck Question:", generateCrossCheckQuestion(mockFlightData));
