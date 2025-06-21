package com.example.aiarchdesigner.model;

public class GeneratedFile {
    private String filePath;
    private String code;

    public GeneratedFile() {
    }

    public GeneratedFile(String filePath, String code) {
        this.filePath = filePath;
        this.code = code;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
} 