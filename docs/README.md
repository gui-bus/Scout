# 📑 Documentação Técnica - Scout

Bem-vindo à central de documentação técnica do **Scout**. Este diretório reúne especificações detalhadas sobre a arquitetura do monorepo, modelagem de banco de dados, fluxo de coletores de vagas e inteligência de extração de metadados.

---

## 📌 Sumário da Documentação

### 1. 🏛️ [Arquitetura do Monorepo e Sistema](architecture.md)
Detalhamento da estrutura de pastas, ciclo de vida das requisições, controle de estado global e reativo no Frontend (Next.js com `nuqs` e TanStack Query) e barramento NestJS.

### 2. 🗄️ [Modelagem de Dados e Banco de Dados](database.md)
Documentação do arquivo `schema.prisma`, mapeamento físico das tabelas do SQLite, índices e migrações.

### 3. 📥 [Fluxo de Coleta de Vagas (Collectors)](collectors.md)
Explicação detalhada dos coletores de dados (GitHub API, Remotive REST API, Scrapers de plataformas como Gupy e Sólides) e fluxos incrementais de sincronização.

### 4. 🧠 [Motor de Extração de Metadados e Stacks](metadata-extractor.md)
Detalhamento de como funciona a engine de expressões regulares contextuais (Regex) para classificar salários, benefícios (VR/VA), e-mails, links de inscrição direta e mapeamento de mais de 200 tecnologias.
