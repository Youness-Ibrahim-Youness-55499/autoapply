// Controlled skill list + aliases. Per the "nothing free-form is invented"
// constraint, skill extraction only ever matches against this list --
// never anything inferred from context. This is a starter list covering
// common software/product-adjacent roles, not a claim of completeness;
// growing it is a data change, not a code change (see skillExtractor.ts
// in the application layer, which does the actual matching).

export type SkillEntry = {
  aliases: string[];
  canonical: string;
};

export const skillDictionary: SkillEntry[] = [
  // Languages
  { canonical: "JavaScript", aliases: ["javascript", "js", "ecmascript"] },
  { canonical: "TypeScript", aliases: ["typescript", "ts"] },
  { canonical: "Python", aliases: ["python", "py"] },
  { canonical: "Java", aliases: ["java"] },
  { canonical: "C#", aliases: ["c#", "csharp", "c sharp"] },
  { canonical: "C++", aliases: ["c++", "cpp"] },
  { canonical: "Go", aliases: ["go", "golang"] },
  { canonical: "Rust", aliases: ["rust"] },
  { canonical: "PHP", aliases: ["php"] },
  { canonical: "Ruby", aliases: ["ruby"] },
  { canonical: "Swift", aliases: ["swift"] },
  { canonical: "Kotlin", aliases: ["kotlin"] },
  { canonical: "SQL", aliases: ["sql"] },

  // Frontend
  { canonical: "React", aliases: ["react", "react.js", "reactjs"] },
  { canonical: "Vue.js", aliases: ["vue", "vue.js", "vuejs"] },
  { canonical: "Angular", aliases: ["angular", "angularjs"] },
  { canonical: "HTML", aliases: ["html", "html5"] },
  { canonical: "CSS", aliases: ["css", "css3"] },
  { canonical: "Tailwind CSS", aliases: ["tailwind", "tailwindcss", "tailwind css"] },
  { canonical: "Next.js", aliases: ["next.js", "nextjs", "next"] },

  // Backend / infra
  { canonical: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { canonical: "Express", aliases: ["express", "express.js", "expressjs"] },
  { canonical: "Django", aliases: ["django"] },
  { canonical: "Flask", aliases: ["flask"] },
  { canonical: "Spring Boot", aliases: ["spring boot", "spring"] },
  { canonical: "GraphQL", aliases: ["graphql"] },
  { canonical: "REST APIs", aliases: ["rest", "rest api", "restful", "restful api"] },
  { canonical: "Docker", aliases: ["docker"] },
  { canonical: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { canonical: "AWS", aliases: ["aws", "amazon web services"] },
  { canonical: "Google Cloud Platform", aliases: ["gcp", "google cloud", "google cloud platform"] },
  { canonical: "Microsoft Azure", aliases: ["azure", "microsoft azure"] },
  { canonical: "Terraform", aliases: ["terraform"] },
  { canonical: "CI/CD", aliases: ["ci/cd", "ci cd", "continuous integration", "continuous deployment"] },

  // Data
  { canonical: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { canonical: "MySQL", aliases: ["mysql"] },
  { canonical: "MongoDB", aliases: ["mongodb", "mongo"] },
  { canonical: "Redis", aliases: ["redis"] },
  { canonical: "Supabase", aliases: ["supabase"] },
  { canonical: "Firebase", aliases: ["firebase"] },

  // Tools / practices
  { canonical: "Git", aliases: ["git"] },
  { canonical: "Figma", aliases: ["figma"] },
  { canonical: "Jira", aliases: ["jira"] },
  { canonical: "Agile", aliases: ["agile", "scrum", "kanban"] },

  // Soft / professional skills
  { canonical: "Project Management", aliases: ["project management"] },
  { canonical: "Team Leadership", aliases: ["team leadership", "leadership"] },
  { canonical: "Communication", aliases: ["communication", "communication skills"] },
  { canonical: "Problem Solving", aliases: ["problem solving", "problem-solving"] },
  { canonical: "Public Speaking", aliases: ["public speaking"] },
  { canonical: "Data Analysis", aliases: ["data analysis"] },

  // Common CV languages-section entries that are also plausible "skills"
  { canonical: "English", aliases: ["english", "englisch"] },
  { canonical: "German", aliases: ["german", "deutsch"] },
  { canonical: "French", aliases: ["french", "französisch", "franzosisch"] },
  { canonical: "Spanish", aliases: ["spanish", "spanisch"] },
];
