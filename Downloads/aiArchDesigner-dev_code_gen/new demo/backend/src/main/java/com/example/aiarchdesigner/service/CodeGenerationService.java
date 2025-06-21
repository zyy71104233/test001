package com.example.aiarchdesigner.service;

import com.alibaba.fastjson.JSON;
import com.example.aiarchdesigner.model.GeneratedFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.DefaultChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.example.aiarchdesigner.utils.fileWriteUtil.fileWriting;

@Service
public class CodeGenerationService {

    private final ObjectMapper objectMapper;
    private final ChatClient.Builder chatClientBuilder;
    private final PromptProviderService promptProviderService;

    @Autowired
    public CodeGenerationService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper, PromptProviderService promptProviderService) {
        this.chatClientBuilder = chatClientBuilder;
        this.objectMapper = objectMapper;
        this.promptProviderService = promptProviderService;
    }

    public List<GeneratedFile> generateProjectCode(String designDocumentContent) throws IOException {
        // 通过大模型的问答方式，请根据识别设计文档中是否需要生成前端代码，如果不需要生成前端代码，则跳过前端代码生成阶段。
//        boolean shouldGenerateFrontFlag = shouldGenerateFrontend(designDocumentContent);
//        System.out.println("是否需要生成前端代码:"+shouldGenerateFrontFlag);
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        Path projectRunBaseDir = Paths.get("workspace", timestamp);
        Path backendBaseWorkspaceDir = projectRunBaseDir.resolve("backend");
        Path frontendBaseWorkspaceDir = projectRunBaseDir.resolve("front");

        Files.createDirectories(backendBaseWorkspaceDir);
        Files.createDirectories(frontendBaseWorkspaceDir);

        List<GeneratedFile> allGeneratedFiles = new ArrayList<>();

        System.out.println("\n--- Starting Backend Code Generation Phase ---");

        // 生成前端代码
        genFront(designDocumentContent, null, frontendBaseWorkspaceDir, allGeneratedFiles);

        // 生成后端代码
        String backendPromptStr = promptProviderService.constructBackendPrompt(designDocumentContent);
        List<GeneratedFile> backendFiles = callLlmForPhase(backendPromptStr, designDocumentContent, "Backend");
        if (backendFiles != null && !backendFiles.isEmpty()) {
            fileWriting(backendFiles, backendBaseWorkspaceDir);
            allGeneratedFiles.addAll(backendFiles);
            System.out.println("--- Backend Code Generation Phase Completed ---");
        } else {
            System.out.println("--- Backend Code Generation Phase Produced No Files or Errored ---");
        }

        System.out.println("\n--- Starting Project README.md Generation Phase ---");
        String readmePromptStr = promptProviderService.constructReadmePrompt(designDocumentContent, allGeneratedFiles);
        List<GeneratedFile> readmeFileList = callLlmForPhase(readmePromptStr, designDocumentContent, "README");
        if (readmeFileList != null && !readmeFileList.isEmpty()) {
            fileWriting(readmeFileList, projectRunBaseDir);
            System.out.println("--- Project README.md Generation Phase Completed ---");
        } else {
            System.out.println("--- Project README.md Generation Phase Produced No File or Errored ---");
        }
//        return projectRunBaseDir.getFileSystem();
        return allGeneratedFiles;
    }

    private void genFront(String designDocumentContent, List<GeneratedFile> backendFiles, Path frontendBaseWorkspaceDir, List<GeneratedFile> allGeneratedFiles) {
        System.out.println("\n--- Starting Frontend Code Generation Phase ---");
        String frontendPromptStr = promptProviderService.constructFrontendPrompt(designDocumentContent, backendFiles);
        List<GeneratedFile> frontFiles = callLlmForPhase(frontendPromptStr, designDocumentContent, "Frontend");
        if (frontFiles != null && !frontFiles.isEmpty()) {
            fileWriting(frontFiles, frontendBaseWorkspaceDir);
            allGeneratedFiles.addAll(frontFiles);
            System.out.println("--- Frontend Code Generation Phase Completed ---");
        } else {
            System.out.println("--- Frontend Code Generation Phase Produced No Files or Errored ---");
        }
    }

    // 新增方法：判断是否需要生成前端代码
    private boolean shouldGenerateFrontend(String designDocumentContent) {
        PromptTemplate promptTemplate = new PromptTemplate("请分析以下设计文档，判断是否需要生成前端代码。\n\n设计文档内容：\n{design_document_content}\n\n回答 \"Yes\" 表示需要生成前端代码，回答 \"No\" 表示不需要。");
        Map<String, Object> promptParameters = new HashMap<>();
        promptParameters.put("design_document_content", designDocumentContent);

        Prompt prompt = promptTemplate.create(promptParameters);

        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
                .model("deepseek-chat")
                .build();

        ChatClient chatClient = chatClientBuilder.defaultOptions(openAiChatOptions).build();

        try {
            ChatResponse chatResponse = chatClient.prompt(prompt)
                    .user("User: 请分析设计文档是否需要生成前端代码，并仅以 Yes 或 No 回答。")
                    .call()
                    .chatResponse();

            String responseContent = chatResponse.getResult().getOutput().getText().trim();
            return "Yes".equalsIgnoreCase(responseContent);
        } catch (Exception e) {
            System.err.println("Error during LLM call for determining frontend generation requirement: " + e.getMessage());
            e.printStackTrace();
            return false; // 默认不生成前端代码
        }
    }

    private List<GeneratedFile> callLlmForPhase(String phaseSpecificPromptString, String designDocumentContent, String phaseName) {
        PromptTemplate promptTemplate = new PromptTemplate(phaseSpecificPromptString);
        Map<String, Object> promptParameters = new HashMap<>();
        promptParameters.put("design_document_content", designDocumentContent);
        
        Prompt prompt = promptTemplate.create(promptParameters);

        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
            .model("deepseek-chat")
            .build();

        ChatClient chatClient = chatClientBuilder.defaultOptions(openAiChatOptions).build();
        
        System.out.println("--- Streaming LLM Response for " + phaseName + " to Console ---");
        StringBuilder completeResponseContent = new StringBuilder();
        try {
            Flux<ChatResponse> chatResponseFlux = chatClient.prompt(prompt)
                .user("User: Please generate the " + phaseName.toLowerCase() + " code as per the instructions.")
                .stream()
                .chatResponse();
            
            chatResponseFlux.toStream().forEach(chatResponse -> {
                chatResponse.getResults().forEach(generation -> {
                    String contentChunk = generation.getOutput().getText();
                    if (contentChunk != null) {
                        System.out.print(contentChunk);
                        completeResponseContent.append(contentChunk);
                    }
                });
            });
            System.out.println("\n--- End of Streamed LLM Response for " + phaseName + " ---");

            String llmResponseJson = completeResponseContent.toString();
            System.out.println("Raw LLM Response JSON for " + phaseName + ":");
            System.out.println(llmResponseJson);

            String cleanedJson = llmResponseJson.replace("```json", "").replace("```", "").trim();
            
            System.out.println("Cleaned LLM Response JSON for " + phaseName + " for parsing:");
            System.out.println(cleanedJson);

            if (cleanedJson.isEmpty()) {
                System.err.println("Error: Cleaned JSON content for " + phaseName + " is empty.");
                return new ArrayList<>();
            }
            return JSON.parseObject(cleanedJson, new com.alibaba.fastjson.TypeReference<List<GeneratedFile>>() {});

        } catch (Exception e) {
            System.err.println("Error during LLM call or parsing response for " + phaseName + ": " + e.getMessage());
            e.printStackTrace();
            if (e instanceof IllegalArgumentException && e.getMessage().contains("The template string is not valid")) {
                System.err.println("This often means curly braces {} were not properly escaped as {{{{ or }}}} in the prompt string from PromptProviderService for phase: " + phaseName);
            }
            return new ArrayList<>();
        }
    }

    public List<String> listFilesToGenerate(String designDocumentContent) throws IOException {
        System.out.println("\n--- Starting Phase: List Files to Generate ---");

        String listFilesPromptStr = promptProviderService.constructListFilesPrompt(designDocumentContent);
        PromptTemplate promptTemplate = new PromptTemplate(listFilesPromptStr);
        Map<String, Object> promptParameters = new HashMap<>();
        promptParameters.put("design_document_content", designDocumentContent);
        Prompt prompt = promptTemplate.create(promptParameters);

        // Configure LLM options (you might want to centralize this or make it configurable)
        OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
                .model("deepseek-chat") // Or your preferred model
                .temperature(0.3) // Adjust for creativity vs. determinism
                .build();

        ChatClient chatClient = chatClientBuilder.defaultOptions(openAiChatOptions).build();

        System.out.println("Prompt for listing files:\n" + prompt.getInstructions().get(0).getText()); // Log the prompt

        try {
            ChatResponse chatResponse = chatClient.prompt(prompt)
                    .call()
                    .chatResponse();

            String llmResponseJson = chatResponse.getResult().getOutput().getText().trim();
            System.out.println("Raw LLM Response for file list:\n" + llmResponseJson);

            // Clean the JSON if it's wrapped in markdown code blocks
            String cleanedJson = llmResponseJson.replaceAll("^```json", "").replaceAll("```$", "").trim();
            System.out.println("Cleaned LLM Response JSON for file list parsing:\n" + cleanedJson);

            if (cleanedJson.isEmpty()) {
                System.err.println("Error: Cleaned JSON content for file list is empty.");
                // Fallback or throw error
                return List.of("README.md", "src/main/Error.java"); // Example fallback
            }

            // Parse the JSON array of strings
            // Using Jackson ObjectMapper as it's already a dependency
            List<String> fileList = objectMapper.readValue(cleanedJson, new TypeReference<List<String>>() {});

            System.out.println("Parsed file list: " + fileList);
            System.out.println("--- Phase Completed: List Files to Generate (LLM) ---");
            return fileList;

        } catch (Exception e) {
            System.err.println("Error during LLM call or parsing file list response: " + e.getMessage());
            e.printStackTrace();
            // Fallback or re-throw
            // For now, returning a default list so the process can continue for testing other parts
            System.out.println("Falling back to a default file list due to error.");
            return List.of("README.md", "src/main/java/com/example/FallbackDueToError.java");
        }
    }

    // You will likely need new prompt construction methods for the above, e.g.:
    // private String constructListFilesPrompt(String designDocumentContent) { ... }
    // private String constructSingleFilePrompt(String designDocumentContent, String filenameToGenerate) { ... }
    // These would be similar to your existing constructBackendPrompt, constructFrontendPrompt, etc.
    // but tailored to asking for a list of files or content for a single file.

    // --- End of NEW METHODS ---
}


