import { expect, test } from "vitest";
import { calculateMatchScore } from "./match-score";
import { Job, LumeResume } from "../components/jobs/types";

const mockJob: Job = {
  id: 1,
  title: "Desenvolvedor React",
  description: "Vaga de React Frontend",
  company: "Google",
  location: "São Paulo, SP",
  modality: "Presencial",
  level: "Pleno",
  technologies: "React,TypeScript",
  source: "Gupy",
  link: "http://example.com/1",
  publishedAt: new Date().toISOString(),
  collectedAt: new Date().toISOString(),
};

const mockResume: LumeResume = {
  skills: ["React", "TypeScript", "Node.js"],
  personalInfo: {
    location: "São Paulo, SP",
    summary: "Desenvolvedor de software focado em React e TypeScript",
  },
  experiences: [
    {
      company: "Meta",
      position: "Desenvolvedor React Pleno",
    },
  ],
};

test("should return null if resume is not provided", () => {
  expect(calculateMatchScore(mockJob, null)).toBeNull();
});

test("should calculate maximum match score for fully matched profile", () => {
  const score = calculateMatchScore(mockJob, mockResume);
  expect(score).toBe(100);
});

test("should calculate lower match score for partially matched profile", () => {
  const partialResume: LumeResume = {
    skills: ["React"],
    personalInfo: {
      location: "Rio de Janeiro, RJ",
    },
  };
  const score = calculateMatchScore(mockJob, partialResume);
  expect(score).toBeLessThan(100);
});
