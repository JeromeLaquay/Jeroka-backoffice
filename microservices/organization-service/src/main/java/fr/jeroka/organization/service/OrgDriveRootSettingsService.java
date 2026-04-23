package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import fr.jeroka.organization.entity.OrgUserEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgCompanyRepository;
import fr.jeroka.organization.repository.OrgUserRepository;
import fr.jeroka.organization.web.dto.GoogleDriveRootSettingsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OrgDriveRootSettingsService {

    private static final Pattern FOLDERS_URL = Pattern.compile("/folders/([a-zA-Z0-9_-]{10,})");
    private static final Pattern OPEN_ID_URL = Pattern.compile("[?&]id=([a-zA-Z0-9_-]{10,})");
    private static final Pattern RAW_ID = Pattern.compile("^[a-zA-Z0-9_-]{10,}$");
    private final OrgUserRepository users;
    private final OrgCompanyRepository companies;

    public OrgDriveRootSettingsService(OrgUserRepository users, OrgCompanyRepository companies) {
        this.users = users;
        this.companies = companies;
    }

    @Transactional(readOnly = true)
    public GoogleDriveRootSettingsResponse get(UUID userId, UUID companyId) {
        OrgUserEntity user = requireUser(userId, companyId);
        OrgCompanyEntity company = requireCompany(companyId);
        String userFolderId = trimToNull(user.getGoogleDriveFolderId());
        String companyFolderId = trimToNull(company.getGoogleDriveFolderId());
        String scope = userFolderId != null ? "user" : "company";
        String folderId = userFolderId != null ? userFolderId : companyFolderId;
        return new GoogleDriveRootSettingsResponse(
                scope, folderId, asFolderUrl(folderId), userFolderId, companyFolderId);
    }

    @Transactional
    public GoogleDriveRootSettingsResponse save(UUID userId, UUID companyId, String scope, String folderUrl) {
        OrgUserEntity user = requireUser(userId, companyId);
        OrgCompanyEntity company = requireCompany(companyId);
        String nextScope = normalizeScope(scope);
        String folderId = extractFolderId(folderUrl);
        if ("user".equals(nextScope)) {
            user.setGoogleDriveFolderId(folderId);
        } else {
            company.setGoogleDriveFolderId(folderId);
            user.setGoogleDriveFolderId(null);
        }
        users.save(user);
        companies.save(company);
        return get(userId, companyId);
    }

    private OrgUserEntity requireUser(UUID userId, UUID companyId) {
        return users.findById(userId)
                .filter(u -> companyId.equals(u.getCompanyId()))
                .orElseThrow(() -> new OrgApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    private OrgCompanyEntity requireCompany(UUID companyId) {
        return companies.findById(companyId)
                .orElseThrow(() -> new OrgApiException("Entreprise introuvable", HttpStatus.NOT_FOUND));
    }

    private static String normalizeScope(String scope) {
        if (scope == null || scope.isBlank()) {
            return "user";
        }
        String s = scope.trim().toLowerCase();
        if (!"user".equals(s) && !"company".equals(s)) {
            throw new OrgApiException("Le scope doit être 'user' ou 'company'", HttpStatus.BAD_REQUEST);
        }
        return s;
    }

    private static String extractFolderId(String folderUrl) {
        String value = trimToNull(folderUrl);
        if (value == null) {
            return null;
        }
        Matcher folders = FOLDERS_URL.matcher(value);
        if (folders.find()) return folders.group(1);
        Matcher open = OPEN_ID_URL.matcher(value);
        if (open.find()) return open.group(1);
        if (RAW_ID.matcher(value).matches()) return value;
        throw new OrgApiException("URL Google Drive invalide", HttpStatus.BAD_REQUEST);
    }

    private static String asFolderUrl(String folderId) {
        return folderId == null ? null : "https://drive.google.com/drive/folders/" + folderId;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
