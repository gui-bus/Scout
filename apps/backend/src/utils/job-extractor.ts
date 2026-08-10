export interface ExtractedMetadata {
  contractType: string;
  salaryText: string | null;
  contactsText: string | null;
  technologies: string | null;
}

const technologiesToExtract = [
  // Front-end / Web
  { key: 'react', display: 'React' },
  { key: 'next.js', display: 'Next.js' },
  { key: 'nextjs', display: 'Next.js' },
  { key: 'vue.js', display: 'Vue.js' },
  { key: 'vuejs', display: 'Vue.js' },
  { key: 'nuxt', display: 'Nuxt' },
  { key: 'angular', display: 'Angular' },
  { key: 'svelte', display: 'Svelte' },
  { key: 'sveltekit', display: 'SvelteKit' },
  { key: 'solidjs', display: 'SolidJS' },
  { key: 'astro', display: 'Astro' },
  { key: 'html', display: 'HTML' },
  { key: 'css', display: 'CSS' },
  { key: 'javascript', display: 'JavaScript' },
  { key: 'typescript', display: 'TypeScript' },
  { key: 'tailwind css', display: 'Tailwind CSS' },
  { key: 'tailwind', display: 'Tailwind CSS' },
  { key: 'tailwindcss', display: 'Tailwind CSS' },
  { key: 'bootstrap', display: 'Bootstrap' },
  { key: 'sass', display: 'Sass' },
  { key: 'less', display: 'Less' },
  { key: 'web components', display: 'Web Components' },
  { key: 'vite', display: 'Vite' },
  { key: 'webpack', display: 'Webpack' },
  { key: 'rollup', display: 'Rollup' },
  { key: 'babel', display: 'Babel' },
  { key: 'redux', display: 'Redux' },
  { key: 'zustand', display: 'Zustand' },
  { key: 'mobx', display: 'MobX' },
  { key: 'tanstack query', display: 'TanStack Query' },
  { key: 'react query', display: 'TanStack Query' },
  { key: 'react router', display: 'React Router' },
  { key: 'nextauth.js', display: 'NextAuth.js / Auth.js' },
  { key: 'nextauth', display: 'NextAuth.js / Auth.js' },
  { key: 'auth.js', display: 'NextAuth.js / Auth.js' },
  { key: 'authjs', display: 'NextAuth.js / Auth.js' },
  { key: 'storybook', display: 'Storybook' },
  { key: 'framer motion', display: 'Framer Motion' },

  // Back-end / APIs
  { key: 'node.js', display: 'Node.js' },
  { key: 'nodejs', display: 'Node.js' },
  { key: 'node js', display: 'Node.js' },
  { key: 'nestjs', display: 'NestJS' },
  { key: 'nest js', display: 'NestJS' },
  { key: 'express', display: 'Express' },
  { key: 'expressjs', display: 'Express' },
  { key: 'express.js', display: 'Express' },
  { key: 'fastify', display: 'Fastify' },
  { key: 'hono', display: 'Hono' },
  { key: 'bun', display: 'Bun' },
  { key: 'deno', display: 'Deno' },
  { key: 'python', display: 'Python' },
  { key: 'django', display: 'Django' },
  { key: 'flask', display: 'Flask' },
  { key: 'fastapi', display: 'FastAPI' },
  { key: 'java', display: 'Java' },
  { key: 'spring boot', display: 'Spring Boot' },
  { key: 'kotlin', display: 'Kotlin' },
  { key: 'c#', display: 'C#' },
  { key: 'csharp', display: 'C#' },
  { key: 'c-sharp', display: 'C#' },
  { key: '.net', display: '.NET' },
  { key: 'dotnet', display: '.NET' },
  { key: 'asp.net core', display: 'ASP.NET Core' },
  { key: 'asp.net', display: 'ASP.NET Core' },
  { key: 'go', display: 'Go' },
  { key: 'golang', display: 'Go' },
  { key: 'gin', display: 'Gin' },
  { key: 'rust', display: 'Rust' },
  { key: 'php', display: 'PHP' },
  { key: 'laravel', display: 'Laravel' },
  { key: 'ruby', display: 'Ruby' },
  { key: 'ruby on rails', display: 'Ruby on Rails' },
  { key: 'rails', display: 'Ruby on Rails' },
  { key: 'elixir', display: 'Elixir' },
  { key: 'phoenix', display: 'Phoenix' },
  { key: 'scala', display: 'Scala' },
  { key: 'c++', display: 'C++' },
  { key: 'cpp', display: 'C++' },
  { key: 'swift', display: 'Swift' },

  // Bancos de dados
  { key: 'postgresql', display: 'PostgreSQL' },
  { key: 'postgres', display: 'PostgreSQL' },
  { key: 'mysql', display: 'MySQL' },
  { key: 'mariadb', display: 'MariaDB' },
  { key: 'sqlite', display: 'SQLite' },
  { key: 'mongodb', display: 'MongoDB' },
  { key: 'mongo', display: 'MongoDB' },
  { key: 'redis', display: 'Redis' },
  { key: 'sql server', display: 'Microsoft SQL Server' },
  { key: 'mssql', display: 'Microsoft SQL Server' },
  { key: 'oracle', display: 'Oracle Database' },
  { key: 'cassandra', display: 'Cassandra' },
  { key: 'dynamodb', display: 'DynamoDB' },
  { key: 'elasticsearch', display: 'Elasticsearch' },
  { key: 'opensearch', display: 'OpenSearch' },
  { key: 'neo4j', display: 'Neo4j' },
  { key: 'supabase', display: 'Supabase' },
  { key: 'firebase', display: 'Firebase' },
  { key: 'cockroachdb', display: 'CockroachDB' },
  { key: 'planetscale', display: 'PlanetScale' },
  { key: 'clickhouse', display: 'ClickHouse' },
  { key: 'influxdb', display: 'InfluxDB' },
  { key: 'couchdb', display: 'CouchDB' },

  // ORM / Data / Query
  { key: 'prisma', display: 'Prisma' },
  { key: 'drizzle orm', display: 'Drizzle ORM' },
  { key: 'drizzle', display: 'Drizzle ORM' },
  { key: 'typeorm', display: 'TypeORM' },
  { key: 'sequelize', display: 'Sequelize' },
  { key: 'mongoose', display: 'Mongoose' },
  { key: 'hibernate', display: 'Hibernate' },
  { key: 'entity framework', display: 'Entity Framework' },
  { key: 'sqlalchemy', display: 'SQLAlchemy' },
  { key: 'django orm', display: 'Django ORM' },
  { key: 'graphql', display: 'GraphQL' },
  { key: 'apollo', display: 'Apollo GraphQL' },
  { key: 'apollo graphql', display: 'Apollo GraphQL' },
  { key: 'trpc', display: 'tRPC' },
  { key: 'rest api', display: 'REST API' },
  { key: 'restful', display: 'REST API' },
  { key: 'grpc', display: 'gRPC' },
  { key: 'websockets', display: 'WebSockets' },
  { key: 'websocket', display: 'WebSockets' },
  { key: 'socket.io', display: 'Socket.IO' },
  { key: 'socketio', display: 'Socket.IO' },
  { key: 'kafka', display: 'Apache Kafka' },
  { key: 'apache kafka', display: 'Apache Kafka' },
  { key: 'rabbitmq', display: 'RabbitMQ' },
  { key: 'pulsar', display: 'Apache Pulsar' },
  { key: 'apache pulsar', display: 'Apache Pulsar' },
  { key: 'nats', display: 'NATS' },

  // Cloud / Infraestrutura
  { key: 'aws', display: 'AWS' },
  { key: 'amazon web services', display: 'AWS' },
  { key: 'azure', display: 'Microsoft Azure' },
  { key: 'microsoft azure', display: 'Microsoft Azure' },
  { key: 'gcp', display: 'Google Cloud' },
  { key: 'google cloud', display: 'Google Cloud' },
  { key: 'cloudflare', display: 'Cloudflare' },
  { key: 'vercel', display: 'Vercel' },
  { key: 'netlify', display: 'Netlify' },
  { key: 'digitalocean', display: 'DigitalOcean' },
  { key: 'heroku', display: 'Heroku' },
  { key: 'render', display: 'Render' },
  { key: 'railway', display: 'Railway' },
  { key: 'ec2', display: 'AWS EC2' },
  { key: 's3', display: 'AWS S3' },
  { key: 'lambda', display: 'AWS Lambda' },
  { key: 'rds', display: 'AWS RDS' },
  { key: 'ecs', display: 'AWS ECS' },
  { key: 'eks', display: 'AWS EKS' },
  { key: 'cloudfront', display: 'AWS CloudFront' },
  { key: 'api gateway', display: 'AWS API Gateway' },
  { key: 'azure functions', display: 'Azure Functions' },
  { key: 'cloud run', display: 'Google Cloud Run' },

  // DevOps / Containers / CI/CD
  { key: 'docker', display: 'Docker' },
  { key: 'kubernetes', display: 'Kubernetes' },
  { key: 'k8s', display: 'Kubernetes' },
  { key: 'docker compose', display: 'Docker Compose' },
  { key: 'helm', display: 'Helm' },
  { key: 'terraform', display: 'Terraform' },
  { key: 'ansible', display: 'Ansible' },
  { key: 'pulumi', display: 'Pulumi' },
  { key: 'jenkins', display: 'Jenkins' },
  { key: 'github actions', display: 'GitHub Actions' },
  { key: 'gitlab ci', display: 'GitLab CI/CD' },
  { key: 'gitlab ci/cd', display: 'GitLab CI/CD' },
  { key: 'circleci', display: 'CircleCI' },
  { key: 'argo cd', display: 'Argo CD' },
  { key: 'argocd', display: 'Argo CD' },
  { key: 'prometheus', display: 'Prometheus' },
  { key: 'grafana', display: 'Grafana' },
  { key: 'datadog', display: 'Datadog' },
  { key: 'nginx', display: 'Nginx' },
  { key: 'apache', display: 'Apache' },
  { key: 'traefik', display: 'Traefik' },
  { key: 'haproxy', display: 'HAProxy' },
  { key: 'opentelemetry', display: 'OpenTelemetry' },
  { key: 'otel', display: 'OpenTelemetry' },

  // Git / Desenvolvimento / Ferramentas
  { key: 'git', display: 'Git' },
  { key: 'github', display: 'GitHub' },
  { key: 'gitlab', display: 'GitLab' },
  { key: 'bitbucket', display: 'Bitbucket' },
  { key: 'codespaces', display: 'GitHub Codespaces' },
  { key: 'vs code', display: 'VS Code' },
  { key: 'vscode', display: 'VS Code' },
  { key: 'intellij', display: 'JetBrains IntelliJ IDEA' },
  { key: 'webstorm', display: 'WebStorm' },
  { key: 'postman', display: 'Postman' },
  { key: 'insomnia', display: 'Insomnia' },
  { key: 'swagger', display: 'Swagger / OpenAPI' },
  { key: 'openapi', display: 'Swagger / OpenAPI' },
  { key: 'eslint', display: 'ESLint' },
  { key: 'prettier', display: 'Prettier' },
  { key: 'husky', display: 'Husky' },
  { key: 'lint-staged', display: 'lint-staged' },
  { key: 'pnpm', display: 'pnpm' },
  { key: 'npm', display: 'npm' },
  { key: 'yarn', display: 'Yarn' },
  { key: 'make', display: 'Make' },

  // Testes / Qualidade
  { key: 'jest', display: 'Jest' },
  { key: 'vitest', display: 'Vitest' },
  { key: 'cypress', display: 'Cypress' },
  { key: 'playwright', display: 'Playwright' },
  { key: 'selenium', display: 'Selenium' },
  { key: 'testing library', display: 'Testing Library' },
  { key: 'react testing library', display: 'React Testing Library' },
  { key: 'supertest', display: 'Supertest' },
  { key: 'mocha', display: 'Mocha' },
  { key: 'chai', display: 'Chai' },
  { key: 'phpunit', display: 'PHPUnit' },
  { key: 'pytest', display: 'PyTest' },
  { key: 'junit', display: 'JUnit' },
  { key: 'nunit', display: 'NUnit' },
  { key: 'sonarqube', display: 'SonarQube' },

  // IA / Machine Learning / Data
  { key: 'tensorflow', display: 'TensorFlow' },
  { key: 'pytorch', display: 'PyTorch' },
  { key: 'scikit-learn', display: 'scikit-learn' },
  { key: 'pandas', display: 'Pandas' },
  { key: 'numpy', display: 'NumPy' },
  { key: 'jupyter', display: 'Jupyter' },
  { key: 'opencv', display: 'OpenCV' },
  { key: 'hugging face', display: 'Hugging Face' },
  { key: 'huggingface', display: 'Hugging Face' },
  { key: 'langchain', display: 'LangChain' },
  { key: 'openai', display: 'OpenAI API' },
  { key: 'anthropic', display: 'Anthropic API' },
  { key: 'ollama', display: 'Ollama' },
  { key: 'mlflow', display: 'MLflow' },
  { key: 'spark', display: 'Apache Spark' },
  { key: 'airflow', display: 'Apache Airflow' },

  // Mobile / Desktop / Outros
  { key: 'react native', display: 'React Native' },
  { key: 'flutter', display: 'Flutter' },
  { key: 'dart', display: 'Dart' },
  { key: 'swiftui', display: 'SwiftUI' },
  { key: 'kotlin multiplatform', display: 'Kotlin Multiplatform' },
  { key: 'kmp', display: 'Kotlin Multiplatform' },
  { key: 'electron', display: 'Electron' },
  { key: 'tauri', display: 'Tauri' },
  { key: 'unity', display: 'Unity' },
  { key: 'unreal engine', display: 'Unreal Engine' },
  { key: 'figma', display: 'Figma' },
];

export function extractTechnologiesFromText(
  description: string | null | undefined,
): string | null {
  if (!description) return null;
  const descLower = description.toLowerCase();
  const foundTechs: string[] = [];

  for (const tech of technologiesToExtract) {
    const escapedTech = tech.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let regex: RegExp;
    if (
      tech.key === 'c' ||
      tech.key === 'go' ||
      tech.key === 'git' ||
      tech.key === 'npm' ||
      tech.key === 'yarn'
    ) {
      regex = new RegExp(`\\b${escapedTech}\\b`, 'i');
    } else {
      regex = new RegExp(`(?<![a-z0-9+#.])${escapedTech}(?![a-z0-9+#.])`, 'i');
    }

    if (regex.test(descLower)) {
      foundTechs.push(tech.display);
    }
  }

  if (foundTechs.length === 0) return null;
  return Array.from(new Set(foundTechs)).slice(0, 15).join(', ');
}

export function extractMetadata(
  description: string | null | undefined,
): ExtractedMetadata {
  const result: ExtractedMetadata = {
    contractType: 'Não especificado',
    salaryText: null,
    contactsText: null,
    technologies: null,
  };

  if (!description) return result;

  const descLower = description.toLowerCase();

  // 1. Detect Contract Type
  const isPj =
    /\b(pj|prestador\s+de\s+servico|cooperado|pessoa\s+juridica)\b/i.test(
      descLower,
    );
  const isClt = /\b(clt|carteira\s+assinada|efetivo)\b/i.test(descLower);

  if (isPj && isClt) {
    result.contractType = 'CLT/PJ';
  } else if (isPj) {
    result.contractType = 'PJ';
  } else if (isClt) {
    result.contractType = 'CLT';
  }

  // 2. Detect Values (Salary, VR, VA, etc.)
  const valueRegex =
    /(?:r\$\s?|\$\s?|usd\s?)(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d{1,2}k)/gi;

  const salaryMatches: string[] = [];
  const vrMatches: string[] = [];
  const vaMatches: string[] = [];
  const otherMatches: string[] = [];

  let match;
  valueRegex.lastIndex = 0;

  while ((match = valueRegex.exec(description)) !== null) {
    const fullValue = match[0].trim();
    const matchIndex = match.index;

    const numericStr = match[1]
      .replace(/\./g, '')
      .replace(',', '.')
      .toLowerCase();
    const numericValue = numericStr.includes('k')
      ? parseFloat(numericStr) * 1000
      : parseFloat(numericStr);

    if (isNaN(numericValue)) continue;

    // Extrai o contexto ao redor do match
    const contextBefore = description
      .substring(Math.max(0, matchIndex - 80), matchIndex)
      .toLowerCase();

    const isVr = /\b(vr|refeicao|refeição)\b/i.test(contextBefore);
    const isVa = /\b(va|alimentacao|alimentação)\b/i.test(contextBefore);
    const isHomeOffice =
      /\b(home\s*office|homeoffice|auxilio\s+internet|auxílio\s+internet)\b/i.test(
        contextBefore,
      );
    const isSalary =
      /\b(salario|salário|remuneracao|remuneração|faixa salarial|bolsa|contrato|contratacao|contratação|salary|remuneration)\b/i.test(
        contextBefore,
      );

    // Se houver indicação direta de salário no contexto de 80 caracteres antes do valor, ou se for valor grande e sem outros benefício
    if (isSalary) {
      salaryMatches.push(`Salário: ${fullValue}`);
    } else if (isVr) {
      vrMatches.push(`VR: ${fullValue}`);
    } else if (isVa) {
      vaMatches.push(`VA: ${fullValue}`);
    } else if (isHomeOffice) {
      otherMatches.push(`Home Office: ${fullValue}`);
    } else if (numericValue >= 1500) {
      salaryMatches.push(`Salário: ${fullValue}`);
    } else {
      // Se não for detectado nenhum termo específico e for valor baixo, pode ser benefício genérico
      otherMatches.push(`Benefício: ${fullValue}`);
    }
  }

  const allValues = [
    ...Array.from(new Set(salaryMatches)),
    ...Array.from(new Set(vrMatches)),
    ...Array.from(new Set(vaMatches)),
    ...Array.from(new Set(otherMatches)),
  ];

  if (allValues.length > 0) {
    result.salaryText = allValues.join(' / ');
  }

  // 3. Detect Emails and Contact Links
  const emails: string[] = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let emailMatch;
  while ((emailMatch = emailRegex.exec(description)) !== null) {
    emails.push(emailMatch[0]);
  }

  const contacts: string[] = [];
  if (emails.length > 0) {
    contacts.push(...Array.from(new Set(emails)));
  }

  const formsRegex =
    /(https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:google\.com\/forms|forms\.gle|typeform\.com|forms\.office\.com|gupy\.io)\/[^\s\)]+)/gi;
  let formMatch;
  while ((formMatch = formsRegex.exec(description)) !== null) {
    contacts.push(formMatch[0]);
  }

  if (contacts.length > 0) {
    result.contactsText = Array.from(new Set(contacts)).join(', ');
  }

  // 4. Extract Technologies
  result.technologies = extractTechnologiesFromText(description);

  return result;
}

const stateMapping: Record<string, { name: string; uf: string }> = {
  ac: { name: 'Acre', uf: 'AC' },
  al: { name: 'Alagoas', uf: 'AL' },
  ap: { name: 'Amapá', uf: 'AP' },
  am: { name: 'Amazonas', uf: 'AM' },
  ba: { name: 'Bahia', uf: 'BA' },
  ce: { name: 'Ceará', uf: 'CE' },
  df: { name: 'Distrito Federal', uf: 'DF' },
  es: { name: 'Espírito Santo', uf: 'ES' },
  go: { name: 'Goiás', uf: 'GO' },
  ma: { name: 'Maranhão', uf: 'MA' },
  mt: { name: 'Mato Grosso', uf: 'MT' },
  ms: { name: 'Mato Grosso do Sul', uf: 'MS' },
  mg: { name: 'Minas Gerais', uf: 'MG' },
  pa: { name: 'Pará', uf: 'PA' },
  pb: { name: 'Paraíba', uf: 'PB' },
  pr: { name: 'Paraná', uf: 'PR' },
  pe: { name: 'Pernambuco', uf: 'PE' },
  pi: { name: 'Piauí', uf: 'PI' },
  rj: { name: 'Rio de Janeiro', uf: 'RJ' },
  rn: { name: 'Rio Grande do Norte', uf: 'RN' },
  rs: { name: 'Rio Grande do Sul', uf: 'RS' },
  ro: { name: 'Rondônia', uf: 'RO' },
  rr: { name: 'Roraima', uf: 'RR' },
  sc: { name: 'Santa Catarina', uf: 'SC' },
  sp: { name: 'São Paulo', uf: 'SP' },
  se: { name: 'Sergipe', uf: 'SE' },
  to: { name: 'Tocantins', uf: 'TO' },
};

export function extractState(locationText: string | null): string | null {
  if (!locationText) return null;
  const normalized = locationText.toLowerCase();

  if (
    normalized.includes('remoto') ||
    normalized.includes('remote') ||
    normalized.includes('anywhere') ||
    normalized.includes('teletrabalho')
  ) {
    return 'Remoto';
  }

  for (const [, state] of Object.entries(stateMapping)) {
    const regexUF = new RegExp(`\\b${state.uf}\\b`, 'i');
    const regexName = new RegExp(
      `\\b${state.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}\\b`,
      'i',
    );

    const textNormalized = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (regexUF.test(normalized) || regexName.test(textNormalized)) {
      return `${state.name}, ${state.uf}`;
    }
  }

  return locationText;
}
