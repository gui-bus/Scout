import { expect, test, describe } from "vitest";
import { calculateMatchScore } from "./match-score";
import { Job, LumeResume } from "../components/jobs/types";

const baseJob: Job = {
  id: 1,
  title: "Desenvolvedor React",
  description: "Vaga de React Frontend",
  company: "Test Corp",
  location: "São Paulo, SP",
  modality: "Presencial",
  level: "Pleno",
  technologies: "React,TypeScript",
  source: "Gupy",
  link: "http://example.com/1",
  publishedAt: new Date().toISOString(),
  collectedAt: new Date().toISOString(),
};

describe("calculateMatchScore", () => {
  test("returns null if resume is null", () => {
    expect(calculateMatchScore(baseJob, null)).toBeNull();
  });

  test("calculates full match when skills, location, and title match completely", () => {
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
        summary: "Desenvolvedor React e TypeScript",
      },
      experiences: [
        {
          company: "Corp A",
          position: "Desenvolvedor React",
        },
      ],
    };
    expect(calculateMatchScore(baseJob, resume)).toBe(100);
  });

  test("applies 20 points when job is Remote regardless of user location", () => {
    const remoteJob = { ...baseJob, modality: "Remoto", location: "Florianópolis, SC" };
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
      },
    };
    const score = calculateMatchScore(remoteJob, resume);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  test("gives 20 points for exact city match", () => {
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
      },
    };
    const score = calculateMatchScore(baseJob, resume);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  test("gives 10 points for state match only", () => {
    const campinasJob = { ...baseJob, location: "Campinas, SP" };
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
      },
    };
    const score = calculateMatchScore(campinasJob, resume);
    expect(score).toBe(82);
  });

  test("gives 0 points for location when both city and state mismatch", () => {
    const curitibaJob = { ...baseJob, location: "Curitiba, PR" };
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
      },
    };
    const score = calculateMatchScore(curitibaJob, resume);
    expect(score).toBe(72);
  });

  test("adds 20 points for direct title keyword match in past positions", () => {
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
        summary: "Professional",
      },
      experiences: [
        {
          position: "React Engineer",
        },
      ],
    };
    const score = calculateMatchScore(baseJob, resume);
    expect(score).toBe(100);
  });

  test("adds 12 points for category-based matches when title does not match directly", () => {
    const resume: LumeResume = {
      skills: ["React", "TypeScript"],
      personalInfo: {
        location: "São Paulo, SP",
        summary: "Trabalho com desenvolvimento frontend",
      },
    };
    const score = calculateMatchScore(baseJob, resume);
    expect(score).toBe(92);
  });

  test("adds 5 points when there is no title or category match", () => {
    const backendJob = { ...baseJob, title: "Go Developer", technologies: "Go" };
    const resume: LumeResume = {
      skills: ["Go"],
      personalInfo: {
        location: "São Paulo, SP",
        summary: "Designer gráfico",
      },
    };
    const score = calculateMatchScore(backendJob, resume);
    expect(score).toBe(85);
  });
});
