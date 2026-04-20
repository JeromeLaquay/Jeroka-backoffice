package fr.jeroka.content.web;

import fr.jeroka.content.security.ContentJwtCompanyId;
import fr.jeroka.content.service.ContentPublicationService;
import fr.jeroka.content.web.dto.PageDto;
import fr.jeroka.content.web.dto.publication.CreatePublicationRequest;
import fr.jeroka.content.web.dto.publication.PublicationResponse;
import fr.jeroka.content.web.dto.publication.UpdatePublicationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationsApiController {

    private final ContentPublicationService contentPublicationService;

    public PublicationsApiController(ContentPublicationService contentPublicationService) {
        this.contentPublicationService = contentPublicationService;
    }

    @GetMapping
    public PageDto<PublicationResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return contentPublicationService.list(ContentJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/{id}")
    public PublicationResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return contentPublicationService.getById(id, ContentJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PublicationResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreatePublicationRequest body) {
        return contentPublicationService.create(ContentJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public PublicationResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePublicationRequest body) {
        return contentPublicationService.update(id, ContentJwtCompanyId.require(jwt), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        contentPublicationService.delete(id, ContentJwtCompanyId.require(jwt));
    }
}
