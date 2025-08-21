export interface ATCCommand {
    id: string;
    text: string;
    type: "altitude" | "heading" | "speed" | "frequency" | "clearance";
    expectedResponse: string;
    timestamp: number;
  }
  
  export interface PilotResponse {
    commandId: string;
    text: string;
    isCorrect: boolean;
    timestamp: number;
  }
  
  export interface TrainingSession {
    isActive: boolean;
    startTime: number | null;
    endTime: number | null;
    commandsIssued: number;
    correctResponses: number;
    score: number;
    commands: ATCCommand[];
    responses: PilotResponse[];
  }
  
  export interface Statistics {
    totalScore: number;
    sessionsCompleted: number;
    accuracy: number;
    avgResponseTime: number;
    recentSessions: Array<{
      date: number;
      score: number;
      commandsCompleted: number;
      accuracy: number;
    }>;
  }
  
  export interface FlightData {
    altitude: number;
    heading: number;
    speed: number;
    verticalSpeed: number;
    targetAltitude: number;
    targetHeading: number;
  }