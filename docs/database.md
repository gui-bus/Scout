# 🗄️ Modelagem de Dados e Banco de Dados

O Scout utiliza um banco de dados local **SQLite** configurado e orquestrado por meio do **Prisma ORM**, facilitando transações relacionais rápidas.

---

## 🏛️ Diagrama Entidade-Relacionamento (E-R)

O banco de dados armazena vagas de trabalho (`Job`) estruturadas e mantém uma tabela de relacionamento de estados do usuário (`JobState`) para controlar o status de favoritos e candidatura:

```mermaid
erDiagram
    USER ||--o{ JOB_STATE : "interage"
    USER ||--o{ NOTIFICATION : "recebe"
    JOB ||--o{ JOB_STATE : "possui"

    USER {
        int id PK "Autoincrement"
        string email UK "E-mail do usuário"
        string password "Senha hasheada"
        string savedFilters "JSON serializado contendo slots de filtros salvos"
        string resumeJson "JSON estruturado do currículo Lume importado"
    }

    JOB {
        int id PK "Autoincrement"
        string title "Título da Vaga"
        string description "Descrição Completa"
        string company "Empresa Contratante"
        string location "Localidade"
        string modality "Modalidade (Remoto/Híbrido/Presencial)"
        string level "Senioridade (Júnior/Pleno/Sênior/etc)"
        string technologies "Tecnologias concatenadas (TechTags)"
        string source "Origem (Gupy/GitHub/etc)"
        string link UK "URL Única Sanitizada"
        datetime publishedAt "Data de Publicação Original"
        datetime collectedAt "Data de Captura no Banco"
        string contractType "Tipo de Contrato (CLT/PJ)"
        string salaryText "Metadados de Salário/VR/VA extraídos"
        string contactsText "E-mails/links de contato extraídos"
    }

    JOB_STATE {
        int id PK "Autoincrement"
        int userId FK "ID do Usuário"
        int jobId FK "ID da Vaga"
        boolean isFavorite "Vaga salva nos favoritos"
        boolean isApplied "Candidatura enviada"
    }

    NOTIFICATION {
        int id PK "Autoincrement"
        int userId FK "ID do Usuário"
        string title "Título da notificação"
        string message "Mensagem detalhada"
        boolean read "Status de lido"
        datetime createdAt "Data de criação"
        int jobId FK "Vaga relacionada opcional"
    }
```

---

## 📑 Detalhe dos Campos Chave (Tabela Job)

| Campo          | Tipo     | Descrição                                                                                             |
| :------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| `link`         | `String` | Chave única (Unique) contendo a URL da vaga após processo de normalização (remoção de UTMs e trackers) |
| `contractType` | `String` | Tipo de contrato inferido pela análise regex (CLT, PJ, CLT/PJ ou Não especificado)                    |
| `salaryText`   | `String` | Valores monetários catalogados (ex: `Salário: R$ 10.000 / VR: R$ 900`)                                 |
| `contactsText` | `String` | Lista de e-mails ou formulários externos separados por vírgula para candidatura direta                 |

---

## 🛠️ Configuração do Prisma 7

### Centralização em `prisma.config.ts`
Diferente das versões anteriores do Prisma, a versão 7 centraliza as definições dinâmicas de banco diretamente no arquivo `prisma.config.ts` localizado na raiz da pasta `apps/backend/`. A URL de conexão física do SQLite é lida das variáveis de ambiente e injetada no pipeline de compilação.
