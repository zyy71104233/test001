package com.example.aiarchdesigner.utils;

import com.example.aiarchdesigner.model.GeneratedFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class fileWriteUtil {
    public static void fileWriting(List<GeneratedFile> generatedFiles) {
        if (generatedFiles != null && !generatedFiles.isEmpty()) {
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
            Path workspaceDir = Paths.get("", "workspace", timestamp);
            try {
                Files.createDirectories(workspaceDir); // Create the base timestamped directory
                System.out.println("Writing generated files to: " + workspaceDir.toAbsolutePath());

                for (GeneratedFile generatedFile : generatedFiles) {
                    if (generatedFile.getFilePath() == null || generatedFile.getFilePath().trim().isEmpty()) {
                        System.err.println("Skipping file with empty path.");
                        continue;
                    }
                    if (generatedFile.getCode() == null) {
                        System.err.println("Skipping file " + generatedFile.getFilePath() + " due to null content.");
                        continue;
                    }

                    Path filePath = workspaceDir.resolve(generatedFile.getFilePath().trim()).normalize();

                    // Security check: Ensure the resolved path is still within the workspaceDir
                    if (!filePath.startsWith(workspaceDir)) {
                        System.err.println("Skipping file due to invalid path (potential directory traversal): " + generatedFile.getFilePath());
                        continue;
                    }

                    Files.createDirectories(filePath.getParent()); // Create parent directories for the file
                    Files.writeString(filePath, generatedFile.getCode());
                    System.out.println("Successfully wrote file: " + filePath);
                }
            } catch (IOException e) {
                System.err.println("Error writing files to disk: " + e.getMessage());
                e.printStackTrace();
                // Optionally, you might want to add this error information to the response
                // For now, we just log and proceed to return the generatedFiles list
            }
        }
    }

    public static void fileWriting(List<GeneratedFile> generatedFiles, Path backendBaseWorkspaceDir) {
        if (generatedFiles != null && !generatedFiles.isEmpty()) {
            Path workspaceDir = backendBaseWorkspaceDir;
            try {
                Files.createDirectories(workspaceDir); // Create the base timestamped directory
                System.out.println("Writing generated files to: " + workspaceDir.toAbsolutePath());

                for (GeneratedFile generatedFile : generatedFiles) {
                    if (generatedFile.getFilePath() == null || generatedFile.getFilePath().trim().isEmpty()) {
                        System.err.println("Skipping file with empty path.");
                        continue;
                    }
                    if (generatedFile.getCode() == null) {
                        System.err.println("Skipping file " + generatedFile.getFilePath() + " due to null content.");
                        continue;
                    }

                    Path filePath = workspaceDir.resolve(generatedFile.getFilePath().trim()).normalize();

                    // Security check: Ensure the resolved path is still within the workspaceDir
                    if (!filePath.startsWith(workspaceDir)) {
                        System.err.println("Skipping file due to invalid path (potential directory traversal): " + generatedFile.getFilePath());
                        continue;
                    }

                    Files.createDirectories(filePath.getParent()); // Create parent directories for the file
                    Files.writeString(filePath, generatedFile.getCode());
                    System.out.println("Successfully wrote file: " + filePath);
                }
            } catch (IOException e) {
                System.err.println("Error writing files to disk: " + e.getMessage());
                e.printStackTrace();
                // Optionally, you might want to add this error information to the response
                // For now, we just log and proceed to return the generatedFiles list
            }
        }
    }
}
