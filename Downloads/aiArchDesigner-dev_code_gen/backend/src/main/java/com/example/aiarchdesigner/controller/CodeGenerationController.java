package com.example.aiarchdesigner.controller;

import com.example.aiarchdesigner.model.GeneratedFile;
import com.example.aiarchdesigner.service.CodeGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/code-generation")
public class CodeGenerationController {

    private final CodeGenerationService codeGenerationService;

    @Autowired
    public CodeGenerationController(CodeGenerationService codeGenerationService) {
        this.codeGenerationService = codeGenerationService;
    }

    @PostMapping("/generate-from-document")
    public ResponseEntity<List<GeneratedFile>> generateCodeFromDocument(@RequestParam("designDocument") MultipartFile designDocument) {
        if (designDocument.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonList(new GeneratedFile("error", "Design document is empty.")));
        }
        try {
            String designDocumentContent = new String(designDocument.getBytes());
            System.out.println("设计文档内容为:\n"+designDocumentContent);
            System.out.println("=====");
            List<GeneratedFile> generatedFiles = codeGenerationService.generateProjectCode(designDocumentContent);
            System.out.println("结束时间:"+LocalDateTime.now());

            return ResponseEntity.ok(generatedFiles);
        } catch (IOException e) {
            // Log the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(new GeneratedFile("error", "Error processing design document: " + e.getMessage())));
        } catch (Exception e) {
            // 打印异常
            e.printStackTrace();
            // Log the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(new GeneratedFile("error", "An unexpected error occurred: " + e.getMessage())));
        }
    }

    // --- NEW ENDPOINTS FOR GRANULAR CODE GENERATION ---

    @PostMapping("/list-files-to-generate")
    public ResponseEntity<?> listFilesToGenerate(@RequestParam("designDocument") MultipartFile designDocument) {
        if (designDocument.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Design document is empty."));
        }
        try {
            String designDocumentContent = new String(designDocument.getBytes());
            List<String> filenames = codeGenerationService.listFilesToGenerate(designDocumentContent);
            return ResponseEntity.ok(filenames);
        } catch (IOException e) {
            // Log the exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error processing design document for listing files: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected error occurred while listing files: " + e.getMessage()));
        }
    }

//    @PostMapping("/generate-single-file")
//    public ResponseEntity<?> generateSingleFileContent(
//            @RequestParam("designDocument") MultipartFile designDocument,
//            @RequestParam("filename") String filename) {
//
//        if (designDocument.isEmpty()) {
//            return ResponseEntity.badRequest().body(new GeneratedFile("error", "Design document is empty for file: " + filename));
//        }
//        if (filename == null || filename.trim().isEmpty()) {
//            return ResponseEntity.badRequest().body(new GeneratedFile("error", "Filename parameter is missing or empty."));
//        }
//
//        try {
//            String designDocumentContent = new String(designDocument.getBytes());
//            GeneratedFile generatedFile = codeGenerationService.generateSingleFileContent(designDocumentContent, filename);
//            return ResponseEntity.ok(generatedFile);
//        } catch (IOException e) {
//            // Log the exception
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new GeneratedFile("error", "Error processing design document for generating file '" + filename + "': " + e.getMessage()));
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new GeneratedFile("error", "An unexpected error occurred while generating file '" + filename + "': " + e.getMessage()));
//        }
//    }
    // --- End of NEW ENDPOINTS ---
} 