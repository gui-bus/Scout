const softwareTitles = [
  "desenvolvedor",
  "desenvolvedora",
  "developer",
  "software developer",
  "software engineer",
  "engenheiro de software",
  "engenheira de software",
  "programador",
  "programadora",
  "backend",
  "back-end",
  "frontend",
  "front-end",
  "fullstack",
  "full stack",
  "firmware",
  "sistemas embarcados",
  "desenvolvimento de sistemas",
  "desenvolvimento de software",
  "analista de sistemas",
  "analista desenvolvedor",
  "analista de desenvolvimento",
];

const moderateSoftwareTitles = [
  "devops",
  "site reliability engineer",
  "sre",
  "qa automation",
  "quality assurance automation",
  "engenheiro de dados",
  "engenheira de dados",
  "data engineer",
  "machine learning engineer",
  "ml engineer",
  "engenheiro de machine learning",
  "engenheira de machine learning",
  "arquiteto de software",
  "arquiteta de software",
  "tech lead",
];

const excludedTitles = [
  "recruiter",
  "tech recruiter",
  "recrutador",
  "recrutadora",
  "recursos humanos",
  "rh",
  "pedagogico",
  "pedagogica",
  "professor",
  "professora",
  "instrutor",
  "instrutora",
  "projetista",
  "business intelligence",
  "bi analyst",
  "analista de bi",
  "power bi",
  "suporte tecnico",
  "help desk",
  "service desk",
  "infraestrutura",
  "product manager",
  "gerente de produto",
  "product owner",
  "scrum master",
];

const strongTechs = [
  "python",
  "java",
  "javascript",
  "typescript",
  "c++",
  "c#",
  "csharp",
  "c-sharp",
  "php",
  "ruby",
  "go",
  "golang",
  "kotlin",
  "swift",
  "dart",
  "scala",
  "rust",
  "react",
  "reactjs",
  "react.js",
  "angular",
  "vue",
  "vuejs",
  "vue.js",
  "svelte",
  "next.js",
  "nextjs",
  "nuxt",
  "node",
  "node.js",
  "nodejs",
  "node js",
  "express",
  "nestjs",
  "flask",
  "django",
  "fastapi",
  "spring",
  "spring boot",
  ".net",
  "dotnet",
  "dot net",
  "asp.net",
  "laravel",
  "rails",
  "ruby on rails",
  "react native",
  "flutter",
  "android",
  "ios",
];

const moderateTechs = [
  "html",
  "css",
  "sass",
  "scss",
  "tailwind",
  "bootstrap",
  "jquery",
  "redux",
  "vite",
  "graphql",
  "microservices",
  "microsserviços",
  "microsservicos",
  "web services",
  "xamarin",
  "sql",
  "postgresql",
  "postgres",
  "mysql",
  "mongodb",
  "mongo",
  "mongo db",
  "oracle",
  "sql server",
  "sqlite",
  "redis",
  "firebase",
  "supabase",
  "elasticsearch",
  "dynamodb",
  "docker",
  "kubernetes",
  "k8s",
  "aws",
  "azure",
  "gcp",
  "google cloud",
  "jenkins",
  "github actions",
  "gitlab ci",
  "ci/cd",
  "terraform",
  "nginx",
  "quality assurance",
  "selenium",
  "cypress",
  "jest",
  "pytest",
  "junit",
  "unit tests",
  "testes unitários",
  "testes unitarios",
  "testes automatizados",
  "machine learning",
  "pandas",
  "numpy",
  "pytorch",
  "tensorflow",
  "etl",
  "big data",
  "airflow",
  "spark",
  "databricks",
];

const weakTechTerms = [
  "api",
  "apis",
  "rest",
  "restful",
  "git",
  "github",
  "gitlab",
  "linux",
  "shell",
  "bash",
  "powershell",
  "qa",
  "testes",
  "mobile",
  "programação",
  "programacao",
  "sistemas",
  "software",
  "web development",
  "desenvolvimento web",
  "tecnologia da informação",
  "tecnologia da informacao",
];

const softwareAreaTerms = [
  "dev",
  "estágio em desenvolvimento",
  "estagio em desenvolvimento",
  "estagiário de desenvolvimento",
  "estagiario de desenvolvimento",
  "estagiária de desenvolvimento",
  "estagiaria de desenvolvimento",
  "estágio em ti",
  "estagio em ti",
  "trainee desenvolvimento",
  "trainee tecnologia",
  "sistemas de informação",
  "sistemas de informacao",
  "análise e desenvolvimento de sistemas",
  "analise e desenvolvimento de sistemas",
  "computação",
  "computacao",
  "ciência da computação",
  "ciencia da computacao",
  "engenharia de software",
  "desenvolvimento backend",
  "desenvolvimento frontend",
  "desenvolvimento full stack",
];

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasTerm(text: string, term: string): boolean {
  const normalizedTerm = normalizeText(term);
  const escapedTerm = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?<![a-z0-9+#.])${escapedTerm}(?![a-z0-9+#.])`, "i");
  return regex.test(text);
}

function countTerms(text: string, terms: string[]): number {
  let count = 0;
  for (const term of terms) {
    if (hasTerm(text, term)) {
      count++;
    }
  }
  return count;
}

export function identifyLevel(data: { title?: string | null; type?: string | null }): string {
  const title = normalizeText(data.title);
  const type = normalizeText(data.type);
  const text = ` ${title} ${type} `;

  if (text.includes("vacancy_type_internship")) {
    return "Estágio";
  }

  if (
    ["estagio", "estagiario", "estagiaria", "internship"].some((term) => text.includes(term)) ||
    text.includes(" intern ")
  ) {
    return "Estágio";
  }

  const hasJunior = [
    "junior",
    " jr ",
    " jr.",
    "nivel i ",
    "desenvolvedor i ",
    "software engineer i ",
  ].some((term) => text.includes(term));

  const hasMid = [
    "pleno",
    " pl ",
    " pl.",
    "mid level",
    "mid-level",
    "midlevel",
    "nivel ii",
    "software engineer ii",
  ].some((term) => text.includes(term));

  const hasSenior = [
    "senior",
    " sr ",
    " sr.",
    "nivel iii",
    "software engineer iii",
  ].some((term) => text.includes(term));

  if (hasJunior && hasMid) return "Júnior/Pleno";
  if (hasMid && hasSenior) return "Pleno/Sênior";
  if (hasSenior) return "Sênior";
  if (hasMid) return "Pleno";
  if (hasJunior) return "Júnior";

  return "Não informado";
}

export function isSoftwareJob(data: { title?: string | null; description?: string | null; technologies?: string | null }): boolean {
  const title = normalizeText(data.title);

  if (excludedTitles.some((term) => hasTerm(title, term))) {
    return false;
  }

  if (softwareTitles.some((term) => hasTerm(title, term))) {
    return true;
  }

  const description = normalizeText(data.description);
  const technologies = normalizeText(data.technologies);
  const fullText = `${title} ${description} ${technologies}`;

  let score = 0;
  score += countTerms(title, moderateSoftwareTitles) * 3;
  score += countTerms(fullText, strongTechs) * 2;
  score += countTerms(fullText, moderateTechs);
  score += countTerms(fullText, weakTechTerms);
  score += countTerms(fullText, softwareAreaTerms) * 2;

  const isGenericTitleValid = [
    "estagio",
    "estagiario",
    "estagiaria",
    "analista",
    "engenheiro",
    "engenheira",
    "assistente",
    "auxiliar",
    "consultor",
    "consultora",
    "especialista",
    "trainee",
  ].some((term) => hasTerm(title, term));

  if (isGenericTitleValid) {
    return score >= 3;
  }

  return score >= 5;
}
