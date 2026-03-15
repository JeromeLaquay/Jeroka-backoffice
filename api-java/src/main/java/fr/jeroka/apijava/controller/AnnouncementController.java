package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.announcement.AnnouncementListDto;
import fr.jeroka.apijava.dto.announcement.AnnouncementResponse;
import fr.jeroka.apijava.dto.announcement.CreateAnnouncementRequest;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * CRUD annonces (back-office). Liste vide + création stub.
 */
@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    @GetMapping
    public AnnouncementListDto list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return AnnouncementListDto.empty();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateAnnouncementResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        var now = Instant.now().toString();
        var authorId = principal != null ? principal.id() : "system";
        var authorName = principal != null ? principal.email() : "Système";
        var ann = new AnnouncementResponse(
                UUID.randomUUID().toString(),
                request.title(),
                request.summary(),
                request.content(),
                request.type(),
                request.priority(),
                request.status(),
                request.version(),
                request.targetAudience() != null ? request.targetAudience() : List.of(),
                request.isPinned(),
                request.sendNotification(),
                0,
                now,
                now,
                request.scheduledAt(),
                "published".equals(request.status()) ? now : null,
                new AnnouncementResponse.AuthorInfo(authorId, authorName, principal != null ? principal.email() : "")
        );
        return new CreateAnnouncementResponse(true, ann);
    }

    public record CreateAnnouncementResponse(boolean success, AnnouncementResponse data) {}
}
