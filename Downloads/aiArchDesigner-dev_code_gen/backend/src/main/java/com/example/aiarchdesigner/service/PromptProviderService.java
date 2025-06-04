package com.example.aiarchdesigner.service;

import com.example.aiarchdesigner.model.GeneratedFile;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PromptProviderService {

    public String getCommonPromptPreamble() {
        return """
[System Preamble]
You are an expert AI software architect and senior full-stack developer. Your primary function is to meticulously analyze provided software design documents and generate complete, production-ready source code files based on these designs. You must output the generated files in a specific JSON format.

[Overall Task Context]
The overall goal is to generate a complete project. This specific request focuses on a particular PHASE of that project. Adhere to all general code quality, pathing, and output format specifications.
""";
    }

    public String getCommonOutputFormatAndKeyInstructions() {
        return """
[Output Format Specification]
Your entire response MUST be a valid JSON array. Each element of the array must be an object with exactly two keys:
- `filePath`: A string representing the full relative path for the file (e.g., "src/main/java/com/example/service/UserService.java", "frontend/src/components/UserProfile.jsx", "README.md").
- `code`: A string containing the complete, well-formatted source code for that file. Ensure all special characters within the code (like newlines, tabs, quotes) are correctly escaped to produce valid JSON.

[Key Instructions & Guidelines (General)]
1.  **Strict Adherence to Design**: Follow the input design document and the phase-specific instructions.
2.  **Project Compilability and Runnability (CRITICAL for the whole project eventually)**:
    *   The code generated in this phase, when combined with other phases, MUST contribute to a compilable and runnable project.
    *   Generate all necessary build configuration files (`pom.xml`, `package.json`, etc.) IF THEY FALL WITHIN THE SCOPE OF THIS PHASE.
    *   Ensure correct syntax, imports, class definitions, method signatures FOR THE CURRENT PHASE.
3.  **Handling Complex Logic with TODO Comments**:
    *   For highly complex, domain-specific, or algorithmically intensive business logic specific to this phase, insert a `// TODO: [Clear description]` comment.
    *   The surrounding code structure MUST still be generated and be syntactically correct.
4.  **No Placeholders (Unless TODO)**: Generate actual, runnable code for the current phase.
5.  **File Paths**: All `filePath` entries must be relative to the project root concept for that phase (e.g. if generating backend files, paths are relative to the backend module root).

[Example of Expected JSON Output Structure]
```json
[
  {{
    "filePath": "src/main/java/com/example/demo/controller/UserController.java",
    "code": "package com.example.demo.controller;\n// ... rest of the code ..."
  }}
  // ... more files for THIS PHASE
]
```
Please ensure your output strictly follows this JSON structure for THIS PHASE. Do not include any explanatory text or apologies outside of the JSON array itself.
""";
    }

    public String constructBackendPrompt(String designDocumentContentPlaceholder) {
        // designDocumentContentPlaceholder is not directly used in the template string here,
        // but passed via promptParameters. Keeping it for consistency.
        return getCommonPromptPreamble() + """

[Current Phase: BACKEND CODE GENERATION]
Your SOLE FOCUS for this request is to generate the BACKEND code for the application, based on the design document.
This typically includes: Java, Spring Boot, database interaction (MyBatis as per previous instructions), etc.
- Generate all necessary Controllers, Services, DTOs, Models (Entities), and MyBatis Mapper interfaces and XML files.
- CRITICAL: Generate the main Spring Boot application class (e.g., `Application.java` or a suitable name like `MainApplication.java` or `YourProjectNameApplication.java` if a project name can be inferred from the design document) in an appropriate package (e.g., `com.example.yourproject`), annotated with `@SpringBootApplication` and containing the `public static void main(String[] args) {{ SpringApplication.run(...); }}` method. This class is essential for running the backend.
- If a `pom.xml` is needed for the backend module, generate it with necessary Spring Boot and MyBatis dependencies.
- If database schema (DDL) is part of the backend design and not a separate phase, include it (e.g. in `src/main/resources/db/migration/V1__init.sql` if using Flyway, or a simple `schema.sql`).
- Ensure adherence to RESTful principles for APIs.
- Implement business logic and CRUD operations as indicated by the design for the backend.
- DO NOT generate any frontend code (React, Vue, Angular, HTML, CSS, JavaScript, package.json, etc.) in this step.
- DO NOT generate deployment scripts or general project-level README files (a separate phase will handle the main README).

[Input Design Document Snippet - Focus on Backend Aspects]
```
{design_document_content}
```
""" + getCommonOutputFormatAndKeyInstructions();
    }

    public String constructFrontendPrompt(String designDocumentContentPlaceholder, List<GeneratedFile> backendFilesInfo) {
        String backendApiSummary = "";
        if (backendFilesInfo != null && !backendFilesInfo.isEmpty()) {

        }

        return getCommonPromptPreamble() + """

""" + backendApiSummary + """
[Input Design Document Snippet - Focus on Frontend Aspects]
```
{design_document_content}
```
注意: 语言限定为 html,css,js。

""" + getCommonOutputFormatAndKeyInstructions();
    }

    public String constructReadmePrompt(String designDocumentContentPlaceholder, List<GeneratedFile> allGeneratedFiles) {
        StringBuilder fileSummary = new StringBuilder();
        if (allGeneratedFiles != null && !allGeneratedFiles.isEmpty()) {
            fileSummary.append("\n\n[Generated Project Structure Overview (for your reference)]\n");
            Map<String, List<String>> dirMap = new HashMap<>();
            for (GeneratedFile gf : allGeneratedFiles) {
                Path conceptualPath = Paths.get(gf.getFilePath());
                String topLevelOrFileName = conceptualPath.getNameCount() > 1 ?
                                            conceptualPath.getName(0).toString() :
                                            conceptualPath.toString();

                if (gf.getFilePath().startsWith("backend/") || gf.getFilePath().startsWith("frontend/")){
                     topLevelOrFileName = conceptualPath.getName(0).toString() + "/";
                } else {
                    topLevelOrFileName = gf.getFilePath();
                }

                dirMap.computeIfAbsent(topLevelOrFileName, k -> new ArrayList<>()).add(gf.getFilePath());
            }

            if (dirMap.containsKey("backend/")){
                fileSummary.append("- backend/ module (contains backend source code)\n");
            }
            if (dirMap.containsKey("frontend/")){
                fileSummary.append("- frontend/ module (contains frontend source code)\n");
            }
        }
        // designDocumentContentPlaceholder is not directly used in the template string here,
        // but passed via promptParameters. Keeping it for consistency.
        return getCommonPromptPreamble() + """

[Current Task: GENERATE PROJECT README.md]
Based on the original design document and the project structure that was generated (backend and frontend modules located in 'backend/' and 'frontend/' subdirectories respectively), your task is to create a comprehensive `README.md` file.
This `README.md` should be placed at the root of the generated project.

This `README.md` should include:
1.  **Project Title**: Derived from the design document.
2.  **Project Description**: A brief overview of the project's purpose.
3.  **Technology Stack**: List the main technologies used for backend and frontend (e.g., Java Spring Boot, MyBatis, React, TypeScript, Vite).
4.  **Prerequisites**: Any software that needs to be installed to run the project (e.g., JDK 17, Node.js 18+, Maven, npm/yarn, MySQL if applicable).
5.  **Backend Setup and Run Instructions** (assuming backend code is in a 'backend/' subdirectory):
    *   How to navigate to the backend directory: `cd backend`
    *   How to build the backend (e.g., `mvn clean install`).
    *   How to run the backend (e.g., `java -jar target/your-backend-app.jar` or `mvn spring-boot:run`).
    *   Default backend port (e.g., 8080) and any key API base paths.
6.  **Frontend Setup and Run Instructions** (assuming frontend code is in a 'frontend/' subdirectory):
    *   How to navigate to the frontend directory: `cd frontend`
    *   How to install dependencies (e.g., `npm install` or `yarn install`).
    *   How to start the frontend development server (e.g., `npm start` or `yarn start`).
    *   Default frontend port (e.g., 3000 or 5173 for Vite) and how to access it in the browser.
7.  **(Optional) Database Setup**: If a database like MySQL is used, mention any initial setup steps (e.g., create database, ensure server is running, run schema scripts if they were generated separately in `backend/src/main/resources/db/...`).
8.  **Directory Structure Overview**: Briefly explain the purpose of the 'backend/' and 'frontend/' subdirectories.

Ensure the instructions are clear, concise, and actionable for a developer trying to set up and run the generated project.
The output for this request should be a SINGLE `GeneratedFile` object in the standard JSON array format, where `filePath` is "README.md" (this path is relative to the project root where backend/ and frontend/ dirs reside) and `code` is the Markdown content.

[Input Design Document (for context)]
```
{design_document_content}
```
""" + fileSummary + getCommonOutputFormatAndKeyInstructions();
    }

    public String constructListFilesPrompt(String designDocumentContentPlaceholder) {
        // designDocumentContentPlaceholder is not directly used in the template string here,
        // but passed via promptParameters. Keeping it for consistency.
        return """
[System Preamble]
You are an expert AI software architect. Your primary function is to meticulously analyze a provided software design document and identify all the individual source code files that need to be generated to realize this design.

[Task Definition]
Based on the design document provided below, your goal is to output a comprehensive list of all necessary file paths. This includes:
- Backend source files (e.g., Java controllers, services, models, repositories, configuration).
- Frontend source files (e.g., JavaScript/TypeScript components, services, HTML, CSS).
- Build configuration files (e.g., `pom.xml` for Maven, `package.json` for Node.js projects).
- Database schema or migration files (if applicable).
- Root-level documentation (e.g., `README.md`).
- Any other auxiliary files implied by the design (e.g., .gitignore, utility scripts).

Consider standard project structures and naming conventions for the technologies implied in the design. For instance:
- Java/Spring Boot projects typically use `backend/src/main/java/com/example/...` and `backend/src/main/resources/...`.
- React/Vue/Angular projects often use `frontend/src/...` and `frontend/public/...`.
- A `pom.xml` should be at `backend/pom.xml`.
- A `package.json` should be at `frontend/package.json`.
- A main `README.md` should be at the project root.

[Input Design Document]
```
{design_document_content}
```

[Output Format Specification]
Your entire response MUST be a valid JSON array of strings. Each string in the array must represent a single, complete relative file path from the conceptual project root.
Example:
```json
[
  "backend/pom.xml",
  "backend/src/main/java/com/example/MyApplication.java",
  "backend/src/main/java/com/example/controller/MyController.java",
  "backend/src/main/resources/application.properties",
  "frontend/package.json",
  "frontend/src/App.js",
  "frontend/public/index.html",
  "README.md"
]
```
Ensure your output strictly adheres to this JSON format. Do not include any other text, explanations, or markdown formatting outside of the JSON array itself.
""";
    }
} 