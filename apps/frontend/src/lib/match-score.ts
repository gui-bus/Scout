export interface LumeResume {
  skills?: string[];
  personalInfo?: {
    name?: string;
    location?: string;
    summary?: string;
  };
  experiences?: Array<{
    company?: string;
    position?: string;
    description?: string;
  }>;
}

export function calculateMatchScore(job: any, resume: LumeResume | null): number | null {
  if (!resume) return null;

  let totalScore = 0;

  // --- 1. Skills Matching (Weight: 60%) ---
  const jobTechs = job.technologies
    ? job.technologies.split(",").map((t: string) => t.trim().toLowerCase())
    : [];

  const resumeSkills = resume.skills ? resume.skills.map((s) => s.toLowerCase()) : [];

  if (jobTechs.length > 0 && resumeSkills.length > 0) {
    const matchedTechs = jobTechs.filter((tech: string) =>
      resumeSkills.some((skill: string) => skill.includes(tech) || tech.includes(skill))
    );
    const skillRatio = matchedTechs.length / jobTechs.length;
    totalScore += skillRatio * 60;
  } else {
    totalScore += 40; // Default moderate skill matching score
  }

  // --- 2. Location / Modality Matching (Weight: 20%) ---
  const jobModality = job.modality ? job.modality.toLowerCase() : "";
  const jobLocation = job.location ? job.location.toLowerCase() : "";
  const userLocation = resume.personalInfo?.location ? resume.personalInfo.location.toLowerCase() : "";

  if (jobModality.includes("remoto")) {
    totalScore += 20;
  } else if (userLocation && jobLocation) {
    const userCity = userLocation.split(",")[0]?.trim();
    const jobCity = jobLocation.split(",")[0]?.trim();
    if (userCity && jobCity && (userCity.includes(jobCity) || jobCity.includes(userCity))) {
      totalScore += 20;
    } else if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
      totalScore += 20;
    } else {
      const userState = userLocation.match(/,\s*([a-z]{2})$/);
      const jobState = jobLocation.match(/,\s*([a-z]{2})$/);
      if (userState && jobState && userState[1] === jobState[1]) {
        totalScore += 10;
      }
    }
  } else {
    totalScore += 10;
  }

  // --- 3. Title / Role Matching (Weight: 20%) ---
  const jobTitle = job.title ? job.title.toLowerCase() : "";
  const resumeSummary = resume.personalInfo?.summary ? resume.personalInfo.summary.toLowerCase() : "";
  const positions = resume.experiences ? resume.experiences.map((exp) => exp.position?.toLowerCase() || "") : [];

  let titleMatch = false;
  const titleKeywords = jobTitle.split(" ").filter((w: string) => w.length > 3);
  
  if (titleKeywords.length > 0) {
    const hasPositionMatch = positions.some((pos) =>
      titleKeywords.some((kw: string) => pos.includes(kw))
    );
    const hasSummaryMatch = titleKeywords.some((kw: string) => resumeSummary.includes(kw));
    
    if (hasPositionMatch || hasSummaryMatch) {
      titleMatch = true;
    }
  }

  if (titleMatch) {
    totalScore += 20;
  } else {
    const isFrontendJob = jobTitle.includes("front") || jobTitle.includes("web") || jobTitle.includes("react");
    const isUserFrontend = resumeSummary.includes("front") || resumeSkills.includes("react") || positions.some(p => p.includes("front"));
    
    const isBackendJob = jobTitle.includes("back") || jobTitle.includes("node") || jobTitle.includes("api");
    const isUserBackend = resumeSummary.includes("back") || resumeSkills.includes("node.js") || positions.some(p => p.includes("back"));

    if ((isFrontendJob && isUserFrontend) || (isBackendJob && isUserBackend)) {
      totalScore += 12;
    } else {
      totalScore += 5;
    }
  }

  return Math.min(100, Math.round(totalScore));
}
