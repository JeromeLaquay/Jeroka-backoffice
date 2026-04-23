package fr.jeroka.organization.web.dto;

public record GoogleDriveRootSettingsResponse(
        String scope,
        String folderId,
        String folderUrl,
        String userFolderId,
        String companyFolderId) {}
